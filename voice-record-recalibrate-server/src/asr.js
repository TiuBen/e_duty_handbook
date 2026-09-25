/**
 * asr.js —— 语音识别引擎适配层（完全本地/内网，不访问任何外部服务）
 *
 * 使用 sherpa-onnx（npm: sherpa-onnx-node，Windows/x64 自带预编译二进制）+
 * 本地 ONNX 模型。首次部署时执行：
 *   npm run download-model     （联网环境下载一次，之后模型文件随目录拷贝进内网）
 *
 * 支持两类模型目录（models/model-config.json 指定）：
 *  - sense-voice         : SenseVoice 中文（默认，准确率高、CPU 推理快）
 *  - zipformer-streaming : 流式 transducer 中英双语（体积小、延迟低、识别较弱）
 *
 * 模型不存在时 asrAvailable=false，/api/asr 会返回 503，
 * 但 /api/asr/text（纯文本规则测试）与 admin 页面始终可用。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const sherpa = (() => {
  try { return require('sherpa-onnx-node'); } catch (e) { return null; }
})();

const MODELS_DIR = path.join(__dirname, '..', 'models');
const CONFIG_FILE = path.join(MODELS_DIR, 'model-config.json');

let recognizer = null;
let asrInfo = { available: false, type: null, modelDir: null, error: null };

/** 读取 models/model-config.json（由 download-model 脚本生成） */
function readModelConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (e) {
    return null;
  }
}

/** 初始化识别器（进程内单例），失败时记录原因，不影响其他接口 */
function init() {
  if (!sherpa) {
    asrInfo.error = '未安装 sherpa-onnx-node（npm install 后重试）';
    return;
  }
  const cfg = readModelConfig();
  if (!cfg) {
    asrInfo.error = '未找到模型：请先执行 npm run download-model 下载语音模型到 server/models/';
    return;
  }
  const dir = path.join(MODELS_DIR, cfg.modelDir);
  if (!fs.existsSync(dir)) {
    asrInfo.error = `模型目录不存在: ${dir}`;
    return;
  }
  try {
    if (cfg.type === 'zipformer-streaming') {
      recognizer = new sherpa.OnlineRecognizer({
        modelConfig: {
          transducer: {
            encoder: path.join(dir, cfg.files.encoder),
            decoder: path.join(dir, cfg.files.decoder),
            joiner: path.join(dir, cfg.files.joiner)
          },
          tokens: path.join(dir, 'tokens.txt'),
          numThreads: cfg.numThreads || 2,
          debug: false,
          provider: 'cpu',
          sampleRate: 16000,
          featureDim: 80
        },
        endpointConfig: {
          rule1: 0.0, rule2: 0.0, rule3: 0.5 // 静音 0.5s 即认为一句结束
        }
      });
    } else if (cfg.type === 'sense-voice') {
      recognizer = new sherpa.OfflineRecognizer({
        modelConfig: {
          senseVoice: {
            model: path.join(dir, cfg.files.model),
            language: cfg.language || 'zh', // 塔台交接班场景固定中文，识别更稳
            useInverseTextNormalization: true
          },
          tokens: path.join(dir, 'tokens.txt'),
          numThreads: cfg.numThreads || 2,
          debug: false,
          provider: 'cpu'
        }
      });
    } else {
      asrInfo.error = `未知模型类型: ${cfg.type}`;
      return;
    }
    asrInfo = { available: true, type: cfg.type, modelDir: cfg.modelDir, error: null };
    console.log(`[asr] 已加载模型: type=${cfg.type}, dir=${cfg.modelDir}`);
  } catch (e) {
    recognizer = null;
    asrInfo = { available: false, type: cfg.type, modelDir: cfg.modelDir, error: '模型加载失败: ' + e.message };
    console.error('[asr] 模型加载失败:', e.message);
  }
}

/**
 * 识别 16kHz 单声道 wav
 * @param {Buffer} wavBuf
 * @returns {{ text: string, durationSec: number }} 识别文本 + 语音时长（秒）
 */
function recognizeWav(wavBuf) {
  if (!recognizer) throw new Error(asrInfo.error || '语音识别引擎不可用');
  // sherpa-onnx-node 的 readWave 只接受文件路径，先落盘临时 wav
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'asr-wav-'));
  const wavFile = path.join(dir, 'in.wav');
  fs.writeFileSync(wavFile, wavBuf);
  try {
    const wave = sherpa.readWave(wavFile);
    const durationSec = wave.sampleRate > 0 ? wave.samples.length / wave.sampleRate : 0;

    if (asrInfo.type === 'zipformer-streaming') {
      const stream = recognizer.createStream();
      stream.acceptWaveform({ sampleRate: wave.sampleRate, samples: wave.samples });
      // 喂 0.3s 尾部静音，保证最后几个字被解码
      const tail = new Float32Array(Math.floor(wave.sampleRate * 0.3));
      stream.acceptWaveform({ sampleRate: wave.sampleRate, samples: tail });
      while (recognizer.isReady(stream)) recognizer.decode(stream);
      const result = recognizer.getResult(stream);
      return { text: (result && result.text ? result.text : '').trim(), durationSec };
    }

    // sense-voice：一次性识别（OfflineRecognizer.decode 走完整个音频）
    // 注意：getResult 返回的是对象 { lang, emotion, event, text, ... }，不是数组
    const stream = recognizer.createStream();
    stream.acceptWaveform({ sampleRate: wave.sampleRate, samples: wave.samples });
    recognizer.decode(stream);
    const result = recognizer.getResult(stream);
    // 保险起见剥离 <|zh|> <|NEUTRAL|> <|Speech|> 等特殊标签后才是纯文本
    let text = result && result.text ? result.text : '';
    text = String(text)
      .replace(/<\|[^|]*\|>/g, '')
      .replace(/\s+/g, '')
      .trim();
    return { text, durationSec };
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* ignore */ }
  }
}

function status() {
  return { ...asrInfo, provider: 'sherpa-onnx (本地/内网)' };
}

module.exports = { init, recognizeWav, status };
