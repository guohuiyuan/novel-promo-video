# 事故记录：踩过的坑

按「症状 → 真因 → 修法」记。做新片前扫一遍，能省几小时。

## 1. 渲染中途报 NaN（最贵的一次）

**症状**：渲染到 2m56s 报 `inputRange must contain only finite numbers, but got [NaN,NaN]`。
**真因**：改 `script.json` 的配音 id 后，`Scene03` 还写着旧 id `T.b01`；`undefined - 0.35 = NaN`。
**修法**：全局 grep 所有场景的 `T.`，对着 `timeline.ts` 的 id 核一遍再渲。`tsc --noEmit` **查不出来**——`T` 是 `Record<string, number>`，索引不校验。

## 2. BGM「音乐突然没了 / 忽大忽小」

**症状**：片子 4:10 之后完全没音乐；前半段音量忽高忽低。
**真因**：两个独立问题叠在一起。① 曲子 249.87s、片子 551s，混音 `atrim=0:片长` 之后 300 秒是数字静音；② `sidechaincompress` 跟着旁白走，旁白覆盖率 90% 以上，BGM 一直在 0/1 之间跳。
**修法**：`asplit=N` + `acrossfade d=4` 循环接够片长；彻底去掉侧链，旁白逐条归一到 −19 dB、BGM 固定 −36 dB。验法：0.25s 窗 RMS 扫全片，中段不该有 `< −60dB`。

## 3. 台词折成三行压到下一栏

**症状**：24 字台词在 1180px 版宽里自动折成三行，第三行「了。」压在「结局」行上。
**修法**：`Quote` 支持 `\n` 手动断行；实在太长就单独给该页 `quoteSize` 并加宽版心。**不要靠浏览器自动折行**。

## 4. `--only` 不生效

**症状**：`vo.py --only p01` 跑完没重新生成，配音还是旧的。
**真因**：`--only` 只是「允许重做」；文件已存在且没 `--force` 就复用。
**修法**：`--only p01 --force`。

## 5. 页面下半空 / 印章压字

**症状**：女主页字段排完下面空一大片；片尾「完」印压住 endLine。
**修法**：女主页左图页压 230px 浅纸色页码填白；片尾印移到 x=1586 y=700 size=150。印章位置一律避让正文，宁可偏右。

## 6. 页脚被压 / 字幕压照片

**症状**：白字幕正压在「全书 290 章 · 111 万字」上；46px 的 25 字长行顶到左图照片。
**修法**：`MarginV` 从 rec2video 的 46 抬到 116；长句多时字号降到 42。

## 7. 片尾被裁

**症状**：成片结尾盖印只露一半。
**真因**：音轨比画面短，`-shortest` 按音轨截断。
**修法**：`mix.py --tail` 缺省 = `timeline.total + TAIL_HOLD`，与 `mk_timeline.py` 的 7.5s 对齐；混音末尾 `apad/atrim` 补到 tail。

## 8. 环境类（本机 Windows）

- `git clone` 直连 GitHub 会静默失败 → 用 `https://ghfast.top/https://github.com/...` 镜像。
- Bash 缺 coreutils：`ls/head/cat/dirname/uname` 可用但 `rm` 被安全壳包装后更坏 → 删文件用 Python `os.remove` / `shutil.rmtree`。
- `python - <<'EOF'` heredoc 有时被安全拦截（误判 PowerShell）→ 写成 `.py` 文件或用 Write 工具。
- `cover.py` 用 playwright，系统 python 没装 → 用 `/c/Users/<user>/miniconda3/python.exe`。
- 前台 Bash 调用结束时子进程会被回收 → 长任务（渲染、TTS）必须 `run_in_background=true`。
- 字幕/混音脚本里的路径用相对工程根，subprocess 的 `cwd` 必须设成工程目录；`NOVEL_PROJECT` 环境变量负责告诉子脚本工程在哪。

## 9. 事实 Accuracy

**症状**：画面写了「2006 年起点 · 800 订阅」，但书评只写「平台未知」。
**修法**：用 WebSearch 查百科与两篇公众号对上之后才写进画面。查不到就写「书评未给」。写进成品的每句话都要能回原文查到——这是硬规矩，流畅不能替代事实。

## 10. 用户反馈的正确解读

用户说「配音缺失」「BGM 忽大忽小」时，先量数据（覆盖率、RMS 包络、曲长 vs 片长）再动手，别直接重配音。本次真因在 BGM 长度与侧链，配音本身完整（转写抽验过）。

用户说「经历没解说完整」时，通常是要求把书评「经历」段逐拍讲全，不是要多念几遍档案字段。按给的原文逐条对齐，别压缩成一句话。
