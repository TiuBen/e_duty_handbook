// pages/workbench/index.js - 工作台：待办任务 / 已办任务 / 消息提醒 / 反馈记录
const store = require('../../utils/store');
const format = require('../../utils/format');

Page({
  data: {
    tabs: [
      { name: '待办任务', key: 'todo' },
      { name: '已办任务', key: 'done' },
      { name: '消息提醒', key: 'msg' },
      { name: '反馈记录', key: 'feedback' }
    ],
    // 每个 tab 对应的角标数量，-1 表示不显示
    badges: { todo: 0, done: -1, msg: 0, feedback: -1 },
    activeKey: 'todo',
    searchKey: '',
    list: [],
    banner: '点击此处生成月/年度报告/在个人信息页面生成'
  },

  onShow() {
    this.refresh();
  },

  // 重新读取本地数据并按当前 tab + 搜索词过滤
  refresh() {
    const key = this.data.activeKey;
    const kw = (this.data.searchKey || '').trim();

    let list = [];
    if (key === 'todo') list = store.listTodos();
    else if (key === 'done') list = store.listDone();
    else if (key === 'msg') list = store.listMessages();
    else list = store.listFeedbacks();

    if (kw) {
      list = list.filter(function (item) {
        return (item.title || '').indexOf(kw) !== -1;
      });
    }

    // 消息提醒的角标固定用总数（模拟原小程序 431 的效果）
    this.setData({
      list: list,
      badges: {
        todo: store.listTodos().length,
        done: -1,
        msg: store.listMessages().length,
        feedback: -1
      }
    });
  },

  // 切换顶部 tab
  onSwitchTab(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.activeKey) return;
    this.setData({ activeKey: key, searchKey: '' });
    this.refresh();
  },

  // 搜索框输入（输入即过滤）
  onSearchInput(e) {
    this.setData({ searchKey: e.detail.value });
    this.refresh();
  },

  // 点击黄色横幅 -> 生成月/年度报告（占位提示）
  onTapBanner() {
    wx.showToast({ title: '报告生成功能开发中', icon: 'none' });
  },

  // 点击列表项：待办任务进入详情页，其他 tab 仅提示
  onTapItem(e) {
    const id = e.currentTarget.dataset.id;
    if (this.data.activeKey === 'todo') {
      wx.navigateTo({ url: '/pages/task-detail/index?id=' + id });
    } else {
      wx.showToast({ title: '查看功能开发中', icon: 'none' });
    }
  },

  // 底部红色按钮：模拟机培训/考核 -> 快速填写表单
  onGoSimulator() {
    wx.navigateTo({ url: '/pages/simulator-form/index' });
  },

  // 底部绿色按钮：理论培训 -> 理论培训表单
  onGoTheory() {
    wx.navigateTo({ url: '/pages/theory-form/index' });
  },

  // 拼装列表项时间显示
  fmt(item) {
    return item.createdAt || format.now();
  }
});
