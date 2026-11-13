import { a11y, engines, mediaWall } from '@/lib/content';

/* 8 个引擎文字标志，无图片。默认灰、hover 朱砂红。id='product' 归本节。 */

export default function MediaWall() {
  return (
    <section
      id="product"
      aria-label={a11y.mediaWall}
      className="border-b border-line bg-cream"
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-zhu">{mediaWall.kicker}</p>
          <h2 className="mt-3 break-words text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {mediaWall.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl break-words text-base leading-relaxed text-ink-2">
            {mediaWall.subtitle}
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {engines.map((name) => (
            <li
              key={name}
              className="flex min-w-0 items-center justify-center rounded-brand border border-line bg-white px-4 py-6 shadow-brand"
            >
              <span className="break-words text-center text-lg font-semibold tracking-tight text-ink-3 transition-colors hover:text-zhu sm:text-xl">
                {name}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-xs text-ink-3">
          {mediaWall.note}
        </p>
      </div>
    </section>
  );
}
