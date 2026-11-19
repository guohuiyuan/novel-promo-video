// timeline.ts — 由 build/mk_timeline.py 从 design/timeline.json 生成，不要手改。
// 声音先量、画面后画：所有场景只读这里的绝对秒数。

export type Clip = {
  id: string; sec: string; start: number; dur: number; end: number;
  voice: string; kind: string;
};

export const CLIPS: Clip[] = [
  {id: "a01", sec: "info", start: 0.0, dur: 10.224, end: 10.224, voice: "voice-210", kind: "narration"},
  {id: "a02", sec: "info", start: 10.504, dur: 7.344, end: 17.848, voice: "voice-210", kind: "narration"},
  {id: "s01", sec: "synopsis", start: 18.128, dur: 8.784, end: 26.912, voice: "voice-210", kind: "narration"},
  {id: "s02", sec: "synopsis", start: 27.192, dur: 11.088, end: 38.28, voice: "voice-210", kind: "narration"},
  {id: "s03", sec: "synopsis", start: 38.56, dur: 6.936, end: 45.496, voice: "voice-210", kind: "narration"},
  {id: "r01", sec: "risk", start: 45.776, dur: 6.528, end: 52.304, voice: "voice-210", kind: "narration"},
  {id: "r02", sec: "risk", start: 52.584, dur: 12.768, end: 65.352, voice: "voice-210", kind: "narration"},
  {id: "h01", sec: "hero", start: 65.632, dur: 7.488, end: 73.12, voice: "voice-219", kind: "line"},
  {id: "h02", sec: "hero", start: 73.4, dur: 20.448, end: 93.848, voice: "voice-210", kind: "narration"},
  {id: "h03", sec: "hero", start: 94.128, dur: 30.936, end: 125.064, voice: "voice-210", kind: "narration"},
  {id: "h04", sec: "hero", start: 125.344, dur: 23.328, end: 148.672, voice: "voice-210", kind: "narration"},
  {id: "p01", sec: "women", start: 148.952, dur: 3.648, end: 152.6, voice: "voice-42", kind: "line"},
  {id: "q01", sec: "women", start: 152.88, dur: 43.728, end: 196.608, voice: "voice-210", kind: "narration"},
  {id: "p02", sec: "women", start: 196.888, dur: 4.368, end: 201.256, voice: "voice-42", kind: "line"},
  {id: "q02", sec: "women", start: 201.536, dur: 46.848, end: 248.384, voice: "voice-210", kind: "narration"},
  {id: "p03", sec: "women", start: 248.664, dur: 7.008, end: 255.672, voice: "voice-42", kind: "line"},
  {id: "q03", sec: "women", start: 255.952, dur: 45.336, end: 301.288, voice: "voice-210", kind: "narration"},
  {id: "p04", sec: "women", start: 301.568, dur: 7.416, end: 308.984, voice: "voice-42", kind: "line"},
  {id: "q04", sec: "women", start: 309.264, dur: 37.896, end: 347.16, voice: "voice-210", kind: "narration"},
  {id: "p05", sec: "women", start: 347.44, dur: 3.264, end: 350.704, voice: "voice-42", kind: "line"},
  {id: "q05", sec: "women", start: 350.984, dur: 46.848, end: 397.832, voice: "voice-210", kind: "narration"},
  {id: "p06", sec: "women", start: 398.112, dur: 6.456, end: 404.568, voice: "voice-42", kind: "line"},
  {id: "q06", sec: "women", start: 404.848, dur: 42.768, end: 447.616, voice: "voice-210", kind: "narration"},
  {id: "p07", sec: "women", start: 447.896, dur: 5.328, end: 453.224, voice: "voice-42", kind: "line"},
  {id: "q07", sec: "women", start: 453.504, dur: 47.256, end: 500.76, voice: "voice-210", kind: "narration"},
  {id: "p08", sec: "women", start: 501.04, dur: 10.056, end: 511.096, voice: "voice-42", kind: "line"},
  {id: "q08", sec: "women", start: 511.376, dur: 41.664, end: 553.04, voice: "voice-210", kind: "narration"},
  {id: "p09", sec: "women", start: 553.32, dur: 6.048, end: 559.368, voice: "voice-42", kind: "line"},
  {id: "q09", sec: "women", start: 559.648, dur: 46.128, end: 605.776, voice: "voice-210", kind: "narration"},
  {id: "p10", sec: "women", start: 606.056, dur: 7.824, end: 613.88, voice: "voice-42", kind: "line"},
  {id: "q10", sec: "women", start: 614.16, dur: 45.336, end: 659.496, voice: "voice-210", kind: "narration"},
  {id: "p11", sec: "women", start: 659.776, dur: 3.024, end: 662.8, voice: "voice-42", kind: "line"},
  {id: "q11", sec: "women", start: 663.08, dur: 47.664, end: 710.744, voice: "voice-210", kind: "narration"},
  {id: "f01", sec: "finale", start: 711.024, dur: 8.688, end: 719.712, voice: "voice-210", kind: "narration"},
  {id: "f02", sec: "finale", start: 719.992, dur: 9.024, end: 729.016, voice: "voice-210", kind: "narration"},
  {id: "f03", sec: "finale", start: 729.296, dur: 4.128, end: 733.424, voice: "voice-210", kind: "narration"}
];

export const VO_END = 733.424;
export const FILM_END = 740.924;

// 大段切换点（每条配音前一瞬，字先落纸、声后到）
export const CUT = {
  info: 0.0,  synopsis: 17.778,  risk: 45.426,  hero: 65.282,  women: 148.602,  finale: 710.674
} as const;

// 男主，一页（台词 + 三段经历）
export const HERO_PAGE = {
  start: 65.282, end: 148.602,
  lineAt: 65.632, lineDur: 7.488,
  narrAt: 73.4, narrDur: 75.272,
};

// 十一位女主，一人一页
export const WOMEN = [
  {num: "01", start: 148.602, end: 196.538, lineAt: 148.952, lineDur: 3.648, narrAt: 152.88, narrDur: 43.728},
  {num: "02", start: 196.538, end: 248.314, lineAt: 196.888, lineDur: 4.368, narrAt: 201.536, narrDur: 46.848},
  {num: "03", start: 248.314, end: 301.218, lineAt: 248.664, lineDur: 7.008, narrAt: 255.952, narrDur: 45.336},
  {num: "04", start: 301.218, end: 347.09, lineAt: 301.568, lineDur: 7.416, narrAt: 309.264, narrDur: 37.896},
  {num: "05", start: 347.09, end: 397.762, lineAt: 347.44, lineDur: 3.264, narrAt: 350.984, narrDur: 46.848},
  {num: "06", start: 397.762, end: 447.546, lineAt: 398.112, lineDur: 6.456, narrAt: 404.848, narrDur: 42.768},
  {num: "07", start: 447.546, end: 500.69, lineAt: 447.896, lineDur: 5.328, narrAt: 453.504, narrDur: 47.256},
  {num: "08", start: 500.69, end: 552.97, lineAt: 501.04, lineDur: 10.056, narrAt: 511.376, narrDur: 41.664},
  {num: "09", start: 552.97, end: 605.706, lineAt: 553.32, lineDur: 6.048, narrAt: 559.648, narrDur: 46.128},
  {num: "10", start: 605.706, end: 659.426, lineAt: 606.056, lineDur: 7.824, narrAt: 614.16, narrDur: 45.336},
  {num: "11", start: 659.426, end: 710.674, lineAt: 659.776, lineDur: 3.024, narrAt: 663.08, narrDur: 47.664}
];

// id → 起始秒，场景里按句取点
export const T: Record<string, number> = Object.fromEntries(
  CLIPS.map((c) => [c.id, c.start])
);
