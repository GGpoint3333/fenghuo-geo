import type { Metadata } from 'next';
import './globals.css';
import { faqs } from '@/lib/content';
import { SITE_URL, SITE_NAME, SITE_SLOGAN, SITE_DESCRIPTION } from '@/lib/site';

const TITLE = `${SITE_NAME} · ${SITE_SLOGAN}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'GEO',
    '生成式引擎优化',
    'AI 搜索',
    '品牌可见度',
    'AI 提及率',
    SITE_NAME,
    SITE_SLOGAN,
  ],
  authors: [{ name: 'Point', url: SITE_URL }],
  creator: 'Point',
  publisher: 'Point',
  alternates: {
    canonical: '/',
    languages: { 'zh-CN': '/' },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} · ${SITE_SLOGAN}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  category: 'technology',
};

/** 首页 JSON-LD：Organization(name: Point) + WebSite + FAQPage（复用 faqs 单一真源）。 */
function JsonLd() {
  const graph = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Point',
      url: SITE_URL,
      description: '个人独立开发者，风火GEO 为学习演示项目，非商业运营。',
      founder: { '@type': 'Person', name: 'Point' },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: 'zh-CN',
      description: SITE_DESCRIPTION,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  const json = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };

  return (
    <script
      type="application/ld+json"
      // 内容由本文件常量构造，不注入任何外部输入
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
