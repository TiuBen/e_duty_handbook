/**
 * 命令行识别测试脚本（不经过 HTTP，直接调用识别服务）
 *
 * 用法:
 *   node scripts/transcribe-file.js <音频文件路径>
 *   node scripts/transcribe-file.js test-audio/zh.mp3
 *
 * 支持 wav 直读；mp3/m4a 等需本机装有 ffmpeg 自动转码。
 */
const audioService = require('../src/services/audio.service');
const recognizerService = require('../src/services/recognizer.service');
const logger = require('../src/utils/logger.util');

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('用法: node scripts/transcribe-file.js <音频文件路径>');
    process.exit(1);
  }

  const abs = require('path').resolve(filePath);
  if (!require('fs').existsSync(abs)) {
    console.error(`文件不存在: ${abs}`);
    process.exit(1);
  }

  logger.info(`开始识别: ${abs}`);
  const t0 = Date.now();

  // 解码音频 -> PCM
  const { samples, sampleRate } = audioService.decodeAudioFile(abs);
  logger.info(`音频解码完成: ${samples.length} samples, ${sampleRate} Hz, 时长 ${(samples.length / sampleRate).toFixed(1)}s`);

  // 识别
  const result = recognizerService.transcribe(samples, sampleRate);

  console.log('\n================ 识别结果 ================');
  console.log(`文本:   ${result.text || '(空)'}`);
  console.log(`语种:   ${result.lang || '-'}`);
  console.log(`情感:   ${result.emotion || '-'}`);
  console.log(`事件:   ${result.event || '-'}`);
  console.log(`耗时:   ${result.elapsedMs} ms`);
  console.log('==========================================\n');
}

main().catch((err) => {
  logger.error(`识别失败: ${err.message}`);
  process.exit(1);
});
