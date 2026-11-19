---
name: novel-promo-video
description: "把一份小说书评（novel-scan 的人物卡 + 雷点 + 简介）做成一条能直接投稿的推书视频：旧报纸铅字版式、Remotion 逐帧渲染、多声线配音、按实测时长排时间轴、一人一页的人物档案、rec2video 白色硬字幕、go-music-dl 配乐与侧链以外的固定电平混音、16:9/4:3 封面、标题与简介。当用户说「把这个小说做成推书视频」「做一条扫书视频」「给这本书做个介绍片」「书评转视频」「一人一页讲女主经历」时使用。用户只给一份书评 md 也能跑完。"
display_name: "扫书视频流水线"
agent_created: true
version: 1.0.0
tags: [视频, video, 小说, 推书, 扫书, Remotion, 配音, TTS, 字幕, BGM, 封面, novel-scan]
---

# novel-promo-video · 书评 → 推书视频

一句话：**给一份书评，出一条带配音、白色硬字幕、BGM、人物档案页的 1080p 推书视频 + 两版封面 + 标题简介。**

本仓库只做编排与版式，能力全调外部，**不把别人的实现搬进来**：

| 能力 | 来源 | 本仓库怎么用 |
|---|---|---|
| 配音 | [latent-media](https://github.com/guohuiyuan/latent-media) | 调 `latent.py tts`，声音 id 由用户指定 |
| 配乐 | [go-music-dl](https://github.com/guohuiyuan/go-music-dl) | 调本机 web 服务搜曲/下载；用户给曲子则跳过 |
| 字幕规范 | [rec2video](https://github.com/guohuiyuan/rec2video) | 白色 Microsoft YaHei 46 / 描边 3.4 / 阴影 1.8，口播≠字幕 |
| 动效底座 | [deepseek-opus-motion-skill](https://github.com/8533502-dev/deepseek-opus-motion-skill) | `templates/film/src/lib/motion.tsx` 的纯函数与精确缓动 |

硬依赖：`ffmpeg` / `ffprobe` / `node` + `npx` / 本机 Chrome 或 Edge。软依赖：playwright（出封面）、go-music-dl web（换曲子）。

```
书评 md ──init──▶ 工程骨架 ──填数据──▶ script.json + book.json + data.ts
                                          │
              latent 配音 → timeline.ts → 静帧评审 → Remotion 渲染
                                          │
                    BGM 循环接续 + 固定电平混音 → 烧白色字幕 → 成片
                                          │
                                   封面 16:9 / 4:3 + 标题简介
```

## 0. 先判需求，再动手

用户必须给（或能从上下文推出来）：**书评 md**、**书名**、**声线分配**（旁白 / 男主 / 女主各用哪个 voice id）。没给声线就问一次；别自作主张——声线是这条片子的骨架。

书评要能回答这几类问题，缺哪类就在画面上写「书评未给」，**不要脑补**：
- 书籍信息：作者、字数、章数、平台、代表作
- 简介：3 个能剪成快剪的因果段
- 雷点 / 郁闷点：数量、分布、最重那一条的原话
- 人物：身份、外貌、性格、名场面台词及出处、经历、结局

## 1. 建工程

```bash
R=<本 skill 目录>/scripts/novel_video.py
python "$R" doctor                                     # 先体检
python "$R" init <书评.md> --dir <工程目录> --name <书名>
```

`init` 会复制 Remotion 模板、建目录、把书评原件存成 `design/source-review.md`，并放两份示例配置。**下一步是填数据，不是直接配音。**

## 2. 填数据：声音与画面分层

这是这条流水线最重要的规矩，违反了就会变成「旁白念了一堆画面上已有的字」：

- **旁白只讲因果和经历。** 数字、头衔、书名、标签、评分、人物档案字段全部交给画面。
- **角色只说名场面台词。** 身份、性格、结局不念，写在纸上。
- **经历必须讲完整。** 用户如果给了原文段落，一字不落地进旁白；不要「一句话概括」。

改三个文件：

| 文件 | 填什么 | 注意 |
|---|---|---|
| `design/script.json` | 每条配音的 `id / sec / kind / voice / text` | id 定下就别改；一场戏里 `T.<id>` 全靠它 |
| `film/src/data.ts` | 书讯、评分、简介页、雷点、收尾页、男主、女主档案 | 所有字段照书评抄；照片放 `film/public/art/` |
| `design/book.json` | 封面的书名、作者、代表作、hook、人物照清单 | 照片按重要性排序：16:9 取前 4，4:3 取前 3 |

### id 契约（`mk_timeline.py` 依赖它，改了会全片错位）

| 段 `sec` | id | `kind` | 谁念 |
|---|---|---|---|
| `info` | `a01` `a02` | narration | 旁白 |
| `synopsis` | `s01`–`s03` | narration | 旁白（快剪，每条 7–11 秒） |
| `risk` | `r01` `r02` | narration | 旁白 |
| `hero` | `h01` | **line** | 男主本人 |
| `hero` | `h02`–`h04` | narration | 旁白（经历讲全） |
| `women` | `p01`–`pNN` | **line** | 女主本人 |
| `women` | `q01`–`qNN` | narration | 旁白（经历讲全） |
| `finale` | `f01`–`f03` | narration | 旁白 |

女主数量 N = `WOMEN_DATA.length` = `timeline.ts` 里 `WOMEN.length`，三处必须一致。`check` 会验。

## 3. 配音与时长

```bash
python "$R" tts <工程>                                  # 全量；已有文件自动复用
python "$R" tts <工程> --only q01 --force               # 只重做一条
python "$R" timeline <工程>                             # 生成 film/src/timeline.ts
cd <工程>/film && npx tsc --noEmit
```

- `--only` 只是「允许重做」，文件在就复用 → **必须配 `--force`**，否则什么都不会重新生成。
- 语速体检：中文 4.5–7.5 字/秒。低于 4.0 说明被截断，高于 8.5 说明念太快，都要重听。
- 一条配音 = 一段旁白，时长取 `ffprobe` 实测；条与条之间留 0.28s 气口。`timeline.ts` 的 `CUT` 取每段第一条前 0.35s（字先落纸，声后到）。

## 4. 静帧评审（别跳过，整片渲染很贵）

```bash
python "$R" still <工程> --time 8        # 书讯
python "$R" still <工程> --time 22       # 简介
python "$R" still <工程> --time 90       # 男主
python "$R" still <工程> --time 143      # 女主第一页
python "$R" still <工程> --time 395      # 女主中段
python "$R" still <工程> --time 730      # 收尾
```

逐张看，重点查：`台词是否折成第三行压到下一栏`、`字段是否压到页脚线 974`、`大字页码是否与文字相撞`、`照片是否被文字盖住`。**发现一处就改 `data.ts` 或 `Scene0N.tsx`，再静帧确认，然后才整片渲。** 台词用 `\n` 手动断行，别指望自动折行。

## 5. 渲染

```bash
python "$R" render <工程>                               # 约 20–40 分钟，取决于片长
python "$R" render <工程> --scale 0.5                   # 快速预览
```

Remotion 只出画面（`FILM.sound = false`），声音在最后一步合。渲染报 `inputRange must contain only finite numbers`：一定是某个场景引用了不存在的 `T.<id>`（`undefined - 0.35 = NaN`）。`tsc` 查不出来，因为 `T` 是 `Record<string, number>`——全局 grep `T.` 对着 `timeline.ts` 的 id 核一遍。

## 6. BGM 与混音

```bash
# 起服务（换曲子时才需要）
cd ~/code/golang/musicwork/go-music-dl && ./music-dl.exe web --no-browser -p 8080
python "$R" bgm <工程> search "纯音乐 沉稳" "cinematic"
python "$R" bgm <工程> get <id> audio/bgm.mp3 --name 曲名 --artist 作者
python "$R" mix <工程> --bgm audio/bgm.mp3
```

**别用 sidechaincompress。** 推书视频旁白覆盖率 90% 以上，侧链等于让 BGM 在 0 和 1 之间一直跳，听感就是「忽大忽小」。这里每条旁白按实测 `mean_volume` 归到 −19 dB，BGM 固定 −36 dB，17 dB 差距，靠音量差让人声清楚，音乐电平全程不变。

**曲子比片子短必须接够。** 只 `atrim=0:片长` 会让曲子结束后整段是数字静音（听感「音乐突然没了」）。`mix.py` 用 `asplit=N` + 逐段 `acrossfade d=4` 循环接续，N = `ceil((片长−曲长)/(曲长−4))+1`。验法见 `check`：全片按 0.25s 窗算 RMS，中段不该出现 `< −60 dB` 的窗口。

## 7. 字幕（rec2video 规格）

```bash
python "$R" subs <工程>          # 同时出 design/subs.ass（烧录用）和 subs.srt（投稿外挂）
```

- Microsoft YaHei 46px（台词 48px），纯白 `&H00FFFFFF`，黑描边 3.4，阴影 1.8
- 一行 ≤20 字（台词 24 字），按标点断，句号/分号/破折号是强断点不往前并
- `MarginV 116`：比 rec2video 的 46px 高，因为这片子底部有一条铅印页脚（线在 974）
- **口播 ≠ 字幕**：旁白念「一百一十一万字」，字幕写「111 万字」。数字对照表在 `mk_subs.py` 的 `NUM`，按新书补条目；数字两侧会自动补空格

字幕是烧进画面的（`ffmpeg -vf ass=...`），同时留一份 srt 给平台。

## 8. 合成、封面、文案

```bash
python "$R" build <工程> --bgm audio/bgm.mp3           # 渲染 + 混音 + 烧字幕一步到位
python "$R" cover <工程>                                # 两版封面
python "$R" check <工程>                                # 交付前自检
```

`build` 也支持 `--no-subs`（先出干净片看版式）。

标题按「全片最勾人的一幕」写，不按「这本书讲了什么」写。经验句式：

```
抱着战友的遗体沉进沼泽，七天后他从崖壁爬了回来     ← 场景 + 反差
一袋夜明珠闯天京，三十五岁的女总裁跪下来叫他"圣主"  ← 数字 + 身份错位
订阅八百，作者还是写完了 111 万字                  ← 数字 + 坚持
```

简介要包含：一句话故事、作者与代表作、**雷点/郁闷点数量**（这类书评读者会先看这个）、最争议的收尾。写成 `标题与简介.md` 放工程根。

## 9. 交付

四样一起给：成片 `out/<名字>-推书.mp4`、外挂字幕 `design/subs.srt`、两版封面 `cover/cover-16x9.png` / `cover-4x3.png`、`标题与简介.md`。用 present_files 一次呈现。

## 命令表

| 命令 | 作用 |
|---|---|
| `doctor` | 体检 ffmpeg / node / latent-media / 浏览器 / 音乐站 |
| `init <书评> --dir <目录> [--name 名]` | 建工程骨架 |
| `tts <工程> [--only ids] [--force]` | 配音 + 实测时长 → `design/timeline.json` |
| `timeline <工程>` | `timeline.json` → `film/src/timeline.ts` |
| `still <工程> --time 秒` | 渲单帧评审 |
| `render <工程> [--scale 0.5]` | 渲全片无声版 |
| `subs <工程>` | 出 ASS + SRT |
| `bgm <工程> search/get ...` | 搜曲 / 下载 |
| `mix <工程> [--bgm 文件]` | 旁白对齐 + BGM 循环 + 固定电平 → `audio/mix.wav` |
| `build <工程> --bgm 文件 [--no-subs]` | 渲染 + 混音 + 烧字幕 |
| `cover <工程>` | 16:9 / 4:3 封面 |
| `check <工程>` | id 引用、人数对齐、字幕行长、静音段、成片参数 |

## 常见改动怎么落

| 想改什么 | 改哪里 | 要不要重渲 |
|---|---|---|
| 换 BGM | `python "$R" mix <工程> --bgm audio/新曲.mp3`，然后重烧字幕合成 | 否 |
| 某段台词/经历 | `design/script.json` → `tts --only <id> --force` → `timeline` → 渲 → `mix` → `subs` | 是 |
| 页面文案或人物字段 | `film/src/data.ts` → 静帧确认 → 渲 → 烧字幕 | 是 |
| 字幕字号/位置 | `scripts/mk_subs.py` 的 `HEAD` → `subs` → 重烧字幕 | 否 |
| 整片配色/字体 | `templates/film/src/spec.ts` 的 `C` / `FONT` | 是 |

## 深入阅读

- `references/pipeline.md` — 每一步的输入输出文件、目录约定
- `references/design-contract.md` — 旧报纸版式的坐标、字号、色值、动效节奏
- `references/audio.md` — 配音、电平、BGM 接续的完整参数与踩坑
- `references/subtitles.md` — rec2video 字幕规格与断句规则
- `references/review.md` — 静帧评审清单
- `references/lessons.md` — 事故记录（NaN、静音、折行、进程回收等）
