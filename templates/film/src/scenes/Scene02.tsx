// Scene02 — 简介：三页快剪。旁白讲因果，画面只钉住能数清的东西。
// 每页的文案与数字都在 data.ts 的 SYNOPSIS[]，时间点由 SYNOPSIS_IDS 对应配音决定。
import React from 'react';
import {BOOK, CUT, T} from '../spec';
import {Sheet, Page} from '../lib/print';
import {SlidePage} from '../lib/slides';
import {SYNOPSIS, SYNOPSIS_IDS} from '../data';

export const Scene02: React.FC<{t: number}> = ({t}) => (
  <Sheet t={t} chapter="第 001—100 章" section={`${BOOK.author} · 卷一`}>
    {SYNOPSIS.map((s, i) => {
      const at = Math.max(0, (T[SYNOPSIS_IDS[i]] ?? CUT.synopsis) - 0.35);
      const endAt = i + 1 < SYNOPSIS_IDS.length
        ? Math.max(0, (T[SYNOPSIS_IDS[i + 1]] ?? at) - 0.35)
        : CUT.risk;
      return <Page key={i} t={t} at={at}><SlidePage t={t} at={at} endAt={endAt} s={s} /></Page>;
    })}
  </Sheet>
);
