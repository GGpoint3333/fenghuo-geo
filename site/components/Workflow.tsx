import {
  Radar,
  ScanSearch,
  FileText,
  Send,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { a11y, workflowSection, workflowSteps } from '@/lib/content';

const iconMap: Record<string, LucideIcon> = {
  Radar,
  ScanSearch,
  FileText,
  Send,
  TrendingUp,
};

/* 01/05 九紫角标，03 八白金角标；大号描边数字用朱砂红。 */

export default function Workflow() {
  return (
    <section
      id="workflow"
      aria-label={a11y.workflow}
      className="border-b border-line bg-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-zhu">{workflowSection.kicker}</p>
          <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {workflowSection.title}
          </h2>
          <p className="mt-4 break-words text-base leading-relaxed text-ink-2">{workflowSection.subtitle}</p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
          {workflowSteps.map((step) => {
            const Icon = iconMap[step.icon] ?? Radar;
            let badgeClass = 'absolute right-0 top-0 rounded-bl-brand rounded-tr-brand px-2 py-1 text-[11px] font-semibold';
            if (step.badge === 'jiuzi') {
              badgeClass += ' bg-jiuzi text-white';
            } else if (step.badge === 'baijin') {
              badgeClass += ' bg-baijin text-ink';
            }
            return (
              <li
                key={step.number}
                className="relative min-w-0 rounded-brand border border-line bg-white p-5 shadow-brand transition-colors hover:border-zhu"
              >
                {step.badge ? (
                  <span className={badgeClass}>{step.badgeLabel}</span>
                ) : null}

                <p
                  aria-hidden="true"
                  className="select-none text-5xl font-black leading-none text-transparent [-webkit-text-stroke:2px_#c23b22] sm:text-6xl"
                >
                  {step.number}
                </p>

                <div className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-brand bg-zhu/10 text-zhu">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>

                <h3 className="mt-4 break-words text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 break-words text-sm leading-relaxed text-ink-2">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
