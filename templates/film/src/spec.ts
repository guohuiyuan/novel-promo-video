// spec.ts — 设计契约：所有数值只在这里出现一次，场景只读不写死。
//
// 世界观默认「旧报纸 + 铅字 + 套红」：纸负责底，墨负责字，朱红只给决定性的一笔。
// 换风格时改这里的 C / FONT / SAFE，不要到场景里逐个改颜色。
// 书的事实与文案在 data.ts，不在本文件；本文件只做 re-export，方便 lib 统一从 spec 取。
import {BOOK, COPY} from './data';
import {CLIPS, VO_END, FILM_END, CUT, WOMEN, HERO_PAGE, T} from './timeline';

export const FILM = {
  duration: FILM_END,   // 声音先量，画面后画：片长由 timeline.ts 决定
  fps: 30,
  width: 1920,
  height: 1080,
  sound: false,         // 声音在成片阶段用 ffmpeg 混；Remotion 只出画面
};

export const SAFE = {x: 120, y: 96};  // 版心：内容不进这两个边
export const FOLIO_Y = 1002;          // 页脚基线；字幕 MarginV 要抬到它上面

export const FONT = {
  display: '"SimHei","Microsoft YaHei",sans-serif',  // 黑体：标题、数字、标签
  body: '"SimSun","Songti SC",serif',                // 宋体：正文、叙述
  quote: '"KaiTi","STKaiti",serif',                  // 楷体：台词、引文
};

// 五色四角色：夜蓝只在两处环境，珠光只给宝物。除此之外没有第六种颜色。
export const C = {
  paper: '#EDE4D0',
  paperDeep: '#DED2B6',
  paperEdge: '#C9BB9B',
  ink: '#191713',
  inkSoft: '#4C463A',
  inkFaint: '#8B8271',
  vermilion: '#B03A2E',
  night: '#1A212A',
  nightSoft: '#2A3542',
  gold: '#B98B45',
};

// 节奏：全片是「读」的节奏，不是「跳」的节奏。切点落在句子之间，不在句中。
export const BEAT = 0.34;      // 一行字压印时长
export const STAGGER = 0.026;  // 字与字的间隔

export {BOOK, COPY, CLIPS, VO_END, FILM_END, CUT, WOMEN, HERO_PAGE, T};
