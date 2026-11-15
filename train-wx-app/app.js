// app.js - 小程序全局入口：启动时初始化本地种子数据
const store = require('./utils/store');

App({
  onLaunch() {
    // 首次启动时写入预置样本数据（待办/已办/消息/反馈），保证页面一打开就有内容
    store.seedIfEmpty();
  },

  globalData: {
    // 当前登录用户（教员），后续接入真实登录时从这里取
    userInfo: {
      name: '吴其奇',
      role: '教员',
      unit: '模拟机培训中心'
    }
  }
});
