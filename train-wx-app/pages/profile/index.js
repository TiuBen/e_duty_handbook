// pages/profile/index.js - 个人信息：用户卡片 + 月/年度报告入口 + 占位菜单
Page({
  data: {
    user: {}
  },

  onShow() {
    const app = getApp();
    this.setData({ user: app.globalData.userInfo });
  },

  // 生成月/年度报告（占位）
  onGenReport() {
    wx.showToast({ title: '报告生成功能开发中', icon: 'none' });
  },

  onMyTasks() {
    wx.switchTab({ url: '/pages/workbench/index' });
  }
});
