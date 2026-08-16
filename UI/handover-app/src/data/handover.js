// 交接班数据（来自 交接班页面.js）
// type: single=单选 / multi=多选 / text=文本项（字符串为标签）

export const HANDOVER_GROUPS = [
  {
    title: '运行模式',
    comp: [
      { type: 'single', items: ['单跑道', '相关进近', '类隔离', '独立离场'] },
      { type: 'single', items: ['I类盲降', 'LVP运行'] },
      { type: 'single', items: ['01L', '19R', '01R', '19L'] },
    ],
  },
  {
    title: '设备',
    comp: [
      { type: 'multi', items: ['主频', '备频', '复飞直通'] },
      { type: 'multi', items: ['莱斯', '二所', '场监', '进程单'] },
      { type: 'single', items: ['01L', '19R', '01R', '19L'] },
    ],
  },
  {
    title: '场面状况',
    comp: [
      { type: 'text', items: ['西跑道道面状况代码'] },
      { type: 'single', items: [0, 1, 2, 3, 4, 5] },
      { type: 'text', items: ['东跑道道面状况代码'] },
      { type: 'text', items: [0, 1, 2, 3, 4, 5] },
      { type: 'text', items: ['西跑道+A滑行'] },
    ],
  },
  {
    title: '天气',
    comp: [
      { type: 'text', items: ['VIS/RVR'] },
      { type: 'text', items: ['QNH'] },
      { type: 'text', items: ['特殊'] },
      { type: 'text', items: ['风向风速'] },
      { type: 'text', items: ['特殊'] },
      { type: 'text', items: ['复杂天气及趋势'] },
      { type: 'text', items: ['机场警报'] },
    ],
  },
  { title: '当前进近方式', comp: [] },
  {
    title: '空军活动',
    comp: [
      { type: 'single', items: ['SP活动无'] },
      { type: 'multi', items: ['高度要求', '南落北起', '是否通报'] },
    ],
  },
  {
    title: '通航',
    comp: [{ type: 'single', items: ['申请中', '活动中', '无'] }],
  },
  {
    title: '特殊',
    comp: [{ type: 'multi', items: ['VIP', '公务机', '训练', '试车', '非默认跑道', '国际航司', '无'] }],
  },
  { title: '流量控制', comp: [] },
  { title: '航行通告', comp: [] },
  {
    title: '动态',
    comp: [{ type: 'multi', items: ['进港', '放行', '开车', '滑行', '协调移交', '需协调航班', '相似航班号'] }],
  },
];
