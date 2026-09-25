# VoiceRec Backend（本地 ASR 服务）

本地语音识别（ASR）服务：**SenseVoice Small + Node.js/Express + SQLite**，基于
[sherpa-onnx-node](https://www.npmjs.com/package/sherpa-onnx-node) 纯 Node.js 推理，
无需 Python / PyTorch，完全离线运行。识别结果自动写入本地 SQLite（`data/asr.db`），
供前端展示历史记录。

- 支持语种：中文 / 粤语 / 英文 / 日文 / 韩文（`auto` 自动检测）
- 附带能力：语种识别、情感识别、音频事件检测（掌声/笑声/音乐等）
- CPU 推理，INT8 模型约 8MB，实时因子 0.1（10 秒音频约 1 秒出结果）
- 面向交接班语音确认等场景：上传一段录音 → 返回转写文本供语音句匹配

## 目录结构

```
backend/
├── server.js                  # 服务入口
├── src/
│   ├── app.js                 # Express 应用组装（中间件、路由、错误兜底）
│   ├── config/index.js        # 配置（端口、模型路径、语种、线程数）
│   ├── db/database.js         # SQLite 数据层（asr_records 表 增删查）
│   ├── routes/
│   │   ├── asr.routes.js      # 路由：/api/asr/*
│   │   └── records.routes.js  # 路由：/api/records/*
│   ├── controllers/           # asr.controller / records.controller
│   ├── services/
│   │   ├── recognizer.service.js  # sherpa-onnx 识别器单例封装（核心）
│   │   └── audio.service.js       # 音频解码（wav 直读 / ffmpeg 转码兜底）
│   └── utils/                 # 日志、统一响应格式
├── models/                    # SenseVoice ONNX 模型（npm run download:model 获取）
├── data/asr.db                # SQLite 数据库（首次启动自动创建）
├── uploads/                   # 上传临时目录（自动清理）
├── test-audio/                # 中文测试音频（可选）
└── scripts/
    ├── download-model.js      # 模型下载脚本
    └── transcribe-file.js     # 命令行识别测试脚本
```

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 下载模型（约 30MB；加 --test-audio 可额外下载一段中文测试音频）
npm run download:model
#   或: node scripts/download-model.js --test-audio

# 3. 启动服务
npm start
# 服务默认监听 http://localhost:5300
```

## API

### 健康检查

```bash
curl http://localhost:5300/api/asr/health
```

```json
{ "code": 0, "msg": "ok", "data": { "service": "voicerec-asr", "ready": true } }
```

### 语音识别

`POST /api/asr/transcribe`，`multipart/form-data`，字段名 `audio`（单文件，≤20MB）。

```bash
curl -X POST http://localhost:5300/api/asr/transcribe \
  -F "audio=@test-audio/zh.mp3"
```

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "text": "开饭时间早上九点至下午五点",
    "lang": "zh",
    "emotion": "NEUTRAL",
    "event": "Speech",
    "durationSec": 5.62,
    "elapsedMs": 199,
    "recordId": 2
  }
}
```

| 字段 | 说明 |
| --- | --- |
| `text` | 转写文本（已去除 `<\|zh\|>` 等富文本标签） |
| `lang` | 检测语种：zh / en / yue / ja / ko |
| `emotion` | 情感：NEUTRAL / HAPPY / SAD / ANGRY 等 |
| `event` | 音频事件：Speech / BGM / Applause / Laughter 等 |
| `durationSec` | 音频时长（秒） |
| `elapsedMs` | 识别耗时（毫秒） |
| `recordId` | 本次记录在 SQLite 中的 id（`null` 表示入库失败，不影响识别） |

### 识别历史（SQLite）

每次识别成功后自动写入 `data/asr.db` 的 `asr_records` 表。

```bash
# 分页列表（倒序）
curl "http://localhost:5300/api/records?limit=50&offset=0"

# 单条详情
curl http://localhost:5300/api/records/2

# 删除单条
curl -X DELETE http://localhost:5300/api/records/2
```

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "total": 1,
    "list": [
      {
        "id": 2,
        "text": "开饭时间早上九点至下午五点",
        "lang": "zh",
        "emotion": "NEUTRAL",
        "event": "Speech",
        "durationSec": 5.62,
        "elapsedMs": 199,
        "audioFilename": "zh.mp3",
        "createdAt": "2026-08-23 22:11:20"
      }
    ]
  }
}
```

## 命令行测试（不走 HTTP）

```bash
# wav 直接识别
node scripts/transcribe-file.js your-audio.wav

# mp3/m4a 等（需本机装有 ffmpeg，自动转码后识别）
node scripts/transcribe-file.js test-audio/zh.mp3
```

## 音频格式支持

| 格式 | 方式 |
| --- | --- |
| `.wav` / `.wave` | sherpa-onnx 直接解析（16bit PCM / float32） |
| `.mp3` / `.m4a` / `.webm` / `.ogg` 等 | 调系统 `ffmpeg` 转码为 16k 单声道 wav |

> 本机未安装 ffmpeg 时，非 wav 格式会返回明确错误提示。安装 ffmpeg 后即可自动转码。

## 前端配合（frontend/）

仓库同级 `frontend/` 提供 React 网页（Vite），功能：麦克风录音 / 文件上传识别 /
识别结果展示 / 历史记录管理。开发时 vite 将 `/api` 代理到本服务：

```bash
cd ../frontend
npm install
npm run dev        # http://localhost:5174，/api 自动代理到 :5300
```

## 配置（.env）

参考 `.env.example`：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `5300` | 服务端口 |
| `MODEL_FILE` | `model.int8.onnx` | `model.onnx`（fp16 更准）/ `model.int8.onnx`（CPU 更快） |
| `MODEL_LANGUAGE` | `auto` | `zh` / `en` / `yue` / `ja` / `ko` / `auto` |
| `MODEL_USE_ITN` | `true` | 数字转写与标点恢复 |
| `MODEL_NUM_THREADS` | `4` | 推理线程数（建议 = CPU 物理核数） |

## 常见问题

**Q: 启动时提示模型文件缺失？**
模型未下载或路径不对。运行 `npm run download:model`，并确认 `models/` 下目录名与
`.env` 中 `MODEL_DIR` 一致。

**Q: 服务已启动但识别报 500？**
先看 `/api/asr/health` 的 `ready` 是否为 `true`。模型加载失败时 `loadError` 字段
会给出原因。
