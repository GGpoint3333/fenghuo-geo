import { a11y, brand } from '@/lib/content';

/* 内联 SVG 标志：朱砂红火焰为主，黛青风线为辅。 */
/* 颜色全部由语义 text-* 工具类 + currentColor 驱动，不自造色值。 */
/* dark 变体只影响火焰内芯；火焰主体在任何场景（含暖玄页脚）都是朱砂红。 */

interface BrandMarkProps {
  dark?: boolean;
}

export function BrandMark({ dark = false }: BrandMarkProps) {
  return (
    <svg
      role="img"
      aria-label={a11y.brandLogo}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-9 w-9 shrink-0"
    >
      {/* 黛青风线 */}
      <g className="text-dai">
        <path
          d="M3 14c4-3 8-3 12 0M2 20c5-3.5 9.5-3.5 14 0M4 26c4-2.5 7.5-2.5 11 0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>
      {/* 朱砂红火焰主形 */}
      <g className="text-zhu">
        <path
          d="M20 4c1.2 5.2-3 7.4-3 12.2 0 2 1.1 3.4 2.6 4.2-.3-3.1 1.5-5 3.2-6.8 1.1 2.6 3.9 4.5 3.9 8.5 0 4.7-3.4 8.2-7.7 8.2S11 30 11 25.2c0-5 3.1-7.7 5-11.4.7 2.6 2.3 3.8 3.6 4.4C18.4 13 19 8.2 20 4Z"
          fill="currentColor"
        />
      </g>
      {/* 火焰内芯：暖白 / 暖玄，保证朱砂红主体仍占主导 */}
      <g className={dark ? 'text-warm-black' : 'text-cream'}>
        <path
          d="M20 22.5c.6 2-1 3-1 4.6 0 1.7 1.1 2.9 2.6 2.9 1.5 0 2.6-1.2 2.6-2.9 0-2-1.6-3.1-2.6-4.6-.2 1.2-.7 1.9-1.6 2.3.1-.9.1-1.7 0-2.3Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

interface BrandLockupProps {
  dark?: boolean;
  subtitle?: string;
}

export function BrandLockup({ dark = false, subtitle }: BrandLockupProps) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <BrandMark dark={dark} />
      <span className="flex min-w-0 flex-col leading-tight">
        <span
          className={
            dark
              ? 'break-words text-base font-semibold tracking-tight text-warm-white'
              : 'break-words text-base font-semibold tracking-tight text-ink'
          }
        >
          {brand.name}
        </span>
        {subtitle ? (
          <span
            className={
              dark
                ? 'truncate text-[11px] font-normal text-warm-white/60'
                : 'truncate text-[11px] font-normal text-ink-3'
            }
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
