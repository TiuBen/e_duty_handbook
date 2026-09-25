# 项目长期记忆

## VoiceRec —— 本地 ASR 全栈（backend + frontend）

**位置**: `e_duty_handbook/e_duty_handbook/backend/`（原 VoiceRec 目录，2026-08-23 迁移）
**技术栈**: Node.js 22 + Express + `sherpa-onnx-node`（纯 Node 推理，无 Python）+ `better-sqlite3`
**模型**: SenseVoice Small ONNX（int8 229MB），多语言中/英/日/韩/粤 + 情感/事件检测
**端口**: backend 5300 / frontend 5174（**5184-5283 是 Windows Hyper-V 保留段，监听必报 EACCES，勿用**）
**API**: `GET /api/asr/health`、`POST /api/asr/transcribe`（multipart 字段 audio）、`/api/records`（SQLite 历史 CRUD）
**数据库**: `data/asr.db`（better-sqlite3，WAL 模式，表 `asr_records`，created_at 本地时间；识别成功自动入库，响应带 recordId）
**音频**: wav 直读；mp3/m4a 等需 ffmpeg 转码（本机已装 ffmpeg 8.1.2）
**模型下载**: `npm run download:model`（ModelScope 国内镜像 poloniumrock/SenseVoiceSmallOnnx，GitHub 太慢）
**测试**: `node scripts/transcribe-file.js <audio>`；测试音频 test-audio/zh.mp3（SenseVoice 官方）
**性能**: 5.6s 中文音频 CPU 识别约 200ms
**前端**: `frontend/`（Vite + React 18 JSX），MediaRecorder 录音/文件上传/结果展示/历史列表，vite proxy `/api` → :5300，极简白底灰字样式

### 关键约定
- 服务分层：config/routes/controllers/services/db/utils，识别器单例懒加载，模型缺失不阻塞启动
- 响应格式统一 `{code, msg, data}`；lang/emotion/event 需从 `<|zh|>` 标签提取
- 沙箱环境 bash 后台 node 进程易被杀/残留；残留进程占端口会导致 EADDRINUSE 且 curl 打到旧进程（新接口 404/空响应），改代码后必须确认旧进程已杀净
- Windows 下 mv/rm 目录可能失败（宿主 cwd 占用 / safe-delete 回收站对 node_modules 失效），用 robocopy 复制后清理源
