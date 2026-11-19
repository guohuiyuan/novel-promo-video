#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""一遍生成全部配音，并量出真实时长写成 timeline.json。

    python build/vo.py                     # 全量重做
    python build/vo.py --only n01 d02      # 只重做指定几条
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

# 工程目录由 NOVEL_PROJECT 指定；直接 cd 到工程里跑也可以（默认 cwd）。
ROOT = Path(os.environ.get("NOVEL_PROJECT", Path.cwd())).resolve()
LATENT = Path(os.environ.get(
    "LATENT_PY",
    Path.home() / ".workbuddy" / "skills" / "latent-media" / "scripts" / "latent.py",
))
VO = ROOT / "audio" / "vo"
SCRIPT = ROOT / "design" / "script.json"
TIMELINE = ROOT / "design" / "timeline.json"


def dur(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True)
    return float(out.stdout.strip())


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", nargs="*", help="只重做这几条 id")
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()

    spec = json.loads(SCRIPT.read_text(encoding="utf-8"))
    VO.mkdir(parents=True, exist_ok=True)

    rows = []
    for c in spec["clips"]:
        cid = c["id"]
        mp3 = VO / f"{cid}.mp3"
        if a.only and cid not in a.only:
            pass
        elif mp3.is_file() and not a.force:
            print(f"[=] {cid} 复用 {dur(mp3):.2f}s")
        else:
            print(f"[>] {cid} ← {c['voice']}  {c['text'][:26]}…", flush=True)
            cmd = [sys.executable, str(LATENT), "tts", "--voice", c["voice"],
                   "--text", c["text"], "-o", str(mp3), "--format", "mp3",
                   "--language", "Chinese"]
            err = ""
            for attempt in range(1, 4):
                r = subprocess.run(cmd, capture_output=True, text=True,
                                   encoding="utf-8", errors="replace")
                if r.returncode == 0 and mp3.is_file():
                    break
                err = (r.stderr or r.stdout)[-800:]
                print(f"    [!] 第 {attempt} 次失败，重试", flush=True)
            else:
                raise SystemExit(f"[!] {cid} 失败\n{err}")
            d = dur(mp3)
            print(f"    {d:.2f}s", flush=True)
            # 语速体检：中文正常 4.5–7.5 字/秒，低于 4.0 说明被截断了
            n = len([ch for ch in c["text"] if ch.strip() and ch not in "，。！？—…”’、；："])
            rate = n / d if d else 0
            if rate < 4.0 or rate > 8.5:
                print(f"    [?] 语速 {rate:.1f} 字/秒（{n} 字 / {d:.2f}s），建议复查", flush=True)

        if mp3.is_file():
            rows.append({**c, "file": str(mp3.relative_to(ROOT)), "dur": round(dur(mp3), 3)})

    # 按顺序累加，条与条之间留 0.28s 气口
    t = 0.0
    gap = 0.28
    for i, r in enumerate(rows):
        r["start"] = round(t, 3)
        t += r["dur"] + gap

    total = round(t - gap, 3)
    TIMELINE.write_text(json.dumps(
        {"total": total, "gap": gap, "clips": rows}, ensure_ascii=False, indent=2),
        encoding="utf-8")

    print("\n" + "-" * 56)
    for r in rows:
        print(f"{r['start']:7.2f}s  {r['dur']:5.2f}s  {r['id']:5s}  {r['voice']}")
    print("-" * 56)
    print(f"总长 {total:.2f}s  → {TIMELINE}")


if __name__ == "__main__":
    main()
