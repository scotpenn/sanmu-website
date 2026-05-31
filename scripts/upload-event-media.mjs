#!/usr/bin/env node
/**
 * upload-event-media.mjs
 * 把本地文件夹的图片批量上传到 Cloudinary, 然后写入 Notion event 条目的封面图 + 现场照片字段.
 *
 * 用法 (在 sanmu-website/ 目录下):
 *   npm run media:upload -- <event-slug> <local-folder>
 *
 * 例:
 *   npm run media:upload -- houshi-na-xie-shi-er-2026-05 ~/Desktop/sanmu-events/2026-05/
 *
 * 行为:
 *   1. 文件夹内所有 jpg/jpeg/png/webp/heic/heif/gif 文件按文件名升序排
 *   2. 逐个传到 Cloudinary 的 sanmu-events/<slug>/ 文件夹
 *   3. 第 1 张设为 Notion 「封面图」字段 (single external link)
 *   4. 全部填入 Notion 「现场照片」字段 (multiple external links)
 *   5. 已有的字段内容会被覆盖 (重跑同一文件夹 = 替换)
 */

import { v2 as cloudinary } from "cloudinary";
import { Client as NotionClient } from "@notionhq/client";
import { readdir, stat } from "fs/promises";
import { extname, join, resolve } from "path";
import { homedir } from "os";

const EVENTS_DATA_SOURCE_ID = "d5b3cb57-7b27-4acd-b936-ae2ca6f275f1";
const IMG_EXTS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
  ".gif",
]);

function expandHome(p) {
  if (p.startsWith("~/")) return join(homedir(), p.slice(2));
  return p;
}

function checkEnv() {
  const missing = [];
  for (const k of [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "NOTION_TOKEN",
  ]) {
    if (!process.env[k]) missing.push(k);
  }
  if (missing.length > 0) {
    console.error(`✗ 缺少环境变量: ${missing.join(", ")}`);
    console.error(
      `  本脚本用 --env-file=../.env 加载, 请确认根目录 .env 含上述变量.`,
    );
    process.exit(1);
  }
}

async function main() {
  const [, , slug, rawDir] = process.argv;
  if (!slug || !rawDir) {
    console.error(
      `用法: npm run media:upload -- <event-slug> <local-folder>\n`,
    );
    console.error(`例: npm run media:upload -- houshi-na-xie-shi-er-2026-05 ~/Desktop/photos/`);
    process.exit(1);
  }
  checkEnv();

  const dir = resolve(expandHome(rawDir));
  console.log(`→ event slug = ${slug}`);
  console.log(`→ 本地文件夹  = ${dir}`);

  // 1. List image files
  let entries;
  try {
    entries = await readdir(dir);
  } catch (e) {
    console.error(`✗ 读取文件夹失败: ${e.message}`);
    process.exit(1);
  }
  const imageFiles = [];
  for (const name of entries) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    const s = await stat(full);
    if (!s.isFile()) continue;
    if (IMG_EXTS.has(extname(name).toLowerCase())) imageFiles.push(name);
  }
  imageFiles.sort();
  if (imageFiles.length === 0) {
    console.error(`✗ 文件夹内没找到图片`);
    process.exit(1);
  }
  console.log(`  共 ${imageFiles.length} 张图\n`);

  // 2. Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // 3. Upload each image
  const cloudFolder = `sanmu-events/${slug}`;
  const uploaded = [];
  for (const file of imageFiles) {
    const localPath = join(dir, file);
    process.stdout.write(`  ↑ ${file} ... `);
    try {
      const result = await cloudinary.uploader.upload(localPath, {
        folder: cloudFolder,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        resource_type: "image",
      });
      uploaded.push({ name: file, url: result.secure_url });
      console.log(`✓`);
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
  }

  if (uploaded.length === 0) {
    console.error(`\n✗ 没有图成功上传, 终止`);
    process.exit(1);
  }
  console.log(`\n✓ Cloudinary 上传完成: ${uploaded.length}/${imageFiles.length}\n`);

  // 4. Find Notion event by slug
  console.log(`→ 查找 Notion event slug="${slug}"`);
  const notion = new NotionClient({ auth: process.env.NOTION_TOKEN });
  const query = await notion.dataSources.query({
    data_source_id: EVENTS_DATA_SOURCE_ID,
    filter: { property: "Slug", rich_text: { equals: slug } },
    page_size: 1,
  });

  if (query.results.length === 0) {
    console.error(`✗ Notion Events 库里没找到 slug="${slug}" 的条目`);
    console.error(`\n已上传 URLs (你可以手动粘到 Notion):`);
    uploaded.forEach((u) => console.error(`  ${u.url}`));
    process.exit(1);
  }
  const pageId = query.results[0].id;
  console.log(`  ${pageId}\n`);

  // 5. Update Notion entry: 封面图 = 第 1 张, 现场照片 = 全部
  console.log(`→ 更新 Notion 字段`);
  console.log(`  封面图   = ${uploaded[0].name}`);
  console.log(`  现场照片 = ${uploaded.length} 张`);

  await notion.pages.update({
    page_id: pageId,
    properties: {
      封面图: {
        files: [
          {
            type: "external",
            name: uploaded[0].name,
            external: { url: uploaded[0].url },
          },
        ],
      },
      现场照片: {
        files: uploaded.map((u) => ({
          type: "external",
          name: u.name,
          external: { url: u.url },
        })),
      },
    },
  });

  console.log(`\n✓ Notion 更新完成`);

  // 6. Trigger Vercel deploy hook (auto-publish)
  const deployHook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (deployHook) {
    console.log(`\n→ 触发 Vercel Deploy Hook`);
    try {
      const resp = await fetch(deployHook, { method: "POST" });
      if (resp.ok) {
        const data = await resp.json();
        console.log(`  ✓ Deploy 已触发 (job ${data?.job?.id ?? "?"})`);
        console.log(`  等 2-3 分钟, sanmu.ca/events 显示新照片`);
      } else {
        console.warn(`  ! Deploy Hook 返回 HTTP ${resp.status}, 请手动点 Notion hub 页的部署按钮`);
      }
    } catch (e) {
      console.warn(`  ! Deploy Hook 调用失败: ${e.message}`);
      console.warn(`    手动方案: 打开 Notion hub 页, 点 🚀 部署按钮`);
    }
  } else {
    console.log(
      `\n提示: 在 .env 添加 VERCEL_DEPLOY_HOOK_URL=... 可自动触发部署, 否则需手动点 hub 页部署按钮`,
    );
  }
}

main().catch((e) => {
  console.error(`\n✗ 失败: ${e.message}`);
  process.exit(1);
});
