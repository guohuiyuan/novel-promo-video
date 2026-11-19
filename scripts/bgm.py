#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从本地 go-music-dl 服务搜曲并下载。

    python build/bgm.py search "纯音乐 沉稳" "cinematic"      # 只列候选
    python build/bgm.py get <id> <out.mp3>
"""
from __future__ import annotations

import argparse
import html
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path

BASE = os.environ.get("MUSIC_BASE", "http://127.0.0.1:8080/music")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
CARD = re.compile(r'<li class="song-card"(.*?)</li>', re.S)
ATTR = re.compile(r'data-([a-z-]+)="([^"]*)"')


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=90) as r:
        return r.read()


def search(q: str, source: str = "netease") -> list[dict]:
    url = f"{BASE}/search?" + urllib.parse.urlencode({"q": q, "type": "song", "sources": source})
    page = fetch(url).decode("utf-8", "replace")
    rows = []
    for block in CARD.findall(page):
        d = {k: html.unescape(v) for k, v in ATTR.findall(block)}
        if not d.get("name"):
            continue
        rows.append({"id": d.get("id"), "source": d.get("source"), "name": d["name"],
                     "artist": d.get("artist", ""), "album": d.get("album", ""),
                     "dur": int(float(d.get("duration") or 0))})
    return rows


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["search", "get"])
    ap.add_argument("args", nargs="+")
    ap.add_argument("--source", default="netease")
    ap.add_argument("--name", default="")
    ap.add_argument("--artist", default="")
    a = ap.parse_args()

    if a.cmd == "search":
        seen = set()
        for q in a.args:
            print(f"\n### {q}")
            try:
                rows = search(q, a.source)
            except Exception as e:  # noqa: BLE001
                print("  ✗", e)
                continue
            for r in rows:
                if r["id"] in seen:
                    continue
                seen.add(r["id"])
                m, s = divmod(r["dur"], 60)
                print(f"  {r['id']:>12}  {m}:{s:02d}  {r['name'][:30]} — {r['artist'][:16]}")
        return

    sid, out = a.args[0], Path(a.args[1])
    out.parent.mkdir(parents=True, exist_ok=True)
    q = {"id": sid, "source": a.source, "name": a.name or "Unknown",
         "artist": a.artist or "Unknown", "stream": "1"}
    url = f"{BASE}/download?" + urllib.parse.urlencode(q)
    try:
        data = fetch(url)
    except Exception as e:  # noqa: BLE001
        sys.exit(f"[!] {url} → {e}")
    if len(data) < 100_000:
        sys.exit("[!] 没拿到音频")
    out.write_bytes(data)
    probe = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration,bit_rate",
                            "-of", "default=nw=1", str(out)], capture_output=True, text=True)
    print(f"[+] {out}  {len(data)/1048576:.1f} MB")
    print(probe.stdout.strip())


if __name__ == "__main__":
    main()
