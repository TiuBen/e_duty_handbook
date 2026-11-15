// utils/store.js - 基于 wx.setStorageSync 的本地数据存取（当前阶段替代后端接口）
// 待办/已办/消息/反馈四类数据，统一走这里读写，页面不直接碰 storage

const KEYS = {
  TODO: 'tb_todo_tasks',
  DONE: 'tb_done_tasks',
  MSG: 'tb_messages',
  FEEDBACK: 'tb_feedbacks',
  SEQ: 'tb_seq'
};

function read(key, fallback) {
  const val = wx.getStorageSync(key);
  return val === '' || val === undefined || val === null ? fallback : val;
}

function write(key, val) {
  wx.setStorageSync(key, val);
}

// 任务编号从 9147214 起自增，与原小程序截图一致
function nextId() {
  const seq = read(KEYS.SEQ, 9147214) + 1;
  write(KEYS.SEQ, seq);
  return String(seq);
}

// ---------- 待办任务 ----------
function listTodos() {
  return read(KEYS.TODO, []);
}

function addTodo(task) {
  const list = listTodos();
  const item = Object.assign(
    { id: nextId(), createdAt: require('./format').now() },
    task
  );
  list.unshift(item);
  write(KEYS.TODO, list);
  return item;
}

function getTodo(id) {
  return listTodos().find(function (t) { return t.id === id; });
}

function updateTodo(id, patch) {
  const list = listTodos();
  const idx = list.findIndex(function (t) { return t.id === id; });
  if (idx === -1) return;
  list[idx] = Object.assign({}, list[idx], patch);
  write(KEYS.TODO, list);
}

// 删除待办任务
function deleteTodo(id) {
  write(KEYS.TODO, listTodos().filter(function (t) { return t.id !== id; }));
}

// 待办 -> 已办（提交评分后调用）
function moveTodoToDone(id, extra) {
  const task = getTodo(id);
  if (!task) return;
  deleteTodo(id);
  const done = read(KEYS.DONE, []);
  done.unshift(Object.assign({}, task, { finishedAt: require('./format').now() }, extra || {}));
  write(KEYS.DONE, done);
}

// ---------- 已办任务 ----------
function listDone() {
  return read(KEYS.DONE, []);
}

// ---------- 消息提醒 / 反馈记录 ----------
function listMessages() {
  return read(KEYS.MSG, []);
}

function listFeedbacks() {
  return read(KEYS.FEEDBACK, []);
}

// ---------- 预置样本数据 ----------
function seedIfEmpty() {
  if (read(KEYS.SEQ, null) !== null) return; // 已初始化过则跳过

  write(KEYS.SEQ, 9147214);
  write(KEYS.TODO, [
    {
      id: '9147215',
      title: '李依玲【（进近）指挥席位培训记录表】需录入关联表单',
      createdAt: '2026-07-29 03:04:52',
      student: '李依玲',
      trainCategory: '岗位培训',
      postTrainType: '资格培训',
      formName: '（进近）指挥席位培训记录表',
      startTime: '2026-07-29 01:18:30',
      endTime: '',
      qualType: 'PLC',
      sector: 'AP04',
      weather: '',
      military: '',
      sorties: '',
      complexity: '',
      teacher: '吴其奇'
    },
    {
      id: '9147216',
      title: '李依玲【（进近）指挥席位培训记录表】需录入关联表单',
      createdAt: '2026-07-29 02:01:40',
      student: '李依玲',
      trainCategory: '岗位培训',
      postTrainType: '资格培训',
      formName: '（进近）指挥席位培训记录表',
      startTime: '2026-07-29 01:18:30',
      endTime: '',
      qualType: 'PLC',
      sector: 'AP04',
      weather: '',
      military: '',
      sorties: '',
      complexity: '',
      teacher: '吴其奇'
    },
    {
      id: '9147217',
      title: '李依玲【（进近）指挥席位培训记录表】需录入关联表单',
      createdAt: '2026-07-28 23:08:27',
      student: '李依玲',
      trainCategory: '岗位培训',
      postTrainType: '资格培训',
      formName: '（进近）指挥席位培训记录表',
      startTime: '2026-07-29 01:18:30',
      endTime: '',
      qualType: 'PLC',
      sector: 'AP04',
      weather: '',
      military: '',
      sorties: '',
      complexity: '',
      teacher: '吴其奇'
    }
  ]);
  write(KEYS.DONE, [
    {
      id: '9147201',
      title: '王思远【（塔台）指挥席位培训记录表】已提交',
      createdAt: '2026-07-27 09:30:11',
      finishedAt: '2026-07-27 11:02:45',
      student: '王思远',
      formName: '（塔台）指挥席位培训记录表'
    }
  ]);
  write(KEYS.MSG, [
    { id: '1', title: '您有一条新的培训考核反馈待查看', createdAt: '2026-07-29 08:00:00' },
    { id: '2', title: '本月模拟机培训/考核计划已发布', createdAt: '2026-07-28 10:00:00' }
  ]);
  write(KEYS.FEEDBACK, []);
}

module.exports = {
  listTodos,
  addTodo,
  getTodo,
  updateTodo,
  deleteTodo,
  moveTodoToDone,
  listDone,
  listMessages,
  listFeedbacks,
  seedIfEmpty
};
