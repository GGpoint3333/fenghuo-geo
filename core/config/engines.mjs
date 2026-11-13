import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NL = String.fromCharCode(10);

const HERE = path.dirname(fileURLToPath(import.meta.url));
/** 项目根（fenghuo-geo/）：core/config -> core -> 根 */
export const PROJECT_ROOT = path.resolve(HERE, '..', '..');

/**
 * 8 引擎统一 adapter 配置 —— 运行时真源，零第三方依赖。
 * 与上游 cli/geo-probe.mjs 的 PROVIDERS 字段语义一致（但不 import 上游，保持可独立运行）。
 * 元宝为 manual（无稳定公开 API）；千帆为本项目新增（上游无此条目）。
 */
export const ENGINES = [
  {
    id: 'doubao',
    name: '豆包',
    mode: 'api',
    envKey: 'ARK_API_KEY',
    base: 'https://ark.cn-beijing.volces.com/api/v3',
    model: null,
    modelEnv: 'ARK_MODEL',
    keyUrl: 'https://console.volcengine.com/ark',
    upstream: true,
    entry: '入口=API（火山方舟 OpenAI 兼容）',
    note: '上游 cli/geo-probe.mjs 的 doubao 为 model:null，必须先在方舟控制台创建接入点并用 ARK_MODEL 指定其 ID；未指定则跳过。App 内回答不等同 API 回答。',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    mode: 'api',
    envKey: 'DEEPSEEK_API_KEY',
    base: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    keyUrl: 'https://platform.deepseek.com/api_keys',
    upstream: true,
    entry: '入口=API（OpenAI 兼容）',
    note: '与上游 PROVIDERS.deepseek 对齐；API 回答不登录、不等同 App 内回答。',
  },
  {
    id: 'qwen',
    name: '通义千问',
    mode: 'api',
    envKey: 'DASHSCOPE_API_KEY',
    base: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
    extra: { enable_search: true },
    keyUrl: 'https://bailian.console.aliyun.com/',
    upstream: true,
    entry: '入口=API（DashScope 兼容模式，开启联网搜索）',
    note: '与上游 PROVIDERS.qwen 对齐，extra.enable_search:true 开启联网；不等同 App 内回答。',
  },
  {
    id: 'yuanbao',
    name: '腾讯元宝',
    mode: 'manual',
    envKey: null,
    base: null,
    model: null,
    keyUrl: 'https://yuanbao.tencent.com',
    upstream: false,
    entry: '入口=人工（元宝 App 内手动采样）',
    note: '元宝 App 无面向公众的稳定公开 API；上游 geo-doctor 的 hunyuan 只是腾讯混元 API 近似，不等同元宝。未配置 · 需人工在 App 内采样，不读取任何密钥；keyUrl 为 App 官网（非 API）。',
  },
  {
    id: 'qianfan',
    name: '文心一言',
    mode: 'api',
    envKey: 'QIANFAN_API_KEY',
    base: 'https://qianfan.baidubce.com/v2',
    model: 'ernie-3.5-8k',
    modelEnv: 'QIANFAN_MODEL',
    keyUrl: 'https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application',
    upstream: false,
    entry: '入口=API（千帆 V2 OpenAI 兼容）',
    note: '本项目新增（上游 PROVIDERS 无此条目）。模型 ID 以千帆控制台实际可用为准，可用 QIANFAN_MODEL 覆盖；默认取保守值 ernie-3.5-8k。/chat/completions 为 OpenAI 兼容端点。',
  },
  {
    id: 'kimi',
    name: 'Kimi',
    mode: 'api',
    envKey: 'MOONSHOT_API_KEY',
    base: 'https://api.moonshot.cn/v1',
    model: 'kimi-latest',
    keyUrl: 'https://platform.moonshot.cn/console/api-keys',
    upstream: true,
    entry: '入口=API（Moonshot OpenAI 兼容）',
    note: '与上游 PROVIDERS.kimi 对齐。',
  },
  {
    id: 'openai',
    name: 'GPT',
    mode: 'api',
    envKey: 'OPENAI_API_KEY',
    base: 'https://api.openai.com/v1',
    model: 'gpt-5-mini',
    keyUrl: 'https://platform.openai.com/api-keys',
    upstream: true,
    entry: '入口=API（OpenAI 官方）',
    note: '与上游 PROVIDERS.openai 对齐（沿用 gpt-5-mini）。',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    mode: 'api',
    envKey: 'GEMINI_API_KEY',
    base: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-2.5-flash',
    keyUrl: 'https://aistudio.google.com/apikey',
    upstream: true,
    entry: '入口=API（Google OpenAI 兼容端点）',
    note: '与上游 PROVIDERS.gemini 对齐（OpenAI 兼容端点）。',
  },
];

/** 单次全引擎采样预算上限（人民币等值 token 估算），默认 ¥5。 */
export const BUDGET_LIMIT_CNY = (() => {
  const n = Number(process.env.GEO_BUDGET_CNY);
  return Number.isFinite(n) && n > 0 ? n : 5;
})();

/** 每次调用的估算单价（元），仅用于预算护栏，非真实账单。 */
const COST_PER_CALL_CNY = {
  doubao: 0.02,
  deepseek: 0.01,
  qwen: 0.02,
  qianfan: 0.02,
  kimi: 0.02,
  openai: 0.03,
  gemini: 0.01,
  yuanbao: 0,
};

/** 估算某引擎调用若干次的人民币成本。 */
export function estimateCostCny(engine, calls = 1) {
  const c = Math.max(0, Number(calls) || 0);
  const per = COST_PER_CALL_CNY[engine && engine.id] ?? 0.02;
  return Math.round(per * c * 10000) / 10000;
}

/** 解析模型：优先读 modelEnv 指定的环境变量，否则用固定 model 或默认。 */
export function resolveModel(engine, env = process.env) {
  if (engine.modelEnv && env[engine.modelEnv]) return env[engine.modelEnv];
  return engine.model || null;
}

/**
 * 自己解析项目根 .env 的 KEY=VALUE（零依赖，不用 dotenv），再叠加 process.env。
 * process.env 中非空值优先；未配置/空值由 .env 补齐；缺密钥返回空值而非报错。
 */
export function loadEnv() {
  const parsed = {};
  const envPath = path.join(PROJECT_ROOT, '.env');
  try {
    if (fs.existsSync(envPath)) {
      const raw = fs.readFileSync(envPath, 'utf8');
      for (const line of raw.split(NL)) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const eq = t.indexOf('=');
        if (eq < 1) continue;
        const k = t.slice(0, eq).trim();
        let v = t.slice(eq + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith(String.fromCharCode(39)) && v.endsWith(String.fromCharCode(39)))) {
          v = v.slice(1, -1);
        }
        parsed[k] = v;
      }
    }
  } catch (e) {
    /* .env 不可读时静默降级为纯 process.env，不中断 */
  }
  const merged = { ...parsed };
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined && v !== '') merged[k] = v;
  }
  return merged;
}

/** 返回已配置密钥且可发 API 的引擎（manual 的元宝永不入选）。 */
export function configuredEngines(env = process.env) {
  return ENGINES.filter((e) => e.mode === 'api' && e.envKey && Boolean(env[e.envKey]));
}

/** 交付表格用：引擎 / 模式 / 密钥名 / 申请地址 / 说明。 */
export const ENGINE_KEY_URLS = ENGINES.map((e) => ({
  id: e.id,
  name: e.name,
  mode: e.mode,
  envKey: e.envKey || null,
  keyUrl: e.keyUrl,
  entry: e.entry,
  upstream: e.upstream,
  note: e.note,
}));
