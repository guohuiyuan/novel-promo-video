// data.ts — 画面要用的书的事实与人物档案。
//
// 规则（别破）：
//   1. 这里只放「能回书评查到」的事实；查不到就写「未知/书评未给」，绝不脑补。
//   2. 经历不写在这里——经历全部交给旁白。这里只放档案字段与档案照。
//   3. title / \n 是手动断行；自动折行会把台词拆成三行压到下一栏（踩过）。
//
// 下面是《都市良人行》的精简示例。做新书时整份替换，结构照抄。

export type StatItem = {value: string; unit?: string; label: string; red?: boolean};
export type Slide = {
  kicker: {num: string; label: string};
  endcard?: boolean;                // 片尾标版：只留书名、作者、代表作、朱印
  title: string;                    // \n 手动断行，建议两行、每行 ≤9 字
  titleSize?: number;
  lead?: string;                    // 标题下的一行导语
  stats?: StatItem[];               // 数字条，最多 3 个，x 依次 120 / 470 / 820
  list?: {label: string; items: string[]; note?: string};  // 右侧编号清单
  stamp?: {text: string; at?: number; x?: number; y?: number; size?: number};
  quote?: {text: string; who: string; source?: string; size?: number};
  dual?: [string, string][];        // 两栏对照，如 [['白 天','…'],['夜 里','…']]
  lines?: {text: string; red?: boolean}[];
  verdict?: {text: string; note?: string};  // 左栏底部总评引文块
};

export const BOOK = {
  title: '都市良人行',
  author: '禹岩',
  alias: '禹言',
  words: '111',             // 万字，Stat 的 value
  chapters: 290,
  volumes: 5,
  year: '一九九六',
  serial: '起点中文网 · 2006 年 2 月',
  genre: '都市 · 异能 · 后宫 · 商战',
  score: 'A−',
  classic: '《极品家丁》',
  classicNote: '起点总收藏第七 · 订阅破万',
  tagline: '一个退伍兵 · 一袋夜明珠 · 一个叫他圣主的女人',
  subscriberNote: '当年只有八百个订阅',
};

export const COPY = {
  title: '抱着战友的遗体沉进沼泽',
  title2: '泥底石缝，通向一部失传的全诀',
  hook: '抱着战友的遗体沉进沼泽，七天后他从崖壁爬了回来。',  // 书讯页竖排报眼
  verdict: '九十年代都市后宫爽文的完成度样本：\n热闹好读、情绪给足，格局与收尾撑不住。',
  verdictNote: '总评 A− · 评分为阅读主观判断，非原文事实',
  endLine: '一九九六年，从一片沼泽开始。',
  seal: '完',
};

export const SCORE: [string, string][] = [
  ['情节', 'A−'], ['文笔', 'B+'], ['感情', 'A−'], ['车速', 'B+'],
  ['人物刻画', 'B+'], ['新意', 'B'], ['压抑度', 'C'], ['总评', 'A−'],
];

// 每段配音的 id（对应 design/script.json）。幻灯片数量 = ids 数量。
export const SYNOPSIS_IDS = ['s01', 's02', 's03'];
export const SYNOPSIS: Slide[] = [
  {
    kicker: {num: '02', label: '简介 · 丛林'},
    title: '抱着战友的遗体\n沉进沼泽',
    lead: '越境伏击踩进毒贩和雇佣兵合做的套。他留下断后，沉进泥底。',
    stats: [
      {value: '18', unit: '岁', label: '猎鹰最年轻的小队长'},
      {value: '6', unit: '人', label: '弟兄'},
      {value: '2', unit: '死', label: '一残', red: true},
    ],
    list: {
      label: '泥 底 石 缝',
      items: ['两具坐化的骸骨', '一份失传的《天心诀》全诀', '一株千年才长一截的翠玉墨竹'],
      note: '山腹古洞 · 魔门衣钵',
    },
  },
  {
    kicker: {num: '03', label: '简介 · 天京'},
    title: '七天后，他从崖壁\n爬了回来',
    lead: '等到的不是嘉奖。高考后，他揣着一袋夜明珠闯进天京。',
    stamp: {text: '强制退伍', x: 120, y: 548, size: 170},
    stats: [
      {value: '1', unit: '袋', label: '夜明珠 · 全部本钱'},
      {value: '港岛', label: '拍卖会 · 一夜扬名'},
      {value: '35', unit: '岁', label: '总裁跪下认主', red: true},
    ],
    quote: {
      text: '她跪下来，\n叫他圣主。', who: '关敏晴',
      source: '港岛拍卖会后，他夜入酒店出示圣玉', size: 36,
    },
  },
  {
    kicker: {num: '04', label: '简介 · 商战'},
    title: '他要造一台\n中国人自己的车',
    lead: '',
    dual: [['白 天', '谈配套、跑批文、张罗造车'], ['夜 里', '清理门户、应付暗杀']],
    lines: [
      {text: '一边是千年圣门留下的烂摊子，一边是快被吞掉的小公司；'},
      {text: '撞合资潮那堵墙，是他全书最有想法的一笔。', red: true},
    ],
  },
];

export const RISK = {
  thunder: 1,
  gloom: 24,
  breakdown: [
    ['虐心', 8], ['拒女', 4], ['擦边', 3], ['拉皮条', 2],
    ['漏女', 2], ['百合', 2], ['虐主', 2], ['神雕', 1],
  ] as [string, number][],
};
export const RISK_IDS = ['r01', 'r02'];
export const RISK_FOCUS = {
  name: '许念欣', stamp: '背叛',
  lead: '荒岛求生的头几天，她随身带着卫星电话',
  facts: [
    ['知情', '电话是她自己藏进登岛的树林，不是丢了、不是坏了'],
    ['动机', '想留他陪满三年，再送他走'],
    ['后果', '风暴连树林带电话一起卷走，他和关雅妮困岛近两年'],
  ] as [string, string][],
  quote: {
    text: '所以，到了小岛之后，\n我就把电话藏在登岛那个地方的树林中。',
    who: '许念欣', source: '事后承认：是我当初自私',
  },
};

export const FINALE_IDS = ['f01', 'f02', 'f03'];
export const FINALE: Slide[] = [
  {
    kicker: {num: '10', label: '十死无生'},
    title: '为了一纸批文，\n他接下十死无生的任务',
    lead: '炸毁秘密试验室，和关雅妮一起坠海。',
    stats: [
      {value: '17', unit: '个月', label: '昏迷', red: true},
      {value: '2', unit: '年', label: '失踪 · 众女分头守着'},
      {value: '1', label: '张盖章的结婚证 · 国家最高机密'},
    ],
    lines: [{text: '一夫多妻的合法性，全书就靠这一张纸撑着——这也是它最儿戏的一处。'}],
  },
  {
    kicker: {num: '11', label: '四年后'},
    title: '当年只有八百个订阅',
    lead: '他还是把一百一十一万字，写完了。',
    stats: [
      {value: '800', unit: '订阅', label: '二〇〇六年的起点'},
      {value: '111', unit: '万字', label: '全书'},
      {value: '290', unit: '章', label: '五卷 · 完结'},
    ],
    lines: [{text: '四年后，公海的小岛上，一屋子妻儿在晒太阳。'}],
  },
  {kicker: {num: '终', label: '全书终'}, title: '', endcard: true} as Slide,
];

export type Person = {
  num: string;
  name: string;
  photo: string;                 // film/public/art/ 下的文件名，如 'art/01_曾倩.webp'
  role: string;                  // 身份
  photoRole?: string;            // 照片下方的小字（默认用 num）
  quote: string;                 // 名场面台词，\n 手动断行
  quoteSrc: string;              // 台词出处一行
  look: string;                  // 外貌一行（书评原话压缩）
  traits: string[];              // 性格关键词（书评原词），4 个
  ending: string;                // 结局一行
  purity?: string;               // 书评给的纯洁度；没有就不写
};

// 男主：与女主页同版式，把「纯洁度」换成「名分」。
export const HERO = {
  num: '00', name: '禹言', photo: 'art/00_禹言.webp', photoRole: '圣门圣主',
  quote: '中国不行，就去国外，地球不行，就去火星，\n反正我是打定主意了，两个我都要。',
  quoteSrc: '向曾柔摊牌，要连她姐姐曾倩一起娶进门',
  role: '云门十五代弟子 · 猎鹰最年轻的小队长 · 圣门圣主',
  look: '黑发黑瞳，脸白如玉，眉目清俊近书生；西装领带，退伍后留长发',
  traits: ['外表温雅', '行事蔫坏', '先斩后奏', '护短到跪'],
  status: '千年圣门圣主 · 九张绝密结婚证',
  statusNote: '叶子、候芸到结尾都没等到',
  ending: '炸实验室坠海，昏迷十七个月；两年后重返天京，四年后在公海小岛。',
};

// 女主：一人一页，顺序照书评。id 的序号要与 design/script.json 的 pNN/qNN 对齐。
export const WOMEN_DATA: Person[] = [
  {
    num: '01', name: '曾倩', purity: '全初', photo: 'art/01_曾倩.webp',
    role: '曾天元长女 · 猎鹰特战队员 · 曾柔的双胞胎姐姐',
    quote: '你知不知道，\n这一辈子，我只为你舞蹈。',
    quoteSrc: '山顶月下为他独舞，力竭，倒进他怀里',
    look: '齐耳短发，清丽白皙，身段玲珑；着军装时更显英姿',
    traits: ['羞涩腼腆', '死心眼', '自我牺牲', '外柔内刚'],
    ending: '团圆后第一个领结婚证；四年后升少校，也怀上了孩子。',
  },
  {
    num: '02', name: '关敏晴', purity: '全初', photo: 'art/02_关敏晴.webp',
    role: '圣龙集团掌权者 · 圣门第三十九代圣女 · 三十五岁',
    quote: '圣门第三十九代圣女关敏晴\n恭迎圣主驾前。',
    quoteSrc: '他夜入酒店出示圣玉，她跪倒认主',
    look: '三十五岁却看不出年纪，可当少女也可当少妇，媚艳入骨',
    traits: ['钢铁女强人', '外媚内传统', '痴等二十年', '掌家主母'],
    ending: '怀着身孕主持禹家，生下禹成；四年后一大家同住，仍掌家中规矩。',
  },
  // ↓ 继续按书评顺序补齐；WOMEN_DATA.length 必须等于 WOMEN.length（见 timeline.ts）
];
