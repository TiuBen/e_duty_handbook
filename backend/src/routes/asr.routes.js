/**
 * ASR 路由
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const asrController = require('../controllers/asr.controller');

const router = express.Router();

// 确保上传目录存在
fs.mkdirSync(config.uploadDir, { recursive: true });

// multer 配置：内存不落盘，直接写临时文件到 uploads/
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, config.uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      cb(null, `asr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 单文件上限 20MB
});

// 上传并识别（单文件字段: audio）
router.post('/transcribe', upload.single('audio'), asrController.transcribe);

// 健康检查
router.get('/health', asrController.health);

module.exports = router;
