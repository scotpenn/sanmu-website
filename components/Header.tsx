"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <header className="border-b border-rule">
      <div className="mx-auto max-w-[1280px] px-6 py-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="text-2xl font-extrabold text-brand-navy tracking-[-0.01em] hover:opacity-80 transition-opacity"
        >
          三木有话说
        </Link>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-base">
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
      </div>
    </header>
  );
}
