import { ChevronDown } from 'lucide-react';
import { a11y, faqSection, faqs } from '@/lib/content';

/* 原生 details/summary 手风琴，零 JS。group-open: 旋转箭头。 */
/* 服务端组件，零 JS，无第三方库。 */

export default function Faq() {
  return (
    <section
      id="faq"
      aria-label={a11y.faq}
      className="border-b border-line bg-cream"
    >
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-zhu">{faqSection.kicker}</p>
          <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {faqSection.title}
          </h2>
          <p className="mt-4 break-words text-base leading-relaxed text-ink-2">{faqSection.subtitle}</p>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group min-w-0 rounded-brand border border-line bg-white shadow-brand transition-colors open:border-zhu"
            >
              <summary
                className="flex min-w-0 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-base font-medium text-ink [&::-webkit-details-marker]:hidden"
              >
                <span className="min-w-0 break-words">{item.q}</span>
                <ChevronDown
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-zhu transition-transform group-open:rotate-180"
                />
              </summary>
              <div className="border-t border-line px-5 py-4">
                <p className="break-words text-sm leading-relaxed text-ink-2">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
