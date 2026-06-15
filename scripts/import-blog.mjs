import { Client } from "@notionhq/client";
import { markdownToBlocks } from "@tryfabric/martian";
import { readdirSync, readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { resolve } from "path";
import { parseBlogMd } from "./md-blog.mjs";
import { checkMd } from "./check-blog.mjs";

const BLOG = "319407d1-e400-4aed-8e36-dfa0ab19e6ea";
const notion = new Client({ auth: process.env.NOTION_TOKEN });
// 网站 parseBlocks 目前能渲染的块(含 video——文章对应视频, 很关键)
const RENDERABLE = ["paragraph", "quote", "heading_2", "heading_3", "video"];

// 简→繁 字符映射(取自 lib/i18n.ts 的 S2T_MAP), 用于繁体标题/摘要转繁
function makeToTrad() {
  const src = readFileSync(fileURLToPath(new URL("../lib/i18n.ts", import.meta.url)), "utf8");
  const m = src.match(/const S2T_MAP[^{]*{([\s\S]*?)\n};/);
  const map = new Map();
  if (m) for (const mm of m[1].matchAll(/([一-鿿])\s*:\s*"([^"]+)"/g)) map.set(mm[1], mm[2]);
  return (s) => [...(s || "")].map((c) => map.get(c) || c).join("");
}

// 正文 → Notion 块: 把 <video src="url">说明</video> 转成 video 块, 其余文字交给 martian
function bodyToBlocks(body) {
  const re = /<video\s+src="([^"]+)"[^>]*>([\s\S]*?)<\/video>/gi;
  const blocks = [];
  let last = 0, m;
  while ((m = re.exec(body)) !== null) {
    const before = body.slice(last, m.index).trim();
    if (before) blocks.push(...markdownToBlocks(before));
    const url = m[1].trim();
    const caption = m[2].trim();
    blocks.push({
      object: "block",
      type: "video",
      video: {
        type: "external",
        external: { url },
        ...(caption ? { caption: [{ type: "text", text: { content: caption } }] } : {}),
      },
    });
    last = m.index + m[0].length;
  }
  const rest = body.slice(last).trim();
  if (rest) blocks.push(...markdownToBlocks(rest));
  return blocks;
}

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
    for (const b of r.results) {
      if (b.archived) continue; // 已归档的块跳过(不能再删)
      await notion.blocks.delete({ block_id: b.id });
    }
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
}

export async function importOne(file, { force } = {}) {
  const parsed = parseBlogMd(file);
  if (parsed.isStub) {
    console.log(`⛔ ${file} 正文是占位符空壳(真内容在 Notion), 拒绝导入以防覆盖`);
    return false;
  }
  const { slug, locale, body, bodyOnly } = parsed;
  let props = parsed.props;

  // 繁体 body-only: 属性取同 slug 简体 MD, 标题/摘要转繁(方案 A)
  if (bodyOnly) {
    const sib = file.replace(/_zh-Hant\.md$/, ".md");
    if (!existsSync(sib)) {
      console.log(`⛔ ${file} 找不到对应简体 MD(${sib}), 无法取属性, 跳过`);
      return false;
    }
    const sp = parseBlogMd(sib).props;
    const toTrad = makeToTrad();
    props = { ...sp, title: toTrad(sp.title), subtitle: toTrad(sp.subtitle) };
  }

  const { reds } = checkMd(file);
  if (reds.length && !force) {
    console.log(`⛔ ${file} 有红色问题, 跳过(加 --force 强行导入):`);
    reds.forEach((r) => console.log("   🔴 " + r));
    return false;
  }
  const blocks = bodyToBlocks(body);
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
    // 繁体 body-only 且记录已存在: 保留现有属性(上线时 s2twp 已校好的标题/摘要), 只更新正文
    if (!bodyOnly) {
      // 状态 是 Notion 管理的工作流字段(MD 里的可能过期), 更新已存在文章时绝不覆盖,
      // 否则会把线上「已发布」文章误打回「待发布」=下线。新建时才用 MD 的状态(见下方 create).
      const { 状态: _omitStatus, ...updateProps } = notionProps;
      await notion.pages.update({ page_id: id, properties: updateProps });
    }
    await chunkAppend(id, blocks);
    console.log(`✓ 更新 ${slug} [${locale}]${bodyOnly ? " (仅正文, 属性保留)" : ""}`);
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

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
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
}
