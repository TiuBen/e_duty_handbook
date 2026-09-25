/**
 * download-model.js —— 下载内网语音识别模型（只需在联网环境执行一次）
 *
 *   npm run download-model
 *
 * 默认下载 SenseVoice int8 中文语音模型（~158MB tar.bz2，CPU 推理快、
 * 中文识别准确率高），解压到 server/models/<模型名>/ 并生成
 * models/model-config.json 供 asr.js 使用。
 * 之后整个 server 目录（含 models/）可直接拷贝到内网，无需再联网。
 *
 * 可用环境变量覆盖：
 *   MODEL_URL  其它 .tar.bz2 模型包地址
 *   MODEL_TYPE sense-voice | zipformer-streaming
 *
 * 换回流式小模型（体积更小但识别差）：
 *   MODEL_URL=https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-streaming-zipformer-small-bilingual-zh-en-2023-02-16.tar.bz2 MODEL_TYPE=zipformer-streaming npm run download-model
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const MODELS_DIR = path.join(__dirname, '..', 'models');

const MODEL_URL =
  process.env.MODEL_URL ||
  'https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09.tar.bz2';
const MODEL_TYPE = process.env.MODEL_TYPE || 'sense-voice';

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const follow = (u, redirects) => {
      if (redirects > 5) return reject(new Error('重定向次数过多'));
      https
        .get(u, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return follow(res.headers.location, redirects + 1);
          }
          if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
          const total = Number(res.headers['content-length'] || 0);
          const out = fs.createWriteStream(dest);
          let done = 0;
          res.on('data', (chunk) => {
            done += chunk.length;
            if (total) process.stdout.write(`\r下载中 ${(done / 1048576).toFixed(1)}/${(total / 1048576).toFixed(1)} MB`);
          });
          res.pipe(out);
          out.on('finish', () => { console.log(''); resolve(); });
          out.on('error', reject);
        })
        .on('error', reject);
    };
    follow(url, 0);
  });
}

async function main() {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
  const fileName = MODEL_URL.split('/').pop();
  const archive = path.join(MODELS_DIR, fileName);
  const modelName = fileName.replace(/\.tar\.bz2$/, '');

  const dir = path.join(MODELS_DIR, modelName);
  if (fs.existsSync(path.join(dir, 'tokens.txt'))) {
    console.log(`模型已存在: ${modelName}，跳过下载`);
  } else {
    const archive = path.join(MODELS_DIR, fileName);
    if (!fs.existsSync(archive)) {
      console.log('开始下载模型（首次联网执行一次即可）...');
      await download(MODEL_URL, archive);
    } else {
      console.log('发现已下载的归档，直接解压（如需重新下载请删除 models/ 下的 .tar.bz2）');
    }
    console.log('解压中...');
    // Windows 10+ 自带 bsdtar，支持 -xjf（bz2）；--force-local 防止盘符 D: 被当作远程主机
    execFileSync('tar', ['-xjf', archive, '-C', MODELS_DIR, '--force-local']);
    fs.rmSync(archive, { force: true });
  }
  const pick = (re) => {
    const found = fs.readdirSync(dir).filter((f) => re.test(f));
    if (!found.length) throw new Error(`在 ${modelName} 中找不到匹配 ${re} 的文件`);
    return found.sort((a, b) => b.length - a.length)[0]; // 优先 fp32（文件名较长），保证兼容
  };

  let config;
  if (MODEL_TYPE === 'zipformer-streaming') {
    config = {
      type: 'zipformer-streaming',
      modelDir: modelName,
      files: {
        encoder: pick(/^encoder.*\.onnx$/),
        decoder: pick(/^decoder.*\.onnx$/),
        joiner: pick(/^joiner.*\.onnx$/)
      },
      numThreads: 2
    };
  } else {
    config = { type: 'sense-voice', modelDir: modelName, files: { model: pick(/^model.*\.onnx$/) }, numThreads: 2 };
  }

  fs.writeFileSync(path.join(MODELS_DIR, 'model-config.json'), JSON.stringify(config, null, 2));
  console.log('完成！模型配置已写入 models/model-config.json');
  console.log('重启 server 即可启用语音识别：npm start');
}

main().catch((e) => {
  console.error('下载失败:', e.message);
  console.error('可手动从下面地址下载并解压到 server/models/ ：');
  console.error('  ' + MODEL_URL);
  process.exit(1);
});
