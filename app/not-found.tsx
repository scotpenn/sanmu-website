import Link from "next/link";
import { Container } from "@/components/Container";

export const metadata = {
  title: "这页找不到了 · 三木有话说",
};

const SHORTCUTS = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/videos", label: "视频" },
  { href: "/events", label: "活动" },
  { href: "/about", label: "关于三木" },
];

export default function NotFound() {
  return (
    <section>
      <Container width="reading" className="py-20 md:py-32 text-center">
        <div className="text-xs font-en uppercase tracking-widest text-brand-navy/70 mb-4 font-medium">
          404 · Not Found
        </div>
        <h1 className="text-3xl md:text-4xl mb-6">这页找不到了</h1>
        <p className="text-lg opacity-80 mb-10 max-w-[480px] mx-auto leading-relaxed">
          可能链接过期了，可能页面已下线，也可能是一个错别字。
          <br />
          下面这些方向，或许有你想找的：
        </p>

        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-12">
          {SHORTCUTS.map((s, i) => (
            <li key={s.href} className="flex items-center gap-4">
              <Link
                href={s.href}
                className="text-brand-navy font-medium hover:opacity-80 transition-opacity"
              >
                {s.label}
              </Link>
              {i < SHORTCUTS.length - 1 && (
                <span className="opacity-30">·</span>
              )}
            </li>
          ))}
        </ul>

        <p className="text-sm opacity-60">
          实在找不到？给三木来信：{" "}
          <a
            href="mailto:info@sanmu.ca"
            className="text-brand-navy hover:opacity-80 transition-opacity font-medium"
          >
            info@sanmu.ca
          </a>
        </p>
      </Container>
    </section>
  );
}
