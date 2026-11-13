import { Check } from 'lucide-react';
import { a11y, labels, plans, pricingSection } from '@/lib/content';

export default function Pricing() {
  return (
    <section
      id="pricing"
      aria-label={a11y.pricing}
      className="border-b border-line bg-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-zhu">{pricingSection.kicker}</p>
          <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {pricingSection.title}
          </h2>
          <p className="mt-4 break-words text-base leading-relaxed text-ink-2">{pricingSection.subtitle}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isFeatured = plan.featured;
            return (
              <article
                key={plan.name}
                className={
                  isFeatured
                    ? 'relative min-w-0 rounded-brand border-2 border-zhu bg-white p-6 shadow-brand'
                    : 'relative min-w-0 rounded-brand border border-line bg-white p-6 shadow-brand'
                }
              >
                {isFeatured ? (
                  <span className="absolute right-0 top-0 rounded-bl-brand rounded-tr-brand bg-baijin px-3 py-1 text-xs font-semibold text-ink">
                    {plan.badge}
                  </span>
                ) : null}

                <h3 className="break-words text-lg font-semibold text-ink">{plan.name}</h3>
                <p className="mt-2 break-words text-sm text-ink-2">{plan.description}</p>

                <p className="mt-5 flex min-w-0 flex-wrap items-baseline gap-1">
                  <span className="break-words text-4xl font-bold tracking-tight text-zhu">{plan.price}</span>
                  {plan.unit ? <span className="text-sm text-ink-3">{plan.unit}</span> : null}
                </p>

                <ul className="mt-6 flex flex-col gap-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex min-w-0 items-start gap-2 text-sm text-ink-2">
                      <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-zhu" />
                      <span className="break-words">{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.cta.variant === 'primary' ? (
                  <a
                    href={plan.cta.href}
                    className="mt-7 inline-flex w-full items-center justify-center rounded-brand bg-zhu px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-opacity hover:opacity-90"
                  >
                    {plan.cta.label}
                  </a>
                ) : (
                  <a
                    href={plan.cta.href}
                    className="mt-7 inline-flex w-full items-center justify-center rounded-brand border border-zhu px-4 py-2.5 text-sm font-semibold text-zhu transition-colors hover:bg-zhu hover:text-white"
                  >
                    {plan.cta.label}
                  </a>
                )}
              </article>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-ink-3">{labels.pricingNote}</p>
      </div>
    </section>
  );
}
