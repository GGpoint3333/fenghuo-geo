/**
 * Phase 1 静态验收：检查预渲染 HTML 的语义、色彩与首屏结构。
 * 运行：node scripts/verify-phase1.mjs（先 pnpm build）
 * 375px 无横向滚动属于浏览器布局行为，由下方 Tailwind 响应式类审计 + 人工渲染确认；
 * 本脚本负责可在源码/构建产物上机读的部分。
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const html = await readFile(path.join(root, 'site', '.next', 'server', 'app', 'index.html'), 'utf8');
const src = async (p) => readFile(path.join(root, 'site', p), 'utf8');
const allTsx = (await readdir(path.join(root, 'site', 'components')))
  .filter((f) => f.endsWith('.tsx'));
const NL = String.fromCharCode(10);
const componentCode = (await Promise.all(allTsx.map((f) => src('components/' + f)))).join(NL);

const checks = [];
const ok = (name, cond, detail) => checks.push({ name, pass: !!cond, detail: detail || '' });

// --- 语义 / SEO ---
ok('单一 h1', (html.match(/<h1[\s>]/g) || []).length === 1,
  'h1 count = ' + (html.match(/<h1[\s>]/g) || []).length);
ok('html lang=zh-CN', /<html[^>]*lang="zh-CN"/.test(html));
ok('canonical 存在', /rel="canonical"/.test(html));
ok('OG 1200x630 图', /og:image/.test(html) && /1200/.test(html) && /630/.test(html));
ok('JSON-LD @graph', /application\/ld\+json/.test(html) && /"@graph"/.test(html));
ok('Organization(name:Point)', /"@type":"Organization"/.test(html) && /"name":"Point"/.test(html));
ok('FAQPage 6 问', (html.match(/"@type":"Question"/g) || []).length === 6,
  'count = ' + (html.match(/"@type":"Question"/g) || []).length);
ok('语义化 main/nav/footer/section', /<main/.test(html) && /<nav/.test(html) && /<footer/.test(html) && /<section/.test(html));
ok('details/summary 原生手风琴', /<details/.test(html) && /<summary/.test(html));
ok('无 emoji（组件源码）', !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(componentCode));

// --- 五行色彩 ---
ok('品牌渐变唯一（朱砂红→九紫）',
  (componentCode.match(/brand-gradient/g) || []).length === 2 &&
  /linear-gradient\(120deg,\s*#c23b22\s*0%,\s*#8b2fbe\s*100%\)/.test(await src('app/globals.css')));
ok('无大面积玄黑/深蓝底（仅 Footer 用 warm-black）',
  (componentCode.match(/bg-warm-black/g) || []).length === 1 &&
  !/bg-(black|slate-9|blue-9|gray-9|zinc-9)/.test(componentCode));
ok('朱砂红全程显色（logo/CTA/数字/hover）',
  /text-zhu/.test(await src('components/Brand.tsx')) &&
  /bg-zhu/.test(await src('components/Nav.tsx')) &&
  /hover:text-zhu/.test(await src('components/MediaWall.tsx')));
ok('深色场景 Logo 朱砂红', /text-zhu/.test(await src('components/Brand.tsx')) && /<BrandLockup dark/.test(await src('components/Footer.tsx')));
ok('竹青仅正向指标', /text-zhuqing/.test(await src('components/Cases.tsx')));
ok('八白金「最受欢迎」角标', /bg-baijin/.test(await src('components/Pricing.tsx')) && /最受欢迎/.test(await src('lib/content.ts')));
ok('九紫 01/05 角标', /badge: 'jiuzi'/.test(await src('lib/content.ts')));
ok('朱砂红空心大数字', /-webkit-text-stroke:2px_#c23b22/.test(await src('components/Workflow.tsx')));
ok('案例「示例」标注', /示例/.test(await src('lib/content.ts')) && /labels.sample/.test(await src('components/Cases.tsx')));
ok('定价演示声明', /学习演示项目，定价仅为示意/.test(await src('lib/content.ts')));
ok('Footer 版权+免责', /© 2026 Point/.test(await src('lib/content.ts')) && /非商业运营/.test(await src('lib/content.ts')));

// --- 375px 无横向滚动（响应式类审计） ---
const noOverflow = [
  '无 w-screen/100vw 固定宽度', !/w-screen|w-\[100vw\]/.test(componentCode),
];
ok(noOverflow[0], noOverflow[1]);
ok('Hero 渐变仅覆盖首屏（absolute inset + overflow-hidden）',
  /overflow-hidden/.test(await src('components/Hero.tsx')) && /absolute inset-0/.test(await src('components/Hero.tsx')));
ok('移动端汉堡菜单存在', /lg:hidden/.test(await src('components/Nav.tsx')) && /useState/.test(await src('components/Nav.tsx')));
ok('锚点纯 CSS（scroll-behavior + scroll-margin-top）',
  /scroll-behavior:\s*smooth/.test(await src('app/globals.css')) && /scroll-margin-top:\s*88px/.test(await src('app/globals.css')));

// --- 零第三方 JS 库 ---
const pkg = JSON.parse(await src('package.json'));
const allowed = new Set(['next', 'react', 'react-dom', 'lucide-react', '@tailwindcss/postcss', 'tailwindcss', 'typescript', '@types/node', '@types/react', '@types/react-dom']);
const extras = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)].filter((d) => !allowed.has(d));
ok('无手风琴/菜单/滚动第三方库', extras.length === 0, 'extra deps: ' + (extras.join(',') || 'none'));

// --- GEO/SEO 路由产物 ---
ok('robots.txt 首行 Content-Signal',
  (await readFile(path.join(root, 'site', '.next', 'server', 'app', 'robots.txt.body'), 'utf8'))
    .startsWith('Content-Signal: search=yes, ai-input=yes, ai-train=yes'));
const sitemap = await readFile(path.join(root, 'site', '.next', 'server', 'app', 'sitemap.xml.body'), 'utf8');
ok('sitemap 含 /llms.txt', sitemap.includes('/llms.txt'));

let passed = 0;
for (const c of checks) {
  console.log((c.pass ? 'PASS ' : 'FAIL ') + c.name + (c.detail ? ' — ' + c.detail : ''));
  if (c.pass) passed++;
}
console.log(NL + passed + '/' + checks.length + ' checks passed');
process.exit(passed === checks.length ? 0 : 1);