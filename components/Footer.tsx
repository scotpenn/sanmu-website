import Link from "next/link";

const CONTENT_LINKS = [
  { href: "/blog", label: "博客" },
  { href: "/videos", label: "视频" },
  { href: "/events", label: "活动" },
  { href: "/resources/handbook", label: "资料" },
];

const SOCIAL_LINKS = [
  { href: "https://www.youtube.com/@yyds3mu", label: "YouTube · @yyds3mu" },
  { href: "https://xhslink.com/m/51jimi2BVtR", label: "小红书 · @温哥华三木" },
];

export function Footer() {
  return (
    <footer className="border-t border-rule mt-auto">
      <div className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* 列 1 · Logo + 一句简介 */}
          <div>
            <div className="text-2xl font-extrabold text-brand-navy tracking-[-0.01em] mb-3">
              三木有话说
            </div>
            <p className="text-sm leading-relaxed opacity-70">
              温哥华殡葬师，16 年送过 1000+ 个人最后一程。你怕什么，他就聊什么。
            </p>
          </div>

          {/* 列 2 · 内容导航 */}
          <div>
            <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-3">
              Content
            </div>
            <ul className="space-y-2 text-sm">
              {CONTENT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-brand-navy transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 列 3 · 联系 + 社交矩阵 */}
          <div>
            <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-3">
              Connect
            </div>
            <a
              href="mailto:info@sanmu.ca"
              className="block text-sm mb-3 hover:text-brand-navy transition-colors"
            >
              info@sanmu.ca
            </a>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {SOCIAL_LINKS.map((s) => {
                const isExternal = /^https?:\/\//i.test(s.href);
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      {...(isExternal && {
                        target: "_blank",
                        rel: "noopener noreferrer",
                      })}
                      className="hover:text-brand-navy transition-colors opacity-70 hover:opacity-100"
                    >
                      {s.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* 底部 · 版权行 */}
        <div className="border-t border-rule pt-6 flex flex-wrap justify-between gap-3 text-xs opacity-60">
          <div>© 2026 三木有话说 · 由三木个人运营 · sanmu.ca</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link
              href="/disclaimer"
              className="hover:text-brand-navy transition-colors"
            >
              免责声明
            </Link>
            <Link
              href="/privacy"
              className="hover:text-brand-navy transition-colors"
            >
              隐私政策
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
