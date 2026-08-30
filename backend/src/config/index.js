/**
 * 全局配置
 * 通过环境变量覆盖，默认值面向本地开发。
 */
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..'); // 项目根目录

module.exports = {
  /**
   * HTTP 服务端口
   * 注意: 5184-5283 段被 Windows Hyper-V/WinNAT 保留(排除范围)，监听会报 EACCES。
   *       默认 5300 不在任何保留段内。
   */
  port: Number(process.env.PORT || 5300),

  /** 模型相关配置 */
  model: {
    /**
     * 模型目录名（scripts/download-model.js 下载解压后与该名称保持一致）
     * 该目录下需要包含: model.onnx / model.int8.onnx / tokens.txt
     */
    dirName: process.env.MODEL_DIR || 'sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17',

    /**
     * 使用的 onnx 模型文件：
     * - model.int8.onnx : INT8 量化版，约 8MB，CPU 上速度最快（默认）
     * - model.onnx      : fp16 版，约 16MB，精度略高
     */
    modelFile: process.env.MODEL_FILE || 'model.int8.onnx',

    /** 语种：auto=自动检测（zh 中文 / en 英文 / yue 粤语 / ja 日语 / ko 韩语） */
    language: process.env.MODEL_LANGUAGE || 'auto',

    /** 逆文本正则化：把"一二三四"转写为"1234"，开启标点恢复 */
    useItn: String(process.env.MODEL_USE_ITN || 'true') === 'true',

    /** 推理线程数（CPU 场景建议 = 物理核数） */
    numThreads: Number(process.env.MODEL_NUM_THREADS || 4),
  },

  /** 上传临时目录 */
  uploadDir: path.join(ROOT, 'uploads'),

  /** SQLite 数据库文件（绝对路径） */
  dbPath: path.join(ROOT, 'data', 'asr.db'),

  /** 模型目录（绝对路径） */
  get modelDir() {
    return path.join(ROOT, 'models', this.model.dirName);
  },

  /** onnx 模型绝对路径 */
  get modelPath() {
    return path.join(this.modelDir, this.model.modelFile);
  },

  /** tokens 文件绝对路径 */
  get tokensPath() {
    return path.join(this.modelDir, 'tokens.txt');
  },
};
