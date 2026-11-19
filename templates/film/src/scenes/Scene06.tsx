// Scene06 — 收尾：把账算完。最后一页只留书名、作者、代表作与朱印。
import React from 'react';
import {BOOK, CUT, FILM_END, T} from '../spec';
import {Sheet, Page} from '../lib/print';
import {SlidePage} from '../lib/slides';
import {FINALE, FINALE_IDS} from '../data';

export const Scene06: React.FC<{t: number}> = ({t}) => (
  <Sheet t={t} chapter="终卷" section={`${BOOK.author} · 全书终`}>
    {FINALE.map((s, i) => {
      const at = Math.max(0, (T[FINALE_IDS[i]] ?? CUT.finale) - 0.35);
      const endAt = i + 1 < FINALE_IDS.length
        ? Math.max(0, (T[FINALE_IDS[i + 1]] ?? at) - 0.35)
        : FILM_END;
      return <Page key={i} t={t} at={at}><SlidePage t={t} at={at} endAt={endAt} s={s} /></Page>;
    })}
  </Sheet>
);
