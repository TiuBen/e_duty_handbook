// components/form-cell/form-cell.js - 通用表单行：左侧 label，右侧值/占位 + 箭头
Component({
  properties: {
    label: { type: String, value: '' },
    value: { type: String, value: '' },
    placeholder: { type: String, value: '' },
    // 是否显示右侧箭头（可编辑行才显示）
    arrow: { type: Boolean, value: true },
    // 值以灰色显示（原小程序里灰字代表只读/未启用字段）
    gray: { type: Boolean, value: false }
  },

  data: {
    hasValue: false
  },

  observers: {
    value: function (val) {
      this.setData({ hasValue: !!(val && val.length) });
    }
  }
});
