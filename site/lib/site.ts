/**
 * 站点级常量。改这里（或设置 NEXT_PUBLIC_SITE_URL）即可切换 canonical / OG /
 * sitemap / RSS / llms.txt 里的绝对地址；默认值为学习演示用的占位域名。
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fenghuo-geo.example.com'
).replace(/\/$/, '');

export const SITE_NAME = '风火GEO';
export const SITE_SLOGAN = '别让AI漏掉你的品牌';

export const SITE_DESCRIPTION =
  '风火GEO 实时监测豆包、DeepSeek、通义千问、腾讯元宝、文心一言、Kimi、GPT、Gemini 八大引擎中品牌的排名、口碑与引用来源，用真实问题查询与循证写作把 AI 可见度变成可复用的工作流。';

/** llms.txt 首段：100 字以内，说清「是谁 / 监测哪些引擎 / 四步工作流」。 */
export const LLMS_INTRO =
  '风火GEO 是 Point 的演示项目，监测豆包、DeepSeek、通义千问、腾讯元宝、文心一言、Kimi、GPT、Gemini 的品牌提及与引用；四步：基线诊断→战场分析→循证写作→精准发布。';

export interface CorePage {
  path: string;
  description: string;
}

/** 核心页面清单，llms.txt / sitemap / RSS 共用同一份事实来源。 */
export const CORE_PAGES: CorePage[] = [
  { path: '/', description: '风火GEO 首页：品牌、五步工作流、8 大引擎覆盖、示例案例、功能、定价与 FAQ。' },
  { path: '/llms.txt', description: '面向大模型的站点说明：品牌定义、四步工作流与核心页面索引。' },
  { path: '/feed.xml', description: 'RSS 2.0 订阅源（占位），用于发布监测观察与内容更新。' },
  { path: '/sitemap.xml', description: '站点地图，列出可被搜索引擎与 AI 抓取的公开页面。' },
  { path: '/robots.txt', description: '抓取规则，首行声明 Content-Signal 允许搜索、AI 输入与训练。' },
];
