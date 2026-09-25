/**
 * rules.js —— 关键词规则引擎
 *
 * 职责：
 * 1. 读取/保存 rules.json（admin 页面可编辑每一条 checklist 项的"关键词表"）
 * 2. 提供 matchText(text)：对识别出的文本做归一化后逐项匹配，返回应勾选的项
 *
 * 规则文件结构（rules.json）：
 * {
 *   "groups": [
 *     { "id": "operation_mode", "name": "运行模式",
 *       "items": [ { "id": "single_rw", "label": "单跑道", "keywords": ["单跑道", ...] }, ... ] }
 *   ]
 * }
 *
 * 匹配算法：文本归一化（小写、全角转半角、去空白）后，只要 item 的任一关键词
 * 是文本的子串，即视为命中该 item。多个 item 可同时命中。
 */

const fs = require('fs');
const path = require('path');

const RULES_FILE = path.join(__dirname, '..', 'rules.json');

/** 默认规则：对齐清单附录"运行模式"卡片（见需求截图） */
const DEFAULT_RULES = {
  version: 1,
  groups: [
    {
      id: 'operation_mode',
      name: '运行模式',
      items: [
        { id: 'single_rw', label: '单跑道', keywords: ['单跑道', '单一跑道', '单条跑道'] },
        { id: 'related_approach', label: '相关进近', keywords: ['相关进近', '相关运行'] },
        { id: 'independent_departure', label: '独立离场', keywords: ['独立离场', '独立起飞'] },
        { id: 'cat1', label: 'I类', keywords: ['1类', '一类', 'Ⅰ类', 'i类', 'cat1', 'cat i', '一类盲降', '1类盲降'] },
        { id: 'lvp', label: 'LVP', keywords: ['lvp', '低能见度运行', '低能见度程序'] },
        { id: '01L', label: '01L', keywords: ['01左', '零一左', '零1左', '01l', '01 l'] },
        { id: '19R', label: '19R', keywords: ['19右', '一九右', '19r', '19 r'] },
        { id: '01R', label: '01R', keywords: ['01右', '零一右', '零1右', '01r', '01 r'] },
        { id: '19L', label: '19L', keywords: ['19左', '一九左', '19l', '19 l'] }
      ]
    }
  ]
};

/** 全角转半角（数字/字母/常用符号），供匹配归一化用 */
function toHalfWidth(str) {
  let out = '';
  for (const ch of str) {
    const code = ch.codePointAt(0);
    if (code === 0x3000) {
      out += ' '; // 全角空格
    } else if (code >= 0xff01 && code <= 0xff5e) {
      out += String.fromCharCode(code - 0xfee0);
    } else {
      out += ch;
    }
  }
  return out;
}

/** 文本归一化：小写 + 全角转半角 + 去所有空白 */
function normalize(text) {
  return toHalfWidth(String(text || '')).toLowerCase().replace(/\s+/g, '');
}

function loadRules() {
  try {
    const raw = fs.readFileSync(RULES_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    // 文件不存在或损坏时，用默认规则初始化一份，方便首次部署
    saveRules(DEFAULT_RULES);
    return DEFAULT_RULES;
  }
}

function saveRules(rules) {
  fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2), 'utf8');
}

/**
 * 核心匹配：输入识别文本，返回每个 group 中各项的勾选结果
 * @returns {{ groups: Array<{id,name,items:Array<{id,label,checked,matchedBy}>}> }}
 */
function matchText(text) {
  const rules = loadRules();
  const norm = normalize(text);
  return {
    transcript: String(text || ''),
    groups: rules.groups.map((g) => ({
      id: g.id,
      name: g.name,
      items: g.items.map((item) => {
        const keywords = Array.isArray(item.keywords) ? item.keywords : [];
        // 用归一化后的关键词去匹配归一化后的文本
        const hit = keywords.find((k) => normalize(k) !== '' && norm.includes(normalize(k)));
        return {
          id: item.id,
          label: item.label,
          checked: !!hit,
          matchedBy: hit || null
        };
      })
    }))
  };
}

module.exports = { loadRules, saveRules, matchText, normalize, DEFAULT_RULES, RULES_FILE };
