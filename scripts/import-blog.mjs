import { Client } from "@notionhq/client";
import { markdownToBlocks } from "@tryfabric/martian";
import { readdirSync } from "fs";
import { fileURLToPath } from "url";
import { resolve } from "path";
import { parseBlogMd } from "./md-blog.mjs";
import { checkMd } from "./check-blog.mjs";

const BLOG = "319407d1-e400-4aed-8e36-dfa0ab19e6ea";
const notion = new Client({ auth: process.env.NOTION_TOKEN });
// 网站 parseBlocks 目前能渲染的块
const RENDERABLE = ["paragraph", "quote", "heading_2", "heading_3"];

function buildProps(p, slug, locale) {
  const props = {
    标题: { title: [{ type: "text", text: { content: p.title || "" } }] },
    Slug: { rich_text: [{ type: "text", text: { content: p.slug || slug } }] },
    语言版本: { select: { name: locale } },
    翻译组ID: { rich_text: [{ type: "text", text: { content: p.slug || slug } }] },
  };
  if (p.subtitle) props["摘要"] = { rich_text: [{ type: "text", text: { content: p.subtitle } }] };
  if (p.category) props["类型"] = { select: { name: p.category } };
  if (p.keywords) {
    const tags = p.keywords.split(/[、,，]/).map((s) => s.trim()).filter(Boolean).map((name) => ({ name }));
    if (tags.length) props["关键词"] = { multi_select: tags };
  }
  if (p.status) props["状态"] = { select: { name: p.status } };
  if (p.readMinutes && /^\d+$/.test(p.readMinutes)) props["阅读时长"] = { number: parseInt(p.readMinutes, 10) };
  if (p.videoUrl) props["视频链接"] = { url: p.videoUrl };
  return props;
}

async function chunkAppend(pageId, blocks) {
  for (let i = 0; i < blocks.length; i += 100) {
    await notion.blocks.children.append({ block_id: pageId, children: blocks.slice(i, i + 100) });
  }
}
async function clearChildren(pageId) {
  let cursor;
  do {
    const r = await notion.blocks.children.list({ block_id: pageId, start_cursor: cursor, page_size: 100 });
    for (const b of r.results) await notion.blocks.delete({ block_id: b.id });
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
}

export async function importOne(file, { force } = {}) {
  const { slug, locale, props, body } = parseBlogMd(file);
  const { reds } = checkMd(file);
  if (reds.length && !force) {
    console.log(`⛔ ${file} 有红色问题, 跳过(加 --force 强行导入):`);
    reds.forEach((r) => console.log("   🔴 " + r));
    return false;
  }
  const blocks = markdownToBlocks(body);
  const unsupported = [...new Set(blocks.map((b) => b.type))].filter((t) => !RENDERABLE.includes(t));
  if (unsupported.length) console.log(`   ⚠️ ${slug}: 含网站暂不渲染的块类型: ${unsupported.join(", ")}`);
  const notionProps = buildProps(props, slug, locale);
  const key = props.slug || slug;
  const ex = await notion.dataSources.query({
    data_source_id: BLOG,
    filter: { and: [{ property: "Slug", rich_text: { equals: key } }, { property: "语言版本", select: { equals: locale } }] },
    page_size: 1,
  });
  if (ex.results.length) {
    const id = ex.results[0].id;
    await clearChildren(id);
    await notion.pages.update({ page_id: id, properties: notionProps });
    await chunkAppend(id, blocks);
    console.log(`✓ 更新 ${slug} [${locale}]`);
  } else {
    const page = await notion.pages.create({
      parent: { type: "data_source_id", data_source_id: BLOG },
      properties: notionProps,
      children: blocks.slice(0, 100),
    });
    if (blocks.length > 100) await chunkAppend(page.id, blocks.slice(100));
    console.log(`✓ 新建 ${slug} [${locale}]`);
  }
  return true;
}

const args = process.argv.slice(2);
const force = args.includes("--force");
if (args.includes("--all")) {
  const dir = fileURLToPath(new URL("../../SEO/output/", import.meta.url));
  const files = readdirSync(dir).filter((f) => /^blog_.+\.md$/.test(f));
  let ok = 0;
  for (const f of files) if (await importOne(dir + f, { force })) ok++;
  console.log(`\n完成: ${ok}/${files.length} 篇导入`);
} else {
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) { console.error("用法: node scripts/import-blog.mjs <md> [--force] | --all [--force]"); process.exit(2); }
  await importOne(file, { force });
}
