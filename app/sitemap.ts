import type { MetadataRoute } from "next";
import { getAllPosts, getAllEventSlugs } from "@/lib/notion";

const SITE = "https://www.sanmu.ca";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静态路由
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, priority: 1.0, changeFrequency: "weekly" },
    { url: `${SITE}/about`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${SITE}/blog`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${SITE}/videos`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${SITE}/events`, priority: 0.8, changeFrequency: "monthly" },
    {
      url: `${SITE}/resources/handbook`,
      priority: 0.8,
      changeFrequency: "monthly",
    },
    { url: `${SITE}/disclaimer`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${SITE}/privacy`, priority: 0.3, changeFrequency: "yearly" },
  ];

  // 动态拉博客 + 活动 (从 Notion)
  const [posts, eventSlugs] = await Promise.all([
    getAllPosts(),
    getAllEventSlugs(),
  ]);

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : undefined,
    priority: 0.7,
    changeFrequency: "monthly",
  }));

  const eventRoutes: MetadataRoute.Sitemap = eventSlugs.map((slug) => ({
    url: `${SITE}/events/${slug}`,
    priority: 0.6,
    changeFrequency: "monthly",
  }));

  return [...staticRoutes, ...blogRoutes, ...eventRoutes];
}
