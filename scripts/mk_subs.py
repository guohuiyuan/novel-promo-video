#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""design/timeline.json → design/subs.ass + design/subs.srt

字幕风格照 rec2video（github.com/guohuiyuan/rec2video）：
  白字、Microsoft YaHei 46、描边 3.4、阴影 1.8、一行 ≤20 字。
  位置比 rec2video 高一点（MarginV 116）——这片子底部有一条铅印页脚，
  字幕压在页脚线以上，不跟书眉页脚抢地方。

rec2video 的另一条规矩也搬过来了：**口播 ≠ 字幕**。
旁白念「一百一十一万字」顺口，字幕写「111 万字」一眼能读，所以这里有一张
数字对照表，只作用在字幕上，不碰配音稿。

    python build/mk_subs.py
    python build/mk_subs.py --maxlen 20 --out design/subs.ass
"""
from __future__ import annotations

import argparse
import json
import os
import re
from pathlib import Path

ROOT = Path(os.environ.get("NOVEL_PROJECT", Path.cwd())).resolve()
TL = ROOT / "design" / "timeline.json"
OUT = ROOT / "design" / "subs.ass"
SRT = ROOT / "design" / "subs.srt"

# 断句用的标点；行末的逗号句号在上字幕时去掉（视频字幕惯例）
BREAK = "，。！？；：、"
STRONG = "。！？；…—"          # 到这里必须换行，不往前并
DROP_TAIL = "，。；：、"

# 口播 ≠ 字幕：念出来的中文数字，落到字幕上是阿拉伯数字（长的先换）
NUM = [
    ("一百一十一万字", "111 万字"), ("一百一十一万", "111 万"),
    ("二百九十章", "290 章"), ("一九九六年", "1996 年"),
    ("第三十九代", "第 39 代"), ("第四十代", "第 40 代"), ("三十九代", "39 代"),
    ("二十四五岁", "二十四五岁"), ("三十五年", "35 年"), ("二十年", "20 年"),
    ("三十五岁", "35 岁"), ("十八岁", "18 岁"),
    ("十二岁", "12 岁"), ("十七个月", "17 个月"), ("八百个", "800 个"),
    ("一千万", "1000 万"), ("二十四处", "24 处"), ("一处雷点", "1 处雷点"),
    ("四年后", "4 年后"), ("七天后", "7 天后"), ("三天内", "3 天内"),
    ("两天", "2 天"), ("两年多", "2 年多"), ("两年", "2 年"), ("三年", "3 年"),
    ("九个女人", "9 个女人"), ("九人之一", "9 人之一"), ("九女发证", "9 女发证"),
    ("两本空白", "2 本空白"), ("五卷完结", "5 卷完结"), ("零零一", "001"),
]

HEAD = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Narration,Microsoft YaHei,46,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0.6,0,1,3.4,1.8,2,120,120,116,1
Style: Line,Microsoft YaHei,48,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,1.4,0,1,3.4,1.8,2,120,120,114,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def ts(sec: float) -> str:
    sec = max(0.0, sec)
    h = int(sec // 3600)
    m = int(sec % 3600 // 60)
    s = sec % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def ts_srt(sec: float) -> str:
    sec = max(0.0, sec)
    h = int(sec // 3600)
    m = int(sec % 3600 // 60)
    s = int(sec % 60)
    ms = int(round((sec - int(sec)) * 1000))
    if ms == 1000:
        ms, s = 0, s + 1
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def to_sub(text: str) -> str:
    for a, b in NUM:
        text = text.replace(a, b)
    # 阿拉伯数字两侧留空格：「他失踪 2 年」比「他失踪2 年」好读
    text = re.sub(r"([\u4e00-\u9fff])(\d)", r"\1 \2", text)
    text = re.sub(r"(\d)([\u4e00-\u9fff])", r"\1 \2", text)
    return text


def split_text(text: str, maxlen: int) -> list[str]:
    """先按标点断句，再把碎句合并成不超过 maxlen 字的一行。"""
    raw = [p for p in re.split(rf"(?<=[{BREAK}])", text) if p.strip()]
    chunks: list[str] = []
    for p in raw:
        p = p.strip()
        # 超长单句：按 maxlen 硬切，优先在标点处切
        while len(p) > maxlen:
            cut = maxlen
            for i in range(maxlen, max(4, maxlen // 2), -1):
                if p[i - 1] in BREAK:
                    cut = i
                    break
            chunks.append(p[:cut])
            p = p[cut:]
        if p:
            chunks.append(p)

    # 合并：相邻两片加起来不超过 maxlen 就并成一行
    merged: list[str] = []
    for c in chunks:
        joinable = (merged and len(merged[-1]) + len(c) <= maxlen
                    and merged[-1][-1] not in STRONG)  # 句号分号破折号是强断点
        if joinable:
            merged[-1] += c
        else:
            merged.append(c)
    # 太短的行（<=3 字）尽量并到前一行，避免字幕闪一下
    out: list[str] = []
    for c in merged:
        if out and len(c) <= 3 and len(out[-1]) + len(c) <= maxlen:
            out[-1] += c
        else:
            out.append(c)
    # 行末的逗号句号一律不要（字幕的停顿由时间表达，不靠标点）
    return [c.rstrip(DROP_TAIL) or c for c in out]


def weight(s: str) -> float:
    """标点占半个字的时间，读起来更贴。"""
    return sum(0.45 if ch in BREAK else 1.0 for ch in s)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--maxlen", type=int, default=20)
    ap.add_argument("--out", default=str(OUT))
    a = ap.parse_args()

    tl = json.loads(TL.read_text(encoding="utf-8"))
    clips = tl["clips"]
    lines: list[str] = []
    srt: list[str] = []
    n = 0

    for i, c in enumerate(clips):
        style = "Line" if c["kind"] == "line" else "Narration"
        # 台词（整句引语）给更宽的行，别把一句话拆成两段
        lim = a.maxlen + (4 if c["kind"] == "line" else 0)
        chunks = split_text(to_sub(c["text"]), lim)
        total_w = sum(weight(x) for x in chunks) or 1.0
        span = max(0.4, c["dur"])
        cur = c["start"] + 0.03
        # 最后一句往气口里多留 0.24s，避免话音刚落字就没了
        nxt = clips[i + 1]["start"] if i + 1 < len(clips) else c["start"] + c["dur"] + 0.24
        for j, ch in enumerate(chunks):
            d = span * weight(ch) / total_w
            end = cur + d
            if j == len(chunks) - 1:
                end = min(end + 0.24, nxt - 0.04)
            lines.append(
                f"Dialogue: 0,{ts(cur)},{ts(end)},{style},,0,0,0,,"
                f"{{\\fad(70,70)}}{ch}")
            srt.append(f"{n + 1}\n{ts_srt(cur)} --> {ts_srt(end)}\n{ch}\n")
            cur = cur + d
            n += 1

    Path(a.out).write_text(HEAD + "\n".join(lines) + "\n", encoding="utf-8")
    Path(SRT).write_text("\n".join(srt), encoding="utf-8")
    print(f"[+] {a.out}  {n} 行  ({len(clips)} 条配音)")
    print(f"[+] {SRT}")


if __name__ == "__main__":
    main()
