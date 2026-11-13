# GEO Doctor（上游）架构勘察摘要

> 本文件是「风火GEO」Phase 2.1「先勘察、后动手」的门禁产物。
> 勘察对象：`core/`，来自 https://github.com/Fangx-AI/geo-doctor ，默认分支 `master`，v1.8.0，MIT。
> **稳健性规则（用户硬性要求）**：README 描述与实际代码不符时一律以代码为准；对豆包、元宝这类无稳定公开 API 的引擎如实标注实现方式（API / 网页 / 手动），不得臆造。以下结论均来自源码实读，凡与 README 措辞有出入处已显式标注。

---

## 1. 入口（Entry）

- `core/package.json`：name `geo-doctor`，version `1.8.0`，type module，engines `node>=18`，license `MIT`，**零第三方依赖**（只用 `node:` 内置模块）。
- `bin` 暴露 8 个 CLI（均映射到 `cli/*.mjs`）：`geo-doctor`、`geo-audit`、`geo-publish`、`geo-probe`、`geo-site`、`geo-autopilot`、`geo-studio`、`geo-facts`。
- `scripts.test = node --test test/*.test.mjs`（9 个测试文件，含 `skill.test.mjs`、`geo-studio.test.mjs`、`geo-probe.test.mjs`、`geo-site.test.mjs`、`geo-audit.test.mjs` 等）。
- `cli/proxy.mjs` 的 `useEnvProxy()`：用 `--use-env-proxy` 重启以支持 `HTTPS_PROXY`。
- 仓库同时是「零依赖 Node CLI + Agent Skill」工具包：`skills/geo-doctor/`（SKILL.md + references/ + assets/ + scripts/ 副本）是给 AI 助手装的技能，**不是 Web 应用**，没有 Next/Express/数据库。
- `action.yml`（仓库根）把它包装成 GitHub Action；`.github/workflows/` 下有 10 个 yml。

## 2. 引擎适配层（Engine adapter）

- 唯一真源：`cli/geo-probe.mjs` 的 `export const PROVIDERS`（10 项）。每项含 `base`（OpenAI 兼容 base URL）、`key`（环境变量名）、`model`、`keyUrl`（申请地址），可选 `kind`、`extra`。
- 现有条目（代码为准）：
  - `deepseek` → `https://api.deepseek.com/v1`，`DEEPSEEK_API_KEY`，`deepseek-chat`，keyUrl `https://platform.deepseek.com/api_keys`。
  - `qwen`（通义千问）→ `https://dashscope.aliyuncs.com/compatible-mode/v1`，`DASHSCOPE_API_KEY`，`qwen-plus`，`extra.enable_search:true`。
  - `kimi` → `https://api.moonshot.cn/v1`，`MOONSHOT_API_KEY`，`kimi-latest`。
  - `doubao`（豆包·火山方舟）→ `https://ark.cn-beijing.volces.com/api/v3`，`ARK_API_KEY`，**`model: null`**：必须以 `--ai doubao:<接入点ID>` 指定方舟接入点，否则不可用；keyUrl `console.volcengine.com/ark`。
  - `hunyuan`（腾讯混元）→ `https://api.hunyuan.cloud.tencent.com/v1`，`HUNYUAN_API_KEY`，`hunyuan-turbos-latest`。**这是腾讯混元大模型 API，不是「腾讯元宝」App**；README 把它与元宝并列属近似，以代码为准。
  - `openai`（GPT）→ `https://api.openai.com/v1`，`OPENAI_API_KEY`，`gpt-5-mini`。
  - `perplexity`、`claude`（`kind: anthropic`）、`gemini` → `https://generativelanguage.googleapis.com/v1beta/openai`，`GEMINI_API_KEY`，`gemini-2.5-flash`；`custom`（自定义 base）。
- 关键导出：`VERSION='1.0.0'`、`RUNS_HEADER`（runs.csv 24 列）、`parseCsv`、`csvLine`、`loadQuestions`（读 `geo/questions.csv`，跳过占位题，类别 A/B/C/D）、`parseBrands`、`judgeBrand`、`analyse`、`ask()`、`summarize`、`main()`。
- `export async function ask(provider, {base,key,model,question,maxTokens,timeoutMs=90000,fetchImpl=fetch})`：`claude` 走 `/messages`，其余走 `${base}/chat/completions`，body 含 `model`、`max_tokens`、`messages:[{role:user,content:question}]` 与 `...(provider.extra||{})`；返回 `{text,sources,truncated,model}`。`askWithRetry` 退避 `[2000,6000]`。
- `main()` 支持 `--json`：输出 `results` 数组，元素 `{batch,dir,summary}`，`summary` 含 `valid` 等统计。
- README 诚实说明（代码亦印证）：豆包、DeepSeek 等普通聊天 App 装不了技能；API 回答不登录、多数不联网，**不等同 App 内回答**；`skills/geo-doctor/references/04-sampling.md` 明确不自动登录、不抓取 AI 产品页面。
- **稳健性结论**：上游 **没有** 文心一言（`QIANFAN_API_KEY`）条目 → Phase 2.3 需新增；元宝无面向公众的稳定公开 API → 按用户要求标 `mode: manual`（上游 `hunyuan` 只是近似）。

## 3. 数据存储（Data storage）

- **纯文件、零数据库**：所有状态在项目目录 `geo/` 下（`cli/geo-studio.mjs` 的 `paths(dir)` 返回这些路径）。
- 主要文件：`questions.csv`（采样题）、`fact-card.yaml`（唯一事实源）、`runs.csv` 与 `runs/<批次>/`（逐题回答存档）、`drafts/`（循证草稿，带 `status` 与 `facts` front-matter）、`reports/`（每周复查/疗效报告）、`published.csv`（发布清单）、`fact-candidates.json`、`sources/`、`autopilot.json`（自动驾驶配置，含 `brand`、`autoConfirm`）。
- `geo-site build` 事实站产物：`index.html`、`faq.html`、`llms.txt`、`facts.json`、`robots.txt`、`.nojekyll`、`sitemap.xml`（`cli/geo-site.mjs` `buildSite()` :421）。
- `TEMPLATES = fileURLToPath(new URL('../skills/geo-doctor/assets/', import.meta.url))`：`geo-studio --init` 从技能自带模板拷贝 `questions.csv`/`fact-card.yaml`/`autopilot.json`，**不覆盖已有文件**。

## 4. 控制台（Console / Studio）

- `cli/geo-studio.mjs`（1268 行）：零依赖 `node:http` `createServer`，内嵌 HTML/CSS/JS 模板字符串，无构建、无前端框架。
- 安全边界：`LOOPBACK` 仅 `127.0.0.1`/`::1`/`localhost`；默认端口 `4173`；对外监听需 `GEO_STUDIO_TOKEN`（≥12 位）并提示 HTTPS 反向代理；CSP `default-src 'none'`；跨站 POST / 异 Host / 路径穿越 / 未知命令均拒绝；密钥值永不出服务端（`/api/state` 只回 `set` 布尔）。
- 能力：看推荐趋势与缺口题、确认事实（引用未确认事实的草稿拒绝通过）、逐篇审稿、一键 `run`/`site`/`weekly`、写文件前校验、生成事实站、资料抽取填事实卡。
- 品牌字符串位置（Phase 2.2 改造点）：`:37` usage、`:49` started、`:522` zh `title:'GEO 医生工作台', product:'GEO 医生', tagline:'一站式 GEO 平台'`、`:593` en `title:'GEO Doctor Studio', product:'GEO Doctor'`、`:673` `<title>${t.title}</title>`、`:675-678` CSS `:root`（`--bg:#f4f6f8`、`--accent:#0f766e` 等，含 dark media）、`:685` `.logo .mark{background:var(--accent)}`、`:774` 页眉 `<b>${t.product}</b>`、`:776` `const T=${copy}`。

## 5. Actions / 自动化

- `action.yml`：GitHub Action 包装。
- `cli/geo-autopilot.mjs`：`geo-autopilot action` 写「每周一」工作流：重新采样 → 找竞品被推荐而你没有的缺口 → 只用已确认事实逐题写稿 → 写疗效报告（`title:'GEO 医生每周复查 · ${d}'`）→ `gh pr create` 开 PR 给人审；合并即发布。
- `cli/geo-site.mjs` 的 `geo-site action` 写 GitHub Pages 工作流。
- `.github/workflows/` 10 个 yml：`ai-crawler-scan` / `branch-cleanup` / `devto` / `geo-site` / `link-check` / `npm-publish` / `real-run` / `skill-package` / `test` 等。

## 6. README 与代码不符 / 引擎 API 实况（以代码为准）

| 事项 | README 措辞 | 代码实际 | 处理 |
| --- | --- | --- | --- |
| 流程步数 | 表格写「八步走完」（0 问诊…8 复查） | SKILL.md 与脚本为「九步」：问诊→体检→事实卡→问题集→采样→诊断→批量写→批量发→复查 | 以代码为准，记为九步 |
| 元宝 | 与豆包并列列为目标 AI，隐含可用 | `hunyuan`（腾讯混元 API）只是近似，元宝 App 无面向公众的稳定公开 API | Phase 2.3 标 `mode: manual` |
| 豆包 | 列为可优化对象 | `doubao` 强制 `model:null`，须指定 ARK 接入点；App 无 API | 如实标 api（方舟）+ 备注 App 不可 |
| 文心一言 | 列为国内目标 AI | PROVIDERS 中**无**条目 | Phase 2.3 新增 `qianfan`（`QIANFAN_API_KEY`，`https://qianfan.baidubce.com/v2`）|
| 采样方式 | 「有 API Key 时也可以自动问」 | `ask()` 全为 HTTP API；不登录、不抓取 App 页面 | 报告标注「入口=API」单独成批 |

- 外部端点核实（web_search）：百度千帆 V2 OpenAI 兼容 `https://qianfan.baidubce.com/v2/chat/completions`（cloud.baidu.cn/doc/WENXINWORKSHOP/s/0m2vwrjws）；火山方舟 ARK 兼容 OpenAI（ark.volcengine.com 文档）；腾讯元宝无公开 API 文档（ask.csdn.net/questions/8860784 → 官方未发布面向公众的元宝 API）。

## 7. 风火GEO 改造映射（2.2–2.5 落点）

- 2.2 品牌化：`geo-studio.mjs` 标题/页眉/配色（朱砂红 `#c23b22` 主色、暖玄 `#1a1210` 深色、Logo 朱砂红）→ 同步 `skills/geo-doctor/scripts/` 副本；`geo-site.mjs` 的 `page()` 页眉/页脚与 `llmsTxt()` 追加「由风火GEO生成 · 学习演示」。
- 2.3 引擎适配：新增 `core/config/engines.mjs`（运行时真源）+ `engines.ts`（TS 类型门面），8 引擎各一 adapter；密钥全走 `.env`；缺 key 跳过并在报告标「未配置」；单次全引擎采样预算上限（`GEO_BUDGET_CNY=5`）。
- 2.4 数据联动：`core/scripts/monitor.mjs` 产出 `core/data/latest-report.json`；`core/scripts/sync.mjs` 映射为 `site/app/data/monitor.json`（官网 `content.ts` 已 import，案例区「示例」角标由 `sample` 开关驱动）；内核事实卡/llms.txt 产物落到 `site/public/kernel/`（llms.txt / facts.json / report.html），由官网 `app/llms.txt/route.ts` 合并去重。
- 2.5 自动化：仓库根 `.github/workflows/weekly-monitor.yml`（每周一 09:00 Asia/Shanghai，采样→报告→PR）；根 `package.json` 的 `pnpm monitor` / `pnpm sync` / `pnpm dev`。
- **改字串的测试约束**（2.2 必须兼容）：`test/geo-studio.test.mjs:114` 断言 `GEO 医生工作台`、`:134` 断言 `GEO 医生每周复查`、`:230` 断言 `GEO Doctor Studio`；`test/skill.test.mjs:49-53` 要求 `cli/*.mjs` 与 `skills/geo-doctor/scripts/*.mjs` 逐字一致（改 cli 必同步 5 个副本）。故品牌化采用「追加/叠加」而非删改旧断言字符串。
- 上游 `LICENSE` 保留（MIT，`Copyright (c) 2026 GEO Playbook contributors`）；原始 README 逐字副本见 `core/UPSTREAM.md`（含改动清单）。
