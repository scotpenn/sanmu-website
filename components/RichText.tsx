import Link from "next/link";
import type { RichSegment } from "@/lib/notion";

// 站内域名: href 命中这些 host 就归一成相对路径, 用 Next <Link> 客户端跳转
const SITE_HOSTS = ["www.sanmu.ca", "sanmu.ca"];
const LINK_CLASS =
  "text-brand-navy underline underline-offset-2 hover:opacity-80 transition-opacity";

function resolveHref(href: string): { to: string; external: boolean } {
  if (href.startsWith("/")) return { to: href, external: false }; // 相对路径
  try {
    const u = new URL(href);
    if (SITE_HOSTS.includes(u.hostname)) {
      return { to: u.pathname + u.search + u.hash, external: false };
    }
  } catch {
    // 非法 URL: 当外链兜底
  }
  return { to: href, external: true };
}

/** 渲染 Notion 段落分段: 无 href 是纯文字, 有 href 按站内/站外渲染成链接. */
export function RichText({ segments }: { segments: RichSegment[] }) {
  return (
    <>
      {segments.map((seg, i) => {
        if (!seg.href) return <span key={i}>{seg.text}</span>;
        const { to, external } = resolveHref(seg.href);
        if (external) {
          return (
            <a
              key={i}
              href={to}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              {seg.text}
            </a>
          );
        }
        return (
          <Link key={i} href={to} className={LINK_CLASS}>
            {seg.text}
          </Link>
        );
      })}
    </>
  );
}
