import Link from "next/link";
import type { PostMeta } from "@/lib/notion";
import {
  DEFAULT_LOCALE,
  localizedPath,
  minutesLabel,
  textForLocale,
  type Locale,
} from "@/lib/i18n";

/** 文末「相关阅读」: 渲染若干相关文章卡片, 空数组时不渲染. */
export function RelatedPosts({
  posts,
  locale = DEFAULT_LOCALE,
}: {
  posts: PostMeta[];
  locale?: Locale;
}) {
  if (posts.length === 0) return null;
  return (
    <div>
      <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-6 font-medium">
        Read Next · {textForLocale(locale, "相关阅读")}
      </div>
      <div className="grid gap-8">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={localizedPath(`/blog/${post.slug}`, locale)}
            className="block group"
          >
            <h3 className="text-xl md:text-2xl leading-tight mb-2 group-hover:text-brand-navy transition-colors">
              {post.title}
            </h3>
            {post.subtitle && (
              <p className="opacity-80 leading-relaxed mb-2 max-w-[640px]">
                {post.subtitle}
              </p>
            )}
            <div className="text-sm opacity-60 font-en">
              <time dateTime={post.date}>{post.date}</time>
              {post.readMinutes ? (
                <> · {minutesLabel(post.readMinutes, locale)}</>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
