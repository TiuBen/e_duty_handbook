// 席位数据（纯选择器，不显示在班人员）
export const SEATS = [
  { id: 'wt', name: '西塔台', role: '主+副' },
  { id: 'et', name: '东塔台', role: '主+副' },
  { id: 'fx', name: '放行', role: '单岗' },
  { id: 'lb', name: '领班', role: '单岗' },
  { id: 'zh', name: '综合协调', role: '单岗' },
  { id: 'hd', name: '航班调度席', role: '单岗' },
];

export const TABS = [
  { id: 'seats', label: '席位', short: '席位' },
  { id: 'checklist', label: '检查单', short: '检查' },
  { id: 'handover', label: '交接班', short: '交接' },
];

// 水印文字映射
export const WATERMARK = {
  seats: '席位选择',
  checklist: '检查单',
  handover: '交接班',
};
