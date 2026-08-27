"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LOCALES,
  localeFromPathname,
  localeShortLabels,
  navLabels,
  siteName,
  stripLocalePrefix,
  switchLocalePath,
  withLocalePrefix,
  type Locale,
} from "@/lib/i18n";

const NAV = [
  { href: "/", key: "home" },
  { href: "/videos", key: "videos" },
  { href: "/blog", key: "blog" },
  { href: "/events", key: "events" },
  { href: "/about", key: "about" },
  { href: "/resources/handbook", key: "resources" },
] as const;

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * 分段式语言切换器 (简 | 繁). 当前语言高亮, 点另一格切到对应路径.
 * size="md" 给移动端更大的点击区; onNavigate 用于移动端切换后关菜单.
 */
function LocaleSwitcher({
  pathname,
  locale,
  size = "sm",
  onNavigate,
}: {
  pathname: string;
  locale: Locale;
  size?: "sm" | "md";
  onNavigate?: () => void;
}) {
  const pad = size === "md" ? "px-4 py-1.5 text-base" : "px-3 py-1 text-sm";
  return (
    <div
      role="group"
      aria-label="语言 / 語言"
      className="inline-flex items-center overflow-hidden rounded-full border border-rule"
    >
      {LOCALES.map((l) =>
        l === locale ? (
          <span
            key={l}
            aria-current="true"
            className={`${pad} bg-brand-navy text-paper font-medium`}
          >
            {localeShortLabels[l]}
          </span>
        ) : (
          <Link
            key={l}
            href={switchLocalePath(pathname, l)}
            hrefLang={l}
            onClick={onNavigate}
            className={`${pad} text-ink/70 hover:text-brand-navy transition-colors`}
          >
            {localeShortLabels[l]}
          </Link>
        ),
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const normalizedPathname = stripLocalePrefix(pathname);
  const [isOpen, setIsOpen] = useState(false);

  // Escape 键关闭
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <header className="border-b border-rule sticky top-0 z-40 bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[1280px] px-6 py-5 flex items-center justify-between gap-4">
        <Link
          href={withLocalePrefix("/", locale)}
          className="text-2xl font-extrabold text-brand-navy tracking-[-0.01em] hover:opacity-80 transition-opacity"
        >
          {siteName[locale]}
        </Link>

        {/* 桌面端 nav (md+) */}
        <nav className="hidden md:flex flex-wrap gap-x-6 gap-y-2 text-base">
          {NAV.map((item) => {
            const active = isActiveLink(normalizedPathname, item.href);
            return (
              <Link
                key={item.href}
                href={withLocalePrefix(item.href, locale)}
                className={
                  active
                    ? "text-brand-navy font-medium border-b-2 border-brand-navy pb-0.5"
                    : "text-ink hover:text-brand-navy transition-colors"
                }
              >
                {navLabels[locale][item.key]}
                {item.key === "events" && (
                  <span aria-hidden className="ml-0.5">🔥</span>
                )}
              </Link>
            );
          })}
          <LocaleSwitcher pathname={pathname} locale={locale} />
        </nav>

        {/* 移动端 hamburger (<md) */}
        <button
          type="button"
          aria-label={isOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={isOpen ? "true" : "false"}
          aria-controls="mobile-nav"
          onClick={() => setIsOpen((p) => !p)}
          className="md:hidden -mr-2 p-2 text-brand-navy"
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* 移动端下拉 menu */}
      {isOpen && (
        <nav
          id="mobile-nav"
          className="md:hidden absolute top-full left-0 right-0 bg-paper border-b border-rule shadow-lg z-50"
        >
          <ul className="px-6">
            {NAV.map((item, i) => {
              const active = isActiveLink(normalizedPathname, item.href);
              const isLast = i === NAV.length - 1;
              return (
                <li
                  key={item.href}
                  className={isLast ? "" : "border-b border-rule"}
                >
                  <Link
                    href={withLocalePrefix(item.href, locale)}
                    onClick={() => setIsOpen(false)}
                    className={
                      active
                        ? "block py-4 text-brand-navy font-medium"
                        : "block py-4 text-ink hover:text-brand-navy transition-colors"
                    }
                  >
                    {navLabels[locale][item.key]}
                    {item.key === "events" && (
                      <span aria-hidden className="ml-0.5">🔥</span>
                    )}
                  </Link>
                </li>
              );
            })}
            <li className="border-t border-rule pt-4 mt-2">
              <LocaleSwitcher
                pathname={pathname}
                locale={locale}
                size="md"
                onNavigate={() => setIsOpen(false)}
              />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
