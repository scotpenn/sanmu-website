import { type Locale, siteName, TRADITIONAL_LOCALE } from "@/lib/i18n";
import { localeUrl, organizationSchema } from "@/lib/seo";
import type { PostMeta } from "@/lib/notion";

/**
 * 博客列表页结构化数据: Blog + 最近文章清单(BlogPosting)。
 * 帮 Google 识别这是一个博客集合页, 并提供文章列表, 利于站点链接 / 富结果。
 */
export function BlogListJsonLd({
  locale,
  posts,
}: {
  locale: Locale;
  posts: PostMeta[];
}) {
  const blog = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteName[locale]}${locale === TRADITIONAL_LOCALE ? "網誌" : "博客"}`,
    url: localeUrl("/blog", locale),
    inLanguage: locale,
    publisher: organizationSchema(locale),
    blogPost: posts.slice(0, 20).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: localeUrl(`/blog/${p.slug}`, locale),
      ...(p.date ? { datePublished: p.date } : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(blog) }}
    />
  );
}
