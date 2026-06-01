"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "首页" },
  { href: "/videos", label: "视频" },
  { href: "/blog", label: "博客" },
  { href: "/events", label: "活动" },
  { href: "/about", label: "关于" },
  { href: "/resources/handbook", label: "资料" },
];

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // 切换路由时自动关闭移动端菜单
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
    <header className="border-b border-rule relative bg-paper">
      <div className="mx-auto max-w-[1280px] px-6 py-5 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-2xl font-extrabold text-brand-navy tracking-[-0.01em] hover:opacity-80 transition-opacity"
        >
          三木有话说
        </Link>

        {/* 桌面端 nav (md+) */}
        <nav className="hidden md:flex flex-wrap gap-x-6 gap-y-2 text-base">
          {NAV.map((item) => {
            const active = isActiveLink(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "text-brand-navy font-medium border-b-2 border-brand-navy pb-0.5"
                    : "text-ink hover:text-brand-navy transition-colors"
                }
              >
                {item.label}
              </Link>
            );
          })}
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
              const active = isActiveLink(pathname, item.href);
              const isLast = i === NAV.length - 1;
              return (
                <li
                  key={item.href}
                  className={isLast ? "" : "border-b border-rule"}
                >
                  <Link
                    href={item.href}
                    className={
                      active
                        ? "block py-4 text-brand-navy font-medium"
                        : "block py-4 text-ink hover:text-brand-navy transition-colors"
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
