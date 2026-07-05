// 一次性修复: 博客正文里的字面量 [video] 占位符段落 → 真 video 块(URL 取「视频链接」属性)
// 背景: MD 模板用 [video] 占位, 5 篇(简繁 10 行)漏替换成 <video src> 标签就导入了,
// martian 把它当普通段落写进 Notion, 网页上原样显示 "[video]"。
// 用法: node --env-file=.env.local scripts/fix-video-placeholder.mjs          (dry-run, 只看不改)
//       node --env-file=.env.local scripts/fix-video-placeholder.mjs --apply  (真跑)
import { Client } from "@notionhq/client";

const BLOG = "319407d1-e400-4aed-8e36-dfa0ab19e6ea";
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const APPLY = process.argv.includes("--apply");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const pages = [];
let cursor;
do {
  const r = await notion.dataSources.query({ data_source_id: BLOG, start_cursor: cursor, page_size: 100 });
  pages.push(...r.results);
  cursor = r.has_more ? r.next_cursor : undefined;
} while (cursor);

let fixed = 0, skipped = 0, failed = 0;
for (const p of pages) {
  const slug = (p.properties?.Slug?.rich_text || []).map((t) => t.plain_text).join("");
  const locale = p.properties?.["语言版本"]?.select?.name;
  const videoUrl = p.properties?.["视频链接"]?.url || "";
  const caption = locale === "zh-Hant" ? "三木有話說 · 本文對應影片" : "三木有话说 · 本文对应的视频";
  let cur;
  do {
    const r = await notion.blocks.children.list({ block_id: p.id, start_cursor: cur, page_size: 100 });
    for (const b of r.results) {
      if (b.type !== "paragraph") continue;
      const txt = (b.paragraph.rich_text || []).map((t) => t.plain_text).join("").trim();
      if (txt !== "[video]") continue;
      if (!/(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/.test(videoUrl)) {
        console.log(`⚠️ ${slug} [${locale}] 有 [video] 占位符但「视频链接」不是有效 YouTube URL("${videoUrl}"), 跳过`);
        skipped++;
        continue;
      }
      console.log(`${APPLY ? "修复" : "待修"} ${slug} [${locale}] → video块 ${videoUrl}`);
      if (!APPLY) { fixed++; continue; }
      try {
        // 先在占位符后面原位插入 video 块, 再删占位符(顺序保证中途失败不丢位置)
        await notion.blocks.children.append({
          block_id: p.id,
          after: b.id,
          children: [{
            object: "block",
            type: "video",
            video: {
              type: "external",
              external: { url: videoUrl },
              caption: [{ type: "text", text: { content: caption } }],
            },
          }],
        });
        await sleep(350);
        await notion.blocks.delete({ block_id: b.id });
        await sleep(350);
        fixed++;
      } catch (e) {
        console.log(`  ✗ 失败 block=${b.id}: ${e.message}`);
        failed++;
      }
    }
    cur = r.has_more ? r.next_cursor : undefined;
  } while (cur);
}
console.log(`\n汇总: ${fixed} 个${APPLY ? "已修复" : "待修复"}, ${skipped} 个跳过, ${failed} 个失败`);
if (!APPLY) console.log("确认无误后加 --apply 真跑。");
