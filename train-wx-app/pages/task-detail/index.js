// pages/task-detail/index.js - 待办任务详情：可改字段 + 下一步 / 删除
const store = require('../../utils/store');
const dict = require('../../utils/dict');

// 可编辑字段 -> 字典
const FIELD_DICT = {
  student: dict.students,
  trainCategory: dict.trainCategories,
  postTrainType: ['资格培训', '熟练培训', '复训'],
  formName: dict.formNames,
  sector: dict.sectors,
  weather: dict.weathers,
  military: dict.militaryOptions,
  complexity: dict.complexityLevels
};

const FIELD_TITLE = {
  student: '学员姓名',
  trainCategory: '培训分类',
  postTrainType: '岗位培训类别',
  formName: '表单名称',
  sector: '扇区',
  weather: '天气情况',
  military: '军航活动情况',
  complexity: '复杂程度'
};

Page({
  data: {
    task: null,
    sheetVisible: false,
    sheetField: '',
    sheetTitle: '',
    sheetOptions: [],
    sheetCurrent: -1
  },

  onLoad(options) {
    const task = store.getTodo(options.id);
    if (!task) {
      wx.showToast({ title: '任务不存在', icon: 'none' });
      setTimeout(function () { wx.navigateBack(); }, 800);
      return;
    }
    this.setData({ task: task });
  },

  // 点击可编辑字段 -> 弹层选择后立即写回本地存储
  onTapField(e) {
    const field = e.currentTarget.dataset.field;
    const dict = FIELD_DICT[field];
    if (!dict || !this.data.task) return;

    const current = dict.indexOf(this.data.task[field]);
    this.setData({
      sheetVisible: true,
      sheetField: field,
      sheetTitle: FIELD_TITLE[field] || '请选择',
      sheetOptions: dict.map(function (label) { return { label: label }; }),
      sheetCurrent: current
    });
  },

  onSheetConfirm(e) {
    const index = e.detail.index;
    const field = this.data.sheetField;
    this.setData({ sheetVisible: false });
    if (index < 0) return;

    const value = this.data.sheetOptions[index].label;
    store.updateTodo(this.data.task.id, this.buildPatch(field, value));
    this.setData({
      ['task.' + field]: value,
      'task.title':
        this.data.task.student +
        '【' +
        this.data.task.formName +
        '】需录入关联表单'
    });
  },

  // 学员姓名或表单名称变化时同步刷新标题
  buildPatch(field, value) {
    const patch = {};
    patch[field] = value;
    if (field === 'student' || field === 'formName') {
      const t = Object.assign({}, this.data.task);
      patch.title =
        (field === 'student' ? value : t.student) +
        '【' +
        (field === 'formName' ? value : t.formName) +
        '】需录入关联表单';
    }
    return patch;
  },

  onSheetCancel() {
    this.setData({ sheetVisible: false });
  },

  // 下一步 -> 进入评分页
  onNext() {
    wx.navigateTo({
      url: '/pages/score/index?id=' + this.data.task.id
    });
  },

  // 删除待办任务（二次确认）
  onDelete() {
    const id = this.data.task.id;
    wx.showModal({
      title: '提示',
      content: '确认删除该待办任务吗？',
      confirmColor: '#f53f3f',
      success(res) {
        if (res.confirm) {
          store.deleteTodo(id);
          wx.showToast({ title: '已删除', icon: 'success' });
          setTimeout(function () { wx.navigateBack(); }, 800);
        }
      }
    });
  },

  onClose() {
    wx.navigateBack();
  }
});
