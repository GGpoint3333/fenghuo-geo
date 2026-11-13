/**
 * 风火GEO · 引擎配置 TS 类型门面
 *
 * 运行时真源是 ./engines.mjs（零依赖 ESM，core 为纯 JS 包）。
 * 本文件只提供静态类型，供编辑器与类型检查使用；请从 './engines.mjs'
 * import 运行时值，不要从本文件 import 运行时常量（它们是 ambient 声明）。
 */

export type EngineMode = 'api' | 'manual' | 'web';

export interface EngineExtra {
  enable_search?: boolean;
  [key: string]: unknown;
}

export interface Engine {
  id: string;
  name: string;
  mode: EngineMode;
  envKey: string | null;
  base: string | null;
  model: string | null;
  modelEnv?: string;
  extra?: EngineExtra;
  keyUrl: string;
  upstream: boolean;
  entry: string;
  note: string;
}

export interface EngineKeyUrl {
  id: string;
  name: string;
  mode: EngineMode;
  envKey: string | null;
  keyUrl: string;
  entry: string;
  upstream: boolean;
  note: string;
}

export interface Budget {
  limitCny: number;
  spentCny: number;
  stopped: boolean;
}

export interface Coverage {
  total: number;
  api: number;
  configured: number;
  sampled: number;
  skipped: number;
  manual: number;
  unconfigured: number;
  errors: number;
}

export interface Gap {
  question: string;
  engine: string;
  detail: string;
}

export type EngineStatus = 'ok' | 'unconfigured' | 'manual' | 'error' | 'skipped';

export interface EngineReport {
  id: string;
  name: string;
  mode: EngineMode;
  status: EngineStatus;
  envKey: string | null;
  keyUrl: string;
  entry: string;
  note: string;
  mentionCount: number;
  mentions: unknown[];
  mentionRate: number;
  total: number;
  error?: string;
}

export interface MonitorCase {
  id: string;
  type: 'article' | 'video';
  title: string;
  description: string;
  engineTags: string[];
  lift: string;
  liftLabel: string;
  sample: boolean;
}

export type ReportSource = 'fixture' | 'live' | 'partial';

export interface LatestReport {
  schemaVersion: 1;
  generatedAt: string;
  brand: string;
  source: ReportSource;
  sample: boolean;
  budget: Budget;
  coverage: Coverage;
  mentionRate: number;
  engines: EngineReport[];
  gaps: Gap[];
  cases: MonitorCase[];
  questions: string[];
  timestamp: number;
}

/** 官网数据文件 site/app/data/monitor.json 的 schema（固定）。 */
export interface SiteMonitorData {
  generatedAt: string;
  sample: boolean;
  source: string;
  cases: MonitorCase[];
}

export declare const PROJECT_ROOT: string;
export declare const ENGINES: Engine[];
export declare const BUDGET_LIMIT_CNY: number;
export declare const ENGINE_KEY_URLS: EngineKeyUrl[];
export declare function estimateCostCny(engine: Engine, calls?: number): number;
export declare function resolveModel(engine: Engine, env?: Record<string, string | undefined>): string | null;
export declare function loadEnv(): Record<string, string | undefined>;
export declare function configuredEngines(env?: Record<string, string | undefined>): Engine[];
