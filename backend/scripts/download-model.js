/**
 * SenseVoice 模型下载脚本
 *
 * 用法:
 *   node scripts/download-model.js              仅下载模型
 *   node scripts/download-model.js --test-audio 额外下载一段中文测试音频 (test-audio/zh.mp3)
 *
 * 模型来源（按优先级自动尝试）:
 *   1) ModelScope 镜像 poloniumrock/SenseVoiceSmallOnnx  (国内快, 含 model.int8.onnx + tokens.txt)
 *   2) sherpa-onnx 官方 GitHub Releases                    (完整包, 额外含 model.onnx fp16)
 *
 * 下载后模型位于 models/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17/
 *   - model.int8.onnx  (默认使用, CPU 快)
 *   - model.onnx       (fp16, 可选, 仅 GitHub 完整包含)
 *   - tokens.txt
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MODELS_DIR = path.join(ROOT, 'models');
const TEST_AUDIO_DIR = path.join(ROOT, 'test-audio');

const MODEL_DIR = path.join(MODELS_DIR, 'sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17');

// 必需文件（两个源都应提供）
const REQUIRED_FILES = ['model.int8.onnx', 'tokens.txt'];
// 可选文件（仅 GitHub 完整包提供 fp16 版）
const OPTIONAL_FILES = ['model.onnx'];

// 镜像源定义
const MIRRORS = [
  {
    name: 'ModelScope (国内)',
    // poloniumrock/SenseVoiceSmallOnnx 镜像: 逐个文件下载
    type: 'files',
    base: 'https://modelscope.cn/models/poloniumrock/SenseVoiceSmallOnnx/resolve/master',
    files: ['model.int8.onnx', 'tokens.txt'],
  },
  {
    name: 'GitHub Releases (完整包)',
    type: 'tarball',
    url:
      'https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/' +
      'sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17.tar.bz2',
  },
];

const TEST_AUDIO_URL =
  'https://modelscope.cn/models/iic/SenseVoiceSmall/resolve/master/example/zh.mp3';

function log(msg) {
  console.log(`[下载脚本] ${msg}`);
}

/** curl 下载单个文件，成功返回 true */
function downloadWithCurl(url, dest) {
  const r = spawnSync(
    'curl',
    ['-L', '--retry', '2', '--connect-timeout', '15', '-o', dest, url],
    { encoding: 'utf8', timeout: 600000 }
  );
  return r.status === 0 && fs.existsSync(dest) && fs.statSync(dest).size > 1000;
}

/** Node https 下载（备用通道），Promise 化 */
function downloadWithNodeHttps(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = require(url.startsWith('https') ? 'https' : 'http');
    const file = fs.createWriteStream(dest);
    const get = (u) => {
      mod.get(u, { headers: { 'User-Agent': 'voice-rec-downloader' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location);
        }
        if (res.statusCode !== 200) {
          file.destroy();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(true)));
        file.on('error', reject);
      }).on('error', (e) => {
        file.destroy();
        reject(e);
      });
    };
    get(url);
  });
}

/** 下载单个文件：curl 优先，Node https 兜底 */
async function downloadFile(url, dest) {
  log(`下载: ${url}`);
  if (downloadWithCurl(url, dest)) {
    log(`  完成 (${(fs.statSync(dest).size / 1024 / 1024).toFixed(1)} MB)`);
    return;
  }
  log('  curl 失败，回退 Node https ...');
  try {
    await downloadWithNodeHttps(url, dest);
    log(`  完成 (${(fs.statSync(dest).size / 1024 / 1024).toFixed(1)} MB)`);
  } catch (err) {
    throw new Error(`下载失败: ${url} (${err.message})`);
  }
}

async function downloadFromMirror(mirror) {
  if (mirror.type === 'files') {
    for (const f of mirror.files) {
      const dest = path.join(MODEL_DIR, f);
      if (fs.existsSync(dest)) continue; // 已存在跳过
      await downloadFile(`${mirror.base}/${f}`, dest);
    }
    return;
  }
  // tarball 类型: 下载整个包解压
  const tarPath = path.join(MODELS_DIR, '_model.tar.bz2');
  await downloadFile(mirror.url, tarPath);
  log('解压中...');
  const r = spawnSync('tar', ['-xjf', tarPath, '-C', MODELS_DIR], {
    encoding: 'utf8',
    stdio: 'inherit',
    timeout: 600000,
  });
  if (r.status !== 0) throw new Error('tar 解压失败');
  fs.unlinkSync(tarPath);
}

async function main() {
  const withTestAudio = process.argv.includes('--test-audio');
  fs.mkdirSync(MODEL_DIR, { recursive: true });

  // 1) 校验是否已齐备
  const allExist = REQUIRED_FILES.every((f) => fs.existsSync(path.join(MODEL_DIR, f)));
  if (allExist) {
    log('模型已存在，跳过下载: ' + MODEL_DIR);
  } else {
    // 2) 依次尝试镜像源
    let done = false;
    for (const mirror of MIRRORS) {
      try {
        log(`尝试镜像源: ${mirror.name}`);
        await downloadFromMirror(mirror);
        done = true;
        break;
      } catch (err) {
        log(`镜像源失败: ${err.message}`);
      }
    }
    if (!done) {
      log('所有镜像源均失败。请手动下载后解压到 models/ 目录。');
      process.exit(1);
    }
  }

  // 3) 校验必需文件
  const missing = REQUIRED_FILES.filter((f) => !fs.existsSync(path.join(MODEL_DIR, f)));
  if (missing.length > 0) {
    log(`模型文件不完整，缺少: ${missing.join(', ')}`);
    process.exit(1);
  }
  log('模型校验通过 ✔');
  log('  ' + REQUIRED_FILES.map((f) => path.join(MODEL_DIR, f)).join('\n  '));

  // 4) 可选文件提示
  const missingOpt = OPTIONAL_FILES.filter((f) => !fs.existsSync(path.join(MODEL_DIR, f)));
  if (missingOpt.length > 0) {
    log(`提示: 未包含可选文件 ${missingOpt.join(', ')}（如需 fp16 高精度版，可从 GitHub Releases 完整包获取）`);
  }

  // 5) 中文测试音频（可选）
  if (withTestAudio) {
    fs.mkdirSync(TEST_AUDIO_DIR, { recursive: true });
    const dest = path.join(TEST_AUDIO_DIR, 'zh.mp3');
    if (fs.existsSync(dest)) {
      log('测试音频已存在，跳过: ' + dest);
    } else {
      try {
        await downloadFile(TEST_AUDIO_URL, dest);
      } catch (err) {
        log(`测试音频下载失败（不影响使用）: ${err.message}`);
      }
    }
  }

  log('全部完成。启动服务: npm start');
}

main().catch((err) => {
  log(`失败: ${err.message}`);
  process.exit(1);
});
