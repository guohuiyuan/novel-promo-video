// print.tsx — 这片的"印刷所"：纸、书眉、页脚、铅字、朱印、档案照。
// 所有场景共用同一套件，保证 160 秒里纸不换、字不换、红不换。
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, FONT, SAFE, FOLIO_Y, BOOK, BEAT, STAGGER} from '../spec';
import {EASE, Letters, Paper, prog, mix} from './motion';

// ───────────────────────────────── 纸 + 报头 + 页脚
export const Sheet: React.FC<{
  t: number;
  chapter?: string;
  section?: string;
  children?: React.ReactNode;
  dark?: boolean;
  since?: number;          // 本页进场的时刻：书眉和页脚跟着换页一起擦进来，不在切点上跳
}> = ({t, chapter, section, children, dark, since = 0}) => {
  const base = dark ? C.night : C.paper;
  return (
    <AbsoluteFill style={{backgroundColor: base}}>
      {!dark && <Paper color={C.paper} grain={0.16} fibre={0.1} seed={4} />}
      {!dark && (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          {/* 版面边框：内侧一道细线，像旧书的天头地脚 */}
          <div style={{
            position: 'absolute', left: SAFE.x - 42, top: SAFE.y - 42,
            right: SAFE.x - 42, bottom: 1080 - FOLIO_Y - 4,
            border: `1px solid ${C.paperEdge}`, opacity: 0.9,
          }} />
        </AbsoluteFill>
      )}
      <Header t={t} since={since} dark={dark} section={section} />
      {children}
      <Folio t={t} since={since} dark={dark} chapter={chapter} />
    </AbsoluteFill>
  );
};

const Header: React.FC<{t: number; since: number; dark?: boolean; section?: string}> = ({t, since, dark, section}) => {
  const p = prog(t, since + 0.05, 0.5, EASE.out);
  const col = dark ? '#7C8798' : C.inkFaint;
  return (
    <>
      <div style={{
        position: 'absolute', left: SAFE.x, top: 56, right: SAFE.x,
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontFamily: FONT.body, fontSize: 21, letterSpacing: '0.18em', color: col,
        opacity: p,
      }}>
        <span>{BOOK.title}</span>
        <span style={{letterSpacing: '0.12em'}}>{section ?? `${BOOK.author} · ${BOOK.year}`}</span>
      </div>
      <div style={{
        position: 'absolute', left: SAFE.x, top: 88, right: SAFE.x, height: 1,
        background: dark ? '#3C4756' : C.inkFaint, opacity: 0.5,
        transformOrigin: 'left center', transform: `scaleX(${p})`,
      }} />
      <div style={{
        position: 'absolute', left: SAFE.x, top: 90, right: SAFE.x, height: 3,
        background: dark ? '#3C4756' : C.inkFaint, opacity: 0.3,
        transformOrigin: 'left center', transform: `scaleX(${p * 0.999})`,
      }} />
    </>
  );
};

const Folio: React.FC<{t: number; since: number; dark?: boolean; chapter?: string}> = ({t, since, dark, chapter}) => {
  const p = prog(t, since + 0.1, 0.5, EASE.out);
  const col = dark ? '#6F7A8B' : C.inkFaint;
  return (
    <>
      <div style={{
        position: 'absolute', left: SAFE.x, right: SAFE.x, top: FOLIO_Y - 28, height: 1,
        background: col, opacity: 0.35 * p, transformOrigin: 'left center', transform: `scaleX(${p})`,
      }} />
      <div style={{
        position: 'absolute', left: SAFE.x, top: FOLIO_Y - 12, right: SAFE.x,
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontFamily: FONT.display, fontSize: 19, letterSpacing: '0.1em', color: col, opacity: p,
      }}>
        <span>全书 {BOOK.chapters} 章 · {BOOK.words}</span>
        <span style={{letterSpacing: '0.04em'}}>{chapter ?? ''}</span>
      </div>
    </>
  );
};

// ───────────────────────────────── 铅字
// 逐字压印：字从 0.94 抬起、落到位。不用弹跳，不用泛白渐显。
export const Imprint: React.FC<{
  t: number; text: string; at: number; size?: number; color?: string;
  font?: string; weight?: number; stagger?: number; dur?: number; tracking?: string;
  lh?: number; align?: 'left' | 'center';
}> = ({t, text, at, size = 64, color = C.ink, font = FONT.display, weight = 900,
       stagger = STAGGER, dur = BEAT, tracking = '0.02em', lh = 1.28, align = 'left'}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start'}}>
    {text.split('\n').map((line, li) => (
      <Letters
        key={li}
        text={line}
        t={t}
        start={at + li * 0.16}
        stagger={stagger}
        dur={dur}
        ease={EASE.out}
        box={{fontFamily: font, fontSize: size, fontWeight: weight, color,
              lineHeight: lh, letterSpacing: tracking}}
        style={(p) => ({
          opacity: p,
          transform: `translateY(${mix(0.14, 0, p)}em)`,
        })}
      />
    ))}
  </div>
);

// 一行字整体滑入（长句用，逐字太碎）
export const Line: React.FC<{
  t: number; text: string; at: number; size?: number; color?: string;
  font?: string; weight?: number; tracking?: string; lh?: number; dur?: number;
}> = ({t, text, at, size = 34, color = C.inkSoft, font = FONT.body, weight = 400,
       tracking = '0.06em', lh = 1.75, dur = 0.46}) => {
  const p = prog(t, at, dur, EASE.out);
  return (
    <div style={{
      fontFamily: font, fontSize: size, fontWeight: weight, color,
      letterSpacing: tracking, lineHeight: lh,
      opacity: p, transform: `translateY(${mix(16, 0, p)}px)`,
    }}>{text}</div>
  );
};

export const Rule: React.FC<{t: number; at: number; x: number; y: number; w: number;
  color?: string; h?: number; dur?: number; from?: 'left' | 'right'}> = ({t, at, x, y, w, color = C.ink, h = 2, dur = 0.5, from = 'left'}) => {
  const p = prog(t, at, dur, EASE.inOut);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: color,
      opacity: 0.85, transformOrigin: from === 'left' ? 'left center' : 'right center',
      transform: `scaleX(${p})`}} />
  );
};

// 小标签：`01 / 丛林` 这种，黑体，字距拉开
export const Kicker: React.FC<{t: number; at: number; label: string; num?: string;
  color?: string; x?: number; y?: number}> = ({t, at, label, num, color = C.vermilion, x, y}) => {
  const p = prog(t, at, 0.4, EASE.out);
  return (
    <div style={{position: x !== undefined ? 'absolute' : 'relative', left: x, top: y,
      display: 'flex', alignItems: 'baseline', gap: 14, opacity: p,
      transform: `translateX(${mix(-10, 0, p)}px)`}}>
      {num && <span style={{fontFamily: FONT.display, fontSize: 20, fontWeight: 700,
        letterSpacing: '0.16em', color, padding: '3px 8px', border: `1.5px solid ${color}`}}>{num}</span>}
      <span style={{fontFamily: FONT.display, fontSize: 21, fontWeight: 700,
        letterSpacing: '0.34em', color: C.inkSoft}}>{label}</span>
    </div>
  );
};

// ───────────────────────────────── 朱印
// 契约里唯一允许过冲的动作：印章是砸下去的（物理冲击），过冲 0.05，别的不许。
export const Stamp: React.FC<{t: number; at: number; text: string; x: number; y: number;
  size?: number; rotate?: number; small?: boolean}> = ({t, at, text, x, y, size = 132, rotate = -7, small}) => {
  const q = prog(t, at, 0.2, EASE.in);
  if (q <= 0) return null;
  const over = 1 - 0.05 * Math.sin(Math.PI * Math.min(1, q * 1.6));
  const s = mix(1.75, over, Math.min(1, q * 1.5));
  const op = Math.min(1, q * 3.2);
  const chars = [...text];
  const cols = small ? chars.length : Math.min(chars.length, 2);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: size, height: size,
      transform: `rotate(${rotate}deg) scale(${s})`, opacity: op * 0.94,
      border: `5px solid ${C.vermilion}`, borderRadius: 4,
      boxShadow: 'inset 0 0 0 3px rgba(176,58,46,0.35)',
      display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`,
      placeItems: 'center', padding: size * 0.09, boxSizing: 'border-box',
      background: 'rgba(176,58,46,0.06)',
    }}>
      {chars.map((ch, i) => (
        <span key={i} style={{fontFamily: FONT.display, fontWeight: 900,
          fontSize: size / Math.max(2, cols) * 0.86, color: C.vermilion, lineHeight: 1}}>{ch}</span>
      ))}
    </div>
  );
};

// ───────────────────────────────── 档案照
// 人物图是竖图、脸在中间偏上，裁 3:4 保脸；纸白边框 + 网点 = 报纸上印的证件照。
export const Photo: React.FC<{
  t: number; at: number; src: string; x: number; y: number; w: number;
  num: string; name: string; role?: string; flip?: boolean;
}> = ({t, at, src, x, y, w, num, name, role, flip}) => {
  const p = prog(t, at, 0.62, EASE.out);
  const h = w * 4 / 3;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w,
      opacity: p, transform: `translateY(${mix(26, 0, p)}px)`}}>
      {/* 照片本身的硬投影：一小片，不做弥散光晕 */}
      <div style={{position: 'absolute', left: 8, top: 8, width: w, height: h,
        background: C.ink, opacity: 0.16 * p}} />
      <div style={{position: 'relative', width: w, height: h, background: '#F2EADA',
        padding: 9, boxSizing: 'border-box'}}>
        <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
          background: C.paperDeep}}>
          {/* 极缓推近：6 秒 2%，让特写不是死图 */}
          <Img src={staticFile(src)} style={{
            width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 22%',
            filter: 'contrast(1.05) saturate(1.08) brightness(1.01)',
            transform: `${flip ? 'scaleX(-1) ' : ''}scale(${1 + 0.02 * prog(t, at, 6, EASE.linear)})`,
          }} />
          {/* 网点：报纸印照片的那层筛子。彩色照片只留很薄一层，压版不压色 */}
          <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.12}}>
            <defs>
              <pattern id={`dots-${num}`} width="5" height="5" patternUnits="userSpaceOnUse">
                <circle cx="2.5" cy="2.5" r="1.15" fill={C.ink} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#dots-${num})`} />
          </svg>
        </div>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginTop: 10, width: w}}>
        <span style={{fontFamily: FONT.display, fontSize: 25, fontWeight: 900,
          letterSpacing: '0.06em', color: C.ink}}>{name}</span>
        <span style={{fontFamily: FONT.body, fontSize: 17, letterSpacing: '0.12em',
          color: C.inkFaint}}>{role || num}</span>
      </div>
    </div>
  );
};

// ───────────────────────────────── 台词
// 楷体 + 左侧朱红竖线 + 「」。台词是这片的"决定性那一笔"，所以给红。
export const Quote: React.FC<{
  t: number; at: number; text: string; who: string; x: number; y: number; w: number;
  size?: number; source?: string;
}> = ({t, at, text, who, x, y, w, size = 52, source}) => {
  const p = prog(t, at, 0.5, EASE.out);
  const q = prog(t, at + 0.24, 0.6, EASE.out);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, opacity: 1}}>
      <div style={{display: 'flex', gap: 26}}>
        <div style={{width: 4, background: C.vermilion, opacity: p,
          transformOrigin: 'top', transform: `scaleY(${p})`, alignSelf: 'stretch'}} />
        <div style={{flex: 1}}>
          <div style={{fontFamily: FONT.quote, fontSize: size, lineHeight: 1.62,
            color: C.ink, letterSpacing: '0.02em', opacity: q,
            transform: `translateY(${mix(14, 0, q)}px)`}}>
            <span style={{color: C.vermilion}}>「</span>
            {text.split('\n').map((ln, i) => (
              <React.Fragment key={i}>{i > 0 && <br />}{ln}</React.Fragment>
            ))}
            <span style={{color: C.vermilion}}>」</span>
          </div>
          <div style={{marginTop: 20, display: 'flex', alignItems: 'center', gap: 16, opacity: q}}>
            <span style={{fontFamily: FONT.display, fontSize: 22, fontWeight: 700,
              letterSpacing: '0.2em', color: C.vermilion}}>{who}</span>
            {source && <span style={{fontFamily: FONT.body, fontSize: 18, letterSpacing: '0.1em',
              color: C.inkFaint}}>{source}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ───────────────────────────────── 数据条：数字 + 标签（画面承担信息，不念）
export const Stat: React.FC<{t: number; at: number; value: string; unit?: string; label: string;
  x: number; y: number; color?: string; size?: number}> = ({t, at, value, unit, label, x, y, color = C.ink, size = 62}) => {
  const p = prog(t, at, 0.52, EASE.out);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: p,
      transform: `translateY(${mix(18, 0, p)}px)`}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
        <span style={{fontFamily: FONT.display, fontSize: size, fontWeight: 900,
          color, lineHeight: 1, letterSpacing: '-0.01em'}}>{value}</span>
        {unit && <span style={{fontFamily: FONT.body, fontSize: 24, color: C.inkSoft}}>{unit}</span>}
      </div>
      <div style={{marginTop: 8, fontFamily: FONT.body, fontSize: 20, letterSpacing: '0.14em',
        color: C.inkFaint}}>{label}</div>
    </div>
  );
};

// ───────────────────────────────── 页面切换
// 整页擦除：纸留在下面不动，新的一页从左边压进来。段落之间用它，0.3s，一个硬边。
export const Wipe: React.FC<{t: number; at: number; dur?: number; children: React.ReactNode}> = ({t, at, dur = 0.3, children}) => {
  const p = prog(t, at, dur, EASE.inOut);
  if (p >= 1) return <>{children}</>;
  return <AbsoluteFill style={{clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>{children}</AbsoluteFill>;
};

// 同一张纸上"另起一页"：硬边横向擦除，0.26s。没有淡入淡出。
export const Page: React.FC<{t: number; at: number; dur?: number; children: React.ReactNode}> = ({t, at, dur = 0.26, children}) => {
  const p = prog(t, at, dur, EASE.inOut);
  if (p <= 0) return null;
  if (p >= 1) return <>{children}</>;
  return (
    <AbsoluteFill style={{clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>{children}</AbsoluteFill>
  );
};

// 出场：内容整体向右退出，配合下一页的擦除，读起来像翻页而不是消失
export const leave = (t: number, at: number, dur = 0.22) => {
  const p = prog(t, at, dur, EASE.in);
  return {opacity: 1 - p, transform: `translateX(${-p * 46}px)`, clipPath: `inset(0 0 0 ${p * 100}%)`};
};
