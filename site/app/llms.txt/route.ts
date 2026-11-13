import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SITE_URL, SITE_NAME, LLMS_INTRO, CORE_PAGES } from '@/lib/site';

/**
 * 官网 llms.txt。首段 100 字内说清「是谁 / 监测哪些引擎 / 四步工作流」，
 * 再列核心页面 URL + 一句话描述。
 *
 * Phase 2：内核把事实卡 / llms.txt 产物写到 site/public/kernel/llms.txt，
 * 这里读取并按「行 + URL」合并去重，避免与官网路由内容重复。
 */
export const dynamic = 'force-dynamic';

async function readUpstreamLlms(): Promise<string[]> {
  try {
    const raw = await readFile(join(process.cwd(), 'public', 'kernel', 'llms.txt'), 'utf8');
    return raw.split(/\r?\n/);
  } catch {
    return [];
  }
}

export async function GET() {
  const header = [
    `# ${SITE_NAME}`,
    '',
    LLMS_INTRO,
    '',
    '## 核心页面',
    '',
    ...CORE_PAGES.map((p) => `- ${SITE_URL}${p.path} — ${p.description}`),
    '',
    '> 本网站为个人学习演示项目，非商业运营；示例数据并非实时生产数据。',
    '',
  ];

  // ---- 与 site/public/kernel/llms.txt 合并去重 ----
  const extra = await readUpstreamLlms();
  const seenLines = new Set(header.filter((l) => l.trim()).map((l) => l.trim()));
  const seenUrls = new Set(CORE_PAGES.map((p) => `${SITE_URL}${p.path}`));
  const merged: string[] = [];

  for (const line of extra) {
    const t = line.trim();
    if (!t) continue;
    // 跳过上游自己的标题 / 重复的 intro（官网版为准）
    if (/^#\s/.test(t)) continue;
    // URL 行：按其中出现的绝对地址去重
    const urlMatch = t.match(/https?:\/\/[^\s)\]]+/);
    if (urlMatch && seenUrls.has(urlMatch[0])) continue;
    if (urlMatch) seenUrls.add(urlMatch[0]);
    if (seenLines.has(t)) continue;
    seenLines.add(t);
    merged.push(line);
  }

  const tail = merged.length
    ? ['## 监测产物（由风火GEO 内核生成，已合并去重）', '', ...merged, '']
    : [];

  return new Response([...header, ...tail].join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
