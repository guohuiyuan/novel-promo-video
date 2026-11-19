#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""novel-promo-video — 把一份小说书评做成推书视频。

    python scripts/novel_video.py doctor
    python scripts/novel_video.py init <书评.md> --dir <工程目录> [--name 书名]
    python scripts/novel_video.py tts <工程> [--only q01 --force]
    python scripts/novel_video.py timeline <工程>
    python scripts/novel_video.py still <工程> --time 120
    python scripts/novel_video.py render <工程>
    python scripts/novel_video.py subs <工程>
    python scripts/novel_video.py bgm <工程> search "纯音乐 沉稳"
    python scripts/novel_video.py bgm <工程> get <id> audio/bgm.mp3 --name 曲名 --artist 作者
    python scripts/novel_video.py mix <工程> [--bgm audio/bgm.mp3]
    python scripts/novel_video.py build <工程> --bgm audio/bgm.mp3
    python scripts/novel_video.py cover <工程>
    python scripts/novel_video.py check <工程>

工程外调用靠 <工程> 参数；也可以 cd 到工程里、用环境变量 NOVEL_PROJECT 直接调子脚本。
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SKILL = HERE.parent
TEMPLATE = SKILL / "templates" / "film"
EDGE = os.environ.get("EDGE_PATH", r"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe")
VOICE_SCRIPT = Path(os.environ.get(
    "LATENT_PY", Path.home() / ".workbuddy" / "skills" / "latent-media" / "scripts" / "latent.py"))


def run(cmd: list[str], cwd: Path | None = None, env: dict | None = None) -> int:
    e = os.environ.copy()
    if cwd is not None:
        e["NOVEL_PROJECT"] = str(cwd.resolve())
    if env:
        e.update(env)
    print("[>]", " ".join(str(x) for x in cmd), flush=True)
    r = subprocess.run([str(x) for x in cmd], cwd=str(cwd) if cwd else None, env=e)
    return r.returncode


def script(project: Path, name: str, *args: str) -> int:
    return run([sys.executable, HERE / name, *args], cwd=project)


def which(x: str) -> str | None:
    return shutil.which(x)


def doctor() -> int:
    ok = True
    for tool in ("ffmpeg", "ffprobe", "node", "npx"):
        p = which(tool)
        print(("  ✓ " if p else "  ✗ ") + f"{tool}: {p or '缺失'}")
        ok = ok and bool(p)
    print(("  ✓ " if VOICE_SCRIPT.is_file() else "  ✗ ")
          + f"latent-media: {VOICE_SCRIPT}")
    ok = ok and VOICE_SCRIPT.is_file()
    # 配音 key 不验内容，只提示在哪里放
    latent_dir = VOICE_SCRIPT.parent.parent
    key = latent_dir / "keys.json"
    print(("  ✓ " if key.is_file() else "  ! ") + f"配音 key 缓存: {key}"
          + ("" if key.is_file() else "（首次用 latent.py keys --audio <key> 保存）"))
    edge = Path(EDGE)
    print(("  ✓ " if edge.is_file() else "  ! ") + f"Edge: {edge}")
    if not edge.is_file():
        print("      Mac/Linux 用系统 Chrome；或设 EDGE_PATH 指向本机浏览器")
    # 音乐站可选
    import urllib.request
    try:
        with urllib.request.urlopen("http://127.0.0.1:8080/music/search?q=test&type=song&sources=netease",
                                    timeout=3):
            print("  ✓ go-music-dl web :8080 在跑")
    except Exception:
        print("  ! go-music-dl web :8080 没在跑（换曲子时才需要）")
    print("环境检查" + ("通过" if ok else "有缺口，先补齐再往下跑"))
    return 0 if ok else 2


def init(src: Path, project: Path, name: str | None) -> int:
    if project.exists() and any(project.iterdir()):
        print(f"[!] 目录非空：{project}（用 --dir 换一个）")
        return 2
    if not src.is_file():
        print(f"[!] 书评不存在：{src}")
        return 2
    for sub in ("design", "audio/vo", "out", "cover", "film/public/art", ".tmp"):
        (project / sub).mkdir(parents=True, exist_ok=True)
    shutil.copytree(TEMPLATE, project / "film", dirs_exist_ok=True)
    (project / "film" / "src" / "timeline.ts").write_text(
        "// 占位：跑 `novel_video.py tts <工程>` 与 `timeline <工程>` 后生成。\n"
        "export const CLIPS: any[] = [];\nexport const VO_END = 0;\n"
        "export const FILM_END = 1;\nexport const CUT = {info:0,synopsis:0,risk:0,hero:0,women:0,finale:0} as const;\n"
        "export const WOMEN: any[] = [];\nexport const HERO_PAGE = {start:0,end:0,lineAt:0,lineDur:0,narrAt:0,narrDur:0};\n"
        "export const T: Record<string, number> = {};\n", encoding="utf-8")
    shutil.copy(SKILL / "examples" / "script.example.json", project / "design" / "script.json")
    shutil.copy(SKILL / "examples" / "book.example.json", project / "design" / "book.json")
    # 书评原件进工程，便于回查引文
    shutil.copy(src, project / "design" / "source-review.md")
    print(f"[+] 工程 {project}")
    print("    next: ① 读 source-review.md，填 design/book.json 与 design/script.json")
    print("          ② 填 film/src/data.ts（人物档案与页面文案）")
    print("          ③ python scripts/novel_video.py tts <工程>")
    return 0


def render(project: Path, still: float | None, scale: float | None) -> int:
    film = project / "film"
    if still is not None:
        frame = int(round(still * 30))
        dst = project / ".tmp" / f"still-{still}.png"
        cmd = ["npx", "remotion", "still", "Film", dst, f"--frame={frame}",
               f"--browser-executable={EDGE}", "--log=error"]
        rc = run(cmd, cwd=film)
        print(f"[+] {dst}")
        return rc
    dst = project / "out" / "video-mute.mp4"
    cmd = ["npx", "remotion", "render", "Film", dst, f"--browser-executable={EDGE}", "--log=error"]
    if scale:
        cmd.append(f"--scale={scale}")
    return run(cmd, cwd=film)


def build(project: Path, bgm: str | None, no_subs: bool) -> int:
    rc = render(project, None, None)
    if rc:
        return rc
    rc = mix(project, bgm)
    if rc:
        return rc
    video = project / "out" / "video-mute.mp4"
    audio = project / "audio" / "mix.wav"
    out = project / "out" / f"{(project.name)}-推书.mp4"
    vf = [] if no_subs else ["-vf", "ass=design/subs.ass"]
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", video, "-i", audio, *vf,
           "-map", "0:v:0", "-map", "1:a:0", "-c:v", "libx264", "-crf", "18",
           "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
           "-shortest", "-movflags", "+faststart", out]
    rc = run(cmd, cwd=project)
    if rc == 0:
        print(f"[+] 成片 {out}")
    return rc


def mix(project: Path, bgm: str | None) -> int:
    args = ["mix.py"]
    if bgm:
        args += ["--bgm", bgm]
    return script(project, *args)


def check(project: Path) -> int:
    """交付前自检：id 引用、人数对齐、静音段、字幕行长、成片参数。"""
    bad = 0
    tl = (project / "film" / "src" / "timeline.ts").read_text(encoding="utf-8")
    ids = set(re.findall(r'id: "([a-z0-9]+)"', tl))
    used = set()
    for f in (project / "film" / "src" / "scenes").glob("*.tsx"):
        # CUT.info / FONT.body 也含 "T."，前面必须是非标识符字符才算时间点引用
        used |= set(re.findall(r"(?<![A-Za-z0-9_])T\.([a-z0-9]+)",
                               f.read_text(encoding="utf-8")))
    miss = sorted(used - ids)
    print("  id 引用:", "✓ 全部存在" if not miss else f"✗ 缺失 {miss}")
    bad += bool(miss)

    data = (project / "film" / "src" / "data.ts").read_text(encoding="utf-8")
    n_data = len(re.findall(r"\bnum: '\d\d'", data.split("WOMEN_DATA")[1])) if "WOMEN_DATA" in data else 0
    n_win = len(re.findall(r'num: "\d\d"', tl.split("WOMEN = [")[1])) if "WOMEN = [" in tl else 0
    print(f"  女主页: data.ts {n_data} 人 / timeline {n_win} 页",
          "✓" if n_data == n_win else "✗ 数量不一致（会有空页或丢人）")
    bad += n_data != n_win

    ass = project / "design" / "subs.ass"
    if ass.is_file():
        rows = [re.split(r"\{[^}]*\}", r.strip())[-1] for r in
                ass.read_text(encoding="utf-8").splitlines() if r.startswith("Dialogue")]
        longest = max((len(x) for x in rows), default=0)
        print(f"  字幕: {len(rows)} 行 / 最长 {longest} 字", "✓" if longest <= 28 else "✗ 太长会压照片")
        bad += longest > 28

    wav = project / "audio" / "mix.wav"
    if wav.is_file():
        tmp = project / ".tmp" / "check-mono.wav"
        run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-ac", "1", "-ar", "16000", tmp])
        import array
        import math
        import wave
        with wave.open(str(tmp)) as w:
            sr = w.getframerate()
            a = array.array("h")
            a.frombytes(w.readframes(w.getnframes()))
        win = int(sr * 0.25)
        sil = []
        for i in range(0, len(a) - win, win):
            chunk = a[i:i + win]
            rms = math.sqrt(sum(x * x for x in chunk) / len(chunk)) or 1e-9
            if 20 * math.log10(rms / 32768) < -60:
                sil.append(round(i * 0.25, 1))
        # 片尾淡出允许 2 秒；中段有静音就是 BGM 没接够
        mid = [x for x in sil if x < len(a) / sr - 3]
        print(f"  混音静音: {len(sil)} 窗，其中中段 {len(mid)} 窗",
              "✓" if not mid else f"✗ 中段静音 {mid[:6]}")
        bad += bool(mid)

    mp4 = project / "out" / f"{project.name}-推书.mp4"
    if mp4.is_file():
        r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                            "format=duration,size:stream=codec_name,width,height",
                            "-of", "default=nw=1", str(mp4)], capture_output=True, text=True)
        print("  成片:\n   " + r.stdout.strip().replace("\n", "\n   "))
    print("自检" + ("通过" if bad == 0 else f"发现 {bad} 类问题"))
    return 0 if bad == 0 else 2


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("doctor")

    p = sub.add_parser("init")
    p.add_argument("review", type=Path, help="书评 md")
    p.add_argument("--dir", type=Path, required=True, help="新工程目录")
    p.add_argument("--name", help="工程名（默认书名）")

    p = sub.add_parser("tts")
    p.add_argument("project", type=Path)
    p.add_argument("--only", nargs="*")
    p.add_argument("--force", action="store_true")

    for c in ("timeline", "subs"):
        sub.add_parser(c).add_argument("project", type=Path)

    p = sub.add_parser("bgm")
    p.add_argument("project", type=Path)
    p.add_argument("args", nargs="+", help="search '关键词' 或 get <id> <out.mp3>")
    p.add_argument("--source", default="netease")
    p.add_argument("--name", default="")
    p.add_argument("--artist", default="")

    for c in ("mix", "cover", "check"):
        q = sub.add_parser(c)
        q.add_argument("project", type=Path)
        if c == "mix":
            q.add_argument("--bgm")

    p = sub.add_parser("still")
    p.add_argument("project", type=Path)
    p.add_argument("--time", type=float, required=True)

    p = sub.add_parser("render")
    p.add_argument("project", type=Path)
    p.add_argument("--scale", type=float)

    p = sub.add_parser("build")
    p.add_argument("project", type=Path)
    p.add_argument("--bgm", required=True, help="BGM 文件（相对工程或绝对路径）")
    p.add_argument("--no-subs", action="store_true")

    a = ap.parse_args()

    if a.cmd == "doctor":
        raise SystemExit(doctor())
    if a.cmd == "init":
        raise SystemExit(init(a.review.resolve(), a.dir.resolve(), a.name))
    project = a.project.resolve() if hasattr(a, "project") else None
    if not project or not project.is_dir():
        raise SystemExit(f"[!] 工程目录不存在：{project}")

    if a.cmd == "tts":
        args = ["vo.py"]
        if a.only:
            args += ["--only", *a.only]
        if a.force:
            args.append("--force")
        rc = script(project, *args)
    elif a.cmd == "timeline":
        rc = script(project, "mk_timeline.py")
    elif a.cmd == "subs":
        rc = script(project, "mk_subs.py")
    elif a.cmd == "bgm":
        rc = script(project, "bgm.py", a.args[0], *a.args[1:],
                    "--source", a.source, "--name", a.name, "--artist", a.artist)
    elif a.cmd == "mix":
        rc = mix(project, a.bgm)
    elif a.cmd == "cover":
        rc = script(project, "cover.py")
    elif a.cmd == "still":
        rc = render(project, a.time, None)
    elif a.cmd == "render":
        rc = render(project, None, a.scale)
    elif a.cmd == "build":
        rc = build(project, a.bgm, a.no_subs)
    elif a.cmd == "check":
        rc = check(project)
    else:
        rc = 2
    raise SystemExit(rc)


if __name__ == "__main__":
    main()
