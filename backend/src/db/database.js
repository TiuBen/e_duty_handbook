/**
 * SQLite 数据访问层（better-sqlite3）
 *
 * 职责：初始化数据库与表结构，提供 asr_records 表的增删查接口。
 * 数据落盘位置：data/asr.db（本地 SQLite，无需额外服务）
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');

// 确保数据目录存在
fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

const db = new Database(config.dbPath);
// 开启 WAL 模式，提升并发读写性能
db.pragma('journal_mode = WAL');

/**
 * 建表：语音识别记录
 * 每次转写成功后写入一条，供前端展示历史。
 */
db.exec(`
  CREATE TABLE IF NOT EXISTS asr_records (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    text          TEXT NOT NULL,                -- 转写文本
    lang          TEXT,                         -- 语种 zh/en/yue/ja/ko
    emotion       TEXT,                         -- 情感 NEUTRAL/HAPPY/...
    event         TEXT,                         -- 音频事件 Speech/BGM/...
    duration_sec  REAL,                         -- 音频时长（秒）
    elapsed_ms    INTEGER,                      -- 识别耗时（毫秒）
    audio_filename TEXT,                        -- 原始音频文件名
    created_at    TEXT DEFAULT (datetime('now', 'localtime'))  -- 创建时间（本地时区）
  )
`);

/** 插入一条识别记录，返回新记录 id */
function insertRecord({ text, lang, emotion, event, durationSec, elapsedMs, audioFilename }) {
  const info = db
    .prepare(
      `INSERT INTO asr_records (text, lang, emotion, event, duration_sec, elapsed_ms, audio_filename)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(text, lang, emotion, event, durationSec, elapsedMs, audioFilename);
  return Number(info.lastInsertRowid);
}

/**
 * 分页查询识别记录（按时间倒序）
 * @param {number} limit 每页条数
 * @param {number} offset 偏移
 */
function listRecords(limit = 50, offset = 0) {
  const rows = db
    .prepare(
      `SELECT id, text, lang, emotion, event, duration_sec AS durationSec,
              elapsed_ms AS elapsedMs, audio_filename AS audioFilename, created_at AS createdAt
       FROM asr_records
       ORDER BY id DESC
       LIMIT ? OFFSET ?`
    )
    .all(Number(limit), Number(offset));
  const total = db.prepare('SELECT COUNT(*) AS c FROM asr_records').get().c;
  return { total, list: rows };
}

/** 查询单条记录，不存在返回 null */
function getRecord(id) {
  return (
    db
      .prepare(
        `SELECT id, text, lang, emotion, event, duration_sec AS durationSec,
                elapsed_ms AS elapsedMs, audio_filename AS audioFilename, created_at AS createdAt
         FROM asr_records WHERE id = ?`
      )
      .get(Number(id)) || null
  );
}

/** 删除单条记录，返回是否删除成功 */
function deleteRecord(id) {
  const info = db.prepare('DELETE FROM asr_records WHERE id = ?').run(Number(id));
  return info.changes > 0;
}

module.exports = { db, insertRecord, listRecords, getRecord, deleteRecord };
