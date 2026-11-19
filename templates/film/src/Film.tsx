// Film.tsx — 主时间线。六段按绝对时间读 t，各自在自己的窗口里存在；
// 段落之间用"整页擦除"（Wipe）交接——纸不换，只换版面上的字，像翻同一份报纸。
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useTime} from './lib/motion';
import {C, CUT, FILM_END} from './spec';
import {Wipe} from './lib/print';
import {Scene01} from './scenes/Scene01';
import {Scene02} from './scenes/Scene02';
import {Scene03} from './scenes/Scene03';
import {Scene04} from './scenes/Scene04';
import {Scene05} from './scenes/Scene05';
import {Scene06} from './scenes/Scene06';

export const Film: React.FC = () => {
  const {t} = useTime();
  return (
    <AbsoluteFill style={{backgroundColor: C.paper}}>
      {t < CUT.synopsis + 0.4 && <Scene01 t={t} />}
      {t >= CUT.synopsis && t < CUT.risk + 0.4 && (
        <Wipe t={t} at={CUT.synopsis}><Scene02 t={t} /></Wipe>
      )}
      {t >= CUT.risk && t < CUT.hero + 0.4 && (
        <Wipe t={t} at={CUT.risk}><Scene03 t={t} /></Wipe>
      )}
      {t >= CUT.hero && t < CUT.women + 0.4 && (
        <Wipe t={t} at={CUT.hero}><Scene04 t={t} /></Wipe>
      )}
      {t >= CUT.women && t < CUT.finale + 0.4 && (
        <Wipe t={t} at={CUT.women}><Scene05 t={t} /></Wipe>
      )}
      {t >= CUT.finale && t <= FILM_END && (
        <Wipe t={t} at={CUT.finale}><Scene06 t={t} /></Wipe>
      )}
    </AbsoluteFill>
  );
};
