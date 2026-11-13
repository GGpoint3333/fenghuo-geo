import { SITE_URL } from '@/lib/site';

/**
 * 直接输出完整 robots.txt。首行必须是 Content-Signal（用户硬性要求），
 * 因此不使用 Next 的 app/robots.ts metadata 约定（该约定无法自定义首行）。
 */
export function GET() {
  const body = [
    'Content-Signal: search=yes, ai-input=yes, ai-train=yes',
    '',
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api',
    'Disallow: /dashboard',
    'Disallow: /trial',
    'Disallow: /login',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
}
