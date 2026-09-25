/**
 * Express 应用组装：中间件 + 路由注册
 */
const path = require('path');
const express = require('express');
const cors = require('cors');
const asrRoutes = require('./routes/asr.routes');
const recordsRoutes = require('./routes/records.routes');

const app = express();

// 允许跨域（iPad 前端 / 本地调试需要）
app.use(cors());

// JSON body 解析（预留，当前接口为 multipart 上传）
app.use(express.json({ limit: '20mb' }));

// 路由
app.use('/api/asr', asrRoutes);            // 语音识别
app.use('/api/records', recordsRoutes);    // 识别历史（SQLite）

// 根路径简单提示
app.get('/', (req, res) => {
  res.json({
    service: 'VoiceRec ASR Server (SenseVoice Small + sherpa-onnx + SQLite)',
    endpoints: [
      'GET  /api/asr/health',
      'POST /api/asr/transcribe (multipart, field=audio)',
      'GET  /api/records',
      'GET  /api/records/:id',
      'DELETE /api/records/:id',
    ],
  });
});

// 统一 404
app.use((req, res) => {
  res.status(404).json({ code: 404, msg: 'Not Found', data: null });
});

// 统一错误兜底
app.use((err, req, res, next) => {
  // multer 文件过大等错误
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ code: 413, msg: '音频文件超过 20MB 限制', data: null });
  }
  res.status(500).json({ code: 500, msg: err.message || 'Internal Server Error', data: null });
});

module.exports = app;
