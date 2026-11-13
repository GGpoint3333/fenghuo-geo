/**
 * 风火GEO · 报告 → 官网数据 / 内核产物 映射（零第三方依赖）
 *
 * 读 core/data/latest-report.json，产出：
 *   site/app/data/monitor.json        （官网案例区数据源，严格保持既有 schema）
 *   site/public/kernel/llms.txt      （内核 llms.txt 产物，供 app/llms.txt/route.ts 合并去重）
 *   site/public/kernel/facts.json    （事实卡结构化产物）
 *   site/public/kernel/report.html   （人读报告页，页眉页脚含「由风火GEO生成 · 学习演示」）
 *
 * 绝不写 site/public/llms.txt（会与 app/llms.txt/route.ts 冲突导致 Next 构建报错）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NL = String.fromCharCode(10);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const REPORT_JSON = path.join(ROOT, 'core', 'data', 'latest-report.json');
const SITE_MONITOR = path.join(ROOT, 'site', 'app', 'data', 'monitor.json');
const KERNEL_DIR = path.join(ROOT, 'site', 'public', 'kernel');
const OUT_LLMS = path.join(KERNEL_DIR, 'llms.txt');
const OUT_FACTS = path.join(KERNEL_DIR, 'facts.json');
const OUT_HTML = path.join(KERNEL_DIR, 'report.html');

/** 官网站点地址：优先环境变量，缺省为学习演示占位域名。 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fenghuo-geo.example.com').replace(/\/+$/, '');
export const GENERATED_BY = '由风火GEO生成 · 学习演示';
export const DISCLAIMER = '本网站为个人学习演示项目，非商业运营；示例数据并非实时生产数据。';

const ENGINE_NAMES = ['豆包', 'DeepSeek', '通义千问', '腾讯元宝', '文心一言', 'Kimi', 'GPT', 'Gemini'];

function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pct(rate) {
  return Math.round(Number(rate || 0) * 100) + '%';
}

/** 归一化案例卡：严格保持 site/app/data/monitor.json 的既有字段形状。 */
function normalizeCase(c, sample, lift, liftLabel) {
  return {
    id: String(c.id || ''),
    type: String(c.type || 'article'),
    title: String(c.title || ''),
    description: String(c.description || ''),
    engineTags: Array.isArray(c.engineTags) ? c.engineTags.map(String) : [],
    lift,
    liftLabel,
    sample,
  };
}

function buildCases(report, sample) {
  const lift = '+' + pct(report.mentionRate);
  const liftLabel = sample ? 'AI 提及率涨幅（示例）' : 'AI 提及率涨幅（基于本次采样）';
  const src = Array.isArray(report.cases) ? report.cases : [];
  const article = src.find((c) => c.type === 'article') || src[0] || {};
  const video = src.find((c) => c.type === 'video') || src[1] || {};
  return [
    normalizeCase(article, sample, lift, liftLabel),
    normalizeCase(video, sample, lift, liftLabel),
  ];
}

/** 官网数据：严格 4 个顶层键，与 site/lib/content.ts 的 import 契约一致。 */
function buildSiteMonitor(report, sample) {
  return {
    generatedAt: report.generatedAt,
    sample,
    source: report.source,
    cases: buildCases(report, sample),
  };
}

function buildFacts(report, sample, cases) {
  return {
    schemaVersion: 1,
    brand: '风火GEO',
    slogan: '别让AI漏掉你的品牌',
    operator: 'Point（个人独立开发者，学习演示项目）',
    generatedBy: GENERATED_BY,
    disclaimer: DISCLAIMER,
    generatedAt: report.generatedAt,
    siteUrl: SITE_URL,
    source: report.source,
    sample,
    mentionRate: report.mentionRate,
    budget: report.budget || { limitCny: 0, spentCny: 0, stopped: false },
    coverage: report.coverage || {},
    enginesCovered: ENGINE_NAMES,
    engines: (report.engines || []).map((e) => ({
      id: e.id,
      name: e.name,
      mode: e.mode,
      status: e.status,
      entry: e.entry,
      keyUrl: e.keyUrl,
      mentionCount: e.mentionCount,
      total: e.total,
      mentionRate: e.mentionRate,
    })),
    questions: report.questions || [],
    gaps: (report.gaps || []).slice(0, 20),
    cases,
    artifacts: {
      llms: SITE_URL + '/kernel/llms.txt',
      facts: SITE_URL + '/kernel/facts.json',
      report: SITE_URL + '/kernel/report.html',
    },
  };
}

/** 内核 llms.txt：标题行 + 绝对 URL 行（可被 route.ts 按 URL 去重）+ 事实卡要点。 */
function buildLlms(report, sample, facts) {
  const L = [];
  L.push('# 风火GEO · 监测内核产物 — ' + GENERATED_BY);
  L.push('');
  L.push('> ' + DISCLAIMER);
  L.push('');
  L.push('- ' + SITE_URL + '/kernel/facts.json — 风火GEO 事实卡：品牌定义、8 大引擎覆盖与本轮提及率');
  L.push('- ' + SITE_URL + '/kernel/report.html — 全引擎监测报告页（人读，含逐引擎结果与缺口）');
  L.push('- ' + SITE_URL + '/kernel/llms.txt — 监测内核 llms.txt 产物（本文件，供官网 /llms.txt 合并）');
  L.push('');
  L.push('事实卡要点：');
  L.push('');
  L.push('- 品牌：风火GEO（Slogan：别让AI漏掉你的品牌）');
  L.push('- 运营主体：Point（个人独立开发者，学习演示项目）');
  L.push('- 监测范围：' + ENGINE_NAMES.join(' / ') + ' 共 8 大引擎（腾讯元宝为人工采样）');
  L.push('- 本轮数据来源：' + report.source + (sample ? '（示例数据，非实时生产数据）' : '（真实采样）'));
  L.push('- 全局提及率：' + pct(report.mentionRate) + '；已采样引擎数：' + (report.coverage && report.coverage.sampled));
  L.push('- 预算：上限 ¥' + (report.budget && report.budget.limitCny) + ' / 估算已用 ¥' + (report.budget && report.budget.spentCny) + ((report.budget && report.budget.stopped) ? '（已触顶，输出已采部分）' : ''));
  L.push('- 工作流：实时监测 → 来源洞察 → 循证写作 → 精准发布 → 效果归因');
  L.push('');
  L.push(GENERATED_BY);
  L.push('');
  return L.join(NL);
}

/** 人读报告页：五行配色（朱砂红 #c23b22 主色 / 暖玄 #1a1210 深色 / 暖白 #faf6f0），深色区域保持紧凑。 */
function buildReportHtml(report, sample, facts) {
  const L = [];
  L.push('<!doctype html>');
  L.push('<html lang="zh-CN">');
  L.push('<head>');
  L.push('<meta charset="utf-8">');
  L.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
  L.push('<title>风火GEO · 全引擎监测报告</title>');
  L.push('<style>');
  L.push('*{box-sizing:border-box}');
  L.push('body{margin:0;background:#faf6f0;color:#2b2320;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;line-height:1.7;font-size:15px}');
  L.push('a{color:#c23b22}');
  L.push('.topbar{height:5px;background:#c23b22}');
  L.push('.hd{background:#1a1210;color:#faf6f0;padding:14px 24px;display:flex;flex-wrap:wrap;gap:10px;align-items:baseline;justify-content:space-between}');
  L.push('.hd b{font-size:18px;letter-spacing:.5px;color:#c23b22}');
  L.push('.hd span{font-size:12px;color:#faf6f0;opacity:.85}');
  L.push('.wrap{max-width:960px;margin:0 auto;padding:28px 20px 40px}');
  L.push('h1{font-size:26px;margin:0 0 6px;color:#c23b22}');
  L.push('h2{font-size:18px;margin:30px 0 12px;color:#c23b22;border-left:4px solid #c23b22;padding-left:10px}');
  L.push('p{margin:6px 0}');
  L.push('.meta{background:#fff;border:1px solid #efe8e3;border-radius:8px;padding:14px 16px;box-shadow:0 1px 3px rgba(43,35,32,.08)}');
  L.push('.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:14px 0}');
  L.push('.kpi{background:#fff;border:1px solid #efe8e3;border-radius:8px;padding:12px 14px;box-shadow:0 1px 3px rgba(43,35,32,.08)}');
  L.push('.kpi .n{font-size:22px;font-weight:700;color:#c23b22}');
  L.push('.kpi .t{font-size:12px;color:#6b5f58}');
  L.push('table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #efe8e3;border-radius:8px;overflow:hidden;font-size:14px}');
  L.push('th,td{padding:9px 10px;text-align:left;border-bottom:1px solid #efe8e3;vertical-align:top;word-break:break-word}');
  L.push('th{background:#c23b22;color:#fff;font-weight:600;white-space:nowrap}');
  L.push('tr:last-child td{border-bottom:none}');
  L.push('.tag{display:inline-block;background:#2f6e5a;color:#fff;border-radius:8px;padding:1px 8px;font-size:12px;margin:1px 3px 1px 0}');
  L.push('.up{color:#7aa874;font-weight:700}');
  L.push('.note{font-size:12px;color:#6b5f58;word-break:break-word}');
  L.push('ul{padding-left:20px;margin:6px 0}');
  L.push('.card{background:#fff;border:1px solid #efe8e3;border-radius:8px;padding:14px 16px;margin:10px 0;box-shadow:0 1px 3px rgba(43,35,32,.08)}');
  L.push('.card h3{margin:0 0 6px;font-size:15px;color:#2b2320}');
  L.push('.ft{background:#1a1210;color:#faf6f0;padding:16px 24px;font-size:12px;text-align:center}');
  L.push('.ft b{color:#c23b22}');
  L.push('@media(max-width:600px){.hd{padding:12px 16px}.wrap{padding:20px 14px 30px}h1{font-size:22px}th,td{padding:7px 6px;font-size:13px}}');
  L.push('</style>');
  L.push('</head>');
  L.push('<body>');
  L.push('<div class="topbar"></div>');
  L.push('<header class="hd"><b>风火GEO</b><span>' + escHtml(GENERATED_BY) + ' · 全引擎监测报告</span></header>');
  L.push('<main class="wrap">');
  L.push('<h1>全引擎监测报告</h1>');
  L.push('<p class="note">' + escHtml(GENERATED_BY) + ' — ' + escHtml(DISCLAIMER) + '</p>');

  L.push('<div class="meta">');
  L.push('<p><strong>品牌：</strong>' + escHtml(report.brand) + '　<strong>数据来源：</strong>' + escHtml(report.source) + (sample ? '（示例数据，非实时生产数据）' : '（真实采样）') + '</p>');
  L.push('<p><strong>生成时间：</strong>' + escHtml(report.generatedAt) + '　<strong>站点：</strong><a href="' + escHtml(SITE_URL) + '">' + escHtml(SITE_URL) + '</a></p>');
  L.push('<p><strong>运营主体：</strong>Point（个人独立开发者，学习演示项目）</p>');
  L.push('</div>');

  L.push('<div class="grid">');
  L.push('<div class="kpi"><div class="n">' + pct(report.mentionRate) + '</div><div class="t">全局品牌提及率</div></div>');
  L.push('<div class="kpi"><div class="n">' + (report.coverage ? report.coverage.total : 8) + '</div><div class="t">监测引擎总数</div></div>');
  L.push('<div class="kpi"><div class="n">' + (report.coverage ? report.coverage.sampled : 0) + '</div><div class="t">本轮已采样引擎</div></div>');
  L.push('<div class="kpi"><div class="n">¥' + (report.budget ? report.budget.spentCny : 0) + '</div><div class="t">估算已用 / 上限 ¥' + (report.budget ? report.budget.limitCny : 5) + '</div></div>');
  L.push('</div>');

  L.push('<h2>一、预算与覆盖</h2>');
  L.push('<div class="meta">');
  L.push('<p>预算上限 ¥' + (report.budget ? report.budget.limitCny : 5) + '，估算已用 ¥' + (report.budget ? report.budget.spentCny : 0) + '，' + ((report.budget && report.budget.stopped) ? '<strong>已触顶</strong>：停止后续采样，输出已采部分。' : '未触顶。') + '</p>');
  L.push('<p>成本为 estimateCostCny 的估算护栏值，非真实账单。已配置密钥 ' + (report.coverage ? report.coverage.configured : 0) + ' / ' + (report.coverage ? report.coverage.api : 7) + '，人工采样 ' + (report.coverage ? report.coverage.manual : 1) + '（腾讯元宝），跳过 ' + (report.coverage ? report.coverage.skipped : 0) + '，失败 ' + (report.coverage ? report.coverage.errors : 0) + '。</p>');
  L.push('</div>');

  L.push('<h2>二、逐引擎结果</h2>');
  L.push('<table><thead><tr><th>引擎</th><th>模式</th><th>状态</th><th>提及 / 总数</th><th>提及率</th><th>入口</th></tr></thead><tbody>');
  for (const e of (report.engines || [])) {
    L.push('<tr><td>' + escHtml(e.name) + '</td><td>' + escHtml(e.mode) + '</td><td>' + escHtml(e.status) + '</td><td>' + e.mentionCount + ' / ' + e.total + '</td><td class="up">' + pct(e.mentionRate) + '</td><td>' + escHtml(e.entry) + '</td></tr>');
  }
  L.push('</tbody></table>');

  L.push('<h2>三、实现方式与密钥申请</h2>');
  L.push('<ul>');
  for (const e of (report.engines || [])) {
    L.push('<li><strong>' + escHtml(e.name) + '</strong>（' + escHtml(e.status) + '）：' + escHtml(e.note) + ' <span class="note">密钥变量 ' + escHtml(e.envKey || '无') + ' · <a href="' + escHtml(e.keyUrl) + '">' + escHtml(e.keyUrl) + '</a></span></li>');
  }
  L.push('</ul>');

  L.push('<h2>四、缺口（品牌未被提及的题目）</h2>');
  const gaps = (report.gaps || []).slice(0, 16);
  if (!gaps.length) {
    L.push('<p>本轮未发现缺口。</p>');
  } else {
    L.push('<ul>');
    for (const g of gaps) L.push('<li>[' + escHtml(g.engine) + '] ' + escHtml(g.question) + ' — ' + escHtml(g.detail) + '</li>');
    L.push('</ul>');
    if ((report.gaps || []).length > gaps.length) L.push('<p class="note">其余 ' + ((report.gaps || []).length - gaps.length) + ' 条见 core/data/latest-report.json。</p>');
  }

  L.push('<h2>五、案例卡（官网数据源）</h2>');
  for (const c of facts.cases) {
    L.push('<div class="card"><h3>' + escHtml(c.title) + ' <span class="up">' + escHtml(c.lift) + '</span></h3>');
    L.push('<p class="note">' + escHtml(c.liftLabel) + (c.sample ? ' · 示例' : '') + '</p>');
    L.push('<p>' + escHtml(c.description) + '</p>');
    L.push('<p>' + c.engineTags.map((t) => '<span class="tag">' + escHtml(t) + '</span>').join('') + '</p></div>');
  }

  L.push('<h2>六、采样问题集</h2>');
  L.push('<ol>');
  for (const q of (report.questions || [])) L.push('<li>' + escHtml(q) + '</li>');
  L.push('</ol>');

  L.push('<h2>七、内核产物</h2>');
  L.push('<ul>');
  L.push('<li><a href="' + escHtml(SITE_URL + '/kernel/llms.txt') + '">llms.txt 索引</a></li>');
  L.push('<li><a href="' + escHtml(SITE_URL + '/kernel/facts.json') + '">facts.json 事实卡</a></li>');
  L.push('<li><a href="' + escHtml(SITE_URL + '/kernel/report.html') + '">report.html 报告页</a></li>');
  L.push('</ul>');
  L.push('<p class="note">工作流：实时监测 → 来源洞察 → 循证写作 → 精准发布 → 效果归因。</p>');
  L.push('</main>');
  L.push('<footer class="ft"><p><b>' + escHtml(GENERATED_BY) + '</b></p><p>' + escHtml(DISCLAIMER) + '</p></footer>');
  L.push('</body>');
  L.push('</html>');
  L.push('');
  return L.join(NL);
}

export function main() {
  if (!fs.existsSync(REPORT_JSON)) {
    console.error('[风火GEO sync] 缺少 core/data/latest-report.json，请先运行 pnpm monitor。');
    process.exitCode = 1;
    return null;
  }
  let report;
  try {
    report = JSON.parse(fs.readFileSync(REPORT_JSON, 'utf8'));
  } catch (e) {
    console.error('[风火GEO sync] 报告解析失败：' + String((e && e.message) || e));
    process.exitCode = 1;
    return null;
  }

  const sample = report.sample === true || report.source === 'fixture';
  const siteMonitor = buildSiteMonitor(report, sample);
  const facts = buildFacts(report, sample, siteMonitor.cases);
  const llms = buildLlms(report, sample, facts);
  const html = buildReportHtml(report, sample, facts);

  fs.mkdirSync(path.dirname(SITE_MONITOR), { recursive: true });
  fs.mkdirSync(KERNEL_DIR, { recursive: true });
  fs.writeFileSync(SITE_MONITOR, JSON.stringify(siteMonitor, null, 2) + NL, 'utf8');
  fs.writeFileSync(OUT_LLMS, llms, 'utf8');
  fs.writeFileSync(OUT_FACTS, JSON.stringify(facts, null, 2) + NL, 'utf8');
  fs.writeFileSync(OUT_HTML, html, 'utf8');

  console.log('[风火GEO sync] 同步完成');
  console.log('  读取：core/data/latest-report.json（source=' + report.source + ', sample=' + sample + '）');
  console.log('  写入：site/app/data/monitor.json（' + siteMonitor.cases.length + ' 张案例卡，顶层 sample=' + sample + '）');
  console.log('  写入：site/public/kernel/llms.txt（' + llms.split(NL).length + ' 行，含 ' + SITE_URL + ' 绝对 URL）');
  console.log('  写入：site/public/kernel/facts.json、site/public/kernel/report.html');
  console.log('  未写 site/public/llms.txt（避免与 app/llms.txt/route.ts 冲突）');
  console.log('  提示：官网 /llms.txt 路由请读取 public/kernel/llms.txt 以合并内核产物。');
  return { siteMonitor, facts };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
