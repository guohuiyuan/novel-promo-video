# novel-promo-video

把一份小说书评做成一条能直接投稿的推书视频。

> 给一份书评 → 出一条带多声线配音、白色硬字幕、BGM、一人一页人物档案的 1080p 视频 + 16:9/4:3 封面 + 标题简介。

这是给 Agent 用的 skill（WorkBuddy / Claude Code 风格），不是一键exe：文档描述流程，脚本干机械活，Agent 负责按书评写文案与做判断。

## 产出示例

《都市良人行》推书视频：12 分 21 秒，36 条配音（旁白 + 男主 + 11 位女主），旧报纸铅字版式，全片白色硬字幕。

```
书讯 → 简介快剪 → 排雷 → 男主（同女主页版式）→ 女主 ×11（一人一页）→ 收尾
```

## 安装

```bash
git clone https://github.com/guohuiyuan/novel-promo-video.git
cd novel-promo-video
bash install.sh          # macOS / Linux / Git Bash
# 或 PowerShell: .\install.ps1
```

安装就是把仓库放到 `~/.workbuddy/skills/novel-promo-video/`，重启会话后可直接触发。也可以不安装，直接 `python scripts/novel_video.py ...` 用。

## 依赖

| 依赖 | 用途 | 必需 |
|---|---|---|
| ffmpeg / ffprobe | 量时长、混音、烧字幕 | 是 |
| node + npx | Remotion 渲染 | 是 |
| Chrome / Edge | Remotion 的 browser executable | 是 |
| [latent-media](https://github.com/guohuiyuan/latent-media) | TTS | 是（配音） |
| [go-music-dl](https://github.com/guohuiyuan/go-music-dl) | 搜曲下载 | 否（可用户给曲） |
| playwright | 截图出封面 | 否（可手做封面） |

跑 `python scripts/novel_video.py doctor` 一次看缺口。

## 快速开始

```bash
R=scripts/novel_video.py

python "$R" doctor
python "$R" init path/to/书评.md --dir projects/我的书 --name 我的书

# 1) 填 design/script.json、film/src/data.ts、design/book.json
# 2) 人物图放进 projects/我的书/film/public/art/

python "$R" tts projects/我的书
python "$R" timeline projects/我的书
cd projects/我的书/film && npx tsc --noEmit && cd ../../..

python "$R" still projects/我的书 --time 143     # 先看静帧
python "$R" render projects/我的书
python "$R" bgm projects/我的书 search "纯音乐 沉稳"
python "$R" bgm projects/我的书 get <id> audio/bgm.mp3 --name 曲名 --artist 作者
python "$R" build projects/我的书 --bgm audio/bgm.mp3
python "$R" cover projects/我的书
python "$R" check projects/我的书
```

完整说明在 [SKILL.md](SKILL.md)，细节在 `references/`。

## 仓库结构

```
SKILL.md                 触发条件、完整流程、命令表、id 契约
references/
  pipeline.md            文件怎么流、时间基准
  design-contract.md     旧报纸版式的坐标/字号/色值/动效
  audio.md               配音、电平、BGM 循环接续
  subtitles.md           rec2video 白色字幕规格与断句
  review.md              静帧评审清单
  lessons.md             事故记录（NaN、静音、折行…）
scripts/
  novel_video.py         统一入口（doctor/init/tts/.../check）
  vo.py                  调 latent-media TTS，量时长写 timeline.json
  mk_timeline.py         timeline.json → timeline.ts
  mk_subs.py             rec2video 风格 ASS + SRT
  mix.py                 旁白对齐 + BGM 循环 + 固定电平
  bgm.py                 go-music-dl 搜曲/下载
  cover.py               数据驱动的 16:9 / 4:3 封面
templates/film/          Remotion 工程模板（7 个场景 + 版式套件 + 类型化 data.ts）
examples/                script.json / book.json 示例
```

## 设计原则

1. **事实优先于流畅** —— 写进画面的每句话都能回书评查到，查不到写「书评未给」。
2. **声音与画面分层** —— 能放在画面上的信息不配音；角色只说台词，旁白只讲经历与因果。
3. **声音先量、画面后画** —— 时间轴来自 TTS 实测时长，画面按绝对秒排；改一条配音只影响它之后的内容。
4. **不把别人的实现搬进仓库** —— 只编排 latent-media / go-music-dl / rec2video / motion-skill 的能力。

## License

[AGPL-3.0](LICENSE) — GNU Affero General Public License v3.0
