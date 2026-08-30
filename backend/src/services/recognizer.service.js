/**
 * 识别器服务 —— sherpa-onnx (SenseVoice) 封装
 *
 * 职责：
 *  - 进程启动时懒加载模型（单例，只加载一次）
 *  - 对外提供 transcribe(samples, sampleRate) 完成一段 PCM 音频的离线识别
 *  - 返回识别文本 + 语种 / 情感 / 音频事件标签
 *
 * 说明：SenseVoice 是非流式（offline）模型，整段音频一次性喂入后解码，
 *       非常适合"上传一段录音 → 返回文本"的本地 ASR 服务场景。
 */
const path = require('path');
const fs = require('fs');
const sherpa_onnx = require('sherpa-onnx-node');
const config = require('../config');
const logger = require('../utils/logger.util');

let recognizer = null; // 识别器单例
let loadError = null;  // 首次加载失败时记录原因，便于 /health 诊断

/**
 * 构建 OfflineRecognizer 配置（SenseVoice）
 */
function buildRecognizerConfig() {
  return {
    featConfig: {
      sampleRate: 16000, // SenseVoice 输入采样率
      featureDim: 80,    // fbank 特征维度
    },
    modelConfig: {
      senseVoice: {
        model: config.modelPath,
        language: config.model.language, // auto / zh / en / yue / ja / ko
        useItn: config.model.useItn,     // 逆文本正则化（数字、标点）
      },
      tokens: config.tokensPath,
      numThreads: config.model.numThreads,
      debug: false,
      provider: 'cpu',
    },
  };
}

/**
 * 校验模型文件是否齐备
 */
function checkModelFiles() {
  const need = [config.modelPath, config.tokensPath];
  const missing = need.filter((p) => !fs.existsSync(p));
  if (missing.length > 0) {
    return {
      ok: false,
      missing,
      hint: `模型缺失，请运行: node scripts/download-model.js`,
    };
  }
  return { ok: true, missing: [] };
}

/**
 * 加载识别器（幂等，进程内只加载一次）
 * @returns {boolean} 是否加载成功
 */
function ensureRecognizer() {
  if (recognizer) return true;

  // 模型文件不存在时不抛异常，只记录原因，便于服务先启动、后补模型
  const check = checkModelFiles();
  if (!check.ok) {
    loadError = `模型文件缺失: ${check.missing.join(', ')}。${check.hint}`;
    logger.warn(loadError);
    return false;
  }

  try {
    const t0 = Date.now();
    recognizer = new sherpa_onnx.OfflineRecognizer(buildRecognizerConfig());
    loadError = null;
    logger.info(
      `SenseVoice 识别器加载成功 (${config.model.modelFile}, ${config.model.language}), 耗时 ${Date.now() - t0}ms`
    );
    return true;
  } catch (err) {
    loadError = `模型加载失败: ${err.message}`;
    logger.error(loadError);
    return false;
  }
}

/**
 * 去除 SenseVoice 输出中的富文本标签（<|zh|> 等），得到干净文本
 */
function cleanText(text) {
  return String(text || '')
    .replace(/<\|[^|>]+\|>/g, '') // 形如 <|zh|> / <|NEUTRAL|> / <|Speech|>
    .trim();
}

/**
 * 提取富文本标签中的值：<|zh|> -> zh；无标签则原样返回
 * 用于 lang / emotion / event 字段
 */
function extractTag(text) {
  const m = String(text || '').match(/<\|([^|>]+)\|>/);
  return m ? m[1] : cleanText(text);
}

/**
 * 识别一段 PCM 音频
 * @param {Float32Array} samples  [-1, 1] 归一化的 PCM 采样
 * @param {number} sampleRate      音频实际采样率（内部自动重采样到 16k）
 * @returns {{text:string, lang:string, emotion:string, event:string, duration:number}}
 */
function transcribe(samples, sampleRate) {
  if (!ensureRecognizer()) {
    throw new Error(loadError || '识别器不可用');
  }

  const stream = recognizer.createStream();
  stream.acceptWaveform({ samples, sampleRate });

  const t0 = Date.now();
  recognizer.decode(stream);
  const result = recognizer.getResult(stream);

  // 释放 stream 资源（node 绑定提供 free()）
  if (typeof stream.free === 'function') stream.free();

  const duration = samples.length / sampleRate;
  return {
    text: cleanText(result.text),
    lang: extractTag(result.lang),       // zh / en / yue / ja / ko
    emotion: extractTag(result.emotion), // NEUTRAL / HAPPY / SAD / ANGRY ...
    event: extractTag(result.event),     // Speech / BGM / Applause / Laughter ...
    durationSec: Number(duration.toFixed(2)),
    elapsedMs: Date.now() - t0,
  };
}

/** 识别器就绪状态（供 /health 使用） */
function getStatus() {
  return {
    ready: !!recognizer,
    loadError,
    model: {
      dir: path.basename(config.modelDir),
      file: config.model.modelFile,
      language: config.model.language,
    },
  };
}

module.exports = { ensureRecognizer, transcribe, getStatus };
