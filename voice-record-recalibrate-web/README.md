# voice-record-recalibrate-web

语音识别校准**前端微调台**：Vite + React 19 + Tailwind CSS v4。

三个页签：

| 页签 | 作用 |
| --- | --- |
| **语音识别** | 引擎状态；一句话文本测试；按住 🎤 录音实测；**本次录音标注**（只读优先 → 点「修改」→ 点选 chip，校正文本按点选顺序拼接 → 保存）；规则关键词表编辑 |
| **样本标注** | 全部识别样本表格（序号 / 原始音频 / 人工校正文本 / 应勾选项 / 操作），支持 5·10·20·50 分页，序号跨页连续 |
| **纠错词典** | 从已标注样本生成「错词→正词」候选 → 勾选采纳 → 生效词典查看/删除 |

## 启动

> 先启动后端 `voice-record-recalibrate-server`（默认 `http://localhost:5184`）。

```bash
npm install
npm run dev        # http://localhost:5200
```

开发期 Vite 会把 `/api`、`/uploads` 反向代理到后端，因此代码里一律使用相对路径。

### 后端不在本机时

```bash
VITE_API_TARGET=http://192.168.1.20:5184 npm run dev
```

### 构建

```bash
npm run build      # 产出 dist/
npm run preview    # 本地预览构建产物（5200）
```

若前端与后端**不同源**部署，构建时指定后端基地址（否则前端会请求自己域下的 `/api`）：

```bash
VITE_API_BASE=http://192.168.1.20:5184 npm run build
```

## 目录结构

```
voice-record-recalibrate-web/
├─ index.html
├─ vite.config.js          # 端口 5200 + /api、/uploads 代理
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx              # 外壳：标题 + Segment 切换 + Toast
│  ├─ store.jsx            # 全局状态（Context）：状态/规则/样本/Toast
│  ├─ api.js               # 后端接口封装
│  ├─ index.css            # Tailwind 入口 + 主题变量
│  ├─ hooks/
│  │  └─ useRecorder.js    # 按住说话录音（MediaRecorder）
│  ├─ components/
│  │  ├─ Layout.jsx        # Card / Hint / SectionTag / Bar / Button
│  │  ├─ SegmentBar.jsx    # 顶部三段切换
│  │  ├─ Toast.jsx
│  │  ├─ Chip.jsx          # 清单项 chip
│  │  ├─ Pager.jsx         # 分页
│  │  ├─ ResultView.jsx    # 识别结果（文本 + 原文对照 + chips）
│  │  ├─ SampleTable.jsx   # 样本表格（表头 + 空态）
│  │  └─ SampleRow.jsx     # 样本行（含 只读/编辑 两态逻辑）
│  └─ pages/
│     ├─ VoicePane.jsx
│     ├─ SamplesPane.jsx
│     └─ DictPane.jsx
```

## 关键交互说明

- **本次录音标注（只读优先）**：录音识别后，"本次录音标注"卡先以**只读**展示引擎匹配结果；
  点「修改」后 chip 才可点选，**人工校正文本按点选顺序自动拼接**（取消某项即移除，重选追加到末尾）；
  「保存」后回到只读态并显示「已标注 / 已保存 ✓」，「取消」丢弃本地改动。
- **样本标注页**：保存后按钮置灰（已入库），再次改动才变回「保存修改」。
- **保存即时生效**：规则与纠错词典保存后，App 下一次识别立即使用，无需重启后端。

## 环境变量

| 变量 | 作用 | 使用时机 |
| --- | --- | --- |
| `VITE_API_TARGET` | 开发代理的后端地址（默认 `http://localhost:5184`） | `npm run dev` |
| `VITE_API_BASE` | 前端请求接口的基地址（默认空 = 同源/走代理） | `npm run build` |
