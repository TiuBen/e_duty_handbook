// pages/training-items/index.js - 训练项目选择：席位 tab + 分组折叠 + 单选 + 全选/全取消/确认
const dict = require('../../utils/dict');

Page({
  data: {
    positions: dict.positions,
    activePos: '进近', // 与原小程序截图一致，默认进近
    groups: [],
    searchKey: '',
    selected: '', // 已选训练项目名称
    sheetVisible: false,
    sheetOptions: [],
    sheetCurrent: -1
  },

  onLoad(options) {
    this.selected = decodeURIComponent(options.selected || '');
    this.buildGroups();
  },

  // 依据当前席位 + 搜索词构建分组列表
  buildGroups() {
    const pos = this.data.activePos;
    const kw = (this.data.searchKey || '').trim();

    const groups = dict.trainingGroups
      .map(function (g) {
        const items = g.items
          .filter(function (it) {
            if (it.positions.indexOf(pos) === -1) return false;
            if (kw && it.name.indexOf(kw) === -1) return false;
            return true;
          })
          .map(function (it) {
            return { name: it.name };
          });
        return { name: g.name, open: true, items: items };
      })
      .filter(function (g) { return g.items.length > 0; });

    this.setData({ groups: groups });
  },

  // 切换席位 tab
  onSwitchPos(e) {
    const pos = e.currentTarget.dataset.pos;
    if (pos === this.data.activePos) return;
    this.setData({ activePos: pos, searchKey: '' });
    this.buildGroups();
  },

  // 搜索
  onSearchInput(e) {
    this.setData({ searchKey: e.detail.value });
    this.buildGroups();
  },

  // 折叠/展开分组
  onToggleGroup(e) {
    const gi = Number(e.currentTarget.dataset.gi);
    this.setData({ ['groups[' + gi + '].open']: !this.data.groups[gi].open });
  },

  // 单选某个训练项目
  onSelectItem(e) {
    const name = e.currentTarget.dataset.name;
    this.selected = name;
    // 清掉其他选中态：重新渲染通过 comparing selected 实现，这里直接整体刷新
    this.setData({ selected: name });
  },

  // 全选当前席位可见的项（原界面语义：把当前 tab 全部项选中）
  onSelectAll() {
    const names = [];
    this.data.groups.forEach(function (g) {
      g.items.forEach(function (it) { names.push(it.name); });
    });
    // 单选界面下"全选"用弹层展示全部项，确认后取第一个/全部拼接
    if (!names.length) return;
    this.selected = names.join('、');
    this.setData({ selected: this.selected });
  },

  // 全取消
  onClearAll() {
    this.selected = '';
    this.setData({ selected: '' });
  },

  // 新增个性化（占位）
  onAddCustom() {
    wx.showModal({
      title: '新增个性化',
      editable: true,
      placeholderText: '请输入自定义训练项目名称',
      success: (res) => {
        if (res.confirm && res.content) {
          dict.trainingGroups.push({
            name: '个性化训练',
            items: [{ name: res.content, positions: dict.positions.slice() }]
          });
          this.buildGroups();
          wx.showToast({ title: '已新增', icon: 'success' });
        }
      }
    });
  },

  // 确认 -> 回填模拟机练习号并返回
  onConfirm() {
    const pages = getCurrentPages();
    const prev = pages[pages.length - 2];
    if (prev && prev.route === 'pages/simulator-form/index') {
      prev.setData({ 'form.exerciseNo': this.selected || '' });
    }
    wx.navigateBack();
  }
});
