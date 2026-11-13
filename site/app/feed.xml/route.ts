import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, CORE_PAGES } from '@/lib/site';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** RSS 2.0 占位源：每条核心页面一个 item，避免编造不存在的「文章」。 */
export function GET() {
  const items = CORE_PAGES.filter((p) => p.path !== '/sitemap.xml')
    .map(
      (p) => `    <item>
      <title>${esc(SITE_NAME + ' · ' + p.path)}</title>
      <link>${SITE_URL}${p.path}</link>
      <guid isPermaLink="true">${SITE_URL}${p.path}</guid>
      <description>${esc(p.description)}</description>
      <pubDate>Thu, 13 Nov 2026 00:00:00 +0800</pubDate>
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${esc(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <lastBuildDate>Thu, 13 Nov 2026 00:00:00 +0800</lastBuildDate>
    <!-- 占位源：演示项目，尚未发布真实内容更新 -->
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
