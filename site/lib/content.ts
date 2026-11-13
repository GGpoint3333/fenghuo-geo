import monitor from '@/app/data/monitor.json';

/* ------------------------------------------------------------------ */
/* 类型定义                                                            */
/* ------------------------------------------------------------------ */

export interface NavLink {
  label: string;
  href: string;
}

export interface CtaLink {
  label: string;
  href: string;
  variant: 'primary' | 'outline';
}

export interface HeroContent {
  kicker: string;
  headline: string;
  subtitle: string;
  ctas: CtaLink[];
  trust: string[];
}

export interface WorkflowStep {
  number: string;
  title: string;
  description: string;
  icon: string;
  badge: 'jiuzi' | 'baijin' | null;
  badgeLabel: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}

export interface Plan {
  name: string;
  price: string;
  unit: string;
  description: string;
  features: string[];
  cta: CtaLink;
  featured: boolean;
  badge: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export interface CaseItem {
  id: string;
  type: string;
  title: string;
  description: string;
  engineTags: string[];
  lift: string;
  liftLabel: string;
  sample: boolean;
}

/* ------------------------------------------------------------------ */
/* 品牌                                                                */
/* ------------------------------------------------------------------ */

export const brand = {
  name: '风火GEO',
  slogan: '别让AI漏掉你的品牌',
  operator: 'Point',
  operatorNote: '个人独立开发者，学习演示项目',
  copyright: '© 2026 Point · 风火GEO',
  disclaimer: '本网站为个人学习演示项目，非商业运营',
};

/* ------------------------------------------------------------------ */
/* 通用标签、结构化文案与无障碍文案                                      */
/* ------------------------------------------------------------------ */

export const labels = {
  sample: '示例',
  sampleBadgeTitle: '本条为示例数据',
  popular: '最受欢迎',
  login: '登录',
  freeTrial: '免费体验',
  viewWorkflow: '查看工作流',
  pricingNote: '学习演示项目，定价仅为示意',
  caseSourceLine: '数据来源：示例数据 · 由风火GEO生成',
};

export const a11y = {
  mainNav: '主导航',
  mobileNav: '移动端导航',
  openMenu: '打开菜单',
  closeMenu: '关闭菜单',
  toggleMenu: '展开或收起导航菜单',
  brandHome: '风火GEO 首页',
  hero: '品牌首屏',
  brandLogo: '风火GEO 品牌标志：朱砂红火焰与黛青风线',
  heroDecoration: '装饰性火焰余烬与风线图形',
  workflow: '五步工作流',
  mediaWall: '覆盖的 AI 引擎',
  cases: '示例案例',
  features: '产品功能',
  pricing: '定价方案',
  faq: '常见问题',
  cta: '行动号召',
  footerNav: '页脚导航',
  faqToggleHint: '展开或收起答案',
};

/* ------------------------------------------------------------------ */
/* 导航                                                                */
/* ------------------------------------------------------------------ */

export const navLinks: NavLink[] = [
  { label: '产品', href: '#product' },
  { label: '工作流', href: '#workflow' },
  { label: '案例', href: '#cases' },
  { label: '定价', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export const navCtas = {
  login: { label: labels.login, href: '#pricing' },
  primary: { label: labels.freeTrial, href: '#pricing' },
};

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export const hero: HeroContent = {
  kicker: '面向 AI 搜索时代的品牌可见度工作台',
  headline: '别让 AI 漏掉你的品牌',
  subtitle: '实时监测 8 大引擎中品牌的排名、口碑与引用来源',
  ctas: [
    { label: labels.freeTrial, href: '#pricing', variant: 'primary' },
    { label: labels.viewWorkflow, href: '#workflow', variant: 'outline' },
  ],
  trust: ['免费体验', '8 大引擎实时数据', '无需信用卡', '数据透明可导出'],
};

export const heroPanel = {
  title: '品牌可见度速览',
  metrics: [
    { value: '8', label: '覆盖引擎' },
    { value: '5', label: '工作流步骤' },
    { value: '可追踪', label: '引用来源' },
    { value: '可导出', label: '结构化数据' },
  ],
  note: '以上为演示占位指标，真实数值以各引擎实际查询结果为准。',
};

/* ------------------------------------------------------------------ */
/* 工作流                                                              */
/* ------------------------------------------------------------------ */

export const workflowSection = {
  kicker: '五步闭环',
  title: '从被看见，到被引用',
  subtitle: '把 AI 可见度拆成可重复执行的五个动作，每一步都留得下证据。',
};

export const workflowSteps: WorkflowStep[] = [
  {
    number: '01',
    title: '实时监测',
    description: '用一组真实用户问题定期查询 8 大引擎，留痕每一次回答与排名变化。',
    icon: 'Radar',
    badge: 'jiuzi',
    badgeLabel: '起点',
  },
  {
    number: '02',
    title: '来源洞察',
    description: '定位 AI 回答引用的页面与媒体，看清品牌是被谁、在哪里提起的。',
    icon: 'ScanSearch',
    badge: null,
    badgeLabel: '',
  },
  {
    number: '03',
    title: '循证写作',
    description: '基于可核查的事实与来源，生成结构清晰、便于被引用的内容。',
    icon: 'FileText',
    badge: 'baijin',
    badgeLabel: '重点',
  },
  {
    number: '04',
    title: '精准发布',
    description: '把内容放到可被抓取、可被索引的位置，减少无目标的分发。',
    icon: 'Send',
    badge: null,
    badgeLabel: '',
  },
  {
    number: '05',
    title: '效果归因',
    description: '把发布动作与后续提及率、引用变化对照起来，评估每一步的实际贡献。',
    icon: 'TrendingUp',
    badge: 'jiuzi',
    badgeLabel: '闭环',
  },
];

/* ------------------------------------------------------------------ */
/* 引擎墙                                                              */
/* ------------------------------------------------------------------ */

export const engines: string[] = [
  '豆包',
  'DeepSeek',
  '通义千问',
  '腾讯元宝',
  '文心一言',
  'Kimi',
  'GPT',
  'Gemini',
];

export const mediaWall = {
  kicker: '引擎覆盖',
  title: '覆盖 8 大主流 AI 引擎',
  subtitle: '同一组问题，多个引擎，一份可对照的可见度视图。',
  note: '引擎名称仅作覆盖示意，实际回答以各平台为准。',
};

/* ------------------------------------------------------------------ */
/* 案例（数据来自 monitor.json）                                        */
/* ------------------------------------------------------------------ */

export const casesSection = {
  kicker: '示例观察',
  title: '品牌是怎么被提起来的',
  subtitle: '两张卡片，演示提及率与引用来源的读法。',
  sourceLine: labels.caseSourceLine,
  engineLabel: '涉及引擎',
};

export const caseCardLabels: string[] = ['引用文章卡', '视频创作者卡'];

export const caseVideoTypes: string[] = ['video', 'creator', '视频创作者卡'];

export const caseTypeLabels: Record<string, string> = {
  article: '引用文章卡',
  video: '视频创作者卡',
  citation: '引用文章卡',
  creator: '视频创作者卡',
  '引用文章卡': '引用文章卡',
  '视频创作者卡': '视频创作者卡',
};

export const cases = monitor.cases;

export const caseMeta = {
  source: monitor.source,
  sample: monitor.sample,
  generatedAt: monitor.generatedAt,
};

/* ------------------------------------------------------------------ */
/* 功能                                                                */
/* ------------------------------------------------------------------ */

export const featuresSection = {
  kicker: '产品能力',
  title: '把可见度变成日常可做的工作',
  subtitle: '六项能力覆盖查询、分析、写作、发布与接入。',
};

export const features: FeatureItem[] = [
  {
    title: '排名查询',
    description: '按真实问题查看品牌在回答中的位次与出现频次。',
    icon: 'Search',
  },
  {
    title: '口碑分析',
    description: '归总 AI 描述品牌时使用的措辞与情感倾向。',
    icon: 'MessageSquare',
  },
  {
    title: '竞品占位对比',
    description: '把你与竞品放在同一组问题里对照，看清占位差距。',
    icon: 'GitCompare',
  },
  {
    title: '循证内容生成',
    description: '以事实卡与来源为底稿，产出便于被引用的结构化内容。',
    icon: 'PenLine',
  },
  {
    title: '发布效果追踪',
    description: '记录每次发布，并回看之后的提及率与引用变化。',
    icon: 'BarChart3',
  },
  {
    title: 'API 接入',
    description: '把查询、提及与引用数据导出或接入自有看板。',
    icon: 'Code2',
  },
];

/* ------------------------------------------------------------------ */
/* 定价                                                                */
/* ------------------------------------------------------------------ */

export const pricingSection = {
  kicker: '定价',
  title: '按需要选一个起点',
  subtitle: '从一次观察到长期监测，先用小成本跑通流程。',
};

export const plans: Plan[] = [
  {
    name: '免费',
    price: '¥0',
    unit: '/ 月',
    description: '适合先跑通一次完整的观察流程。',
    features: ['每月 50 次真实问题查询', '2 个品牌监测位', '基础提及率看板', '示例数据与文档'],
    cta: { label: '免费开始', href: '#top', variant: 'outline' },
    featured: false,
    badge: '',
  },
  {
    name: '专业',
    price: '¥99',
    unit: '/ 月',
    description: '适合持续跟踪品牌与竞品的团队。',
    features: [
      '每月 2,000 次真实问题查询',
      '10 个品牌监测位',
      '引用来源与竞品对比',
      '循证内容生成',
      '数据导出',
    ],
    cta: { label: labels.freeTrial, href: '#top', variant: 'primary' },
    featured: true,
    badge: labels.popular,
  },
  {
    name: '企业',
    price: '定制',
    unit: '',
    description: '适合需要接入自有系统的场景。',
    features: ['查询额度与品牌位按量商定', 'API 与数据导出', '专属问题集配置', '私有化部署咨询'],
    cta: { label: '联系我们', href: '#faq', variant: 'outline' },
    featured: false,
    badge: '',
  },
];

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export const faqSection = {
  kicker: '常见问题',
  title: '先把问题说清楚',
  subtitle: '关于 GEO、数据与方法，这里给出如实回答。',
};

export const faqs: FaqItem[] = [
  {
    q: '什么是 GEO？',
    a: 'GEO（Generative Engine Optimization，生成式引擎优化）指让品牌在 AI 生成的回答里被准确提及、被可靠引用的一套做法。风火GEO 把「真实问题查询、回答抓取、结构化解析、循证改进」串成可复用的工作流，帮助你看清并稳步改善 AI 可见度。',
  },
  {
    q: 'GEO 和 SEO 的区别是什么？',
    a: 'SEO 面向搜索结果页的排名与点击，GEO 面向生成式引擎一次性给出的整段回答：前者争的是「排第几」，后者争的是「有没有被提、引用了谁」。两者互补，可以共用同一套内容底座与事实来源。',
  },
  {
    q: '支持哪些引擎？',
    a: '目前覆盖豆包、DeepSeek、通义千问、腾讯元宝、文心一言、Kimi、GPT 与 Gemini 共 8 个主流引擎。同一组真实问题会分别留痕，便于横向对照提及位次与引用来源。',
  },
  {
    q: '数据怎么来的？',
    a: '先用一组真实用户问题向各引擎发起查询并保存原始回答，再抓取回答中引用的页面与来源，最后结构化解析出品牌提及、出现位次与引用链接。本演示站展示的是示例数据，并非实时生产数据。',
  },
  {
    q: '支持 API 接入吗？',
    a: '支持。企业方案提供查询、提及结果与引用来源的 API，以及可导出的数据格式，方便接入你自己的看板或 BI。学习演示项目中的接口与返回均为示意。',
  },
  {
    q: '如何开始使用？',
    a: '点击「免费体验」进入演示，选一个品牌与一组问题，依次跑完 01 至 05 五步工作流，就能看到第一份提及率与引用来源报告。无需信用卡，也不需要接入生产系统。',
  },
];

/* ------------------------------------------------------------------ */
/* 行动号召                                                            */
/* ------------------------------------------------------------------ */

export const cta = {
  headline: '让每一次 AI 回答，都有你的品牌',
  description: '用可核查的数据，把品牌可见度变成一项日常可做的工作。',
  button: { label: labels.freeTrial, href: '#pricing' },
  note: '学习演示项目 · 无需信用卡',
};

/* ------------------------------------------------------------------ */
/* 页脚                                                                */
/* ------------------------------------------------------------------ */

export const footerColumns: FooterColumn[] = [
  {
    title: '产品',
    links: [
      { label: '功能概览', href: '#product' },
      { label: '工作流', href: '#workflow' },
      { label: '定价方案', href: '#pricing' },
      { label: '示例案例', href: '#cases' },
    ],
  },
  {
    title: '资源',
    links: [
      { label: '常见问题', href: '#faq' },
      { label: '引擎覆盖', href: '#product' },
      { label: '数据说明', href: '#faq' },
    ],
  },
  {
    title: '关于',
    links: [
      { label: '关于 Point', href: '#top' },
      { label: '项目说明', href: '#top' },
      { label: '联系作者', href: '#faq' },
    ],
  },
  {
    title: '合规',
    links: [
      { label: '演示声明', href: '#pricing' },
      { label: '数据免责', href: '#cases' },
      { label: '使用条款', href: '#top' },
    ],
  },
];
