/**
 * 后端 API 封装（统一走 vite 代理 /api -> http://localhost:5300）
 */

/** 上传音频识别（multipart, 字段 audio） */
export async function transcribeAudio(file) {
  const form = new FormData();
  form.append('audio', file);
  const res = await fetch('/api/asr/transcribe', { method: 'POST', body: form });
  return handle(res);
}

/** 健康检查 */
export async function fetchHealth() {
  const res = await fetch('/api/asr/health');
  return handle(res);
}

/** 历史记录分页列表 */
export async function fetchRecords(limit = 100, offset = 0) {
  const res = await fetch(`/api/records?limit=${limit}&offset=${offset}`);
  return handle(res);
}

/** 删除单条历史 */
export async function deleteRecord(id) {
  const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
  return handle(res);
}

/** 统一解析 { code, msg, data } */
async function handle(res) {
  const json = await res.json().catch(() => ({ code: res.status, msg: '响应解析失败', data: null }));
  if (res.ok && json.code === 0) return json.data;
  throw new Error(json.msg || `请求失败 (${res.status})`);
}
