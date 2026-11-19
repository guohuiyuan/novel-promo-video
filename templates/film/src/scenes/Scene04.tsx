// Scene04 — 男主：和女主页同一套档案版式。
// 先给他本人的名台词（少年声线），再由旁白分三段把经历讲完整；
// 画面上只补档案字段：身份 → 外貌 → 性格 → 名分 → 结局，按旁白的推进落字。
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT, SAFE, BOOK, HERO_PAGE} from '../spec';
import {Sheet, Imprint, Rule, Kicker, Photo, Quote, Page, leave} from '../lib/print';
import {prog, EASE, mix} from '../lib/motion';
import {HERO} from '../data';

const W = HERO_PAGE;

export const Scene04: React.FC<{t: number}> = ({t}) => (
  <Sheet t={t} chapter={`男主 · ${HERO.name}`} section={`${BOOK.author} · 人物`}>
    <Page t={t} at={W.start}><One t={t} /></Page>
  </Sheet>
);

const Field: React.FC<{t: number; at: number; label: string; x: number; y: number; w: number;
  children: React.ReactNode}> = ({t, at, label, x, y, w, children}) => {
  const p = prog(t, at, 0.5, EASE.out);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, display: 'flex',
      gap: 18, alignItems: 'baseline', opacity: p, transform: `translateY(${mix(8, 0, p)}px)`}}>
      <span style={{fontFamily: FONT.display, fontSize: 16, fontWeight: 700,
        letterSpacing: '0.2em', color: C.inkFaint, minWidth: 88}}>{label}</span>
      {children}
    </div>
  );
};

const One: React.FC<{t: number}> = ({t}) => {
  const d = W.narrDur;
  const lookAt = W.narrAt + d * 0.22;
  const traitAt = W.narrAt + d * 0.42;
  const statusAt = W.narrAt + d * 0.62;
  const endAt = W.narrAt + d * 0.82;

  return (
    <AbsoluteFill style={leave(t, W.end - 0.12)}>
      <Kicker t={t} at={W.start + 0.12} num="男主 00" label="名场面 · 经历" x={SAFE.x} y={150} />

      {/* 第一口气：他自己说（少年声线） */}
      <Quote t={t} at={W.lineAt - 0.12} text={HERO.quote} who={HERO.name} source={HERO.quoteSrc}
        x={SAFE.x} y={186} w={1560} size={44} />

      <Rule t={t} at={W.narrAt - 0.35} x={SAFE.x} y={432} w={1680} h={1} color={C.inkFaint} />

      <Photo t={t} at={W.lineAt + 0.2} src={HERO.photo} x={SAFE.x} y={458} w={290}
        num={HERO.num} name={HERO.name} role={HERO.photoRole ?? HERO.num} />

      {/* 右侧留白用一枚大号名录页码压住，和女主页同一规格 */}
      <div style={{position: 'absolute', right: 150, top: 470, fontFamily: FONT.display,
        fontSize: 230, fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em',
        color: C.paperDeep, opacity: prog(t, W.start + 0.5, 0.7, EASE.out), userSelect: 'none'}}>
        {HERO.num}
      </div>

      <div style={{position: 'absolute', left: 480, top: 452, width: 1320}}>
        <Imprint t={t} at={W.narrAt - 0.25} text={HERO.name} size={84} color={C.ink} tracking="0.12em" />
      </div>

      <Field t={t} at={W.narrAt - 0.08} label="身 份" x={480} y={552} w={1320}>
        <span style={{fontFamily: FONT.body, fontSize: 23, letterSpacing: '0.04em',
          color: C.inkSoft, lineHeight: 1.5}}>{HERO.role}</span>
      </Field>

      {/* 第二口气：旁白讲经历，纸面依次补上档案 */}
      <Field t={t} at={lookAt} label="外 貌" x={480} y={640} w={1320}>
        <span style={{fontFamily: FONT.body, fontSize: 22, letterSpacing: '0.02em',
          color: C.inkSoft, lineHeight: 1.5}}>{HERO.look}</span>
      </Field>

      <Field t={t} at={traitAt} label="性 格" x={480} y={706} w={1320}>
        <span style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
          {HERO.traits.map((s) => (
            <span key={s} style={{fontFamily: FONT.body, fontSize: 20, letterSpacing: '0.08em',
              color: C.inkSoft, border: `1px solid ${C.paperEdge}`, padding: '4px 10px'}}>{s}</span>
          ))}
        </span>
      </Field>

      <Field t={t} at={statusAt} label="名 分" x={480} y={776} w={1320}>
        <span style={{fontFamily: FONT.display, fontSize: 24, fontWeight: 900,
          color: C.vermilion, letterSpacing: '0.06em'}}>{HERO.status}</span>
        <span style={{fontFamily: FONT.body, fontSize: 17, letterSpacing: '0.1em',
          color: C.inkFaint}}>{HERO.statusNote}</span>
      </Field>

      <Field t={t} at={endAt} label="结 局" x={480} y={846} w={1320}>
        <span style={{fontFamily: FONT.body, fontSize: 20, letterSpacing: '0.03em',
          color: C.inkSoft, lineHeight: 1.5}}>{HERO.ending}</span>
      </Field>
    </AbsoluteFill>
  );
};
