/**
 * 统一响应格式
 * 成功: { code: 0, msg: "ok", data: {...} }
 * 失败: { code: 非0, msg: "错误描述", data: null }
 */
function ok(data = null, msg = 'ok') {
  return { code: 0, msg, data };
}

function fail(code, msg) {
  return { code, msg, data: null };
}

module.exports = { ok, fail };
