#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""出 16:9 与 4:3 两版封面：版式与片子同一套（旧纸、铅字、套红、档案照）。
所有文案和照片从 design/book.json 读；没有这张文件就先照 examples/book.example.json 建。

    python scripts/cover.py                 # 依赖 NOVEL_PROJECT 或 cwd
    python scripts/cover.py --only 16x9
"""
from __future__ import annotations

import argparse
import html
import json
import os
from pathlib import Path

ROOT = Path(os.environ.get("NOVEL_PROJECT", Path.cwd())).resolve()
ART = ROOT / "film" / "public" / "art"
OUT = ROOT / "cover"
BOOK_JSON = ROOT / "design" / "book.json"

PAPER, PAPER_DEEP, INK, INK_SOFT, INK_FAINT = "#EDE4D0", "#DED2B6", "#191713", "#4C463A", "#8B8271"
RED, GOLD = "#B03A2E", "#B98B45"


def esc(s: str) -> str:
    return html.escape(str(s), quote=True)


def uri(p: Path) -> str:
    return p.resolve().as_uri()


def css() -> str:
    return f"""
    * {{ margin:0; padding:0; box-sizing:border-box; }}
    html,body {{ background:{PAPER}; }}
    .sheet {{ position:relative; overflow:hidden; background:{PAPER};
             font-family:"SimSun","Songti SC",serif; color:{INK}; }}
    .grain {{ position:absolute; inset:0; opacity:.30; mix-blend-mode:multiply; }}
    .grain svg {{ display:block; }}
    .frame {{ position:absolute; border:1px solid {PAPER_DEEP}; }}
    .display {{ font-family:"SimHei","Microsoft YaHei",sans-serif; font-weight:900; }}
    .kick {{ font-family:"SimHei","Microsoft YaHei",sans-serif; font-weight:700;
            letter-spacing:.42em; color:{INK_FAINT}; }}
    .red {{ color:{RED}; }}
    .photo {{ position:absolute; background:#F2EADA; padding:8px; }}
    .photo .im {{ position:relative; overflow:hidden; background:{PAPER_DEEP}; }}
    .photo img {{ width:100%; height:100%; object-fit:cover; object-position:50% 22%;
                 filter:contrast(1.05) saturate(1.08) brightness(1.01); }}
    .halftone {{ position:absolute; inset:0; mix-blend-mode:multiply; opacity:.12;
                background-image:radial-gradient(circle at 50% 50%, {INK} 38%, transparent 40%);
                background-size:5px 5px; }}
    .pname {{ display:flex; justify-content:space-between; align-items:baseline;
             font-family:"SimHei",sans-serif; font-weight:900; font-size:22px; letter-spacing:.06em; }}
    .pmeta {{ font-family:"SimSun",serif; font-size:15px; letter-spacing:.12em; color:{INK_FAINT}; font-weight:400; }}
    .seal {{ position:absolute; border:4px solid {RED}; display:grid; place-items:center;
            background:rgba(176,58,46,.05); box-shadow:inset 0 0 0 2px rgba(176,58,46,.35); }}
    .seal span {{ font-family:"SimHei",sans-serif; font-weight:900; color:{RED}; line-height:1; }}
    """


def photo(x: int, y: int, w: int, h: int, item: dict) -> str:
    src = ART / item.get("file", "")
    if not src.is_file():
        return ""
    return f"""
    <div class="photo" style="left:{x}px; top:{y}px; width:{w}px; height:{h + 8}px">
      <div class="im" style="width:100%; height:{h - 16}px">
        <img src="{uri(src)}" />
        <div class="halftone"></div>
      </div>
    </div>
    <div style="position:absolute; left:{x + 2}px; top:{y + h + 2}px; width:{w}px" class="pname">
      <span>{esc(item.get('name', ''))}</span><span class="pmeta">{esc(item.get('role', ''))}</span>
    </div>"""


def seal(x: int, y: int, size: int, text: str, rotate: int = -7) -> str:
    chars = "".join(f"<span style='font-size:{size / 2 * .86:.0f}px'>{esc(c)}</span>" for c in text)
    cols = 2 if len(text) <= 4 else 3
    return (f"<div class='seal' style='left:{x}px; top:{y}px; width:{size}px; height:{size}px;"
            f"grid-template-columns:repeat({cols},1fr); transform:rotate({rotate}deg);"
            f"padding:{size * .1:.0f}px'>{chars}</div>")


def grain() -> str:
    return """<div class="grain">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <filter id="gn"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3"/>
      <feColorMatrix type="saturate" values="0"/></filter>
      <rect width="100%" height="100%" filter="url(#gn)"/>
    </svg></div>"""


def title_size(s: str, wide: bool) -> int:
    n = len(s)
    if wide:
        return 152 if n <= 6 else (118 if n <= 9 else 92)
    return 118 if n <= 6 else (92 if n <= 9 else 74)


def html_16x9(b: dict) -> str:
    gs = b.get("photos", [])
    photos = ""
    slots = [(1212, 176, 300, 400), (1544, 262, 262, 350),
             (1212, 668, 262, 318), (1504, 682, 232, 296)]
    for item, (x, y, w, h) in zip(gs[:4], slots):
        photos += photo(x, y, w, h, item)
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{css()}</style></head>
<body><div class="sheet" style="width:1920px;height:1080px">
  {grain()}
  <div class="frame" style="left:56px;top:52px;right:56px;bottom:52px"></div>
  <div style="position:absolute;left:110px;top:96px" class="kick">{esc(b.get('serial',''))}</div>
  <div style="position:absolute;left:110px;top:206px;font-size:36px;letter-spacing:.1em;color:{INK_SOFT}">
    {esc(b.get('tagline',''))}
  </div>
  <div class="display" style="position:absolute;left:100px;top:286px;font-size:{title_size(b['title'], True)}px;line-height:1.06;letter-spacing:.02em">
    <span class="red">《</span>{esc(b['title'])}<span class="red">》</span>
  </div>
  <div style="position:absolute;left:110px;top:492px;width:190px;height:5px;background:{RED}"></div>
  <div style="position:absolute;left:110px;top:530px;display:flex;align-items:baseline;gap:26px">
    <span class="display" style="font-size:56px;letter-spacing:.2em">{esc(b['author'])}</span>
    <span style="font-size:23px;letter-spacing:.14em;color:{INK_SOFT}">著{f" · 又名 {esc(b['alias'])}" if b.get('alias') else ''}</span>
  </div>
  <div style="position:absolute;left:110px;top:644px;font-size:19px;letter-spacing:.34em;color:{INK_FAINT}">代表作</div>
  <div style="position:absolute;left:110px;top:684px;display:flex;align-items:baseline;gap:18px">
    <span style="font-size:52px;letter-spacing:.06em">{esc(b.get('classic',''))}</span>
    <span style="font-size:21px;color:{INK_FAINT};letter-spacing:.1em">{esc(b.get('classicNote',''))}</span>
  </div>
  <div style="position:absolute;left:110px;bottom:104px;display:flex;align-items:center;gap:18px">
    <span style="width:40px;height:1px;background:{INK_FAINT};display:inline-block"></span>
    <span style="font-size:21px;letter-spacing:.16em;color:{INK_SOFT}">{esc(b.get('words',''))} 万字 · {esc(b.get('chapters',''))} 章 · {esc(b.get('status','完结'))}</span>
    <span style="font-size:21px;letter-spacing:.16em;color:{INK_FAINT}">{esc(b.get('genres',''))}</span>
  </div>
  {photos}
  {seal(982, 520, 134, b.get('sealText', b['author'][:2]), -7)}
</div></body></html>"""


def html_4x3(b: dict) -> str:
    gs = b.get("photos", [])
    photos = ""
    slots = [(892, 176, 300, 400), (1080, 452, 250, 334), (838, 646, 232, 310)]
    for item, (x, y, w, h) in zip(gs[:3], slots):
        photos += photo(x, y, w, h, item)
    hook = esc(b.get("hook", "")).replace("，", "，<br/>", 1) if b.get("hook") else ""
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{css()}</style></head>
<body><div class="sheet" style="width:1440px;height:1080px">
  {grain()}
  <div class="frame" style="left:44px;top:44px;right:44px;bottom:44px"></div>
  <div style="position:absolute;left:92px;top:88px" class="kick">{esc(b.get('serial',''))}</div>
  <div style="position:absolute;left:92px;top:150px;width:640px;font-size:33px;line-height:1.7;
              letter-spacing:.06em;color:{INK_SOFT}">{hook}</div>
  <div class="display" style="position:absolute;left:84px;top:300px;font-size:{title_size(b['title'], False)}px;line-height:1.16;letter-spacing:.01em">
    <span class="red">《</span>{esc(b['title'])}<span class="red">》</span>
  </div>
  <div style="position:absolute;left:94px;top:640px;width:150px;height:4px;background:{RED}"></div>
  <div style="position:absolute;left:94px;top:676px;display:flex;align-items:baseline;gap:20px">
    <span class="display" style="font-size:48px;letter-spacing:.2em">{esc(b['author'])}</span>
    <span style="font-size:21px;letter-spacing:.14em;color:{INK_SOFT}">著</span>
  </div>
  <div style="position:absolute;left:94px;top:766px;font-size:18px;letter-spacing:.32em;color:{INK_FAINT}">代表作</div>
  <div style="position:absolute;left:94px;top:802px;font-size:44px;letter-spacing:.06em">{esc(b.get('classic',''))}</div>
  <div style="position:absolute;left:94px;top:868px;font-size:19px;color:{INK_FAINT};letter-spacing:.1em">
    {esc(b.get('classicNote',''))}
  </div>
  <div style="position:absolute;left:94px;bottom:86px;font-size:20px;letter-spacing:.16em;color:{INK_SOFT}">
    {esc(b.get('words',''))} 万字 · {esc(b.get('chapters',''))} 章 · {esc(b.get('status','完结'))}
  </div>
  {photos}
  {seal(560, 660, 126, b.get('sealText', b['author'][:2]), -7)}
</div></body></html>"""


def render(html: str, path: Path, w: int, h: int) -> None:
    from playwright.sync_api import sync_playwright
    tmp = ROOT / ".tmp" / f"{path.stem}.html"
    tmp.parent.mkdir(parents=True, exist_ok=True)
    tmp.write_text(html, encoding="utf-8")
    with sync_playwright() as pw:
        b = pw.chromium.launch(channel="msedge")
        pg = b.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
        pg.goto(tmp.resolve().as_uri())
        pg.wait_for_timeout(500)
        pg.screenshot(path=str(path))
        b.close()
    print(f"[+] {path}  {w}×{h}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", choices=["16x9", "4x3"])
    a = ap.parse_args()
    if not BOOK_JSON.is_file():
        raise SystemExit(f"[!] 缺 {BOOK_JSON}，照 examples/book.example.json 建一份")
    b = json.loads(BOOK_JSON.read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    if a.only in (None, "16x9"):
        render(html_16x9(b), OUT / "cover-16x9.png", 1920, 1080)
    if a.only in (None, "4x3"):
        render(html_4x3(b), OUT / "cover-4x3.png", 1440, 1080)


if __name__ == "__main__":
    main()
