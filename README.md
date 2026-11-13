# 风火GEO · fenghuo-geo

**别让 AI 漏掉你的品牌** —— 官网门面 + GEO 监测内核 monorepo。
运营主体：Point（个人独立开发者）。**本仓库为个人学习演示项目，非商业运营。**

- `site/` —— 风火GEO 营销官网：Next.js 15 App Router + TypeScript + Tailwind CSS v4 单页站，含完整 GEO/SEO 基建（metadata / OG / JSON-LD / robots / sitemap / RSS / llms.txt）
- `core/` —— 监测内核：基于开源 [GEO Doctor](https://github.com/Fangx-AI/geo-doctor)（MIT）最小侵入改造，控制台与报告品牌化为「风火GEO」

## 快速开始

```bash
pnpm install          # 根目录执行（pnpm workspace：site/ + core/）

pnpm dev              # 官网开发预览（http://localhost:3000）
pnpm build            # 官网生产构建（自动探测受限沙箱并固定 4GB 堆，EXIT 134 已修复）
pnpm start            # 官网生产模式启动
pnpm typecheck        # 官网 TS 类型检查

pnpm monitor          # 跑一次全引擎监测（无任何密钥时自动走 fixture 示例数据）
pnpm sync             # 把监测报告映射为官网数据 + 内核产物
pnpm monitor:sync     # 监测 → 同步 一条龙

pnpm core:test        # 内核测试（node --test，138 项）

node core/cli/geo-studio.mjs   # 本地网页后台（风火GEO · geo-studio 控制台）
```

## 密钥配置（全部可选）

复制 `.env.example` 为 `.env`，按需填写；**缺哪个引擎的密钥就跳过哪个**，报告标注「未配置」，不会中断。一个密钥都没有时自动用 fixture 示例数据跑通全链路。

### 每引擎 API 获取地址一览表

| 引擎 | 模式 | 密钥变量 | 申请地址 | 默认模型 | 说明 |
|---|---|---|---|---|---|
| 豆包 | API | `ARK_API_KEY`（+ `ARK_MODEL`） | https://console.volcengine.com/ark | 需在方舟控制台创建**接入点**并用 `ARK_MODEL` 指定其 ID | 火山方舟 OpenAI 兼容端点；App 内回答 ≠ API 回答 |
| DeepSeek | API | `DEEPSEEK_API_KEY` | https://platform.deepseek.com/api_keys | `deepseek-chat` | **成本最低，建议第一个配它跑真实采样** |
| 通义千问 | API | `DASHSCOPE_API_KEY` | https://bailian.console.aliyun.com/ | `qwen-plus`（联网搜索开） | 阿里云百炼 DashScope 兼容模式 |
| 腾讯元宝 | **manual** | —（无稳定公开 API） | https://yuanbao.tencent.com | — | App 内人工采样；不读取任何密钥，如实标注 |
| 文心一言 | API | `QIANFAN_API_KEY`（+ `QIANFAN_MODEL`） | https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application | `ernie-3.5-8k` | 百度千帆 V2 OpenAI 兼容；本项目新增适配器（上游无） |
| Kimi | API | `MOONSHOT_API_KEY` | https://platform.moonshot.cn/console/api-keys | `kimi-latest` | 月之暗面 Moonshot OpenAI 兼容 |
| GPT | API | `OPENAI_API_KEY` | https://platform.openai.com/api-keys | `gpt-5-mini` | OpenAI 官方 |
| Gemini | API | `GEMINI_API_KEY` | https://aistudio.google.com/apikey | `gemini-2.5-flash` | Google OpenAI 兼容端点 |

预算护栏：`GEO_BUDGET_CNY`（默认 `5`，人民币等值 token 估算）——单次全引擎采样超限即停止并输出已采部分。
站址变量：`NEXT_PUBLIC_SITE_URL`（canonical / OG / sitemap / RSS / llms.txt 用，默认占位域名）。

## 数据流（内核 → 官网）

```
core/scripts/monitor.mjs   采样（8 引擎，预算护栏）→ core/data/latest-report.json + core/data/report.md
core/scripts/sync.mjs      映射 → site/app/data/monitor.json（官网案例区数据源，sample 开关保留「示例」标注）
                           产物 → site/public/kernel/{llms.txt, facts.json, report.html}
site/app/llms.txt/route.ts 官网 llms.txt 路由，合并 public/kernel/llms.txt（去重）
```

## 每周自动化

`.github/workflows/weekly-monitor.yml`：每周一 09:00（Asia/Shanghai，cron `0 1 * * 1` UTC）自动「采样 → 同步 → 以 PR 提交产物」（含 latest-report.json 与报告页）。密钥走 GitHub Secrets，未配置的自动跳过；全空时走 fixture，不 fail。

## 上游与许可

- `core/` 基于 Fangx-AI/geo-doctor（MIT），版权与许可保留于 `core/LICENSE`
- 改动清单：`core/UPSTREAM.md`（MIT 要求保留上游声明）
- 架构摘要（入口 / 引擎适配层 / 数据存储 / 控制台 / Actions）：`core/ARCHITECTURE-NOTES.md`
- 所有生成报告页眉页脚带「由风火GEO生成 · 学习演示」

## 目录速览

```
fenghuo-geo/
├─ site/                官网（app/ components/ lib/ public/kernel/）
├─ core/                监测内核（cli/ config/ scripts/ test/ fixtures/ docs/ skills/）
├─ scripts/             跨包脚本（run-site / make-og / verify-phase1）
├─ .github/workflows/   weekly-monitor.yml（每周自动监测 → PR）
├─ .env.example         密钥与预算变量模板
└─ pnpm-workspace.yaml
```
