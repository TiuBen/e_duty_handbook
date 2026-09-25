/**
 * audio.js —— 音频转码
 *
 * 前端（Chrome）用 MediaRecorder 录出来的是 audio/webm;codecs=opus，
 * 而 sherpa-onnx 模型需要 16kHz 单声道 PCM。这里用 ffmpeg 做转码。
 * 内网部署只需保证服务器装有 ffmpeg（或把 ffmpeg.exe 放到 server/bin 下）。
 */

const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

/** 依次寻找可用的 ffmpeg：环境变量 FFMPEG_PATH → server/bin → PATH */
function resolveFfmpeg() {
  const candidates = [];
  if (process.env.FFMPEG_PATH) candidates.push(process.env.FFMPEG_PATH);
  candidates.push(path.join(__dirname, '..', 'bin', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'));
  candidates.push('ffmpeg');
  return candidates;
}

let ffmpegChecked = false;
let ffmpegCmd = null;

/** 懒检测 ffmpeg 是否可用；返回可执行命令或 null */
function getFfmpeg() {
  if (ffmpegChecked) return ffmpegCmd;
  ffmpegChecked = true;
  for (const cmd of resolveFfmpeg()) {
    try {
      // 同步探测一次版本，确认可执行
      require('child_process').execFileSync(cmd, ['-version'], { stdio: 'ignore' });
      ffmpegCmd = cmd;
      return ffmpegCmd;
    } catch (e) {
      /* 试下一个 */
    }
  }
  return null;
}

/**
 * 任意格式音频 → 16kHz 单声道 16bit PCM 的 wav
 * @param {Buffer} buffer 原始音频（webm/opus）
 * @param {string} ext 输入扩展名（如 .webm）
 * @returns {Promise<Buffer>} wav 字节
 */
function convertToWav16k(buffer, ext) {
  return new Promise((resolve, reject) => {
    const ffmpeg = getFfmpeg();
    if (!ffmpeg) {
      return reject(new Error('服务器未找到 ffmpeg，无法解码录音。请安装 ffmpeg 或将其放入 server/bin/ 目录。'));
    }
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'asr-'));
    const inFile = path.join(dir, `in${ext || '.webm'}`);
    const outFile = path.join(dir, 'out.wav');
    fs.writeFileSync(inFile, buffer);
    execFile(
      ffmpeg,
      ['-y', '-hide_banner', '-loglevel', 'error', '-i', inFile, '-ac', '1', '-ar', '16000', '-sample_fmt', 's16', outFile],
      (err) => {
        try {
          if (err) return reject(new Error('ffmpeg 转码失败: ' + err.message));
          const wav = fs.readFileSync(outFile);
          resolve(wav);
        } finally {
          // 清理临时文件
          try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* ignore */ }
        }
      }
    );
  });
}

module.exports = { convertToWav16k, getFfmpeg };
