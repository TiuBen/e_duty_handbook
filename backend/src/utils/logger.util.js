/**
 * 极简日志工具
 * 统一输出格式: [时间] [级别] 消息
 */
function ts() {
  return new Date().toISOString();
}

function log(level, ...args) {
  console.log(`[${ts()}] [${level}]`, ...args);
}

module.exports = {
  info: (...args) => log('INFO ', ...args),
  warn: (...args) => log('WARN ', ...args),
  error: (...args) => log('ERROR', ...args),
};
