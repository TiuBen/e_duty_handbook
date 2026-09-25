/**
 * index.js —— 服务入口
 *
 * 接口一览：
 *  GET  /api/status          引擎状态（模型是否加载、ffmpeg 是否可用）
 *  POST /api/asr             上传录音（multipart 字段名 audio）→ 识别 + 纠错 + 规则匹配 + 存档样本
 *  POST /api/asr/text        { text } 纯文本 → 纠错 + 规则匹配（供 admin / 前端调试）
 *  GET  /api/rules           读取规则
 *  PUT  /api/rules           保存规则（admin 页编辑关键词）
 *  GET  /api/samples         样本列表（识别录音 + 人工标注）
 *  PUT  /api/samples/:id     保存某条样本的人工标注（校正文本 / 应勾选项）
 *  DELETE /api/samples/:id   删除一条样本（连同音频）
 *  GET  /api/corrections            纠错词典列表
 *  PUT  /api/corrections            保存纠错词典（admin 勾选采纳后全量提交）
 *  GET  /api/corrections/suggestions 从已标注样本自动提取"错词→正词"候选
 *  GET  /uploads/...         样本音频静态访问
 *
 * 说明：本服务为纯 API 后端，不托管任何前端页面。
 *      微调页由 voice-record-recalibrate-web（Vite + React + Tailwind）独立提供，
 *      开发时通过 Vite 的 proxy 把 /api、/uploads 转发到本服务（默认 5184）。
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const asr = require('./asr');
const audio = require('./audio');
const rules = require('./rules');
const samples = require('./samples');
const corrections = require('./corrections');

const PORT = process.env.PORT || 5184;
const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// 上传走内存，限制 25MB（几十秒的 webm 足够）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

// ---------- 引擎状态 ----------
app.get('/api/status', (_req, res) => {
  res.json({
    asr: asr.status(),
    ffmpeg: !!audio.getFfmpeg(),
    rulesFile: rules.RULES_FILE
  });
});

// ---------- 语音识别（录音上传） ----------
app.post('/api/asr', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '缺少音频字段 audio' });
    if (!asr.status().available) {
      return res.status(503).json({ error: '语音识别引擎不可用：' + (asr.status().error || '未知原因') });
    }
    const ext = path.extname(req.file.originalname || '') || '.webm';
    const wav = await audio.convertToWav16k(req.file.buffer, ext);
    const { text, durationSec } = asr.recognizeWav(wav);
    // 控制台日志：输入时间  语音时长  识别的文字内容（引擎原始文本）
    const timeStr = new Date().toLocaleString('zh-CN', { hour12: false });
    console.log(`[${timeStr}] 语音时长=${durationSec.toFixed(2)}s 识别内容="${text}"`);

    // 纠错词典层：先把引擎高频错词替换回正确写法，再做规则匹配
    const { text: fixedText, applied } = corrections.apply(text);
    if (applied.length) {
      console.log(
        `[${timeStr}] 纠错应用: ${applied.map((a) => `${a.wrong}→${a.right}(${a.times}处)`).join(', ')}`
      );
    }

    const matched = rules.matchText(fixedText);
    // 命中项 id 列表（扁平化各 group）
    const checkedIds = [];
    for (const g of matched.groups) {
      for (const it of g.items) if (it.checked) checkedIds.push(it.id);
    }
    // 存档为样本（音频 = 16k wav，asrText 存引擎原始文本，供标注纠错/建议生成）
    const sample = samples.add({ wavBuf: wav, asrText: text, checkedIds, durationSec });

    // rawTranscript = 引擎原始识别文本，供前端对照"纠错前 vs 纠错后"
    // sample = 本次样本（含 id / audioUrl），前端可据此直接标注"这一次"的录音
    res.json({ ...matched, rawTranscript: text, sample });
  } catch (e) {
    const timeStr = new Date().toLocaleString('zh-CN', { hour12: false });
    console.error(`[${timeStr}] 语音识别异常：${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

// ---------- 纯文本规则匹配（调试 / admin 测试） ----------
app.post('/api/asr/text', (req, res) => {
  const raw = (req.body && req.body.text) || '';
  // 与 /api/asr 一致：先过纠错词典，再做规则匹配（保证 admin 文本测试所见即线上效果）
  const { text: fixed } = corrections.apply(raw);
  const matched = rules.matchText(fixed);
  // 回显给 admin：纠错后的最终文本 + 原始文本（便于对照微调）
  res.json({ ...matched, rawTranscript: raw });
});

// ---------- 规则 CRUD ----------
app.get('/api/rules', (_req, res) => res.json(rules.loadRules()));

app.put('/api/rules', (req, res) => {
  const incoming = req.body;
  if (!incoming || !Array.isArray(incoming.groups)) {
    return res.status(400).json({ error: '规则格式错误：需要 { groups: [...] }' });
  }
  // 基本校验：每个 item 必须有 id/label
  for (const g of incoming.groups) {
    if (!g.id || !g.name || !Array.isArray(g.items)) {
      return res.status(400).json({ error: `规则组格式错误: ${g.id || '(无 id)'}` });
    }
    for (const it of g.items) {
      if (!it.id || !it.label) return res.status(400).json({ error: `item 缺少 id/label（组 ${g.id}）` });
      if (!Array.isArray(it.keywords)) it.keywords = [];
    }
  }
  rules.saveRules(incoming);
  res.json({ ok: true });
});

// ---------- 样本标注 CRUD ----------
app.get('/api/samples', (_req, res) => {
  res.json({ samples: samples.list() });
});

app.put('/api/samples/:id', (req, res) => {
  const id = req.params.id;
  const body = req.body || {};
  if (typeof body.correctedText !== 'string') {
    return res.status(400).json({ error: '缺少 correctedText（校正文本）' });
  }
  const ok = samples.update(id, {
    correctedText: body.correctedText,
    targetChecked: Array.isArray(body.targetChecked) ? body.targetChecked : []
  });
  if (!ok) return res.status(404).json({ error: '样本不存在: ' + id });
  res.json({ ok: true });
});

app.delete('/api/samples/:id', (req, res) => {
  const ok = samples.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: '样本不存在: ' + req.params.id });
  res.json({ ok: true });
});

// ---------- 纠错词典 CRUD ----------
app.get('/api/corrections', (_req, res) => {
  res.json(corrections.load());
});

app.put('/api/corrections', (req, res) => {
  const body = req.body || {};
  const r = corrections.savePairs(Array.isArray(body.pairs) ? body.pairs : []);
  if (!r.ok) return res.status(400).json({ error: r.error });
  res.json({ ok: true });
});

// 从已标注样本提取"错词→正词"候选（不落盘，纯计算）
app.get('/api/corrections/suggestions', (_req, res) => {
  res.json({ suggestions: corrections.buildSuggestions(samples.list()) });
});

// ---------- 样本音频静态访问 ----------
app.use('/uploads', express.static(samples.UPLOADS_DIR));

asr.init();
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  console.log(`[server] API base: http://localhost:${PORT}/api`);
  console.log('[server] 前端（微调页）请单独启动 voice-record-recalibrate-web');
});
