#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""design/timeline.json → film/src/timeline.ts

把「一条配音 = 一段旁白」的实测时间轴，翻译成场景能直接读的常量：
  CLIPS      每条配音的 start / dur / end
  CUT        六个大段的起点（按 sec 字段，取该段第一条的前 0.35s）
  WOMEN      十一位女主的页窗口（一人一页：先台词，后旁白）
  VO_END / FILM_END

    python build/mk_timeline.py
"""
from __future__ import annotations

import json
import os
from pathlib import Path

ROOT = Path(os.environ.get("NOVEL_PROJECT", Path.cwd())).resolve()
TL = ROOT / "design" / "timeline.json"
OUT = ROOT / "film" / "src" / "timeline.ts"

LEAD = 0.35      # 换页提前量：字先在纸上，声音后到
TAIL_HOLD = 7.5  # 标版留白（旁白结束后还停多久）
ORDER = ["info", "synopsis", "risk", "hero", "women", "finale"]


def main() -> None:
    tl = json.loads(TL.read_text(encoding="utf-8"))
    clips = tl["clips"]

    seen: dict[str, float] = {}
    for c in clips:
        c["end"] = round(c["start"] + c["dur"], 3)
        seen.setdefault(c["sec"], c["start"])

    cut = {sec: round(max(0.0, seen[sec] - LEAD), 3) for sec in ORDER}
    vo_end = round(max(c["end"] for c in clips), 3)
    film_end = round(vo_end + TAIL_HOLD, 3)

    # 女主页窗口：第 i 页 = [本条台词的页起点, 下一条台词的页起点)
    women = [c for c in clips if c["id"].startswith("p") and c["sec"] == "women"]
    page_start = {c["id"][1:]: round(max(0.0, c["start"] - LEAD), 3) for c in women}
    keys = sorted(page_start, key=lambda k: page_start[k])
    women_rows = []
    for i, k in enumerate(keys):
        start = page_start[k]
        end = page_start[keys[i + 1]] if i + 1 < len(keys) else cut["finale"]
        line = next(c for c in clips if c["id"] == f"p{k}")
        narr = next(c for c in clips if c["id"] == f"q{k}")
        women_rows.append({
            "num": k,
            "start": start,
            "end": round(end, 3),
            "lineAt": line["start"],
            "lineDur": line["dur"],
            "narrAt": narr["start"],
            "narrDur": narr["dur"],
        })

    # 男主页：和女主页同一套结构——先他本人的名台词，再三段旁白讲完整经历
    hero = [c for c in clips if c["sec"] == "hero"]
    h_line = next(c for c in hero if c["kind"] == "line")
    h_narr = [c for c in hero if c["kind"] == "narration"]
    hero_row = {
        "start": round(max(0.0, hero[0]["start"] - LEAD), 3),
        "end": cut["women"],
        "lineAt": h_line["start"],
        "lineDur": h_line["dur"],
        "narrAt": h_narr[0]["start"],
        "narrDur": round(h_narr[-1]["end"] - h_narr[0]["start"], 3),
    }

    def rows(src, indent="  "):
        out = []
        for c in src:
            out.append(
                f'{indent}{{id: "{c["id"]}", sec: "{c["sec"]}", start: {c["start"]}, '
                f'dur: {c["dur"]}, end: {c["end"]}, voice: "{c["voice"]}", '
                f'kind: "{c["kind"]}"}}')
        return ",\n".join(out)

    ts = f"""// timeline.ts — 由 build/mk_timeline.py 从 design/timeline.json 生成，不要手改。
// 声音先量、画面后画：所有场景只读这里的绝对秒数。

export type Clip = {{
  id: string; sec: string; start: number; dur: number; end: number;
  voice: string; kind: string;
}};

export const CLIPS: Clip[] = [
{rows(clips)}
];

export const VO_END = {vo_end};
export const FILM_END = {film_end};

// 大段切换点（每条配音前一瞬，字先落纸、声后到）
export const CUT = {{
{",".join(f'  {k}: {v}' for k, v in cut.items())}
}} as const;

// 男主，一页（台词 + 三段经历）
export const HERO_PAGE = {{
  start: {hero_row["start"]}, end: {hero_row["end"]},
  lineAt: {hero_row["lineAt"]}, lineDur: {hero_row["lineDur"]},
  narrAt: {hero_row["narrAt"]}, narrDur: {hero_row["narrDur"]},
}};

// 十一位女主，一人一页
export const WOMEN = [
{",\n".join(
    f'  {{num: "{w["num"]}", start: {w["start"]}, end: {w["end"]}, '
    f'lineAt: {w["lineAt"]}, lineDur: {w["lineDur"]}, '
    f'narrAt: {w["narrAt"]}, narrDur: {w["narrDur"]}}}' for w in women_rows)}
];

// id → 起始秒，场景里按句取点
export const T: Record<string, number> = Object.fromEntries(
  CLIPS.map((c) => [c.id, c.start])
);
"""
    OUT.write_text(ts, encoding="utf-8")
    print(f"[+] {OUT}")
    print(f"    VO_END {vo_end}  FILM_END {film_end}")
    print("    CUT " + "  ".join(f"{k}={v}" for k, v in cut.items()))
    for w in women_rows:
        print(f"    女主 {w['num']}  {w['start']:7.2f} → {w['end']:7.2f}")


if __name__ == "__main__":
    main()
