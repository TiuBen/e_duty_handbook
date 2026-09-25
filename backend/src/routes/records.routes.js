/**
 * 记录路由
 */
const express = require('express');
const recordsController = require('../controllers/records.controller');

const router = express.Router();

router.get('/', recordsController.list);           // 列表（分页）
router.get('/:id', recordsController.detail);       // 详情
router.delete('/:id', recordsController.remove);    // 删除

module.exports = router;
