import type { MetadataRoute } from 'next';
import { SITE_URL, CORE_PAGES } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return CORE_PAGES.filter((p) => p.path !== '/sitemap.xml').map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: new Date('2026-11-13T00:00:00+08:00'),
    changeFrequency: p.path === '/' ? 'weekly' : 'monthly',
    priority: p.path === '/' ? 1 : 0.6,
  }));
}
