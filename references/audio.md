# 音频：配音 → 时间轴 → 混音

## 声线怎么分

一条推书视频不要超过三种声线，否则像群戏不像介绍：

| 角色 | 声线来源 | 念什么 |
|---|---|---|
| 旁白 | 用户指定（本次 `voice-210` 男声） | 因果、经历、雷点、收尾 |
| 男主 | 用户指定（本次 `voice-219` 少年） | 只有名场面台词 |
| 女主 | 用户指定（本次 `voice-42` 达妮娅） | 每人一句名场面台词 |

用户给的 voice id 在 latent-media 缓存里查不到时，先 `latent.py voices --refresh` 再查。缓存条目会变（本次从 165 条刷到 197 条才出现 `voice-210`）。

TTS 命令（由 `vo.py` 封装）：

```bash
latent.py tts --voice <voice> --text "..." -o out.mp3 --format mp3 --language Chinese
```

`--only` 要配 `--force` 才真的重做。超时失败会自动重试 3 次；还剩失败就单独补那一条，别重跑全量。

## 时间轴

一条配音 = 一段旁白。用 `ffprobe` 量真实时长，按 0.28s 气口累加：

```
clip[i].start = sum(dur[0..i-1]) + 0.28 * i
total = sum(dur) + 0.28 * (N-1)
```

`timeline.total + 7.5s` 是片长（最后留标版）。`mix.py --tail` 缺省值必须和 `mk_timeline.py` 的 `TAIL_HOLD` 一致，否则 ffmpeg `-shortest` 会把片尾盖印裁掉。

语速体检：去掉标点后的字数 / 时长。中文 4.5–7.5 字/秒正常，<4.0 可能被截断，>8.5 念得太快。抽一条做转写核对，确认没吞字再往下走。

## 混音参数（`mix.py`）

**固定电平，不侧链。** 参数：

| 项 | 值 |
|---|---|
| 每条旁白目标平均电平 | −19 dB（按实测 `mean_volume` 逐条补 gain） |
| BGM 固定平均电平 | −36 dB |
| 旁白总线 | `highpass=f=85,acompressor=threshold=0.16:ratio=2.2:attack=12:release=220` |
| BGM 淡入 / 淡出 | 2.0s / 6.0s（只在两头） |
| 结尾 | `alimiter=limit=0.95:level=disabled` |

为什么不用 `sidechaincompress`：推书视频旁白覆盖率 90% 以上，侧链让 BGM 一直是 0 或 1，听感就是「忽大忽小」。17 dB 的固定差距足够让人声清楚，音乐也不会跳。

## BGM 不够长：必须循环接够

`mix.py` 的做法：

```
[bgm]aresample=48000,asplit=N → 每段 atrim=0:曲长 → 逐段 acrossfade d=4 → atrim=0:片长
N = 1 if 曲长 >= 片长 else ceil((片长-曲长)/(曲长-4)) + 1
```

只接一段不够：本次 249.9s 的曲子配 551s 片子，接一段只到 495.7s，后面又是数字静音。三段才铺满。

**验证方法**（`check` 里有现成实现）：

```bash
ffmpeg -i audio/mix.wav -ac 1 -ar 16000 -f wav .tmp/m.wav
# Python 按 0.25s 窗算 RMS，找 < -60 dB 的窗口
```

只允许片尾淡出的最后 1–2 窗静音；中段有窗口就是没接够。

## go-music-dl

服务：`music-dl.exe web --no-browser -p 8080`。下载接口必须带四个参数，少一个返回 400：

```
/music/download?id=<id>&source=<source>&name=<曲名>&artist=<作者>&stream=1
```

搜索结果页是 HTML，用 `<li class="song-card" data-id data-name data-artist data-duration>` 解析（`scripts/bgm.py` 已封装）。有的 id 会 404，换一条候选即可。

曲子不 obligated 非要从这来：用户给了 mp3 就 `mix --bgm <文件>`，不用起服务。

## 从无声画面到成片

```bash
ffmpeg -y -i out/video-mute.mp4 -i audio/mix.wav \
  -vf "ass=design/subs.ass" \
  -map 0:v:0 -map 1:a:0 -c:v libx264 -crf 18 -preset medium \
  -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart \
  "out/<名字>-推书.mp4"
```

`-vf ass=...` 用相对路径，cwd 必须是工程根。`--no-subs` 时去掉这段即可出干净片看版式。
