import { Check, ArrowRight } from 'lucide-react';
import { a11y, hero, heroPanel, labels } from '@/lib/content';

/* Hero：h1 全站唯一。品牌唯一渐变（朱砂红→九紫）铺满首屏，
 * 叠加火焰余烬 + 风势线条几何图案；装饰层被 overflow-hidden 裁切，
 * 只覆盖 hero 高度，不渗入下一区块。文字用暖白 #FAF6F0。 */

export default function Hero() {
  return (
    <section
      id="top"
      aria-label={a11y.hero}
      className="relative isolate overflow-hidden border-b border-line bg-white"
    >
      {/* 装饰层：品牌渐变 + 几何图案，仅存在于 hero 高度内 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="brand-gradient absolute inset-0" />
        {/* 左侧轻微压暗，保证暖白大标题的对比度；仍为同一朱砂红→九紫渐变 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />
        <svg
          role="img"
          aria-label={a11y.heroDecoration}
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-0 top-0 h-full w-full max-w-[720px] text-warm-white"
        >
          {/* 风势线条 */}
          <g stroke="currentColor" strokeOpacity="0.20" strokeWidth="2" strokeLinecap="round">
            <path d="M120 90c90-40 180-40 270 0" />
            <path d="M90 150c110-48 220-48 330 0" />
            <path d="M140 210c80-36 160-36 240 0" />
            <path d="M300 470c90-40 170-40 240 0" />
            <path d="M330 520c80-34 150-34 210 0" />
          </g>
          {/* 火焰余烬 */}
          <g fill="currentColor" fillOpacity="0.12">
            <circle cx="470" cy="160" r="46" />
            <circle cx="540" cy="250" r="26" />
            <circle cx="420" cy="300" r="18" />
            <circle cx="520" cy="380" r="34" />
            <circle cx="380" cy="410" r="12" />
            <circle cx="250" cy="120" r="10" />
            <circle cx="200" cy="330" r="14" />
          </g>
        </svg>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:py-28">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-brand border border-warm-white/40 bg-white/10 px-3 py-1.5 text-xs font-medium text-warm-white shadow-brand backdrop-blur">
            <span className="h-1.5 w-1.5 shrink-0 rounded-brand bg-warm-white" />
            <span className="break-words">{hero.kicker}</span>
          </span>

          <h1 className="mt-6 break-words text-4xl font-bold leading-tight tracking-tight text-warm-white sm:text-5xl lg:text-6xl">
            {hero.headline}
          </h1>

          <p className="mt-5 max-w-xl break-words text-base leading-relaxed text-warm-white/90 sm:text-lg">
            {hero.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {hero.ctas.map((cta) =>
              cta.variant === 'primary' ? (
                <a
                  key={cta.label}
                  href={cta.href}
                  className="inline-flex items-center justify-center gap-2 rounded-brand bg-white px-6 py-3 text-sm font-semibold text-zhu shadow-brand transition-opacity hover:opacity-90"
                >
                  {cta.label}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </a>
              ) : (
                <a
                  key={cta.label}
                  href={cta.href}
                  className="inline-flex items-center justify-center gap-2 rounded-brand border-2 border-baijin px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-white/10"
                >
                  {cta.label}
                </a>
              )
            )}
          </div>

          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {hero.trust.map((item) => (
              <li key={item} className="flex min-w-0 items-center gap-2 text-sm text-warm-white/90">
                <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-warm-white" />
                <span className="break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 右侧数据卡：暖白浅底 + 朱砂红强调数字，渐变底上依然显色 */}
        <div className="min-w-0 lg:justify-self-end">
          <div className="w-full max-w-md rounded-brand border border-line bg-white/95 p-6 shadow-brand backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <span className="break-words text-sm font-medium text-ink-2">{heroPanel.title}</span>
              <span className="shrink-0 rounded-brand bg-dai/10 px-2 py-1 text-xs font-medium text-dai">{labels.sample}</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {heroPanel.metrics.map((m, i) => (
                <div key={m.label} className="min-w-0 rounded-brand bg-cream p-4">
                  <p className={i === 2 ? 'text-3xl font-bold tracking-tight text-zhuqing' : 'text-3xl font-bold tracking-tight text-zhu'}>
                    {m.value}
                  </p>
                  <p className="mt-1 break-words text-xs text-ink-3">{m.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 break-words text-xs leading-relaxed text-ink-3">
              {heroPanel.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
