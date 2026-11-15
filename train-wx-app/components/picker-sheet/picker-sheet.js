// components/picker-sheet/picker-sheet.js - 底部弹层选择器：取消 / 请选择 / 确认
Component({
  properties: {
    visible: { type: Boolean, value: false },
    title: { type: String, value: '请选择' },
    options: { type: Array, value: [] }, // [{ label }]
    // 当前选中下标，-1 表示未选
    current: { type: Number, value: -1 }
  },

  data: {
    activeIndex: -1
  },

  observers: {
    visible: function (v) {
      // 每次弹层打开时把高亮恢复为当前已选项
      if (v) this.setData({ activeIndex: this.data.current });
    }
  },

  methods: {
    // 点选某个选项：记录下标，确认时回传
    onTapOption(e) {
      this.setData({ activeIndex: Number(e.currentTarget.dataset.index) });
    },

    onCancel() {
      this.triggerEvent('cancel');
    },

    onConfirm() {
      this.triggerEvent('confirm', { index: this.data.activeIndex });
    },

    // 点遮罩视为取消
    onMaskTap() {
      this.triggerEvent('cancel');
    },

    noop() {}
  }
});
