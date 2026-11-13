/**
 * 风火GEO · 全引擎采样编排器（零第三方依赖，纯 node: 内置模块 + 全局 fetch）
 *
 * 三种运行形态：
 *  1) 无任何 API key 或 FENGHUO_FIXTURE=1 / --fixture → 读 core/fixtures/*.json 预制回答，跑通全链路（source=fixture, sample=true）。
 *  2) 只配 1 个 key（如 DeepSeek）→ 只对该引擎发真实 POST /chat/completions，其余标「未配置」跳过（source=partial）。
 *  3) 7 个 API 引擎密钥齐全 → 全部真实采样（source=live）。元宝永远 manual（人工在 App 内采样）。
 *
 * 缺 key 自动跳过、单引擎/网络失败只记 status:'error' 不中断（Promise.allSettled）；
 * 预算上限 GEO_BUDGET_CNY（默认 ¥5）触顶即停止后续采样并输出已采部分。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ENGINES,
  PROJECT_ROOT,
  BUDGET_LIMIT_CNY,
  estimateCostCny,
  resolveModel,
  loadEnv,
  configuredEngines,
} from '../config/engines.mjs';

const NL = String.fromCharCode(10);
const HERE = path.dirname(fileURLToPath(import.meta.url));
/** 不依赖 cwd：根路径由 import.meta.url 推导（与 engines.mjs 的 PROJECT_ROOT 一致）。 */
const ROOT = PROJECT_ROOT || path.resolve(HERE, '..', '..');
const DATA_DIR = path.join(ROOT, 'core', 'data');
const FIX_DIR = path.join(ROOT, 'core', 'fixtures');
const OUT_JSON = path.join(DATA_DIR, 'latest-report.json');
const OUT_MD = path.join(DATA_DIR, 'report.md');

export const BRAND = '风火GEO';
export const ALIASES = ['风火GEO', '风火', 'fenghuo geo', 'fenghuo-geo', 'fenghuo'];

/** 内置固定中文真实问题集（6 条），前 2 条问 2 次、其余 1 次 → 每题 1~2 次，共 8 次调用。 */
export const QUESTIONS = [
  '有哪些 GEO / AI 可见度监测工具值得推荐？',
  '如何查看品牌在 AI 回答里的提及率？',
  '国内有哪些好用的 AI 搜索优化（GEO）平台？',
  '品牌被 AI 漏掉了该怎么排查？',
  '怎么监测 DeepSeek、豆包等大模型里的品牌口碑？',
  '有没有能导出 AI 引用来源的监测工具？',
];
export const CALLS = QUESTIONS.flatMap((q, i) => (i < 2 ? [q, q] : [q]));

/** 案例卡文案（数据，供官网 monitor.json 使用；非组件内硬编码文案）。 */
const CASE_COPY = [
  {
    id: 'case-citation-article',
    type: 'article',
    title: '某篇行业评测文章被三家引擎反复引用',
    description: '把一篇结构清晰、来源可核查的评测文章，放进 AI 回答的引用链路里；四周后观察到品牌在相关问题下的提及明显前移。',
  },
  {
    id: 'case-video-creator',
    type: 'video',
    title: '一位视频创作者的内容成为回答里的常客',
    description: '围绕真实用户提问整理出可引用的要点，发布后被多个引擎在回答中当作背景来源，带动品牌口碑描述趋于稳定。',
  },
];

/** 与上游 judgeBrand 一致的核心思路：回答文本里是否出现品牌名 / 别名。 */
export function matchAlias(text) {
  const t = String(text == null ? '' : text).toLowerCase();
  for (const a of ALIASES) {
    if (t.includes(a.toLowerCase())) return a;
  }
  return null;
}

/** 0~1，四舍五入到 4 位。 */
export function computeMentionRate(mentionCount, total) {
  if (!total) return 0;
  return Math.round((mentionCount / total) * 10000) / 10000;
}

/** 读取 core/fixtures/*.json 中第一个含 engines 数组的预制回答。 */
function loadFixture() {
  let files = [];
  try {
    files = fs.readdirSync(FIX_DIR).filter((f) => f.endsWith('.json'));
  } catch (e) {
    return null;
  }
  for (const f of files) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(FIX_DIR, f), 'utf8'));
      if (j && Array.isArray(j.engines)) return { file: f, data: j };
    } catch (e) {
      /* 跳过坏文件 */
    }
  }
  return null;
}

/** 真实请求：POST 各引擎 base + /chat/completions，Authorization: Bearer <key>。 */
async function askOne(engine, env, question) {
  const key = env[engine.envKey];
  const model = resolveModel(engine, env);
  if (!key) return { skip: '未配置密钥' };
  if (!model) return { error: '未指定模型：请设置 ' + (engine.modelEnv || 'model') };
  const url = engine.base.replace(/\/+$/, '') + '/chat/completions';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key,
    },
    body: JSON.stringify({
      model,
      max_tokens: 512,
      messages: [{ role: 'user', content: question }],
      ...(engine.extra || {}),
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + res.statusText);
  const data = await res.json();
  const choice = data && data.choices && data.choices[0];
  const text = choice && choice.message ? String(choice.message.content || '') : '';
  return { text };
}

/** 单引擎真实采样：8 次调用并发，单题失败不影响整组。 */
async function sampleLive(engine, env) {
  const texts = [];
  let firstError = null;
  const settled = await Promise.allSettled(CALLS.map((q) => askOne(engine, env, q)));
  for (const s of settled) {
    if (s.status === 'rejected') {
      const msg = String((s.reason && s.reason.message) || s.reason);
      if (!firstError) firstError = msg;
      texts.push('');
      continue;
    }
    const v = s.value;
    if (v && v.error) {
      if (!firstError) firstError = v.error;
      texts.push('');
      continue;
    }
    texts.push(v && v.text ? v.text : '');
  }
  if (firstError && texts.every((t) => !t)) return { texts: [], error: firstError };
  return { texts, error: firstError };
}

/** 按 plan 生成单引擎结果（异常一律收敛为 status:'error'，绝不抛出中断全链路）。 */
async function runPlan(plan, env, fx) {
  const engine = plan.engine;
  const baseNote = engine.note;
  if (plan.kind === 'manual') {
    if (fx) {
      const rows = fx.data.engines.find((e) => e.id === engine.id);
      const answers = rows && Array.isArray(rows.answers) ? rows.answers : [];
      const texts = CALLS.map((q) => {
        const qi = QUESTIONS.indexOf(q);
        return answers[qi] != null ? String(answers[qi]) : '';
      });
      return {
        engine,
        status: 'manual',
        texts,
        note: baseNote + ' 本次为 fixture 中的人工采样占位样本；真实运行需人工在元宝 App 内完成。',
      };
    }
    return {
      engine,
      status: 'manual',
      texts: [],
      note: baseNote + ' 未配置 · 需人工在 App 内采样，本轮未产出自动答案。',
    };
  }
  if (plan.kind === 'unconfigured') {
    return {
      engine,
      status: 'unconfigured',
      texts: [],
      note: baseNote + ' 未配置密钥，自动跳过（不报错）。',
    };
  }
  if (plan.kind === 'skipped-budget') {
    return {
      engine,
      status: 'skipped',
      texts: [],
      note: baseNote + ' 预算上限已触顶，后续采样停止，输出已采部分。',
    };
  }
  if (plan.kind === 'fixture') {
    const rows = fx && fx.data.engines.find((e) => e.id === engine.id);
    const answers = rows && Array.isArray(rows.answers) ? rows.answers : [];
    const texts = CALLS.map((q) => {
      const qi = QUESTIONS.indexOf(q);
      return answers[qi] != null ? String(answers[qi]) : '';
    });
    return {
      engine,
      status: 'ok',
      texts,
      note: baseNote + ' 本轮为 fixture 预制回答（非实时、非 App 内回答）。',
    };
  }
  // live
  try {
    const r = await sampleLive(engine, env);
    if (r.error && r.texts.length === 0) {
      return { engine, status: 'error', texts: [], note: baseNote + ' 采样失败：' + r.error, error: r.error };
    }
    return {
      engine,
      status: 'ok',
      texts: r.texts,
      note: baseNote + (r.error ? ' 部分题目失败已记缺口：' + r.error : ' 真实 API 采样完成。'),
    };
  } catch (e) {
    return {
      engine,
      status: 'error',
      texts: [],
      note: baseNote + ' 采样异常：' + String((e && e.message) || e),
      error: String((e && e.message) || e),
    };
  }
}

function buildEngineReport(out, gaps) {
  const engine = out.engine;
  const texts = out.texts || [];
  const total = texts.length;
  const mentions = [];
  let mentionCount = 0;
  texts.forEach((text, idx) => {
    const q = CALLS[idx] || QUESTIONS[idx % QUESTIONS.length];
    const alias = matchAlias(text);
    if (alias) {
      mentionCount += 1;
      mentions.push({ question: q, alias });
    } else if (out.status === 'ok' || out.status === 'manual') {
      gaps.push({ question: q, engine: engine.name, detail: '该回答未出现品牌名或别名' });
    }
  });
  const r = {
    id: engine.id,
    name: engine.name,
    mode: engine.mode,
    status: out.status,
    envKey: engine.envKey || null,
    keyUrl: engine.keyUrl,
    entry: engine.entry,
    note: out.note || engine.note,
    mentionCount,
    mentions,
    mentionRate: computeMentionRate(mentionCount, total),
    total,
  };
  if (out.error) r.error = out.error;
  return r;
}

function buildCases(reportEngines, globalRate, sample) {
  const ranked = reportEngines
    .filter((e) => e.total > 0)
    .slice()
    .sort((a, b) => b.mentionRate - a.mentionRate);
  const names = ranked.map((e) => e.name);
  const fallback = ENGINES.filter((e) => e.mode === 'api').map((e) => e.name);
  const pool = names.length ? names : fallback;
  const articleTags = pool.slice(0, 3);
  const videoTags = pool.length >= 4 ? pool.slice(3, 6) : pool.slice(0, Math.min(3, pool.length));
  const lift = '+' + Math.round(globalRate * 100) + '%';
  const liftLabel = sample ? 'AI 提及率涨幅（示例）' : 'AI 提及率涨幅（基于本次采样）';
  return [
    {
      id: CASE_COPY[0].id,
      type: CASE_COPY[0].type,
      title: CASE_COPY[0].title,
      description: CASE_COPY[0].description,
      engineTags: articleTags.length ? articleTags : ['DeepSeek'],
      lift,
      liftLabel,
      sample,
    },
    {
      id: CASE_COPY[1].id,
      type: CASE_COPY[1].type,
      title: CASE_COPY[1].title,
      description: CASE_COPY[1].description,
      engineTags: videoTags.length ? videoTags : ['Kimi', 'Gemini'],
      lift,
      liftLabel,
      sample,
    },
  ];
}

function renderReportMd(report) {
  const L = [];
  L.push('# 风火GEO · 全引擎监测报告');
  L.push('');
  L.push('> 由风火GEO生成 · 学习演示');
  L.push('');
  L.push('- 品牌：' + report.brand);
  L.push('- 生成时间：' + report.generatedAt);
  L.push('- 数据来源：' + report.source + (report.sample ? '（示例数据，非实时生产数据）' : '（真实采样）'));
  L.push('- 采样问题数：' + report.questions.length + '（共 ' + CALLS.length + ' 次调用 / 引擎）');
  L.push('- 全局提及率：' + Math.round(report.mentionRate * 100) + '%');
  L.push('');
  L.push('## 预算');
  L.push('');
  L.push('- 上限：¥' + report.budget.limitCny);
  L.push('- 估算已用：¥' + report.budget.spentCny);
  L.push('- 是否触顶停止：' + (report.budget.stopped ? '是（已输出已采部分）' : '否'));
  L.push('- 说明：成本为 estimateCostCny 的估算护栏值，非真实账单。');
  L.push('');
  L.push('## 覆盖');
  L.push('');
  L.push('- 引擎总数：' + report.coverage.total + '；API 引擎：' + report.coverage.api + '；人工：' + report.coverage.manual);
  L.push('- 已配置密钥：' + report.coverage.configured + '；实际采样：' + report.coverage.sampled + '；跳过：' + report.coverage.skipped);
  L.push('');
  L.push('## 各引擎结果');
  L.push('');
  L.push('| 引擎 | 模式 | 状态 | 提及 / 总数 | 提及率 | 入口 |');
  L.push('| --- | --- | --- | --- | --- | --- |');
  for (const e of report.engines) {
    L.push('| ' + e.name + ' | ' + e.mode + ' | ' + e.status + ' | ' + e.mentionCount + ' / ' + e.total + ' | ' + Math.round(e.mentionRate * 100) + '% | ' + e.entry + ' |');
  }
  L.push('');
  L.push('### 说明与密钥申请');
  L.push('');
  for (const e of report.engines) {
    L.push('- **' + e.name + '**（' + e.status + '）：' + e.note);
    L.push('  - 密钥变量：' + (e.envKey || '无') + '；申请地址：' + e.keyUrl);
  }
  L.push('');
  L.push('## 缺口（品牌未被提及的题目）');
  L.push('');
  if (report.gaps.length === 0) {
    L.push('本轮未发现缺口。');
  } else {
    for (const g of report.gaps.slice(0, 24)) {
      L.push('- [' + g.engine + '] ' + g.question + ' — ' + g.detail);
    }
    if (report.gaps.length > 24) L.push('- …… 其余 ' + (report.gaps.length - 24) + ' 条见 latest-report.json。');
  }
  L.push('');
  L.push('## 示例案例卡');
  L.push('');
  for (const c of report.cases) {
    L.push('- **' + c.title + '**（' + c.type + '）：' + c.engineTags.join('、') + '，' + c.liftLabel + ' ' + c.lift);
  }
  L.push('');
  L.push('## 采样问题集');
  L.push('');
  QUESTIONS.forEach((q, i) => L.push((i + 1) + '. ' + q));
  L.push('');
  L.push('---');
  L.push('');
  L.push('由风火GEO生成 · 学习演示 — 本网站为个人学习演示项目，非商业运营；示例数据并非实时生产数据。');
  L.push('');
  return L.join(NL);
}

export async function main() {
  const env = loadEnv();
  const argv = process.argv.slice(2);
  const forced = argv.includes('--fixture') || env.FENGHUO_FIXTURE === '1' || process.env.FENGHUO_FIXTURE === '1';
  const apiEngines = ENGINES.filter((e) => e.mode === 'api');
  const configured = configuredEngines(env);
  const useFixture = forced || configured.length === 0;
  const source = useFixture ? 'fixture' : configured.length === apiEngines.length ? 'live' : 'partial';
  const sample = useFixture;
  const fx = useFixture ? loadFixture() : null;
  if (useFixture && !fx) {
    console.error('[风火GEO] 需要 fixture 但未找到 core/fixtures/*.json（含 engines 数组）。');
    process.exitCode = 1;
    return null;
  }

  // 预算护栏：按引擎顺序估算，触顶即把该引擎及后续标为 skipped（仍用 allSettled 执行已排任务）。
  // 注意：manual（腾讯元宝）永远保持 manual，不因预算停止被误标为 skipped。
  const plans = [];
  let spentCny = 0;
  let stopped = false;
  for (const e of ENGINES) {
    if (e.mode === 'manual') {
      plans.push({ engine: e, kind: 'manual' });
      continue;
    }
    if (stopped) {
      plans.push({ engine: e, kind: 'skipped-budget' });
      continue;
    }
    if (useFixture) {
      plans.push({ engine: e, kind: 'fixture' });
      continue;
    }
    if (!env[e.envKey]) {
      plans.push({ engine: e, kind: 'unconfigured' });
      continue;
    }
    const cost = estimateCostCny(e, CALLS.length);
    if (spentCny + cost > BUDGET_LIMIT_CNY) {
      stopped = true;
      plans.push({ engine: e, kind: 'skipped-budget' });
      continue;
    }
    spentCny += cost;
    plans.push({ engine: e, kind: 'live' });
  }
  spentCny = Math.round(spentCny * 10000) / 10000;

  // 全链路并发：单引擎异常由 allSettled 收敛，绝不抛出中断。
  const settled = await Promise.allSettled(plans.map((p) => runPlan(p, env, fx)));
  const gaps = [];
  const engineReports = settled.map((s, i) => {
    if (s.status === 'rejected') {
      const msg = String((s.reason && s.reason.message) || s.reason);
      return buildEngineReport(
        {
          engine: plans[i].engine,
          status: 'error',
          texts: [],
          note: plans[i].engine.note + ' 采样异常：' + msg,
          error: msg,
        },
        gaps
      );
    }
    return buildEngineReport(s.value, gaps);
  });

  let totalMentions = 0;
  let totalAnswers = 0;
  for (const e of engineReports) {
    if (e.status === 'ok' || e.status === 'manual') {
      totalMentions += e.mentionCount;
      totalAnswers += e.total;
    }
  }
  const mentionRate = computeMentionRate(totalMentions, totalAnswers);

  const okCount = engineReports.filter((e) => e.status === 'ok').length;
  const manualCount = engineReports.filter((e) => e.status === 'manual').length;
  const skippedCount = engineReports.filter((e) => e.status === 'skipped' || e.status === 'unconfigured').length;
  const errorCount = engineReports.filter((e) => e.status === 'error').length;
  const sampledCount = engineReports.filter((e) => e.total > 0).length;

  const generatedAt = new Date().toISOString();
  const report = {
    schemaVersion: 1,
    generatedAt,
    brand: BRAND,
    source,
    sample,
    budget: { limitCny: BUDGET_LIMIT_CNY, spentCny, stopped },
    coverage: {
      total: 8,
      api: apiEngines.length,
      configured: configured.length,
      sampled: sampledCount,
      skipped: skippedCount,
      manual: manualCount,
      unconfigured: engineReports.filter((e) => e.status === 'unconfigured').length,
      errors: errorCount,
    },
    mentionRate,
    engines: engineReports,
    gaps: gaps.slice(0, 200),
    cases: buildCases(engineReports, mentionRate, sample),
    questions: QUESTIONS,
    timestamp: Date.now(),
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2) + NL, 'utf8');
  fs.writeFileSync(OUT_MD, renderReportMd(report), 'utf8');

  // 简明中文摘要
  const skippedNames = engineReports
    .filter((e) => e.status === 'skipped' || e.status === 'unconfigured' || e.status === 'manual')
    .map((e) => e.name + '(' + e.status + ')');
  const errorNames = engineReports.filter((e) => e.status === 'error').map((e) => e.name);
  console.log('[风火GEO] 监测完成');
  console.log('  来源：' + source + (sample ? '（示例 / fixture）' : '（真实采样）') + '  生成时间：' + generatedAt);
  console.log('  形态：' + (useFixture ? 'fixture 全链路（无密钥或强制 fixture）' : configured.length === 1 ? '单引擎真实采样' : '多引擎真实采样'));
  console.log('  全局提及率：' + Math.round(mentionRate * 100) + '%  已配置密钥：' + configured.length + '/' + apiEngines.length + '  实际采样引擎：' + sampledCount);
  console.log('  跳过 / 人工 / 未配置：' + (skippedNames.length ? skippedNames.join('、') : '无'));
  console.log('  失败引擎：' + (errorNames.length ? errorNames.join('、') : '无'));
  console.log('  预算：上限 ¥' + BUDGET_LIMIT_CNY + ' / 估算已用 ¥' + spentCny + (stopped ? ' —— 已触顶，停止后续采样，输出已采部分' : ' —— 未触顶'));
  console.log('  已写：core/data/latest-report.json、core/data/report.md');
  console.log('  下一步：pnpm sync（映射到官网数据与内核产物）');
  return report;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((e) => {
    console.error('[风火GEO] 未捕获异常：' + String((e && e.stack) || e));
    process.exitCode = 1;
  });
}
