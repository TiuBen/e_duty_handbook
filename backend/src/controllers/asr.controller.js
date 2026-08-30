/**
 * ASR 控制器 —— HTTP 请求处理层
 *
 * POST /api/asr/transcribe
 *   multipart/form-data, 字段 audio = 音频文件
 *   -> 解码音频 -> 识别 -> 返回 { code:0, data: { text, lang, emotion, event, ... } }
 *
 * GET  /api/health
 *   -> 服务与模型就绪状态
 */
const fs = require('fs');
const recognizerService = require('../services/recognizer.service');
const audioService = require('../services/audio.service');
const { insertRecord } = require('../db/database');
const { ok, fail } = require('../utils/response.util');
const logger = require('../utils/logger.util');

/**
 * 语音识别接口
 */
async function transcribe(req, res) {
  let tmpPath = null;
  try {
    // multer 已把文件写入 uploads/，字段名为 audio
    const file = req.file;
    if (!file) {
      return res.status(400).json(fail(40001, '缺少音频文件，multipart 字段名应为 audio'));
    }
    tmpPath = file.path;

    // 1) 解码音频 -> PCM
    const { samples, sampleRate } = audioService.decodeAudioFile(tmpPath);
    if (samples.length === 0) {
      return res.status(400).json(fail(40002, '音频内容为空'));
    }

    // 2) 识别
    const result = recognizerService.transcribe(samples, sampleRate);

    // 3) 识别结果写入 SQLite（历史记录），失败不影响识别结果返回
    let recordId = null;
    try {
      recordId = insertRecord({
        text: result.text,
        lang: result.lang,
        emotion: result.emotion,
        event: result.event,
        durationSec: result.durationSec,
        elapsedMs: result.elapsedMs,
        audioFilename: file.originalname || null,
      });
    } catch (dbErr) {
      logger.error(`记录入库失败: ${dbErr.message}`);
    }

    // 4) 返回（附带记录 id，便于前端定位历史）
    logger.info(`识别完成: "${result.text}" (${result.elapsedMs}ms, ${result.lang})`);
    return res.json(ok({ ...result, recordId }));
  } catch (err) {
    logger.error(`识别失败: ${err.message}`);
    return res.status(500).json(fail(50001, err.message));
  } finally {
    // 无论成功失败都清理临时上传文件
    if (tmpPath) {
      try { fs.unlinkSync(tmpPath); } catch (_) { /* ignore */ }
    }
  }
}

/**
 * 健康检查
 */
function health(req, res) {
  const status = recognizerService.getStatus();
  return res.json(ok({
    service: 'voicerec-asr',
    ready: status.ready,
    ...status,
  }));
}

module.exports = { transcribe, health };
