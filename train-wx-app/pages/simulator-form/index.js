// pages/simulator-form/index.js - 快速填写模拟机培训/考核
const store = require('../../utils/store');
const dict = require('../../utils/dict');
const format = require('../../utils/format');

// 每个可选项字段对应的字典 key，弹层打开时取对应选项
const FIELD_DICT = {
  student: dict.students,
  trainCategory: dict.trainCategories,
  formName: dict.formNames,
  qualType: dict.qualTypes,
  sector: dict.sectors,
  weather: dict.weathers,
  military: dict.militaryOptions,
  complexity: dict.complexityLevels,
  duration: dict.durations
};

// 表单字段标题（弹层顶部显示用）
const FIELD_TITLE = {
  student: '学员姓名',
  trainCategory: '培训分类',
  formName: '表单名称',
  qualType: '资格类型',
  sector: '扇区',
  weather: '天气情况',
  military: '军航活动情况',
  complexity: '复杂程度',
  duration: '培训时长'
};

Page({
  data: {
    form: {
      student: '',
      exerciseNo: '',
      trainCategory: '',
      formName: '',
      qualType: '',
      sector: '',
      weather: '',
      military: '',
      sorties: '',
      complexity: '',
      teacher: '吴其奇',
      startTime: '',
      duration: ''
    },
    // 弹层状态
    sheetVisible: false,
    sheetField: '',
    sheetTitle: '',
    sheetOptions: [],
    sheetCurrent: -1,
    submitting: false
  },

  onLoad() {
    // 开始时间自动预填当前时间
    this.setData({ 'form.startTime': format.now() });
  },

  // 点击可选项行 -> 打开底部弹层
  onTapField(e) {
    const field = e.currentTarget.dataset.field;
    if (field === 'exerciseNo') {
      // 模拟机练习号跳转训练项目选择页
      wx.navigateTo({
        url:
          '/pages/training-items/index?selected=' +
          encodeURIComponent(this.data.form.exerciseNo)
      });
      return;
    }
    if (field === 'sorties') {
      // 指挥架次用数字键盘输入
      this.inputSorties();
      return;
    }
    if (field === 'startTime') return; // 只读

    const options = FIELD_DICT[field] || [];
    const current = options.indexOf(this.data.form[field]);
    this.setData({
      sheetVisible: true,
      sheetField: field,
      sheetTitle: FIELD_TITLE[field] || '请选择',
      sheetOptions: options.map(function (label) { return { label: label }; }),
      sheetCurrent: current
    });
  },

  // 指挥架次：键盘输入
  inputSorties() {
    wx.showModal({
      title: '指挥架次',
      editable: true,
      placeholderText: '请输入指挥架次（数字）',
      success: (res) => {
        if (res.confirm) {
          this.setData({ 'form.sorties': res.content || '' });
        }
      }
    });
  },

  // 弹层确认：把选中的值写回对应字段
  onSheetConfirm(e) {
    const index = e.detail.index;
    const field = this.data.sheetField;
    if (index < 0) {
      this.setData({ sheetVisible: false });
      return;
    }
    const value = this.data.sheetOptions[index].label;
    this.setData({
      sheetVisible: false,
      ['form.' + field]: value
    });
  },

  onSheetCancel() {
    this.setData({ sheetVisible: false });
  },

  // 关闭整页（右上角 ⊗）
  onClose() {
    wx.navigateBack();
  },

  // 提交 -> 生成待办任务，回到工作台
  onSubmit() {
    const f = this.data.form;
    if (!f.student) {
      wx.showToast({ title: '请选择学员姓名', icon: 'none' });
      return;
    }
    if (!f.trainCategory) {
      wx.showToast({ title: '请选择培训分类', icon: 'none' });
      return;
    }
    if (!f.formName) {
      wx.showToast({ title: '请选择表单名称', icon: 'none' });
      return;
    }

    store.addTodo({
      title: f.student + '【' + f.formName + '】需录入关联表单',
      student: f.student,
      exerciseNo: f.exerciseNo,
      trainCategory: f.trainCategory,
      postTrainType: '资格培训',
      formName: f.formName,
      startTime: f.startTime,
      endTime: '',
      qualType: f.qualType,
      sector: f.sector,
      weather: f.weather,
      military: f.military,
      sorties: f.sorties,
      complexity: f.complexity,
      teacher: f.teacher,
      duration: f.duration
    });

    wx.showToast({ title: '已生成待办任务', icon: 'success' });
    setTimeout(function () {
      wx.navigateBack();
    }, 800);
  }
});
