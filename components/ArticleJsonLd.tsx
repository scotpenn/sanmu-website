import { type Locale, navLabels } from "@/lib/i18n";
import {
  absoluteUrl,
  localeUrl,
  organizationSchema,
  personSchema,
} from "@/lib/seo";
import type { PostMeta } from "@/lib/notion";

/**
 * 博客文章的结构化数据: BlogPosting(文章富媒体) + BreadcrumbList(面包屑).
 * 标题/摘要/日期/作者(三木)/发布方(品牌)随 locale, 与可见页面一致.
 */
export function ArticleJsonLd({
  post,
  locale,
}: {
  post: PostMeta;
  locale: Locale;
}) {
  const url = localeUrl(`/blog/${post.slug}`, locale);

  const article = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.subtitle,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: locale,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: absoluteUrl("/portrait.jpg"),
    author: personSchema(locale),
    publisher: organizationSchema(locale),
    ...(post.tags.length ? { keywords: post.tags.join(", ") } : {}),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: navLabels[locale].home,
        item: localeUrl("/", locale),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: navLabels[locale].blog,
        item: localeUrl("/blog", locale),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}
