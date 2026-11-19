# 流水线：文件怎么流

## 工程目录

```
<工程>/
├── design/
│   ├── source-review.md    # 书评原件，引文回查用
│   ├── book.json           # 封面文案 + 人物照清单
│   ├── script.json         # 配音稿：id / sec / kind / voice / text
│   ├── timeline.json       # 配音实测时长 + 累加起点（vo.py 产出）
│   ├── levels.json         # 电平缓存（mix.py 产出）
│   ├── subs.ass            # 烧录用硬字幕
│   └── subs.srt            # 投稿外挂字幕
├── audio/
│   ├── vo/<id>.mp3         # 一条一段，绝不合并
│   ├── bgm-a.mp3
│   └── mix.wav             # 最终音轨
├── film/
│   ├── package.json        # Remotion 4.0.537 + React 19.1.0
│   ├── public/art/*.webp   # 人物图，竖图，脸偏上
│   └── src/
│       ├── index.ts / Root.tsx      # 注册 Composition "Film"
│       ├── spec.ts                  # 设计契约（颜色/字体/版心）
│       ├── data.ts                  # ← Agent 填：所有文案与人物档案
│       ├── timeline.ts              # ← 脚本生成，别手改
│       ├── lib/{motion,print,slides}.tsx
│       └── scenes/Scene01..06.tsx   # 书讯 / 简介 / 排雷 / 男主 / 女主 / 收尾
├── out/
│   ├── video-mute.mp4      # Remotion 输出，无声
│   └── <名字>-推书.mp4     # 成片
├── cover/cover-{16x9,4x3}.png
├── .tmp/                   # 静帧、临时 html
└── 标题与简介.md
```

## 顺序与依赖

1. `init` → 骨架 + 空模板
2. Agent 填 `script.json` / `data.ts` / `book.json`；把人物图放进 `film/public/art/`
3. `tts` → `timeline.json`（必须先配音，画面才知道每页多长）
4. `timeline` → `timeline.ts`；`npx tsc --noEmit` 过
5. `still` × 6 → 看静帧，改版式
6. `render` → `video-mute.mp4`
7. `bgm search/get` → `audio/bgm-a.mp3`
8. `mix` → `audio/mix.wav`（长度必须等于 `timeline.total + 7.5`）
9. `subs` → `subs.ass` + `subs.srt`
10. `build` 里那步 ffmpeg：无声画面 + mix.wav + `-vf ass=subs.ass` → 成片
11. `cover` + 写文案 → `check` → 交付

第 6 步是唯一的长任务（20–40 分钟），所以第 5 步的静帧一定要先看够。第 8/9 步不依赖渲染，可以和渲染并行做。

## 时间基准

全片所有时间点都是**绝对秒**。场景只用 `useTime()` 拿 `t = frame / fps`，不用 `<Sequence>`，不用相对帧号。这样：

- 拖动时间轴到任意一帧，画面都是确定的
- 改一条配音的长度，只影响它之后的条目（时间轴重新累加）
- 静帧评审的 `--frame=` 就是 `秒 × 30`

`timeline.ts` 导出：

| 常量 | 用途 |
|---|---|
| `CLIPS` | 每条配音的 `start / dur / end / voice / kind` |
| `T` | `id → start`，场景里按句取点 |
| `CUT` | 六段起点 = 该段第一条.start − 0.35s |
| `WOMEN` | 每位女主的页窗口：`start / end / lineAt / lineDur / narrAt / narrDur` |
| `HERO_PAGE` | 男主页窗口，同结构 |
| `VO_END` / `FILM_END` | 最后一句结束 / 片长（多 7.5s 标版留白） |

页窗口里的 `narrDur` 用来把档案字段按时长分拍落下：女主 0.26 / 0.46 / 0.64 / 0.82，男主 0.22 / 0.42 / 0.62 / 0.82。三四秒一句旁白期间纸面不会停住。
