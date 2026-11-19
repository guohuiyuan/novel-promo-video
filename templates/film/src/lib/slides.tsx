// slides.tsx — 简介 / 排雷 / 收尾共用的数据驱动版式。
// 场景只负责给页窗口和 Slide 数据；坐标只在这里出现一次。
// 换书的版式需求不同时，改这里的 y 值即可，不要到 data.ts 里塞坐标。
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT, SAFE, BOOK, COPY} from '../spec';
import {Imprint, Line, Rule, Kicker, Stat, Quote, Stamp, leave} from './print';
import {prog, EASE, mix} from './motion';
import type {Slide} from '../data';

export const SlidePage: React.FC<{t: number; at: number; endAt: number; s: Slide}> = ({t, at, endAt, s}) => {
  if (s.endcard) return <EndCard t={t} at={at} />;
  const A = at;
  const statsY = s.stamp ? 580 : 682;
  return (
    <AbsoluteFill style={leave(t, endAt - 0.12)}>
      <Kicker t={t} at={A + 0.15} num={s.kicker.num} label={s.kicker.label} x={SAFE.x} y={164} />

      <div style={{position: 'absolute', left: SAFE.x, top: 226, width: 1240}}>
        <Imprint t={t} at={A + 0.35} text={s.title} size={s.titleSize ?? 92} color={C.ink}
          lh={1.18} tracking="0.04em" />
      </div>

      <Rule t={t} at={A + 1.5} x={SAFE.x} y={462} w={700} h={4} color={C.vermilion} />

      {s.lead && (
        <div style={{position: 'absolute', left: SAFE.x, top: 496, width: 1100}}>
          <Line t={t} at={A + 1.7} text={s.lead} size={30} color={C.inkSoft} tracking="0.05em" />
        </div>
      )}

      {s.stamp && (
        <Stamp t={t} at={A + (s.stamp.at ?? 4.6)} text={s.stamp.text}
          x={s.stamp.x ?? SAFE.x} y={s.stamp.y ?? 548} size={s.stamp.size ?? 170} rotate={-7} />
      )}

      {s.stats && (
        <div>
          {s.stats.map((q, i) => (
            <Stat key={i} t={t} at={A + 3.3 + i * 0.3} value={q.value} unit={q.unit} label={q.label}
              x={[SAFE.x, 470, 820, 1180][i] ?? SAFE.x} y={statsY} size={66}
              color={q.red ? C.vermilion : C.ink} />
          ))}
        </div>
      )}

      {s.list && (
        <div style={{position: 'absolute', left: 1180, top: 232, width: 620,
          opacity: prog(t, A + 4.3, 0.6, EASE.out)}}>
          <div style={{fontFamily: FONT.display, fontSize: 21, fontWeight: 700, letterSpacing: '0.3em',
            color: C.vermilion}}>{s.list.label}</div>
          <div style={{height: 12}} />
          {s.list.items.map((item, i) => {
            const p = prog(t, A + 4.6 + i * 0.3, 0.5, EASE.out);
            return (
              <div key={item} style={{display: 'flex', gap: 18, alignItems: 'baseline',
                padding: '16px 0', borderTop: `1px solid ${C.paperEdge}`,
                opacity: p, transform: `translateY(${mix(12, 0, p)}px)`}}>
                <span style={{fontFamily: FONT.display, fontSize: 19, fontWeight: 700,
                  color: C.vermilion, letterSpacing: '0.1em'}}>{`0${i + 1}`}</span>
                <span style={{fontFamily: FONT.body, fontSize: 27, color: C.ink,
                  letterSpacing: '0.04em'}}>{item}</span>
              </div>
            );
          })}
          {s.list.note && (
            <div style={{marginTop: 22, fontFamily: FONT.body, fontSize: 21, letterSpacing: '0.1em',
              color: C.inkFaint}}>{s.list.note}</div>
          )}
        </div>
      )}

      {s.dual && (
        <div>
          {s.dual.map(([k, v], i) => {
            const p = prog(t, A + 1.9 + i * 0.4, 0.5, EASE.out);
            return (
              <div key={k} style={{position: 'absolute', left: SAFE.x + i * 700, top: 512, width: 620,
                opacity: p, transform: `translateY(${mix(14, 0, p)}px)`}}>
                <div style={{fontFamily: FONT.display, fontSize: 20, fontWeight: 700,
                  letterSpacing: '0.4em', color: C.vermilion}}>{k}</div>
                <div style={{marginTop: 12, fontFamily: FONT.body, fontSize: 32, color: C.ink,
                  letterSpacing: '0.05em'}}>{v}</div>
              </div>
            );
          })}
        </div>
      )}

      {s.lines && (
        <div style={{position: 'absolute', left: SAFE.x, top: 700, width: 1560}}>
          {s.lines.map((q, i) => (
            <Line key={i} t={t} at={A + 3.1 + i * 0.4} text={q.text} size={28}
              color={q.red ? C.vermilion : C.inkSoft} tracking="0.05em" />
          ))}
        </div>
      )}

      {s.verdict && (
        <div style={{position: 'absolute', left: SAFE.x, top: 782, width: 800,
          display: 'flex', gap: 24, opacity: prog(t, A + 1.9, 0.7, EASE.out)}}>
          <div style={{width: 4, background: C.vermilion, alignSelf: 'stretch'}} />
          <div>
            <div style={{fontFamily: FONT.quote, fontSize: 28, lineHeight: 1.66, color: C.ink,
              letterSpacing: '0.03em', whiteSpace: 'pre-line'}}>{s.verdict.text}</div>
            <div style={{marginTop: 10, fontFamily: FONT.body, fontSize: 18, letterSpacing: '0.1em',
              color: C.inkFaint}}>{s.verdict.note ?? ''}</div>
          </div>
        </div>
      )}

      {s.quote && (
        <Quote t={t} at={A + 6.6} text={s.quote.text} who={s.quote.who} source={s.quote.source}
          x={SAFE.x} y={742} w={1200} size={s.quote.size ?? 36} />
      )}
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{t: number; at: number}> = ({t, at}) => (
  <AbsoluteFill>
    <div style={{position: 'absolute', left: SAFE.x, top: 300}}>
      <Imprint t={t} at={at + 0.2} text={`《${BOOK.title}》`} size={142} color={C.ink} tracking="0.02em" />
    </div>
    <div style={{position: 'absolute', left: SAFE.x, top: 500, display: 'flex',
      alignItems: 'baseline', gap: 26, opacity: prog(t, at + 1.0, 0.6, EASE.out)}}>
      <span style={{fontFamily: FONT.display, fontSize: 54, fontWeight: 900, color: C.ink,
        letterSpacing: '0.18em'}}>{BOOK.author}</span>
      <span style={{fontFamily: FONT.body, fontSize: 26, color: C.inkFaint, letterSpacing: '0.12em'}}>
        代表作 {BOOK.classic} · {BOOK.classicNote}
      </span>
    </div>
    <Rule t={t} at={at + 1.4} x={SAFE.x} y={604} w={620} h={3} color={C.vermilion} />
    <div style={{position: 'absolute', left: SAFE.x, top: 636, width: 1200,
      opacity: prog(t, at + 1.7, 0.6, EASE.out)}}>
      <Line t={t} at={at + 1.7} text={COPY.endLine} size={30} color={C.inkSoft} tracking="0.14em" />
    </div>
    {/* 印章是唯一允许过冲的动作；放在右下，不要压 endLine */}
    <Stamp t={t} at={at + 2.9} text={COPY.seal} x={1586} y={700} size={150} rotate={-8} />
  </AbsoluteFill>
);
