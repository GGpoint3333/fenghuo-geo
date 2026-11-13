import { a11y, brand, footerColumns } from '@/lib/content';
import { BrandLockup } from '@/components/Brand';

/* 暖玄 #1a1210 暗色场景，仅此一处，保持紧凑。Logo 强制朱砂红。 */

export default function Footer() {
  return (
    <footer className="bg-warm-black text-warm-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="col-span-2 min-w-0 lg:col-span-1">
            <a href="#top" aria-label={a11y.brandHome} className="inline-flex min-w-0 items-center">
              <BrandLockup dark subtitle={brand.slogan} />
            </a>
            <p className="mt-4 break-words text-xs leading-relaxed text-warm-white/60">
              {brand.operator} · {brand.operatorNote}
            </p>
            {/* 朱砂红点缀 */}
            <span className="mt-4 inline-block h-1 w-10 rounded-brand bg-zhu" aria-hidden="true" />
          </div>

          <nav aria-label={a11y.footerNav} className="contents">
            {footerColumns.map((col) => (
              <div key={col.title} className="min-w-0">
                <h3 className="text-sm font-semibold text-warm-white">{col.title}</h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={link.label} className="min-w-0">
                      <a
                        href={link.href}
                        className="break-words text-xs text-warm-white/70 transition-colors hover:text-zhu"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-9 flex min-w-0 flex-col gap-2 border-t border-warm-white/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-words text-xs text-warm-white/60">{brand.copyright}</p>
          <p className="break-words text-xs text-warm-white/60">{brand.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
