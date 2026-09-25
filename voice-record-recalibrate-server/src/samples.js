/**
 * samples.js —— 识别样本收集与标注（供 Admin 页微调 / 后续模型微调）
 *
 * 每次 /api/asr 识别后自动存档一条样本：
 *   音频（16k 单声道 wav，落盘 uploads/）+ 引擎识别文本 + 规则命中的项
 * Admin 页展示列表，人工填写"校正文本 / 应勾选项"，保存后成为标注样本。
 *
 * 存储：
 *   samples.json —— 样本元数据（含标注结果），追加式数组
 *   uploads/     —— 音频文件（s_<id>.wav）
 *
 * 仅保留最近 MAX_SAMPLES 条，超出时自动清理最旧的记录与音频文件。
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..');
const SAMPLES_FILE = path.join(DATA_DIR, 'samples.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

const MAX_SAMPLES = 300; // 最多保留的样本数，防止内网长期使用无限膨胀

/** 目录与数据文件就绪 */
function ensureStore() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(SAMPLES_FILE)) {
    fs.writeFileSync(SAMPLES_FILE, '[]', 'utf8');
  }
}

function loadAll() {
  ensureStore();
  try {
    const arr = JSON.parse(fs.readFileSync(SAMPLES_FILE, 'utf8'));
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function persist(list) {
  ensureStore();
  fs.writeFileSync(SAMPLES_FILE, JSON.stringify(list, null, 2), 'utf8');
}

/** 生成样本 id：时间戳(36进制) + 随机后缀，可排序 */
function genId() {
  return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** 删除最旧样本，直到不超过 MAX_SAMPLES（连同音频文件一起清理） */
function trim(list) {
  while (list.length > MAX_SAMPLES) {
    const old = list.shift();
    if (old && old.audioFile) {
      try { fs.rmSync(path.join(UPLOADS_DIR, old.audioFile), { force: true }); } catch (e) { /* ignore */ }
    }
  }
  return list;
}

/**
 * 新增一条样本（在 /api/asr 识别后调用）
 * @param {object} opts
 *   - wavBuf     16k 单声道 wav 内容（识别用的同一份，落盘为音频存档）
 *   - asrText    引擎识别文本
 *   - checkedIds 规则命中的项 id 数组
 *   - durationSec 语音时长（秒）
 * @returns {object} 新样本记录
 */
function add({ wavBuf, asrText, checkedIds, durationSec }) {
  const list = loadAll();
  const id = genId();
  const now = new Date();
  const audioFile = `s_${id}.wav`;

  const sample = {
    id,
    time: now.toISOString(),
    timeStr: now.toLocaleString('zh-CN', { hour12: false }),
    durationSec,
    audioFile,
    audioUrl: `/uploads/${audioFile}`,
    // 引擎自动识别结果
    asrText: String(asrText || ''),
    asrChecked: Array.isArray(checkedIds) ? checkedIds : [],
    // 人工标注（admin 填写后才有值）
    correctedText: null,
    targetChecked: [],
    marked: false,
    updatedAt: null
  };

  try {
    fs.writeFileSync(path.join(UPLOADS_DIR, audioFile), wavBuf);
  } catch (e) {
    // 音频落盘失败也保留文本记录（标注仍可用）
    sample.audioFile = null;
    sample.audioUrl = null;
  }

  list.push(sample);
  persist(trim(list));
  return sample;
}

/** 保存人工标注 */
function update(id, { correctedText, targetChecked }) {
  const list = loadAll();
  const idx = list.findIndex((s) => s.id === id);
  if (idx < 0) return false;
  const allowed = Array.isArray(targetChecked) ? targetChecked : [];
  list[idx].correctedText = String(correctedText || '').trim();
  list[idx].targetChecked = allowed.filter((x, i) => allowed.indexOf(x) === i); // 去重保序
  list[idx].marked = true;
  list[idx].updatedAt = new Date().toISOString();
  persist(list);
  return true;
}

/** 删除样本（连同音频文件） */
function remove(id) {
  const list = loadAll();
  const idx = list.findIndex((s) => s.id === id);
  if (idx < 0) return false;
  const s = list.splice(idx, 1)[0];
  if (s.audioFile) {
    try { fs.rmSync(path.join(UPLOADS_DIR, s.audioFile), { force: true }); } catch (e) { /* ignore */ }
  }
  persist(list);
  return true;
}

/** 列表（最新在前） */
function list() {
  return loadAll().slice().reverse();
}

module.exports = { add, update, remove, list, UPLOADS_DIR, SAMPLES_FILE };
