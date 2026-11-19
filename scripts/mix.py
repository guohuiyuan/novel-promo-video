#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""混音：旁白逐条对齐响度，BGM 全程一个音量（不闪避、不忽大忽小）。

    python build/mix.py
    python build/mix.py --bgm audio/bgm-a.mp3

为什么不再用 sidechaincompress：
  旁白覆盖率 90% 以上，侧链等于让 BGM 一直在 0 到 1 之间跳，
  听感就是"声音忽大忽小"。这一版改成固定电平——旁白 -19 dB、
  BGM -36 dB，靠 17 dB 的差距让话听得清，音乐始终在后面。
"""
from __future__ import annotations

import argparse
import json
import math
import os
import re
import subprocess
from pathlib import Path

ROOT = Path(os.environ.get("NOVEL_PROJECT", Path.cwd())).resolve()
TL = ROOT / "design" / "timeline.json"
CACHE = ROOT / "design" / "levels.json"
OUT = ROOT / "audio" / "mix.wav"

VO_TARGET = -19.0   # 每条旁白的目标平均电平（dB）
BGM_TARGET = -36.0  # BGM 的固定平均电平（dB）


def mean_db(path: Path) -> float:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", "volumedetect",
                        "-f", "null", "-"], capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    m = re.search(r"mean_volume:\s*(-?[\d.]+) dB", r.stderr)
    if not m:
        raise SystemExit(f"[!] 量不出电平：{path}")
    return float(m.group(1))


def levels(files: list[Path]) -> dict[str, float]:
    cache = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.is_file() else {}
    out = {}
    for f in files:
        key = f"{f.name}:{f.stat().st_size}"
        if key not in cache:
            cache[key] = round(mean_db(f), 2)
        out[str(f)] = cache[key]
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")
    return out


def probe_dur(path: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=nw=1:nk=1", str(path)],
                       capture_output=True, text=True)
    return float(r.stdout.strip())


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--bgm", default="audio/bgm-a.mp3")
    ap.add_argument("--tail", type=float, default=0.0, help="留空=按时间轴末尾 +4s")
    ap.add_argument("--out", default=str(OUT))
    a = ap.parse_args()

    tl = json.loads(TL.read_text(encoding="utf-8"))
    clips = tl["clips"]
    vo_files = [ROOT / c["file"] for c in clips]
    bgm = ROOT / a.bgm

    lv = levels(vo_files + [bgm])
    # 片长要跟画面一致：旁白结束 + 标版留白 7.5s（见 build/mk_timeline.py 的 TAIL_HOLD）
    total = tl.get("total") or max(c["start"] + c["dur"] for c in clips)
    tail = a.tail or round(total + 7.5, 2)

    inputs, filters, labels = [], [], []
    for i, c in enumerate(clips):
        ms = int(round(c["start"] * 1000))
        gain = VO_TARGET - lv[str(ROOT / c["file"])]
        inputs += ["-i", str(ROOT / c["file"])]
        filters.append(
            f"[{i}:a]aresample=48000,volume={gain:.2f}dB,"
            f"adelay={ms}|{ms}[v{i}]")
        labels.append(f"[v{i}]")

    bgm_idx = len(clips)
    inputs += ["-i", str(bgm)]
    bgm_gain = BGM_TARGET - lv[str(bgm)]

    filters.append(
        "".join(labels)
        + f"amix=inputs={len(clips)}:normalize=0:dropout_transition=0,"
          "highpass=f=85,acompressor=threshold=0.16:ratio=2.2:attack=12:release=220[nar]"
    )
    # BGM：固定电平，只在两头淡入淡出；不做侧链，不跟着旁白走。
    # 曲子比片子短时必须接一次——否则 250s 之后整段是数字静音（听感就是"音乐突然没了"）。
    bgm_dur = probe_dur(bgm)
    xf = 4.0
    # 曲短于片子就循环接：每接一段净增 (bgm_dur - xf)，接够铺满 tail 为止。
    # （只接一次的话，550 秒的片子到 495 秒之后又是数字静音。）
    segs = 1 if bgm_dur >= tail else math.ceil(
        (tail - bgm_dur) / max(1.0, bgm_dur - xf)) + 1
    filters.append(f"[{bgm_idx}:a]aresample=48000,asplit={segs}"
                   + "".join(f"[b{i}]" for i in range(segs)))
    for i in range(segs):
        filters.append(f"[b{i}]atrim=0:{bgm_dur:.3f},asetpts=N/SR/TB[ba{i}]")
    cur = "ba0"
    for i in range(1, segs):
        out = "baloop" if i == segs - 1 else f"bc{i}"
        filters.append(f"[{cur}][ba{i}]acrossfade=d={xf}:c1=tri:c2=tri[{out}]")
        cur = out
    if segs == 1:
        filters.append("[ba0]anull[baloop]")
    print(f"[i] BGM {bgm_dur:.1f}s × {segs} 段接续 → 铺满 {tail:.1f}s", flush=True)
    filters.append(
        f"[baloop]atrim=0:{tail},asetpts=N/SR/TB,"
        f"volume={bgm_gain:.2f}dB,afade=t=in:st=0:d=2.0,"
        f"afade=t=out:st={tail - 6.0}:d=6.0[bgm]"
    )
    filters.append(
        f"[nar]apad=whole_dur={tail},atrim=0:{tail}[nars]"
    )
    filters.append(
        f"[nars][bgm]amix=inputs=2:normalize=0:dropout_transition=0:duration=longest,"
        f"apad=whole_dur={tail},atrim=0:{tail},asetpts=N/SR/TB,"
        "alimiter=limit=0.95:level=disabled[aout]"
    )

    cmd = ["ffmpeg", "-hide_banner", "-v", "warning", "-y", *inputs,
           "-filter_complex", ";".join(filters), "-map", "[aout]",
           "-t", f"{tail}", "-ar", "48000", "-ac", "2", a.out]
    print(f"[>] 混音 {len(clips)} 条旁白 + BGM（固定 {BGM_TARGET} dB）…", flush=True)
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise SystemExit(f"[!] 混音失败\n{r.stderr[-2500:]}")
    if r.stderr.strip():
        print(r.stderr.strip()[-800:])

    print(f"[+] {a.out}")
    for line in subprocess.run(["ffmpeg", "-hide_banner", "-i", a.out, "-af", "volumedetect",
                                "-f", "null", "-"], capture_output=True, text=True,
                               encoding="utf-8", errors="replace").stderr.splitlines():
        if "mean_volume" in line or "max_volume" in line:
            print("   ", line.split("] ")[-1])


if __name__ == "__main__":
    main()
