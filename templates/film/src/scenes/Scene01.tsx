// Scene01 — 书讯：先立书。只回答四个问题：叫什么、谁写的、多厚、值几分。
// 数字交给画面，旁白只报书名与作者。
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT, SAFE, BOOK, COPY, CUT, T} from '../spec';
import {Sheet, Imprint, Line, Rule, Kicker, Stat, Page, leave, Stamp} from '../lib/print';
import {prog, EASE} from '../lib/motion';
import {SCORE} from '../data';

const B_START = Math.max(0, (T.a02 ?? 8) - 0.35);

export const Scene01: React.FC<{t: number}> = ({t}) => (
  <Sheet t={t} chapter="书讯" section={`${BOOK.author} · ${BOOK.year}`}>
    <Page t={t} at={CUT.info}><PageA t={t} /></Page>
    <Page t={t} at={B_START}><PageB t={t} /></Page>
  </Sheet>
);

const PageA: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={leave(t, B_START - 0.12)}>
    <Kicker t={t} at={0.2} num="00" label="书讯 · 完结" x={SAFE.x} y={168} />

    <div style={{position: 'absolute', left: SAFE.x, top: 236}}>
      <Imprint t={t} at={0.45} text={BOOK.title} size={148} color={C.ink} tracking="0.04em" />
    </div>

    <div style={{position: 'absolute', left: SAFE.x, top: 442, width: 900}}>
      <Line t={t} at={1.5} text={`${BOOK.author} 著${BOOK.alias ? ` · 又名 ${BOOK.alias}` : ''}`}
        size={38} color={C.inkSoft} tracking="0.12em" />
    </div>

    <Rule t={t} at={1.9} x={SAFE.x} y={520} w={760} h={4} color={C.vermilion} />

    <div style={{position: 'absolute', left: SAFE.x, top: 556, width: 900}}>
      <Line t={t} at={2.2} text={BOOK.genre} size={27} color={C.inkSoft} tracking="0.16em" />
    </div>

    <div style={{position: 'absolute', left: SAFE.x, top: 608, width: 1000}}>
      <Line t={t} at={2.5} text={BOOK.serial} size={22} color={C.inkFaint} tracking="0.14em" />
    </div>

    <Stat t={t} at={3.2} value={BOOK.words} unit="万字" label="全书" x={SAFE.x} y={748} size={78} />
    <Stat t={t} at={3.5} value={String(BOOK.chapters)} unit="章" label={`${BOOK.volumes} 卷 · 完结`}
      x={470} y={748} size={78} />
    <Stat t={t} at={3.8} value={BOOK.score} label="书评总评" x={800} y={748} size={78} color={C.vermilion} />

    {/* 报眼：竖排一句话，把最勾人的那一处先亮出来 */}
    <div style={{position: 'absolute', left: 1290, top: 190, width: 470, height: 540,
      border: `1px solid ${C.paperEdge}`, padding: '26px 30px', boxSizing: 'border-box',
      opacity: prog(t, 2.2, 0.8, EASE.out)}}>
      <div style={{width: '100%', height: '100%', writingMode: 'vertical-rl',
        fontFamily: FONT.quote, fontSize: 37, lineHeight: 1.95, letterSpacing: '0.06em',
        color: C.ink, textAlign: 'justify'}}>{COPY.hook}</div>
    </div>
    <div style={{position: 'absolute', left: 1290, top: 748, width: 470,
      fontFamily: FONT.body, fontSize: 19, letterSpacing: '0.16em', color: C.inkFaint,
      textAlign: 'right', opacity: prog(t, 3.0, 0.6, EASE.out)}}>
      全书最勾人的一处
    </div>
  </AbsoluteFill>
);

const PageB: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={leave(t, CUT.synopsis - 0.12)}>
    <Kicker t={t} at={B_START + 0.15} num="01" label="评分 · 作者" x={SAFE.x} y={168} />

    <div style={{position: 'absolute', left: SAFE.x, top: 250, width: 700}}>
      {SCORE.map(([k, v], i) => {
        const p = prog(t, B_START + 0.4 + i * 0.1, 0.42, EASE.out);
        const hot = k === '总评';
        return (
          <div key={k} style={{display: 'flex', justifyContent: 'space-between',
            alignItems: 'baseline', padding: '13px 0', borderBottom: `1px solid ${C.paperEdge}`,
            opacity: p, transform: `translateX(${(1 - p) * -12}px)`}}>
            <span style={{fontFamily: FONT.body, fontSize: 25, letterSpacing: '0.16em',
              color: hot ? C.ink : C.inkSoft}}>{k}</span>
            <span style={{fontFamily: FONT.display, fontSize: hot ? 38 : 30, fontWeight: 900,
              color: hot ? C.vermilion : C.ink, letterSpacing: '0.02em'}}>{v}</span>
          </div>
        );
      })}
    </div>

    <div style={{position: 'absolute', left: SAFE.x, top: 782, width: 800,
      display: 'flex', gap: 24, opacity: prog(t, B_START + 1.9, 0.7, EASE.out)}}>
      <div style={{width: 4, background: C.vermilion, alignSelf: 'stretch'}} />
      <div>
        <div style={{fontFamily: FONT.quote, fontSize: 28, lineHeight: 1.66, color: C.ink,
          letterSpacing: '0.03em', whiteSpace: 'pre-line'}}>{COPY.verdict}</div>
        <div style={{marginTop: 10, fontFamily: FONT.body, fontSize: 18, letterSpacing: '0.1em',
          color: C.inkFaint}}>{COPY.verdictNote}</div>
      </div>
    </div>

    <div style={{position: 'absolute', left: 1000, top: 246}}>
      <Imprint t={t} at={B_START + 0.5} text={BOOK.author.split('').join(' ')} size={96}
        color={C.ink} tracking="0.06em" />
      <div style={{marginTop: 14}}>
        <Line t={t} at={B_START + 0.9} text="本书代表作" size={26} color={C.inkFaint} tracking="0.16em" />
      </div>
    </div>

    <Rule t={t} at={B_START + 1.3} x={1000} y={432} w={800} h={1} color={C.inkFaint} />

    <div style={{position: 'absolute', left: 1000, top: 462}}>
      <Line t={t} at={B_START + 1.45} text="代 表 作" size={20} color={C.inkFaint} tracking="0.42em" />
      <div style={{marginTop: 16}}>
        <Imprint t={t} at={B_START + 1.7} text={BOOK.classic} size={62} color={C.ink} tracking="0.04em" />
      </div>
      <div style={{marginTop: 18}}>
        <Line t={t} at={B_START + 2.2} text={BOOK.classicNote} size={24} color={C.vermilion} tracking="0.12em" />
      </div>
    </div>

    <Stamp t={t} at={B_START + 2.9} text="荐" x={1660} y={772} size={142} rotate={-9} />
  </AbsoluteFill>
);
