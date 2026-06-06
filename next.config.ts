import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 把手册 PDF 打包进 Server Action 函数, 确保 Vercel 上能读到.
  // 简繁两个手册页共用同一个 action, 两条路由都包含.
  outputFileTracingIncludes: {
    "/resources/handbook": ["./private/handbook-v2.7.pdf"],
    "/zh-Hant/resources/handbook": ["./private/handbook-v2.7.pdf"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
