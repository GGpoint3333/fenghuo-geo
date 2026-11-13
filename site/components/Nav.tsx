'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { a11y, brand, navCtas, navLinks } from '@/lib/content';
import { BrandLockup } from '@/components/Brand';

/* 用户规格明确允许 Nav 使用 React useState（React 是框架，不是第三方 JS 库），
 * 并要求「点击锚点时关闭菜单」：原生 details/checkbox 无 JS 做不到这一点，
 * 故用 useState 实现。零第三方 JS 库。 */

export default function Nav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/80 backdrop-blur">
      <nav
        aria-label={a11y.mainNav}
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-6"
      >
        <a
          href="#top"
          aria-label={a11y.brandHome}
          onClick={close}
          className="flex min-w-0 shrink-0 items-center"
        >
          <BrandLockup subtitle={brand.slogan} />
        </a>

        <ul className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-ink-2 transition-colors hover:text-zhu"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={navCtas.login.href}
            className="inline-flex items-center justify-center rounded-brand border border-dai px-4 py-2 text-sm font-medium text-dai transition-colors hover:bg-dai hover:text-white"
          >
            {navCtas.login.label}
          </a>
          <a
            href={navCtas.primary.href}
            className="inline-flex items-center justify-center rounded-brand bg-zhu px-4 py-2 text-sm font-medium text-white shadow-brand transition-opacity hover:opacity-90"
          >
            {navCtas.primary.label}
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? a11y.closeMenu : a11y.openMenu}
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-brand border border-line text-zhu transition-colors hover:bg-cream lg:hidden"
        >
          {open ? (
            <X aria-hidden="true" className="h-5 w-5" />
          ) : (
            <Menu aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </nav>

      {open ? (
        <div
          id="mobile-nav-panel"
          aria-label={a11y.mobileNav}
          className="border-t border-line bg-white/95 backdrop-blur lg:hidden"
        >
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-3 sm:px-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={close}
                  className="block rounded-brand px-3 py-2.5 text-sm font-medium text-ink-2 transition-colors hover:bg-cream hover:text-zhu"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 pb-4 sm:px-6">
            <a
              href={navCtas.login.href}
              onClick={close}
              className="inline-flex w-full items-center justify-center rounded-brand border border-dai px-4 py-2.5 text-sm font-medium text-dai"
            >
              {navCtas.login.label}
            </a>
            <a
              href={navCtas.primary.href}
              onClick={close}
              className="inline-flex w-full items-center justify-center rounded-brand bg-zhu px-4 py-2.5 text-sm font-medium text-white"
            >
              {navCtas.primary.label}
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
