# VoiceRec Frontend（React + Vite）

VoiceRec 本地语音识别的网页前端，配合 `../backend`（SenseVoice + Express + SQLite）使用。

## 功能

- 🎙 麦克风录音：点击"开始录音"（MediaRecorder），停止后自动上传识别
- 📁 本地音频文件上传识别（wav / mp3 / m4a / webm 等，后端自动转码）
- 📝 识别结果展示：转写文本、语种、情感、音频事件、耗时
- 🗂 历史记录列表（来自后端 SQLite，支持删除）

## 启动

```bash
# 1. 安装依赖
npm install

# 2. 启动（默认 http://localhost:5174）
npm run dev
```

> 开发模式下 `/api` 请求自动代理到后端 `http://localhost:5300`（见 `vite.config.js`）。
> 使用前请先启动后端：`cd ../backend && npm start`

## 构建

```bash
npm run build     # 输出到 dist/
npm run preview   # 本地预览构建产物
```
