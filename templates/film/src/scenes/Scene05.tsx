// Scene05 — 十一位女主：一人一页，一页两口气。
// 第一口气是她的名场面台词（她自己说，达妮娅声线），第二口气是旁白讲她的经历。
// 画面上给的是「档案」：身份、外貌、性格、纯洁度、结局、图像——经历交给旁白，
// 页面按旁白的推进分四拍落字，长旁白也不至于让纸面停住。
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT, SAFE, BOOK, WOMEN} from '../spec';
import {Sheet, Imprint, Line, Rule, Kicker, Photo, Quote, Page, leave} from '../lib/print';
import {prog, EASE, mix} from '../lib/motion';
import {WOMEN_DATA, Person} from '../data';

export const Scene05: React.FC<{t: number}> = ({t}) => (
  <Sheet t={t} chapter={`女主名录 · ${WOMEN_DATA.length} 人`} section={`${BOOK.author} · 人物`}>
    {WOMEN_DATA.map((w, i) => {
      const win = WOMEN[i];
      if (!win) return null;
      return (
        <Page key={w.num} t={t} at={win.start}>
          <One t={t} w={w} win={win} left={i % 2 === 0} />
        </Page>
      );
    })}
  </Sheet>
);

type Win = (typeof WOMEN)[number];

// 小标签：纸质档案里的字段名
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

const One: React.FC<{t: number; w: Person; win: Win; left: boolean}> = ({t, w, win, left}) => {
  const photoX = left ? SAFE.x : 1800 - 290;
  const textX = left ? 480 : SAFE.x;
  const textW = 1320;

  // 旁白讲多久，纸上的四拍就铺多长
  const d = win.narrDur;
  const lookAt = win.narrAt + d * 0.26;
  const traitAt = win.narrAt + d * 0.46;
  const purityAt = win.narrAt + d * 0.64;
  const endAt = win.narrAt + d * 0.82;

  return (
    <AbsoluteFill style={leave(t, win.end - 0.12)}>
      <Kicker t={t} at={win.start + 0.12} num={`女主 ${w.num}`} label="名场面 · 经历" x={SAFE.x} y={150} />

      {/* 第一口气：她自己说 */}
      <Quote t={t} at={win.lineAt - 0.12} text={w.quote} who={w.name} source={w.quoteSrc}
        x={SAFE.x} y={186} w={1560} size={44} />

      <Rule t={t} at={win.narrAt - 0.35} x={SAFE.x} y={432} w={1680} h={1} color={C.inkFaint} />

      {/* 左图页的右侧留白，用一枚大号名录页码压住 */}
      {left && (
        <div style={{position: 'absolute', right: 150, top: 470, fontFamily: FONT.display,
          fontSize: 230, fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em',
          color: C.paperDeep, opacity: prog(t, win.start + 0.5, 0.7, EASE.out), userSelect: 'none'}}>
          {w.num}
        </div>
      )}

      {/* 图像 */}
      <Photo t={t} at={win.lineAt + 0.2} src={w.photo} x={photoX} y={458} w={290}
        num={w.num} name={w.name} role={`${w.num} / ${String(WOMEN_DATA.length).padStart(2, '0')}`} />

      {/* 姓名 + 身份 */}
      <div style={{position: 'absolute', left: textX, top: 452, width: textW}}>
        <Imprint t={t} at={win.narrAt - 0.25} text={w.name} size={84} color={C.ink} tracking="0.12em" />
      </div>

      <Field t={t} at={win.narrAt - 0.08} label="身 份" x={textX} y={552} w={textW}>
        <span style={{fontFamily: FONT.body, fontSize: 23, letterSpacing: '0.04em',
          color: C.inkSoft, lineHeight: 1.5}}>{w.role}</span>
      </Field>

      {/* 第二口气：旁白讲经历，纸面依次补上档案字段 */}
      <Field t={t} at={lookAt} label="外 貌" x={textX} y={648} w={textW}>
        <span style={{fontFamily: FONT.body, fontSize: 22, letterSpacing: '0.02em',
          color: C.inkSoft, lineHeight: 1.5}}>{w.look}</span>
      </Field>

      <Field t={t} at={traitAt} label="性 格" x={textX} y={714} w={textW}>
        <span style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
          {w.traits.map((s) => (
            <span key={s} style={{fontFamily: FONT.body, fontSize: 20, letterSpacing: '0.08em',
              color: C.inkSoft, border: `1px solid ${C.paperEdge}`, padding: '4px 10px'}}>{s}</span>
          ))}
        </span>
      </Field>

      <Field t={t} at={purityAt} label="纯 洁 度" x={textX} y={784} w={textW}>
        <span style={{fontFamily: FONT.display, fontSize: 26, fontWeight: 900,
          color: w.purity === '全初' ? C.vermilion : C.inkFaint, letterSpacing: '0.08em'}}>
          {w.purity ?? '未知'}
        </span>
        <span style={{fontFamily: FONT.body, fontSize: 17, letterSpacing: '0.1em', color: C.inkFaint}}>
          {w.purity === '全初' ? '处 · 精神初 · 初婚 · 初摸' : '书评未给'}
        </span>
      </Field>

      <Field t={t} at={endAt} label="结 局" x={textX} y={852} w={textW}>
        <span style={{fontFamily: FONT.body, fontSize: 20, letterSpacing: '0.03em',
          color: C.inkSoft, lineHeight: 1.5}}>{w.ending}</span>
      </Field>
    </AbsoluteFill>
  );
};
