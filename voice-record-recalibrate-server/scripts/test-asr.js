/**
 * test-asr.js —— 模型冒烟自检（不占用 HTTP 端口）
 *
 *   node scripts/test-asr.js [wav路径]
 *
 * 默认使用 SenseVoice 模型包自带的 zh.wav 做真实人声验证，
 * 也可传入任意 16k/单声道 wav 路径。
 */
const fs = require('fs');
const path = require('path');

const asr = require('../src/asr');

// 模型解压根目录：优先读 config
const cfg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'models', 'model-config.json'), 'utf8')
);
const defaultWav = path.join(
  __dirname, '..', 'models', cfg.modelDir, 'test_wavs', 'zh.wav'
);

const wavPath = process.argv[2] || defaultWav;

asr.init();
const st = asr.status();
console.log('状态:', JSON.stringify(st, null, 2));
if (!st.available) {
  console.error('识别引擎不可用，无法自检');
  process.exit(1);
}

const buf = fs.readFileSync(wavPath);
const t0 = Date.now();
const { text, durationSec } = asr.recognizeWav(buf);
console.log(`\n音频时长=${durationSec.toFixed(2)}s 推理耗时=${((Date.now() - t0) / 1000).toFixed(2)}s`);
console.log(`识别结果: "${text}"`);
