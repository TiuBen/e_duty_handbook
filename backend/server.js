/**
 * 服务入口
 *
 * 启动流程：
 *  1. 加载环境变量（.env）
 *  2. 预热加载 SenseVoice 模型（失败不阻塞启动，/health 可查状态）
 *  3. 启动 HTTP 服务
 */
require('dotenv').config();

const app = require('./src/app');
const config = require('./src/config');
const logger = require('./src/utils/logger.util');
const recognizerService = require('./src/services/recognizer.service');

// 启动时预热模型（可选：不想阻塞启动可移除）
recognizerService.ensureRecognizer();

const server = app.listen(config.port, () => {
  logger.info('==========================================');
  logger.info(`  VoiceRec ASR Server 已启动`);
  logger.info(`  本机访问:  http://localhost:${config.port}`);
  logger.info(`  健康检查:  GET /api/asr/health`);
  logger.info(`  语音识别:  POST /api/asr/transcribe`);
  logger.info('==========================================');
});

// 端口监听失败时给出可操作的提示（如 Windows 保留端口段、端口被占用）
server.on('error', (err) => {
  if (err.code === 'EACCES') {
    logger.error(
      `无法监听端口 ${config.port} (EACCES)。` +
        '该端口可能属于 Windows 保留端口段（Hyper-V/WinNAT 排除范围）或被其他程序占用。' +
        '请在 .env 中设置 PORT 为其他端口后重启。'
    );
  } else {
    logger.error(`端口监听失败: ${err.message}`);
  }
  process.exit(1);
});
