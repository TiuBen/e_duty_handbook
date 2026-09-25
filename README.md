# e_duty_handbook

电子交接班清单（塔台）相关项目集合。

## 目录

| 目录 | 说明 | 端口 |
| --- | --- | --- |
| `voice-record-recalibrate-server/` | 语音识别校准**后端**：Express 纯 API + 本地 sherpa-onnx 推理（内网可离线） | 5184 |
| `voice-record-recalibrate-web/` | 语音识别校准**前端微调台**：Vite + React 19 + Tailwind CSS v4 | 5200 |
| `ipad-dart-app/` | 交接班清单 iPad 端（Flutter，**仅 Web** 平台） | — |
| `ipad-like-website-app/` | iPad 风格 Web 原型 | — |
| `temp/` | 临时脚本与草稿 | — |

## 语音识别校准（前后端分离）

```bash
# 1) 后端（5184）—— 需要系统 ffmpeg，或把 ffmpeg.exe 放到 server 的 bin/
cd voice-record-recalibrate-server
npm install
npm start

# 2) 前端（5200）—— 开发期自动把 /api、/uploads 代理到 5184
cd voice-record-recalibrate-web
npm install
npm run dev
```

打开 <http://localhost:5200> 即是规则微调台，三个页签：

- **语音识别**：引擎状态 / 一句话文本测试 / 按住录音实测 / 本次录音标注 / 关键词规则表
- **样本标注**：全部识别样本（音频 + 人工校正文本 + 应勾选项），支持分页
- **纠错词典**：从标注样本生成「错词→正词」候选，勾选采纳后识别前自动替换

> 原 `server/` 目录已拆分：后端内容迁至 `voice-record-recalibrate-server`，
> 前端页面由原生 HTML/JS 重写为 `voice-record-recalibrate-web`（React + Tailwind + Vite）。
