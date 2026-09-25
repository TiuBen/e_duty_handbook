/**
 * corrections.js —— 识别后纠错词典（由人工标注样本驱动）
 *
 * 背景：SenseVoice 对机场专词常有固定误识（"01左"→"东摇锁/动摇锁/动腰锁"、
 * "盲降"→"猛将"）。规则同义词只能覆盖"正确说法"那一侧；本模块补充
 * "错词→正确词"的替换层：在规则匹配之前先把引擎高频错词替换回正确写法。
 *
 * 数据流：
 *   人工标注样本（asrText 错文 vs correctedText 正句）
 *     → buildSuggestions() 用 LCS 对齐自动提取 "错词→正词" 候选
 *     → admin 页人工勾选采纳 → 写入 corrections.json
 *   /api/asr 识别文本 → apply() 先替换 → rules.matchText() 再匹配勾选项
 *
 * 存储 corrections.json：{ version:1, pairs:[{wrong,right,fromSamples,used,addedAt}] }
 */

const fs = require('fs');
const path = require('path');

const CORRECTIONS_FILE = path.join(__dirname, '..', 'corrections.json');

/** 单个片段最长长度（防止把整句级别的脏差异当成纠错对） */
const MAX_PAIR_LEN = 12;

function load() {
  try {
    const raw = fs.readFileSync(CORRECTIONS_FILE, 'utf8');
    const d = JSON.parse(raw);
    return { pairs: Array.isArray(d.pairs) ? d.pairs : [] };
  } catch (e) {
    return { pairs: [] };
  }
}

function save(data) {
  fs.writeFileSync(CORRECTIONS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * 应用纠错：对文本做子串替换。
 * 按 wrong 长度降序执行（长词优先，避免短词先替换破坏长词），全量替换所有出现。
 * @returns {{ text:string, applied:Array<{wrong,right,times}> }}
 */
function apply(text) {
  const { pairs } = load();
  const out = String(text || '');
  if (!pairs.length) return { text: out, applied: [] };

  const sorted = [...pairs].sort((a, b) => b.wrong.length - a.wrong.length);
  let cur = out;
  const applied = [];
  let dirty = false;

  for (const p of sorted) {
    if (!p.wrong || !p.right || p.wrong === p.right) continue;
    if (p.wrong.length < 2 || p.right.length < 2) continue; // 双保险：防单字误伤
    const times = cur.split(p.wrong).length - 1;
    if (times > 0) {
      cur = cur.split(p.wrong).join(p.right);
      p.used = (p.used || 0) + times;
      applied.push({ wrong: p.wrong, right: p.right, times });
      dirty = true;
    }
  }

  if (dirty) save({ version: 1, pairs: sorted });
  return { text: cur, applied };
}

/**
 * LCS（字符级）对齐两个句子，找出被"替换"的连续片段对。
 * 例：a="当前是东摇锁单跑道一类猛将运行" b="当前是01左单跑道1类盲降运行"
 *   → [{wrong:"东摇锁", right:"01左"}, {wrong:"一类", right:"1类"}, {wrong:"猛将", right:"盲降"}]
 */
function alignPair(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const pairs = [];
  let wrong = '';
  let right = '';
  const flush = () => {
    if (wrong && right && wrong !== right) pairs.push({ wrong, right });
    wrong = '';
    right = '';
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      flush();
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      wrong += a[i];
      i++;
    } else {
      right += b[j];
      j++;
    }
  }
  while (i < n) { wrong += a[i]; i++; }
  while (j < m) { right += b[j]; j++; }
  flush();
  return pairs;
}

/** 片段是否值得作为候选（过滤纯符号 / 过长碎片 / 单字，防止误伤） */
function isUsablePair(p) {
  const w = p.wrong.trim();
  const r = p.right.trim();
  if (!w || !r) return false;
  // 单字替换极易误伤（"一"→"1" 会破坏"一类/一九右"），至少两字起
  if (w.length < 2 || r.length < 2) return false;
  if (w.length > MAX_PAIR_LEN || r.length > MAX_PAIR_LEN) return false;
  // 纯标点/符号片段没有纠错价值
  if (/^[\s\p{P}\p{S}]+$/u.test(w) || /^[\s\p{P}\p{S}]+$/u.test(r)) return false;
  // 校正文本被误填成"列表/勾选项"时（含逗号顿号），整段不是句子，跳过
  if (/[,，、;；]/.test(r)) return false;
  return true;
}

/**
 * 从已标注样本中提取"错词→正词"候选并跨样本聚合。
 * @param {Array} samples samples.list() 的返回（含 marked/correctedText/asrText）
 * @returns {Array<{wrong,right,count,inDict,examples:Array}>}
 */
function buildSuggestions(samples) {
  const dictPairs = load().pairs;
  const inDict = new Map(dictPairs.map((p) => [`${p.wrong}\u0001${p.right}`, true]));

  const agg = new Map(); // key -> {wrong,right,count,examples:[{asrText,correctedText}]}
  const marked = Array.isArray(samples) ? samples.filter((s) => s.marked && s.correctedText && s.asrText) : [];

  for (const s of marked) {
    const asr = String(s.asrText || '').trim();
    const corr = String(s.correctedText || '').trim();
    if (!asr || !corr || asr === corr) continue;
    for (const p of alignPair(asr, corr)) {
      if (!isUsablePair(p)) continue;
      const key = `${p.wrong}\u0001${p.right}`;
      const rec = agg.get(key) || { wrong: p.wrong, right: p.right, count: 0, examples: [] };
      rec.count++;
      if (rec.examples.length < 3) {
        rec.examples.push({ asrText: asr, correctedText: corr });
      }
      agg.set(key, rec);
    }
  }

  return [...agg.values()]
    .map((r) => ({ ...r, inDict: !!inDict.get(`${r.wrong}\u0001${r.right}`) }))
    .sort((a, b) => b.count - a.count || b.wrong.length - a.wrong.length);
}

/** 校验并保存整份词典（admin 全量提交） */
function savePairs(pairs) {
  if (!Array.isArray(pairs)) return { ok: false, error: '需要 pairs 数组' };
  for (const p of pairs) {
    if (typeof p.wrong !== 'string' || typeof p.right !== 'string') {
      return { ok: false, error: '每条纠错对需要 wrong/right 字符串' };
    }
    p.wrong = p.wrong.trim();
    p.right = p.right.trim();
    if (!p.wrong || !p.right) return { ok: false, error: '纠错对不能为空' };
    if (p.wrong.length < 2 || p.right.length < 2) {
      return { ok: false, error: '纠错片段至少 2 个字（单字替换会误伤其他词）' };
    }
    if (p.wrong.length > MAX_PAIR_LEN || p.right.length > MAX_PAIR_LEN) {
      return { ok: false, error: `片段过长（>${MAX_PAIR_LEN} 字），请检查样本标注是否为完整句子` };
    }
  }
  save({ version: 1, pairs });
  return { ok: true };
}

module.exports = { apply, buildSuggestions, savePairs, load, CORRECTIONS_FILE, alignPair };
