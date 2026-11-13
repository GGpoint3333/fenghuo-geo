import { FileText, Video, ArrowUpRight } from 'lucide-react';
import {
  a11y,
  cases,
  caseCardLabels,
  caseMeta,
  caseTypeLabels,
  caseVideoTypes,
  casesSection,
  labels,
} from '@/lib/content';

/* 案例来自 monitor.json（示例数据）。每张卡必带「示例」角标。 */

export default function Cases() {
  return (
    <section
      id="cases"
      aria-label={a11y.cases}
      className="border-b border-line bg-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-zhu">{casesSection.kicker}</p>
          <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {casesSection.title}
          </h2>
          <p className="mt-4 break-words text-base leading-relaxed text-ink-2">{casesSection.subtitle}</p>
          <p className="mt-3 break-words text-xs text-ink-3">{casesSection.sourceLine}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {cases.map((c, index) => {
            const cardLabel = caseTypeLabels[c.type] ?? caseCardLabels[index] ?? caseCardLabels[0];
            const Icon = caseVideoTypes.includes(c.type) ? Video : FileText;
            return (
              <article
                key={c.id}
                className="relative flex min-w-0 flex-col rounded-brand border border-line bg-cream p-6 shadow-brand"
              >
                {/* 「示例」角标：由 case.sample 驱动 */}
                {c.sample || caseMeta.sample ? (
                  <span
                    title={labels.sampleBadgeTitle}
                    className="absolute right-0 top-0 rounded-bl-brand rounded-tr-brand bg-zhu px-2.5 py-1 text-[11px] font-semibold text-white"
                  >
                    {labels.sample}
                  </span>
                ) : null}

                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-brand bg-zhu/10 text-zhu">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h3 className="min-w-0 break-words text-lg font-semibold text-ink">{cardLabel}</h3>
                </div>

                <p className="mt-4 break-words text-base font-medium text-ink">{c.title}</p>
                <p className="mt-2 break-words text-sm leading-relaxed text-ink-2">{c.description}</p>

                <p className="mt-4 text-xs text-ink-3">{casesSection.engineLabel}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {c.engineTags.map((tag) => (
                    <span
                      key={tag}
                      className="break-words rounded-brand bg-dai px-2 py-1 text-xs font-medium text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex min-w-0 items-end justify-between gap-3 border-t border-line pt-4">
                  <span className="min-w-0 break-words text-xs text-ink-3">{c.liftLabel}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-2xl font-bold text-zhuqing">
                    {c.lift}
                    <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
