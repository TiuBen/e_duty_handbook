/**
 * api.js —— 后端接口封装
 *
 * 默认走相对路径（开发期由 Vite proxy 把 /api、/uploads 转发到后端 5184）。
 * 若前后端分离部署在不同源，构建时设置 VITE_API_BASE，例如：
 *   VITE_API_BASE=http://192.168.1.20:5184 npm run build
 */
const BASE = import.meta.env.VITE_API_BASE || '';

/** 统一请求：非 2xx 时抛出带后端 error 文案的异常 */
async function request(path, options) {
  let res;
  try {
    res = await fetch(BASE + path, options);
  } catch (e) {
    throw new Error('无法连接后端服务（' + (e?.message || e) + '）');
  }
  if (!res.ok) {
    let msg = 'HTTP ' + res.status;
    try {
      const j = await res.json();
      if (j && j.error) msg = j.error;
    } catch {
      /* 响应非 JSON，保留 HTTP 状态 */
    }
    throw new Error(msg);
  }
  return res.json();
}

const postJson = (path, body) =>
  request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

const putJson = (path, body) =>
  request(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

export const api = {
  /** 引擎状态：{ asr: {available, provider, type, modelDir, error}, ffmpeg, rulesFile } */
  status: () => request('/api/status'),

  /** 纯文本 → 纠错 + 规则匹配 */
  testText: (text) => postJson('/api/asr/text', { text }),

  /** 录音识别：blob + 文件名 → 匹配结果（含 rawTranscript 与本次 sample） */
  recognize: (blob, filename) => {
    const fd = new FormData();
    fd.append('audio', blob, filename);
    return request('/api/asr', { method: 'POST', body: fd });
  },

  getRules: () => request('/api/rules'),
  saveRules: (rules) => putJson('/api/rules', rules),

  getSamples: () => request('/api/samples'),
  /** 保存人工标注：{ correctedText, targetChecked } */
  saveSample: (id, payload) => putJson('/api/samples/' + encodeURIComponent(id), payload),
  deleteSample: (id) => request('/api/samples/' + encodeURIComponent(id), { method: 'DELETE' }),

  getCorrections: () => request('/api/corrections'),
  /** 全量提交纠错词典 pairs */
  saveCorrections: (pairs) => putJson('/api/corrections', { pairs }),
  getSuggestions: () => request('/api/corrections/suggestions')
};

/** 样本音频地址（配合 VITE_API_BASE 使用绝对地址时拼接） */
export const resolveAudioUrl = (url) => (url ? BASE + url : '');
