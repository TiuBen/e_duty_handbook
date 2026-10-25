# e_duty_handbook 项目约定

> 每日细节见同目录 `YYYY-MM-DD.md`；函数/字段清单看代码。本文件只留跨会话长期有效的铁律。

## 环境
- 本仓 `D:/GitHub/e_duty_handbook`；重心在 `D:/GitHub/All-js-project`（V5-dispatch 后端 5183 + flight-dispatch-system 前端 5173）。`HJW-AMD-PRP` 旧路径已失效。
- 强制 **pnpm**。改前端热更新生效；改 server 由用户自己重启（别杀端口）。用户自己在 Chrome 实测，预览用 `present_files` 开 localhost。
- ⚠️ PowerShell 工具 stdout 不回传 → 重定向到文件再读（`*>` 默认 UTF-16 要转 utf8）；pnpm/vite 往 stderr 写进度条被记成 `NativeCommandError` + exit 1，**不是失败**，以 `✓ built in` 为准。
- 验证：前端 `pnpm run build` + `pnpm exec eslint <文件>`；后端 `node --check`。探针写仓库内用完即删。
- ⚠️ `Cannot find module @rollup/rollup-win32-x64-msvc` = node_modules 坏了 → 仓库根 `pnpm install --force`，**之后必须重启 `pnpm dev`**。
- 跑 store 逻辑探针：`npx vite build --ssr <entry> --outDir _tmp_dist` 再 node；node 里要同时造 `globalThis.localStorage` 和 `globalThis.window = globalThis`（**shim 必须放单独一个先 import 的模块** —— zustand persist 建 store 时就要读 localStorage）。
- 🔴 连 store→api→axios 全链路探针时改**实例**的 `http.defaults.adapter`（`axios.create()` 已把 defaults 拷走，改 `axios.defaults` 无效）；⚠️ **自定义 adapter 必须自己对非 2xx throw**（axios 只在自带 adapter 调 `settle()`）。

## V5-dispatch（后端 5183，Express + Prisma 7 + PG）
- 模型名=表名、字段名=列名，**不加 `@@map`/`@map`**，不驼峰转换。service 要**直白**：不要配置表/映射表/通用 helper；改删用 `updateMany`/`deleteMany` + 判 `count`。
- `source === 表名 === delegate 名`：只认 `fips`/`ecyilang`/`manual_fips`；前两个只读（写 405），`manual_fips`/`checklist`/`special`/`user_login_log` 全 CRUD；GET fips 缺 source → 400。接口索引 `test/all_http.txt`。
- **`user_login_log` + `/api/user-log`**（5 端点）：`id` 自增 / `username` / `login_time` timestamptz `@default(now())` / `logout_time` 可空（空 = 这场还开着）。🔴 **刻意没有 PUT/PATCH**（时间列不让客户端改）；🔴 **登出原子**：`updateMany({where:{id, logout_time:null}})` 判 count，重复登出 → 409。
- 时间：ecyilang `*_time`/`*_flight_date` 无时区 → `dayjs.utc()`（`wall*`）；`records_*` created_at timestamptz → `tz('Asia/Shanghai')`（`cn*`）；fips/manual_fips 时间列 varchar 原样透传。日期 where **只在 `utils/date.js`** 生成。
- 🔴 铁律：① **写操作不带 `include`**（只 `select:{id:true}`，否则 Prisma7+pg 报 `already executing a query`），写完单查补关联；② 删父行先删子行，`$transaction([子,父])`；③ 唯一性交 DB UNIQUE：P2002 → 全局中间件翻 409，service 不查重不 try/catch。
- 改表名/列名**绝不 `db push`** → migrate + 手写 `ALTER ... RENAME`。
- `source=ecyilang` **只在 `utils/ecyilangToFips.js` 翻一次**：一行快照 = 一离一进两腿 → 出 0~2 行；`id = ${uuid}:${leg}`（**按腿唯一**）；本场离港补 `origin_station`、进港补 `dest_station` + `landing_station='ZHEC'`；时间走 `wallMinute`（不带秒）。`total` = 腿数。
- 🔴 ecyilang 是**一批导入的计划快照**：`?date=` 查不到先怀疑没导新快照。⛔ list **不要快照回退**；查不到就 `total:0`、无 `dataDate`。
- **灌数据**（`db_seed/`）：`db_seed.js` 整目录重灌；`addNewEcyilangToDb.js` 灌指定快照（命令行参数、可传多个、后者覆盖前者同一天）。换算**共用 `ecyilangRow.js`**。🔴 4 个 `*_name_iata/icao_code` 是**导入时回填** → 补码表必须重导；快照行不带 id（`gen_random_uuid()`）→ 重导换新 uuid。🔴 **快照 JSON 是 `{msg, code, data:[...], count}` 包装，读时取 `j.data ?? j.rows ?? j`**。
- **航班监控**（`monitorService.js` + `/api/monitor/*`）：每天 00:01 拉当日计划按 db_seed 同口径灌进 ecyilang（先删当天旧行再插）→ 每 N 分钟增量比对 → SSE 通知。
  🔴 **没有自己的表**：比对基准 = 内存 map（`hash(flightReadableId)→{uuid,norm,…}`），变更流水写 `ecyilang.changelog`，重启 `rebuildFromDb()` 从库重建（日期列是 Date，算键用 wallDay）。
  🔴 **flightReadableId** = `a_flight_date|a_flight_no_full|a_name|d_flight_date|d_flight_no_full|d_name`，**任务性质代码刻意不进键**（空补 H/Z 会换键）。
  三态：新增（插）/ 减少（删行+点名）/ 变更（新值写列 + changelog 追加 + 通知带新旧值）。
  🔴 **比对口径统一成库口径**：map 存归一化值（时间→toISOString()），changelog 展示用 wallMinute。
  🔴 **两道防误报**：本轮无当天数据跳过 / 比上轮少超 `MONITOR_DROP_RATIO_LIMIT`(0.5) 跳过。
  通知 SSE（`GET /api/monitor/stream`）+ 内存 200 条（`/api/monitor/events`）；启动 `ensureBaseline()` 优先从库重建。
- **必须能整目录复制到服务器独立跑**：⛔ 不写 `catalog:prisma` → `@prisma/*` 写死 `7.3.0`；`engines.node` = `^20.19 || ^22.12 || >=24.0`；有 `postinstall`。🔴 `.env` 必须跟着走；🔴 必须 `tsx server.js`；⛔ 服务器上**不要** `prisma migrate deploy`，建表用 sql。改 package.json 后 `pnpm install --lockfile-only`。
- 🔴 **日志分级**（2026-10-18 起）：`config.logLevel`（`LOG_LEVEL`，`error<warn<info`，默认 info）。`monitorService` 的 log/warn/error 三封装受它控；`server.js` 的 morgan 仅非 production 挂；已删启动时 PG_* 连接信息打印。生产设 `LOG_LEVEL=warn`。

## flight-dispatch-system（前端，Vite + React + zustand + Tailwind）
- 🔴 **只有一个工具目录 `src/utils/`**（`src/lib/` 已并入）：`cn.js`（cn = clsx+twMerge）、`cache.js`（IndexedDB 薄封装：draft/image get/put/delete + `getAllDrafts`）。**每个导出函数都写 `@usedBy` 清单**，清理/改签名看注释。
- `src/api/` 一资源一文件，严格对齐 `test/all_http.txt`（`checklist.js`/`special.js`/`setting.js`/`fips.js`/`userLog.js`）。🔴 **source 只在 `api/http.js` 拦截器拼**：GET fips 注入、DELETE 强制 `WRITABLE_FLIGHT_SOURCE`、POST/PUT 剔除；`/api/checklist` 无 source。source 缓存读写在 `utils/flightSource.js`（键 `flight-dispatch:source`，非法 → `ecyilang`）；正源 = app.store 的 `source`。
- 🔴 **模板标识 ⇄ 中文类型名**（`config/dataSource.js` = 唯一真源）：`TemplateChooseSetting` / `TEMPLATE_KEY_BY_TYPE` / `TEMPLATE_TYPE_BY_KEY` / `templateKeyOf()`（认不出或数字开头 → 默认 `cargoBypassFlight`）。⚠️ `Editor.jsx` 与 `ChecklistViewer.jsx` 的 `TEMPLATE_BY_TYPE` **必须逐字一致**。默认兜底 `cargoBypassFlight` = `TYPE_ORDER[0]`。
- 🔴 **URL `?template=<标识>` ⇄ store.templateType（中文名）**，★ 跟着 URL 走（组件不重挂载只认首帧会错）。只单向 URL→store，之后 store→URL（`TemplateChooseDropdown` 改 query 并**保留其它 query**）。
- 🔴 **`store/fips.store.js` 是航班页唯一 store**：`rows` = 原始行；`flights`/`depFlights`/`arrFlights` = 可直接渲染数组（已过滤+按表头 order 排序）。⚠️ 反查航班行读 `rows`。
- 🔴 **表头 = 三对象 + 视图三态**：`allHeader`/`depHeader`/`arrHeader` + `viewMode`（`all`/`in-left`/`out-left`）。每个 = `{ source, columns }`，一条列 = `{ keyName, title, tooltip, order, isHide }`；★ columns 顺序 = 列顺序；`toggleSort` 循环 default→asc→desc→default，排序状态跟表头落盘。🔴 列显隐/顺序**只在设置页「航班表」改**，即点落盘。persist `version:4`；viewMode/数据/过滤不落盘。设置页改动动作直接改三个持久化值（`withHeader` 一次 set 写回表头+重算三表）。
- **日期筛选归 fips.store**：`fetchFlights()` 无入参，内部读 app.store 的 `dateFilterParamsOf` 拼 query；重拉由**页面** effect `[fetchFlights, source, dateKey]` 触发。
- 🔴 **`config/fipsHeaders.js` = 三套表头默认值（逐条枚举，不用 `.filter()` 派生）**：`ALL_HEADER`/`DEP_HEADER`/`ARR_HEADER`（source:"fips"，与 manual_fips 共用）+ `ECYILANG_ALL_HEADER`（只做配置、没接渲染）。时间列 tooltip 取 `shortCutTooltip("sobt")`（长文案真源在 `utils/shortCutFullNameTooltip.js`）。`buildHeaders(默认, 已存columns)` = 以 config 为准 + 套用用户顺序/显隐/排序。
- 生鲜标记走 `specialStore`：无则 POST 有则 PUT，字段 `nodes`。🔴 **必须带 `flightId`**（真 uuid）。
- **双表渲染只有一套**：FipsPage `renderTable(view)`/`renderPanel(view)`，空状态 `renderEmpty`。
- 🔴 **原始快照表（ecyilang）只有一条纯函数**：`pages/FipsPage/stateToWhichCell.js` 的 `cellsOf(row)` 一次返回 `{ a, d }` 两腿各 14 格。`RawEcyilangTable.jsx` 里「到/离」两行手写穷举（`<Fragment>`），只有列走 `COLUMNS.map`。整腿为空 → 该腿 14 格全 null（渲染「-」）。
- 🔴 **行操作归 `sidebar.store.js`**：`selectedFlight`（整行对象）/ `setSelectedFlight` / `clearSelection` + `addOpen`/`editing`/`openAdd`/`openEdit`/`closeDialog` + `addFlight`/`updateFlight`/`removeFlight` + `removeSelected`/`markSelectedFresh`/`unmarkSelectedFresh`。**单向依赖 sidebar → fips**（刷新调 `useFipsStore.getState().fetchFlights()`）。`Sidebar.jsx` 零 props，两组按钮：选中航班组（任何源）/ 写航班表组（**只有 `manual_fips` 渲染**）。表格无「操作」列。
- 设置页 `/setting`：`settingStore` 按 `kind` 分 `rowsByKind`/`keywordByKind`。🔴 码表列 `key` **必须 = 后端字段名 = 原始列名**。
- **切换用户** `components/SwitchUserDialog.jsx` **自包含**（花名册 `USERS` 在文件顶部），确认走 `window.confirm`。
  🔴 **切人 = `app.store.logout()` 再 `login(新人)`**，顺序不能反。🔴 **`app.store.loginLogId` = 这场登录在 `user_login_log` 的行 id，必须随 persist 落 localStorage**（丢了就盖不上 logout_time）。
  `login()` 失败抛；`logout()` 没开场 return null、失败抛且**不清会话**。★ 台账写不进不拦人 → 弹窗两步各自 try/catch，失败 `console.warn` + `setCurrentUser` 兜底；只有显式登出失败才 `window.alert`。弹窗开关状态只住 DOM 的 `el.open`。
- 🔴 **弹窗一律原生 `<dialog>` + `showModal()`**，开关状态住 DOM（`el.open`）。坑：① 已开再 `showModal()` 抛错 → 先判 `!el.open`；② 必须写 `open:flex`（作者样式 `display` 会盖掉 UA 隐藏）；`::backdrop` 用 `backdrop:bg-slate-900/50`。

### 检查单四份 store（别混）
- **会话态** `checklistEditorPage.store.js`：`editingFlight()`（现读 sidebar.store 的 `selectedFlight`）/ `templateType`（中文名）/ **三列显隐** `mainColVisible`+`auxColVisible`+`videoColVisible`（★唯一真源，`panels` 派生）/ `thumbVisible`/`selectedCheckNode`。导出 `TYPE_ORDER`。
  🔴 **三个填写面板（MainList/AuxiliaryList/VideoList）零 props**：`flightUuid`+`setTemplateType` 走 `draftStateOf(flightUuid, type)` 一次算 `templateType`+`templateKey`+`draftKey`+`mains`+`videoGroups`。导出 `templateOf(type)`/`videoFocusOf(type)`（全前端唯一「类型名→模板/视频监管」映射）。`selectedMainNode` 初值 `null`。
- **填写正文** `cache.store.js`：按不透明 key 存 IndexedDB（走 `utils/cache.js`），**不自己拼 key**。按前缀批处理 `hasLocalData`/`clearByPrefix`/`collectByPrefix`。记录 `{ uuid, state, time, note, images }`。
- **草稿箱索引** `checklistDraft.store.js`：真源 localStorage（`current()` 现读）。`createDraft` **先复用已存在再判上限**（满返 `{ok:false,reason:'full'}`）；`dropDraftWithData` = **先 `clearByPrefix` 再删索引**；`switchTemplate` 三分支：已在不动 / 不在没满建新留旧 / 不在已满静默删旧再建；`submitDraft` 后端未接线。
- **查看页会话态** `checklistViewer.store.js`：`record`/`loading`/`error`/`mode`/`saving`/`keyPrefix`/`locked` + `load`/`enterEdit`/`cancelEdit`/`save`。`load` 打回 view；`save` 失败抛不清 mode；`locked` = 创建超 24h，`enterEdit` 被拦。
- 🔴 **检查单工具栏在 `ChecklistPage/ChecklistToolbar/`**：`ChecklistToolbar.jsx` 只做路由分流（有 recordId → 查看 `<ViewerToolbar/>`，否则 `<EditorToolbar/>`），调用方零 props。
- 🔴 **查看页三栏由 `Viewer/Components/ViewXXXList.jsx` 自己维持**（双态）：view → `ViewItem` 读 `itemMap`；edit → 复用 Editor 单卡片，数据走 cache.store。查看页辅助列不跟选中主项，全铺开。
- 🔴 **三层键（`utils/checklistCache.js`，分隔 `::`）**：草稿键 = `航班uuid::模板标识`（MAX_DRAFTS=5）；填写项键 = 草稿键::节点uuid（**必须带草稿前缀**）。查看/修改页是另一套前缀 `record-<id>::`。
- **检查单静态数据在 `ChecklistPage/Const/*.js`**，`Const/index.js` 只 `export *` 转发。`records_checklist.id` 是**整数自增主键**。
- 🔴 **页面高度定高**：`MainPageLayout(min-h-screen) → ContentLayout(h-[calc(100vh-90px)] overflow-hidden) → 右内容(flex-1 min-h-0)`。**任何 `flex-1` 行容器都要自己写 `min-h-0`**，否则不滚动被裁。

## user 表与检查人（2026-10-18 起）
- `user` 表 {id, name UNIQUE, telephone}：**id 0..39 与前端 SwitchUserDialog 花名册同序同人**（telephone 全 18064010604）。`/api/user` 全 CRUD；删除被引用 → P2003 → 409。
- `records_checklist.inspector_id` / `records_special.inspector_id` = FK→user；读带 `include:{inspector:true}`；写 body 收 `inspectorId`，校验走 `userService.inspectorIdOf`（没传不改 / null 清空 / 不存在 400）。
- `user_login_log.user_id` FK：create 按 username 现解析，**对不上留空照记**；username 列保留（历史流水）。
