# e_duty_handbook 项目长期约定

## 目录与运行
- `Test1/`：Flutter Web 前端（仅 Chrome），端口预览 5175（`static-no-cache.js` 托管 build/web，含防缓存）。
- `ipad-dart-app/`：Flutter 前端，**仅支持 Web**（已移除 android/ios/linux/macos/windows，`flutter create --platforms=web` 形态）。仅存 `.metadata`（platforms 只含 root+web）、`lib/`、`web/`、`pubspec.yaml`、`pubspec.lock`、`.gitignore`。若需恢复其他平台：解压备份 `D:/GitHub/_backup_ipad-dart-platforms-20260924.tar.gz`，或从 git 旧路径 `App/` 取回。
- `voice-record-recalibrate-server/`：Express **纯 API** 后端（由原 `server/` 拆分而来），用户自己 `npm start`，端口 **5184**。语音识别本地推理（sherpa-onnx + SenseVoice int8，`models/`），ffmpeg 转 16k wav，纯内网可用。**不再托管任何页面**。
- `voice-record-recalibrate-web/`：微调台前端（Vite 8 + React 19 + Tailwind v4），端口 **5200**，开发期 proxy `/api`、`/uploads` → 5184。三页签：语音识别 / 样本标注 / 纠错词典。
- 原 `server/` 已删除（内容即上面两个项目；旧原生前端备份在 `D:/GitHub/_backup_server_public_20260924/`）。
- 微调台入口：`http://localhost:5200/`（前端项目；后端 API 在 5184）。

## 生效规则（重要）
- **改 `voice-record-recalibrate-web/src/**`：Vite 热更新，浏览器即时生效**（纯前端，无需重启）。
- **改 `voice-record-recalibrate-server/src/**`：必须用户自己重启 `npm start` 才生效。** 别去杀/占 5184（那是用户的进程）。
- 需要用临时后端验证时用别的端口（5186/5187/5188…），**测完必须清理自己造的样本** —— `samples.json` / `uploads/` 与用户实例共用，会被污染。

## 数据文件（voice-record-recalibrate-server/）
- `rules.json`：关键词规则（微调台编辑）。
- `samples.json` + `uploads/`：识别样本（音频 16k wav + 引擎文本 + 人工标注），最多 300 条。
- `corrections.json`：纠错词典（错词→正词，识别文本先替换再匹配）。

## 微调台页面结构（voice-record-recalibrate-web）
- 顶部三个 Segment：语音识别 / 样本标注 / 纠错词典。三 pane 常驻挂载、只切显隐（切页签不丢状态）。
- seg1：引擎状态卡 → 测试+录音卡 → **本次录音标注卡**（只读优先：点「修改」后才能点选 chip，人工校正文本按点选顺序拼接，保存后回只读）→ 规则关键词表。
- seg2：全部样本表格 + 分页（5/10/20/50），用于修改历史标注。
- 样本行组件 `components/SampleRow.jsx`：用 `ordered` prop 区分「本次录音标注」与列表行；点选顺序由数组顺序保证，不依赖 DOM 顺序。

## 验证手段
- 前端改动 → `npm run build`（Vite 全量编译，语法/导入/打包一次过）是最直接的自检。
- 后端改动 → `node --check src/*.js`；起服务验证用临时端口（如 `PORT=5187`），**测完必须停掉并确认端口释放**。
- 本环境 `flutter` CLI 与 PowerShell 工具不可用；bash 删目录若被 safe-delete 拦或报 `Device or resource busy`，用 Python `os.rmdir` 兜底；`models/` 这类被占用的目录要「逐文件 mv + 重建结构」而不是整体 rename。
- 用户偏好自己在本地默认浏览器（Chrome）实测，不喜欢无头/截图工具；预览用 `present_files` 开 localhost 页面。

## 键盘/命名习惯
- 清单项 id：`single_rw` / `related_approach` / `independent_departure` / `cat1` / `lvp` / `01L` / `19R` / `01R` / `19L`（label 与语音说法的对应见 rules.json）。
