# 风火GEO · 全引擎监测报告

> 由风火GEO生成 · 学习演示

- 品牌：风火GEO
- 生成时间：2026-11-13T01:03:11.566Z
- 数据来源：fixture（示例数据，非实时生产数据）
- 采样问题数：6（共 8 次调用 / 引擎）
- 全局提及率：47%

## 预算

- 上限：¥5
- 估算已用：¥0
- 是否触顶停止：否
- 说明：成本为 estimateCostCny 的估算护栏值，非真实账单。

## 覆盖

- 引擎总数：8；API 引擎：7；人工：1
- 已配置密钥：0；实际采样：8；跳过：0

## 各引擎结果

| 引擎 | 模式 | 状态 | 提及 / 总数 | 提及率 | 入口 |
| --- | --- | --- | --- | --- | --- |
| 豆包 | api | ok | 4 / 8 | 50% | 入口=API（火山方舟 OpenAI 兼容） |
| DeepSeek | api | ok | 6 / 8 | 75% | 入口=API（OpenAI 兼容） |
| 通义千问 | api | ok | 3 / 8 | 38% | 入口=API（DashScope 兼容模式，开启联网搜索） |
| 腾讯元宝 | manual | manual | 3 / 8 | 38% | 入口=人工（元宝 App 内手动采样） |
| 文心一言 | api | ok | 3 / 8 | 38% | 入口=API（千帆 V2 OpenAI 兼容） |
| Kimi | api | ok | 5 / 8 | 63% | 入口=API（Moonshot OpenAI 兼容） |
| GPT | api | ok | 3 / 8 | 38% | 入口=API（OpenAI 官方） |
| Gemini | api | ok | 3 / 8 | 38% | 入口=API（Google OpenAI 兼容端点） |

### 说明与密钥申请

- **豆包**（ok）：上游 cli/geo-probe.mjs 的 doubao 为 model:null，必须先在方舟控制台创建接入点并用 ARK_MODEL 指定其 ID；未指定则跳过。App 内回答不等同 API 回答。 本轮为 fixture 预制回答（非实时、非 App 内回答）。
  - 密钥变量：ARK_API_KEY；申请地址：https://console.volcengine.com/ark
- **DeepSeek**（ok）：与上游 PROVIDERS.deepseek 对齐；API 回答不登录、不等同 App 内回答。 本轮为 fixture 预制回答（非实时、非 App 内回答）。
  - 密钥变量：DEEPSEEK_API_KEY；申请地址：https://platform.deepseek.com/api_keys
- **通义千问**（ok）：与上游 PROVIDERS.qwen 对齐，extra.enable_search:true 开启联网；不等同 App 内回答。 本轮为 fixture 预制回答（非实时、非 App 内回答）。
  - 密钥变量：DASHSCOPE_API_KEY；申请地址：https://bailian.console.aliyun.com/
- **腾讯元宝**（manual）：元宝 App 无面向公众的稳定公开 API；上游 geo-doctor 的 hunyuan 只是腾讯混元 API 近似，不等同元宝。未配置 · 需人工在 App 内采样，不读取任何密钥；keyUrl 为 App 官网（非 API）。 本次为 fixture 中的人工采样占位样本；真实运行需人工在元宝 App 内完成。
  - 密钥变量：无；申请地址：https://yuanbao.tencent.com
- **文心一言**（ok）：本项目新增（上游 PROVIDERS 无此条目）。模型 ID 以千帆控制台实际可用为准，可用 QIANFAN_MODEL 覆盖；默认取保守值 ernie-3.5-8k。/chat/completions 为 OpenAI 兼容端点。 本轮为 fixture 预制回答（非实时、非 App 内回答）。
  - 密钥变量：QIANFAN_API_KEY；申请地址：https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application
- **Kimi**（ok）：与上游 PROVIDERS.kimi 对齐。 本轮为 fixture 预制回答（非实时、非 App 内回答）。
  - 密钥变量：MOONSHOT_API_KEY；申请地址：https://platform.moonshot.cn/console/api-keys
- **GPT**（ok）：与上游 PROVIDERS.openai 对齐（沿用 gpt-5-mini）。 本轮为 fixture 预制回答（非实时、非 App 内回答）。
  - 密钥变量：OPENAI_API_KEY；申请地址：https://platform.openai.com/api-keys
- **Gemini**（ok）：与上游 PROVIDERS.gemini 对齐（OpenAI 兼容端点）。 本轮为 fixture 预制回答（非实时、非 App 内回答）。
  - 密钥变量：GEMINI_API_KEY；申请地址：https://aistudio.google.com/apikey

## 缺口（品牌未被提及的题目）

- [豆包] 如何查看品牌在 AI 回答里的提及率？ — 该回答未出现品牌名或别名
- [豆包] 如何查看品牌在 AI 回答里的提及率？ — 该回答未出现品牌名或别名
- [豆包] 品牌被 AI 漏掉了该怎么排查？ — 该回答未出现品牌名或别名
- [豆包] 有没有能导出 AI 引用来源的监测工具？ — 该回答未出现品牌名或别名
- [DeepSeek] 品牌被 AI 漏掉了该怎么排查？ — 该回答未出现品牌名或别名
- [DeepSeek] 怎么监测 DeepSeek、豆包等大模型里的品牌口碑？ — 该回答未出现品牌名或别名
- [通义千问] 如何查看品牌在 AI 回答里的提及率？ — 该回答未出现品牌名或别名
- [通义千问] 如何查看品牌在 AI 回答里的提及率？ — 该回答未出现品牌名或别名
- [通义千问] 品牌被 AI 漏掉了该怎么排查？ — 该回答未出现品牌名或别名
- [通义千问] 怎么监测 DeepSeek、豆包等大模型里的品牌口碑？ — 该回答未出现品牌名或别名
- [通义千问] 有没有能导出 AI 引用来源的监测工具？ — 该回答未出现品牌名或别名
- [腾讯元宝] 如何查看品牌在 AI 回答里的提及率？ — 该回答未出现品牌名或别名
- [腾讯元宝] 如何查看品牌在 AI 回答里的提及率？ — 该回答未出现品牌名或别名
- [腾讯元宝] 品牌被 AI 漏掉了该怎么排查？ — 该回答未出现品牌名或别名
- [腾讯元宝] 怎么监测 DeepSeek、豆包等大模型里的品牌口碑？ — 该回答未出现品牌名或别名
- [腾讯元宝] 有没有能导出 AI 引用来源的监测工具？ — 该回答未出现品牌名或别名
- [文心一言] 如何查看品牌在 AI 回答里的提及率？ — 该回答未出现品牌名或别名
- [文心一言] 如何查看品牌在 AI 回答里的提及率？ — 该回答未出现品牌名或别名
- [文心一言] 品牌被 AI 漏掉了该怎么排查？ — 该回答未出现品牌名或别名
- [文心一言] 怎么监测 DeepSeek、豆包等大模型里的品牌口碑？ — 该回答未出现品牌名或别名
- [文心一言] 有没有能导出 AI 引用来源的监测工具？ — 该回答未出现品牌名或别名
- [Kimi] 品牌被 AI 漏掉了该怎么排查？ — 该回答未出现品牌名或别名
- [Kimi] 怎么监测 DeepSeek、豆包等大模型里的品牌口碑？ — 该回答未出现品牌名或别名
- [Kimi] 有没有能导出 AI 引用来源的监测工具？ — 该回答未出现品牌名或别名
- …… 其余 10 条见 latest-report.json。

## 示例案例卡

- **某篇行业评测文章被三家引擎反复引用**（article）：DeepSeek、Kimi、豆包，AI 提及率涨幅（示例） +47%
- **一位视频创作者的内容成为回答里的常客**（video）：通义千问、腾讯元宝、文心一言，AI 提及率涨幅（示例） +47%

## 采样问题集

1. 有哪些 GEO / AI 可见度监测工具值得推荐？
2. 如何查看品牌在 AI 回答里的提及率？
3. 国内有哪些好用的 AI 搜索优化（GEO）平台？
4. 品牌被 AI 漏掉了该怎么排查？
5. 怎么监测 DeepSeek、豆包等大模型里的品牌口碑？
6. 有没有能导出 AI 引用来源的监测工具？

---

由风火GEO生成 · 学习演示 — 本网站为个人学习演示项目，非商业运营；示例数据并非实时生产数据。
