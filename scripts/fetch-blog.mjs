// 反向工具: 从 Notion 把某篇 blog 的 blocks 拉回本地 MD(body-only 格式).
// 跟 import-blog.mjs 对称: import 是 MD→Notion, fetch 是 Notion→MD.
//
// 主要解决: 早期繁体 MD 是"已推 Notion"占位符空壳的历史债 — Notion 才是真理源.
// 这个工具把 Notion 现状拉回本地, 让 MD 重新成为真理源, 之后所有编辑回归 MD 流程.
//
// 用法:
//   node --env-file=.env.local scripts/fetch-blog.mjs <slug> [zh-Hans|zh-Hant] [--force]
//   npm run fetch:blog -- <slug> zh-Hant
//
// 行为:
//   - 查询 Notion 该 slug+locale 页面
//   - 把所有顶层 blocks 转回 markdown
//   - 写入 ../Blog-SEO/output/blog_<slug>[_zh-Hant].md (body-only 格式, 跟现有繁体 MD 一致)
//   - 目标文件已存在且非空壳时, 要求 --force 才覆盖

import { Client } from "@notionhq/client";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { resolve } from "path";

const BLOG = "319407d1-e400-4aed-8e36-dfa0ab19e6ea";
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// rich_text 数组 → markdown 字符串(含 bold/italic/code/link).
function richTextToMd(rich) {
  if (!rich || !Array.isArray(rich)) return "";
  return rich.map((t) => {
    let s = t.plain_text || "";
    if (!s) return "";
    const a = t.annotations || {};
    if (a.code) s = "`" + s + "`";
    if (a.bold) s = "**" + s + "**";
    if (a.italic) s = "*" + s + "*";
    const href = t.href || t.text?.link?.url;
    if (href) s = `[${s}](${href})`;
    return s;
  }).join("");
}

// 取一个 block 的所有 children(分页), 用于 table/synced_block 等容器.
async function listChildren(blockId) {
  const out = [];
  let cursor;
  do {
    const r = await notion.blocks.children.list({ block_id: blockId, start_cursor: cursor, page_size: 100 });
    out.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return out;
}

// 单个 block → markdown(可能多行).
async function blockToMd(b) {
  switch (b.type) {
    case "paragraph":
      return richTextToMd(b.paragraph.rich_text);
    case "heading_1":
      return "# " + richTextToMd(b.heading_1.rich_text);
    case "heading_2":
      return "## " + richTextToMd(b.heading_2.rich_text);
    case "heading_3":
      return "### " + richTextToMd(b.heading_3.rich_text);
    case "quote":
      return "> " + richTextToMd(b.quote.rich_text).replace(/\n/g, "\n> ");
    case "bulleted_list_item":
      return "- " + richTextToMd(b.bulleted_list_item.rich_text);
    case "numbered_list_item":
      return "1. " + richTextToMd(b.numbered_list_item.rich_text);
    case "divider":
      return "---";
    case "video": {
      const url = b.video?.external?.url || b.video?.file?.url || "";
      const caption = richTextToMd(b.video.caption || []);
      return `<video src="${url}">${caption}</video>`;
    }
    case "callout": {
      // 用 quote 风格降级表示 callout
      return "> " + richTextToMd(b.callout.rich_text);
    }
    case "code": {
      const lang = b.code.language || "";
      const code = richTextToMd(b.code.rich_text);
      return "```" + lang + "\n" + code + "\n```";
    }
    case "table": {
      // table 的子块是 table_row, 每个 row 有 cells: rich_text[][]
      const rows = await listChildren(b.id);
      if (!rows.length) return "";
      const lines = rows.map((r, i) => {
        const cells = (r.table_row?.cells || []).map((c) => richTextToMd(c).replace(/\|/g, "\\|"));
        const line = "| " + cells.join(" | ") + " |";
        if (i === 0) {
          const sep = "| " + cells.map(() => "---").join(" | ") + " |";
          return line + "\n" + sep;
        }
        return line;
      });
      return lines.join("\n");
    }
    default:
      // 未识别的块: 留 marker 让人工 review, 不丢数据
      return `<!-- [unsupported block type: ${b.type}] -->`;
  }
}

async function fetchBlogBody(pageId) {
  const blocks = [];
  let cursor;
  do {
    const r = await notion.blocks.children.list({ block_id: pageId, start_cursor: cursor, page_size: 100 });
    blocks.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);

  const parts = [];
  for (const b of blocks) {
    const md = await blockToMd(b);
    if (md) parts.push(md);
  }
  // 块之间用空行分隔(markdown 标准做法)
  return parts.join("\n\n") + "\n";
}

async function findPage(slug, locale) {
  const r = await notion.dataSources.query({
    data_source_id: BLOG,
    filter: { and: [{ property: "Slug", rich_text: { equals: slug } }, { property: "语言版本", select: { equals: locale } }] },
    page_size: 1,
  });
  return r.results[0];
}

function isStubFile(path) {
  if (!existsSync(path)) return true;
  const txt = readFileSync(path, "utf8");
  // 已知空壳标记
  return /已推\s*Notion|本地保留简体定稿|待推送后回填|占位符/.test(txt);
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const slug = args.find((a) => !a.startsWith("--") && !/^zh-(Hans|Hant)$/.test(a));
const locale = args.find((a) => /^zh-(Hans|Hant)$/.test(a)) || "zh-Hant";
if (!slug) {
  console.error("用法: node scripts/fetch-blog.mjs <slug> [zh-Hans|zh-Hant] [--force]");
  process.exit(2);
}

const outDir = fileURLToPath(new URL("../../Blog-SEO/output/", import.meta.url));
const outName = locale === "zh-Hant" ? `blog_${slug}_zh-Hant.md` : `blog_${slug}.md`;
const outPath = resolve(outDir, outName);

const page = await findPage(slug, locale);
if (!page) {
  console.error(`未找到 ${slug} [${locale}]`);
  process.exit(1);
}

// 安全检查: 目标文件已存在且非空壳时, 要 --force
if (existsSync(outPath) && !isStubFile(outPath) && !force) {
  console.error(`⛔ ${outName} 已存在且非空壳, 加 --force 才会覆盖`);
  process.exit(1);
}

const body = await fetchBlogBody(page.id);

// 简体写完整 MD(带 YAML frontmatter), 繁体写 body-only(跟现有惯例一致)
if (locale === "zh-Hans") {
  // 从 Notion 属性反推 frontmatter
  const props = page.properties;
  const fm = {
    slug,
    title: props["标题"]?.title?.[0]?.plain_text || "",
    language: "zh-Hans",
    type: props["类型"]?.select?.name || "",
    keywords: (props["关键词"]?.multi_select || []).map((x) => x.name),
    read_minutes: props["阅读时长"]?.number || 0,
    summary: props["摘要"]?.rich_text?.[0]?.plain_text || "",
    video_url: props["视频链接"]?.url || "",
    status: props["状态"]?.select?.name || "",
  };
  const yaml = [
    "---",
    `slug: ${fm.slug}`,
    `title: ${fm.title}`,
    `language: ${fm.language}`,
    `type: ${fm.type}`,
    `keywords: [${fm.keywords.join(", ")}]`,
    `read_minutes: ${fm.read_minutes}`,
    fm.video_url ? `video_url: ${fm.video_url}` : "",
    `summary: ${fm.summary}`,
    `status: ${fm.status}`,
    "---",
    "",
  ].filter(Boolean).join("\n");
  // 加 ## Page Body 段标记: check-blog.mjs 要求简体必须有这个段, 不然 🔴 拦截
  writeFileSync(outPath, yaml + "\n## Page Body\n\n" + body);
} else {
  // 繁体: body-only(无 frontmatter), 跟现存所有繁体 MD 格式一致
  writeFileSync(outPath, body);
}

console.log(`✓ ${slug} [${locale}] → ${outName}  (${body.length} chars)`);
