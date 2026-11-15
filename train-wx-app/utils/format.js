// utils/format.js - 本地时间格式化（不用 toISOString，避免时区导致差一天）

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

// 当前本地时间 'YYYY-MM-DD HH:mm:ss'
function now() {
  const d = new Date();
  return (
    d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
    ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())
  );
}

module.exports = { now };
