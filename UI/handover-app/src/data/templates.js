// 检查单模板（附录 A/B/C）
export const TEMPLATE_GROUPS = [
  {
    id: 'A',
    label: '附录 A · 跑道类检查单',
    items: [
      { id: 'a1', title: '跑道巡视检查单', icon: '🏃' },
      { id: 'a2', title: '航空器使用非全跑道离场检查单', icon: '✈' },
      { id: 'a3', title: '航空器使用非主用跑道起降检查单', icon: '✈' },
      { id: 'a4', title: '通航保障检查单', icon: '🛩' },
      { id: 'a5', title: '校验流程检查单', icon: '✓' },
      { id: 'a6', title: '训练飞行流程检查单', icon: '🎓' },
      { id: 'a7', title: '航班备降、返航检查单', icon: '↩' },
      { id: 'a8', title: '鸟情预警处置检查单', icon: '🦅' },
      { id: 'a9', title: '第三方用户飞行保障检查单', icon: '🛡' },
      { id: 'a10', title: '起降间隔检查单', icon: '⏱' },
      { id: 'a11', title: '非默认离场检查单', icon: '↗' },
    ],
  },
  {
    id: 'B',
    label: '附录 B · 天气类检查单',
    items: [
      { id: 'b1', title: '雷雨处置检查单', icon: '⛈' },
      { id: 'b2', title: '大风天气处置检查单', icon: '💨' },
      { id: 'b3', title: '降雪除冰处置检查单', icon: '❄' },
      { id: 'b4', title: '风切变/颠簸处置检查单', icon: '〰' },
      { id: 'b5', title: '低能见度运行检查单', icon: '🌫' },
    ],
  },
  {
    id: 'C',
    label: '附录 C · 设备类检查单',
    items: [
      { id: 'c1', title: '机场设备故障或降级检查单', icon: '⚙' },
      { id: 'c2', title: '内话设备（RS 切换到飞坤）切换检查单', icon: '🎚' },
      { id: 'c3', title: '内话设备（飞坤切换到 RS）切换检查单', icon: '🎚' },
      { id: 'c4', title: '主备自动化系统（莱斯二所）应急切换检查单', icon: '🔁' },
      { id: 'c5', title: '主备自动化系统（莱斯二所）常规切换检查单', icon: '🔁' },
    ],
  },
];
