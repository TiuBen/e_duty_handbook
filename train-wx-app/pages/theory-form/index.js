// pages/theory-form/index.js - 理论培训快速填写
const store = require('../../utils/store');
const dict = require('../../utils/dict');
const format = require('../../utils/format');

Page({
  data: {
    form: {
      student: '',
      topic: '',
      formName: '理论培训记录表',
      startTime: '',
      duration: '',
      teacher: '吴其奇'
    },
    sheetVisible: false,
    sheetField: '',
    sheetTitle: '',
    sheetOptions: [],
    sheetCurrent: -1
  },

  onLoad() {
    this.setData({ 'form.startTime': format.now() });
  },

  onTapField(e) {
    const field = e.currentTarget.dataset.field;
    const dictMap = {
      student: { title: '学员姓名', options: dict.students },
      duration: { title: '培训时长', options: dict.durations }
    };
    const conf = dictMap[field];
    if (!conf) return;

    const current = conf.options.indexOf(this.data.form[field]);
    this.setData({
      sheetVisible: true,
      sheetField: field,
      sheetTitle: conf.title,
      sheetOptions: conf.options.map(function (label) { return { label: label }; }),
      sheetCurrent: current
    });
  },

  // 培训主题：键盘输入
  inputTopic() {
    wx.showModal({
      title: '培训主题',
      editable: true,
      placeholderText: '请输入培训主题',
      success: (res) => {
        if (res.confirm) {
          this.setData({ 'form.topic': res.content || '' });
        }
      }
    });
  },

  onSheetConfirm(e) {
    const index = e.detail.index;
    const field = this.data.sheetField;
    this.setData({ sheetVisible: false });
    if (index < 0) return;
    this.setData({ ['form.' + field]: this.data.sheetOptions[index].label });
  },

  onSheetCancel() {
    this.setData({ sheetVisible: false });
  },

  onClose() {
    wx.navigateBack();
  },

  onSubmit() {
    const f = this.data.form;
    if (!f.student) {
      wx.showToast({ title: '请选择学员姓名', icon: 'none' });
      return;
    }
    if (!f.topic) {
      wx.showToast({ title: '请输入培训主题', icon: 'none' });
      return;
    }

    store.addTodo({
      title: f.student + '【' + f.formName + '】需录入关联表单',
      student: f.student,
      trainCategory: '理论培训',
      formName: f.formName,
      topic: f.topic,
      startTime: f.startTime,
      duration: f.duration,
      teacher: f.teacher
    });

    wx.showToast({ title: '已生成待办任务', icon: 'success' });
    setTimeout(function () {
      wx.navigateBack();
    }, 800);
  }
});
