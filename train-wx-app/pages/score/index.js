// pages/score/index.js - 评分扣分页：分组计次、最后得分、总体情况、附件、提交
const store = require('../../utils/store');
const dict = require('../../utils/dict');

Page({
  data: {
    taskId: '',
    // 分组结构：{ name, open, items: [{ name, score, count }] }
    groups: [],
    finalScore: 100,
    previewScore: 100,
    overall: '',
    attachments: []
  },

  onLoad(options) {
    // 进入评分页时把扣分次数清零
    const groups = dict.scoreGroups.map(function (g) {
      return {
        name: g.name,
        open: true,
        items: g.items.map(function (it) {
          return { name: it.name, score: it.score, count: 0 };
        })
      };
    });
    this.setData({ taskId: options.id || '', groups: groups });
    this.computeScore();
  },

  // 展开/收起分组
  onToggleGroup(e) {
    const gi = Number(e.currentTarget.dataset.gi);
    this.setData({ ['groups[' + gi + '].open']: !this.data.groups[gi].open });
  },

  // 次数 +1
  onPlus(e) {
    const gi = Number(e.currentTarget.dataset.gi);
    const ii = Number(e.currentTarget.dataset.ii);
    const key = 'groups[' + gi + '].items[' + ii + '].count';
    this.setData({ [key]: this.data.groups[gi].items[ii].count + 1 });
    this.computeScore();
  },

  // 次数 -1（不小于 0）
  onMinus(e) {
    const gi = Number(e.currentTarget.dataset.gi);
    const ii = Number(e.currentTarget.dataset.ii);
    const cur = this.data.groups[gi].items[ii].count;
    if (cur <= 0) return;
    this.setData({ ['groups[' + gi + '].items[' + ii + '].count']: cur - 1 });
    this.computeScore();
  },

  // 得分 = 100 - Σ(次数 × 分值)，最低 0
  computeScore() {
    let total = 0;
    this.data.groups.forEach(function (g) {
      g.items.forEach(function (it) {
        total += it.count * it.score;
      });
    });
    const score = Math.max(0, 100 - total);
    this.setData({ finalScore: score, previewScore: score });
  },

  // 总体情况输入（提交必填）
  onOverallInput(e) {
    this.setData({ overall: e.detail.value });
  },

  // 附件：拍照上传
  onAddAttachment() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        const files = this.data.attachments.concat(res.tempFiles.map(function (f) {
          return f.tempFilePath;
        }));
        this.setData({ attachments: files });
      }
    });
  },

  // 提交：整体情况必填 -> 待办转已办 -> 回工作台
  onSubmit() {
    if (!this.data.overall.trim()) {
      wx.showToast({ title: '请输入总体情况', icon: 'none' });
      return;
    }
    store.moveTodoToDone(this.data.taskId, {
      score: this.data.finalScore,
      overall: this.data.overall,
      attachments: this.data.attachments.length
    });
    wx.showToast({ title: '提交成功', icon: 'success' });
    setTimeout(function () {
      // 评分页与详情页都要退出，直接回工作台
      wx.navigateBack({ delta: 2 });
    }, 800);
  },

  // 上一步：回到任务详情
  onPrev() {
    wx.navigateBack();
  }
});
