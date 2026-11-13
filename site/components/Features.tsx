import {
  Search,
  MessageSquare,
  GitCompare,
  PenLine,
  BarChart3,
  Code2,
  type LucideIcon,
} from 'lucide-react';
import { a11y, features, featuresSection } from '@/lib/content';

const iconMap: Record<string, LucideIcon> = {
  Search,
  MessageSquare,
  GitCompare,
  PenLine,
  BarChart3,
  Code2,
};

/* 注意：id='product' 归 MediaWall，本节不重复该 id。 */

export default function Features() {
  return (
    <section
      aria-label={a11y.features}
      className="border-b border-line bg-cream"
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-zhu">{featuresSection.kicker}</p>
          <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {featuresSection.title}
          </h2>
          <p className="mt-4 break-words text-base leading-relaxed text-ink-2">{featuresSection.subtitle}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon] ?? Search;
            return (
              <article
                key={feature.title}
                className="min-w-0 rounded-brand border border-line bg-white p-6 shadow-brand transition-colors hover:border-jiuzi"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-brand bg-zhu/10 text-zhu">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <h3 className="mt-4 break-words text-lg font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 break-words text-sm leading-relaxed text-ink-2">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
