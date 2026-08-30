/**
 * 记录控制器 —— 识别历史（SQLite）查询接口
 *
 * GET    /api/records          -> 分页列表
 * GET    /api/records/:id      -> 单条详情
 * DELETE /api/records/:id      -> 删除单条
 */
const { listRecords, getRecord, deleteRecord } = require('../db/database');
const { ok, fail } = require('../utils/response.util');

/**
 * 分页列表：GET /api/records?limit=50&offset=0
 */
function list(req, res) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const data = listRecords(limit, offset);
  return res.json(ok(data));
}

/**
 * 单条详情：GET /api/records/:id
 */
function detail(req, res) {
  const record = getRecord(req.params.id);
  if (!record) {
    return res.status(404).json(fail(40401, `记录不存在: ${req.params.id}`));
  }
  return res.json(ok(record));
}

/**
 * 删除单条：DELETE /api/records/:id
 */
function remove(req, res) {
  const okFlag = deleteRecord(req.params.id);
  if (!okFlag) {
    return res.status(404).json(fail(40402, `记录不存在: ${req.params.id}`));
  }
  return res.json(ok(null, '删除成功'));
}

module.exports = { list, detail, remove };
