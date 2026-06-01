import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/test-style"], // 视觉验收页, 不让搜索引擎收录
      },
    ],
    sitemap: "https://www.sanmu.ca/sitemap.xml",
    host: "https://www.sanmu.ca",
  };
}
