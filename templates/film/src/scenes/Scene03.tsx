// Scene03 — 雷点与郁闷点：推书不能只报喜。
// 第一页数得清：雷点、郁闷点、八类分布；第二页拆最重的那一条。
// 全部数据来自 data.ts 的 RISK / RISK_FOCUS，口播只念最重那条。
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT, SAFE, BOOK, CUT, T} from '../spec';
import {Sheet, Imprint, Line, Rule, Kicker, Stat, Page, leave, Quote, Stamp} from '../lib/print';
import {prog, EASE, mix} from '../lib/motion';
import {RISK, RISK_FOCUS, RISK_IDS} from '../data';

const A = Math.max(0, (T[RISK_IDS[0]] ?? CUT.risk) - 0.35);
const B = Math.max(0, (T[RISK_IDS[1]] ?? A) - 0.35);

export const Scene03: React.FC<{t: number}> = ({t}) => (
  <Sheet t={t} chapter="开读前 · 排雷" section={`${BOOK.author} · 书评`}>
    <Page t={t} at={A}><PageA t={t} /></Page>
    <Page t={t} at={B}><PageB t={t} /></Page>
  </Sheet>
);

const PageA: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={leave(t, B - 0.12)}>
    <Kicker t={t} at={A + 0.15} num="05" label="排雷 · 先说不好听的" x={SAFE.x} y={164} />
    <div style={{position: 'absolute', left: SAFE.x, top: 226}}>
      <Imprint t={t} at={A + 0.3} text="开读前，先看排雷" size={88} color={C.ink} tracking="0.04em" />
    </div>
    <Rule t={t} at={A + 1.2} x={SAFE.x} y={372} w={1680} h={1} color={C.inkFaint} />

    <Stat t={t} at={A + 1.4} value={String(RISK.thunder)} unit="处" label="雷点 · 容易直接弃书"
      x={SAFE.x} y={420} size={110} color={C.vermilion} />
    <Stat t={t} at={A + 1.7} value={String(RISK.gloom)} unit="处" label="郁闷点 · 膈应但未必弃"
      x={620} y={420} size={110} />

    <div style={{position: 'absolute', left: SAFE.x, top: 620, width: 1500}}>
      <Line t={t} at={A + 2.2} text="郁闷点分布" size={21} color={C.inkFaint} tracking="0.34em" />
    </div>

    <div style={{position: 'absolute', left: SAFE.x, top: 668, width: 1560,
      display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 80}}>
      {RISK.breakdown.map(([k, n], i) => {
        const p = prog(t, A + 2.4 + i * 0.12, 0.4, EASE.out);
        return (
          <div key={k} style={{display: 'flex', alignItems: 'baseline', gap: 14,
            padding: '14px 0', borderBottom: `1px solid ${C.paperEdge}`,
            opacity: p, transform: `translateY(${mix(10, 0, p)}px)`}}>
            <span style={{fontFamily: FONT.body, fontSize: 27, color: C.ink,
              letterSpacing: '0.18em', width: 130}}>{k}</span>
            <span style={{flex: 1, borderBottom: `1px dotted ${C.inkFaint}`, opacity: 0.5,
              transform: 'translateY(-6px)'}} />
            <span style={{fontFamily: FONT.display, fontSize: 34, fontWeight: 900,
              color: C.vermilion}}>{n}</span>
          </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

const PageB: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={leave(t, CUT.hero - 0.12)}>
    <Kicker t={t} at={B + 0.15} num="05" label="雷点 · 最重那条" x={SAFE.x} y={164} />
    <div style={{position: 'absolute', left: SAFE.x, top: 222}}>
      <Imprint t={t} at={B + 0.3} text={RISK_FOCUS.name} size={104} color={C.ink} tracking="0.1em" />
    </div>
    <Stamp t={t} at={B + 1.0} text={RISK_FOCUS.stamp} x={560} y={236} size={132} rotate={-8} />

    <div style={{position: 'absolute', left: SAFE.x, top: 372, width: 1000}}>
      <Line t={t} at={B + 1.3} text={RISK_FOCUS.lead} size={30} color={C.inkSoft} tracking="0.05em" />
    </div>

    <div style={{position: 'absolute', left: SAFE.x, top: 460, width: 1620}}>
      {RISK_FOCUS.facts.map(([k, v], i) => {
        const p = prog(t, B + 1.8 + i * 0.5, 0.5, EASE.out);
        return (
          <div key={k} style={{display: 'flex', gap: 26, alignItems: 'baseline',
            padding: '18px 0', borderTop: `1px solid ${C.paperEdge}`,
            opacity: p, transform: `translateX(${(1 - p) * -12}px)`}}>
            <span style={{fontFamily: FONT.display, fontSize: 20, fontWeight: 700,
              letterSpacing: '0.24em', color: C.vermilion, width: 96}}>{k}</span>
            <span style={{fontFamily: FONT.body, fontSize: 29, color: C.ink, letterSpacing: '0.04em'}}>{v}</span>
          </div>
        );
      })}
    </div>

    <Quote t={t} at={B + 4.2} text={RISK_FOCUS.quote.text} who={RISK_FOCUS.quote.who}
      source={RISK_FOCUS.quote.source} x={SAFE.x} y={770} w={1500} size={38} />
  </AbsoluteFill>
);
