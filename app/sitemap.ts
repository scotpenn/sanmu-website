import type { MetadataRoute } from "next";
import { getAllPosts, getAllEventSlugs } from "@/lib/notion";
import {
  DEFAULT_LOCALE,
  TRADITIONAL_LOCALE,
  type Locale,
} from "@/lib/i18n";
import { localeUrl, hreflangLanguages } from "@/lib/seo";

const SITEMAP_LOCALES = ["zh-Hans", "zh-Hant"] as const satisfies readonly Locale[];

// ISR: 每小时后台重新查 Notion 一次, 发新文章后无需 redeploy, sitemap 自动更新.
// 不设则 Next 视为永久静态 (revalidate 无限), 只在 build 时刷新一次.
export const revalidate = 3600;

function sitemapEntry({
  path,
  locale,
  priority,
  changeFrequency,
  lastModified,
  availableLocales = SITEMAP_LOCALES,
}: {
  path: string;
  locale: Locale;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  lastModified?: Date;
  /** 该路径实际存在的语言版本. 不传 = 两种都有(静态页). */
  availableLocales?: readonly Locale[];
}): MetadataRoute.Sitemap[number] {
  return {
    url: localeUrl(path, locale),
    lastModified,
    priority,
    changeFrequency,
    // 复用 seo.ts 的智能 hreflang: 只 emit 实际存在的语言版本 + 合理的 x-default
    alternates: {
      languages: hreflangLanguages(path, availableLocales),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静态路由
  const staticPaths = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/about", priority: 0.9, changeFrequency: "monthly" },
    { path: "/blog", priority: 0.9, changeFrequency: "weekly" },
    { path: "/videos", priority: 0.8, changeFrequency: "weekly" },
    { path: "/events", priority: 0.8, changeFrequency: "monthly" },
    {
      path: "/resources/handbook",
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      path: "/resources/glossary",
      priority: 0.7,
      changeFrequency: "monthly",
    },
    { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  ] satisfies Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }>;

  // 静态页 / 活动页没有内容层面的「修改时间」, 用 sitemap 生成时间(每小时 ISR 刷新)兜底, 给爬虫一个新鲜度信号。
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = staticPaths.flatMap((route) => [
    sitemapEntry({ ...route, locale: DEFAULT_LOCALE, lastModified: now }),
    sitemapEntry({ ...route, locale: TRADITIONAL_LOCALE, lastModified: now }),
  ]);

  // 动态拉博客 + 活动 (从 Notion)
  const [hansPosts, hantPosts, hansEventSlugs, hantEventSlugs] = await Promise.all([
    getAllPosts(DEFAULT_LOCALE),
    getAllPosts(TRADITIONAL_LOCALE),
    getAllEventSlugs(DEFAULT_LOCALE),
    getAllEventSlugs(TRADITIONAL_LOCALE),
  ]);

  // 每个 slug 实际存在哪些语言版本 (简→繁 稳定顺序), 给智能 hreflang 用.
  const hansBlogSlugs = new Set(hansPosts.map((p) => p.slug));
  const hantBlogSlugs = new Set(hantPosts.map((p) => p.slug));
  const hansEventSet = new Set(hansEventSlugs);
  const hantEventSet = new Set(hantEventSlugs);
  const localesFor = (slug: string, hans: Set<string>, hant: Set<string>) =>
    SITEMAP_LOCALES.filter(
      (l) =>
        (l === DEFAULT_LOCALE && hans.has(slug)) ||
        (l === TRADITIONAL_LOCALE && hant.has(slug)),
    );

  const blogRoutes: MetadataRoute.Sitemap = [
    ...hansPosts.map((post) =>
      sitemapEntry({
        path: `/blog/${post.slug}`,
        locale: DEFAULT_LOCALE,
        lastModified: post.date ? new Date(post.date) : undefined,
        priority: 0.7,
        changeFrequency: "monthly",
        availableLocales: localesFor(post.slug, hansBlogSlugs, hantBlogSlugs),
      }),
    ),
    ...hantPosts.map((post) =>
      sitemapEntry({
        path: `/blog/${post.slug}`,
        locale: TRADITIONAL_LOCALE,
        lastModified: post.date ? new Date(post.date) : undefined,
        priority: 0.7,
        changeFrequency: "monthly",
        availableLocales: localesFor(post.slug, hansBlogSlugs, hantBlogSlugs),
      }),
    ),
  ];

  const eventRoutes: MetadataRoute.Sitemap = [
    ...hansEventSlugs.map((slug) =>
      sitemapEntry({
        path: `/events/${slug}`,
        locale: DEFAULT_LOCALE,
        lastModified: now,
        priority: 0.6,
        changeFrequency: "monthly",
        availableLocales: localesFor(slug, hansEventSet, hantEventSet),
      }),
    ),
    ...hantEventSlugs.map((slug) =>
      sitemapEntry({
        path: `/events/${slug}`,
        locale: TRADITIONAL_LOCALE,
        lastModified: now,
        priority: 0.6,
        changeFrequency: "monthly",
        availableLocales: localesFor(slug, hansEventSet, hantEventSet),
      }),
    ),
  ];

  return [...staticRoutes, ...blogRoutes, ...eventRoutes];
}
