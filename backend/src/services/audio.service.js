/**
 * 音频处理服务
 *
 * 职责：把用户上传的音频文件统一解码为
 *       { samples: Float32Array(16k 单声道), sampleRate } 供识别器消费。
 *
 * 支持策略：
 *  - .wav / .wave : 直接用 sherpa-onnx 内置 readWave 解析（PCM16 / float32）
 *  - 其他格式(mp3/m4a/webm/ogg...) : 调系统 ffmpeg 转码为 16k 单声道 PCM16 wav
 *    （若本机未安装 ffmpeg，将返回明确的错误提示）
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sherpa_onnx = require('sherpa-onnx-node');
const config = require('../config');
const logger = require('../utils/logger.util');

const WAV_EXT = ['.wav', '.wave'];

/**
 * 判断本机是否安装了 ffmpeg
 */
function hasFfmpeg() {
  const r = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8', timeout: 5000 });
  return r.status === 0;
}

/**
 * 用 ffmpeg 将任意音频转码为 16k 单声道 PCM16 wav
 * @param {string} srcPath  源文件
 * @param {string} outPath  输出 wav
 */
function convertWithFfmpeg(srcPath, outPath) {
  if (!hasFfmpeg()) {
    throw new Error(
      '检测到非 wav 格式音频，但本机未安装 ffmpeg，无法转码。' +
        '请安装 ffmpeg 后重试，或将音频转为 16k 单声道 wav 上传。'
    );
  }
  const r = spawnSync(
    'ffmpeg',
    ['-y', '-i', srcPath, '-ar', '16000', '-ac', '1', '-sample_fmt', 's16', outPath],
    { encoding: 'utf8', timeout: 60000 }
  );
  if (r.status !== 0) {
    throw new Error(`ffmpeg 转码失败: ${(r.stderr || r.stdout || '').slice(0, 300)}`);
  }
}

/**
 * 从 wav 文件读取 PCM（封装 sherpa-onnx readWave）
 */
function readWaveFile(wavPath) {
  try {
    const wave = sherpa_onnx.readWave(wavPath);
    return { samples: wave.samples, sampleRate: wave.sampleRate };
  } catch (err) {
    // readWave 对某些 wav 编码（如 24bit / 32bit int）不支持时给出友好提示
    throw new Error(`wav 解析失败: ${err.message}。建议使用 16bit PCM 单声道 wav 或安装 ffmpeg 自动转码`);
  }
}

/**
 * 统一入口：把任意音频文件解码为识别器可用的 PCM
 * @param {string} filePath 上传的临时音频文件
 * @returns {{samples: Float32Array, sampleRate: number}}
 */
function decodeAudioFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  // 1) wav 直读（最快路径，不产生额外文件）
  if (WAV_EXT.includes(ext)) {
    return readWaveFile(filePath);
  }

  // 2) 其他格式 -> ffmpeg 转码
  const outPath = path.join(config.uploadDir, `${path.basename(filePath, ext)}_conv.wav`);
  convertWithFfmpeg(filePath, outPath);
  const result = readWaveFile(outPath);
  // 清理转码中间文件
  try { fs.unlinkSync(outPath); } catch (_) { /* ignore */ }
  logger.info(`已通过 ffmpeg 将 ${ext} 转码为 wav 并完成解析`);
  return result;
}

module.exports = { decodeAudioFile, hasFfmpeg };
