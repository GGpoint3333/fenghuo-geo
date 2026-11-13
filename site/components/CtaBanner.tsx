import { ArrowRight } from 'lucide-react';
import { a11y, cta } from '@/lib/content';

export default function CtaBanner() {
  return (
    <section
      aria-label={a11y.cta}
      className="border-b border-line bg-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-16">
        <div className="brand-gradient relative overflow-hidden rounded-brand px-6 py-12 shadow-brand sm:px-12">
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="break-words text-3xl font-bold leading-tight tracking-tight text-warm-white sm:text-4xl">
              {cta.headline}
            </h2>
            <p className="mx-auto mt-4 max-w-xl break-words text-sm leading-relaxed text-warm-white/90 sm:text-base">
              {cta.description}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <a
                href={cta.button.href}
                className="inline-flex items-center justify-center gap-2 rounded-brand border-2 border-baijin px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {cta.button.label}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <span className="break-words text-xs text-warm-white/70">{cta.note}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
