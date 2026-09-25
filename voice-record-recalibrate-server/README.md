# voice-record-recalibrate-server

语音识别校准**后端（纯 API）**：完全本地推理（sherpa-onnx + ONNX 模型），不访问任何外部 API。
接收录音 → 识别文本 → 纠错词典替换 → 关键词规则匹配 → 返回应勾选项，并把每次识别存档为可标注样本。

> 前端微调页在独立项目 **`voice-record-recalibrate-web`**（Vite + React + Tailwind）。
> 本服务不托管任何页面，只提供 `/api/*` 与 `/uploads/*`。

## 启动

```bash
npm install              # 首次
npm run download-model   # 仅联网环境执行一次（下载 SenseVoice 中文语音模型 ~158MB）
npm start                # 监听 5184 端口（nodemon 热重载）
```

启动前请确保系统 PATH 里有 **ffmpeg**，或把 `ffmpeg.exe` 放到 `./bin/`。

自检（不占端口，用模型自带 wav 验证引擎）：

```bash
node scripts/test-asr.js
```

## 内网部署清单

把整个目录（含 `models/`、`node_modules/`）拷贝到内网服务器，另外确保：

1. Node.js ≥ 18
2. **ffmpeg**：装到系统 PATH，或把 `ffmpeg.exe` 放到 `bin/`
3. `npm start`，即可离线运行

## 接口

所有接口无鉴权，供内网使用。跨域已开启（`cors()` 全放行），前端可由任意端口访问。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/status` | 引擎状态（模型 / ffmpeg 是否就绪） |
| POST | `/api/asr` | 上传录音（multipart 字段 `audio`），返回识别文本 + 各项 checked + 本次样本 `sample`，并自动存档为样本 |
| POST | `/api/asr/text` | `{ "text": "..." }` 纯文本 → 先纠错再规则匹配（调试用） |
| GET | `/api/rules` | 读取规则 |
| PUT | `/api/rules` | 保存规则（保存即生效，无需重启） |
| GET | `/api/samples` | 识别样本列表（含人工标注） |
| PUT | `/api/samples/:id` | 保存某条样本的人工标注（校正文本 / 应勾选项） |
| DELETE | `/api/samples/:id` | 删除样本（连同音频） |
| GET | `/api/corrections` | 读取纠错词典（错词→正确词） |
| PUT | `/api/corrections` | 保存纠错词典（全量提交，保存即生效） |
| GET | `/api/corrections/suggestions` | 从已标注样本自动提取「错词→正词」候选（不落盘） |
| GET | `/uploads/*` | 样本音频（16k 单声道 wav）静态访问 |

### 识别响应结构（`POST /api/asr`）

```jsonc
{
  "transcript": "01左单跑道1类盲降运行",      // 纠错后、用于匹配的文本
  "rawTranscript": "东摇锁单跑道1类猛将运行",  // 引擎原始识别文本（便于对照纠错效果）
  "groups": [                                // 与规则同构，每项带 checked / matchedBy
    { "id": "operation_mode", "name": "运行模式",
      "items": [ { "id": "01L", "label": "01L", "checked": true, "matchedBy": "01左" } ] }
  ],
  "sample": {                                // 本次存档的样本（前端可直接标注"这一次"）
    "id": "s_xxx", "asrText": "...", "asrChecked": ["01L"], "audioUrl": "/uploads/s_xxx.wav"
  }
}
```

## 处理链路

```
录音 → ffmpeg 转 16k wav → SenseVoice 识别
     → 纠错词典替换（长词优先） → 关键词规则匹配 → 勾选结果
     → 存档样本（uploads/ + samples.json）
```

## 数据文件

| 文件 / 目录 | 说明 |
| --- | --- |
| `rules.json` | 关键词规则（微调页编辑后持久化于此） |
| `corrections.json` | 纠错词典 `{ version, pairs:[{wrong,right,fromSamples,used,addedAt}] }` |
| `samples.json` | 样本元数据 + 人工标注（追加式数组，最多保留最近 300 条） |
| `uploads/` | 样本音频（`s_<id>.wav`，随 samples.json 清理） |
| `models/` | ONNX 模型包；`models/model-config.json` 指定当前启用的模型与文件 |
| `bin/` | 可选的 `ffmpeg.exe`（未装系统 ffmpeg 时使用） |

## 目录结构

```
voice-record-recalibrate-server/
├─ src/
│  ├─ index.js       # Express 入口与路由（纯 API）
│  ├─ asr.js         # sherpa-onnx 识别引擎适配层
│  ├─ audio.js       # ffmpeg 音频转码（webm → 16k wav）
│  ├─ rules.js       # 关键词规则引擎（归一化 + 子串匹配）
│  ├─ samples.js     # 识别样本存档 / 人工标注（samples.json + uploads/）
│  └─ corrections.js # 纠错词典（LCS 候选提取 + 识别前替换）
├─ scripts/
│  ├─ download-model.js  # 模型下载/解压脚本（默认 SenseVoice int8）
│  └─ test-asr.js        # 模型冒烟自检（真实人声验证，不占端口）
├─ models/           # ONNX 模型（随部署包携带；旧 zipformer 模型目录可删）
├─ uploads/          # 样本音频（16k wav）
├─ samples.json      # 样本元数据 + 人工标注（自动创建）
├─ corrections.json  # 纠错词典（自动创建）
└─ rules.json        # 关键词规则
```

## 环境变量

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `PORT` | `5184` | 监听端口 |
