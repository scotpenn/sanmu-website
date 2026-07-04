// 一次性数据修复: Blog 库「隐形引用块」批量上提 (2026-07-03, HANDOFF 待办第 0 条).
//
// 背景: martian 导入曾把 `>` 引用文字放进 quote 的子段落(行内 rich_text 只留空段),
// 而网站渲染器(lib/notion.ts parseBlocks)只读行内 rich_text → 引用句在网站上不渲染.
// 根因已在 import-blog.mjs(hoistQuoteChildren)修掉, 本脚本修存量数据.
//
// 用法:
//   node --env-file=.env.local scripts/fix-invisible-quotes.mjs           # dry-run, 只输出清单
//   node --env-file=.env.local scripts/fix-invisible-quotes.mjs --apply   # 真跑: update quote rich_text + 删子块
//
// 安全边界:
//   - 只动 type==="quote" 且行内 rich_text 为空(trim 后)且 has_children 的块
//   - 子块含非 paragraph 类型 → 跳过并记录(与 hoistQuoteChildren 同规则)
//   - 先 update 后 delete: 万一删子块失败, 文本已在行内, 不丢数据
//   - 不碰 page properties(「状态」等字段绝不涉及)

import { Client } from "@notionhq/client";

const BLOG = "319407d1-e400-4aed-8e36-dfa0ab19e6ea";
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const APPLY = process.argv.includes("--apply");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function plain(rich) {
  return (rich || []).map((t) => t.plain_text ?? t.text?.content ?? "").join("");
}

// API 返回的 rich_text 带只读字段(plain_text/href), 回写前清洗成可写形态; text.link/annotations 原样保留
function sanitize(item) {
  const out = { type: item.type, annotations: item.annotations };
  if (item.type === "text") out.text = item.text;
  else if (item.type === "mention") out.mention = item.mention;
  else if (item.type === "equation") out.equation = item.equation;
  return out;
}

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

async function allPages() {
  const out = [];
  let cursor;
  do {
    const r = await notion.dataSources.query({ data_source_id: BLOG, start_cursor: cursor, page_size: 100 });
    out.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return out;
}

function pageLabel(p) {
  const title = plain(p.properties?.["标题"]?.title) || "(无标题)";
  const slug = plain(p.properties?.Slug?.rich_text) || "?";
  const locale = p.properties?.["语言版本"]?.select?.name || "?";
  return { title, slug, locale };
}

const pages = await allPages();
console.log(`共 ${pages.length} 行, ${APPLY ? "🔴 APPLY 模式" : "dry-run 模式(不写入)"}\n`);

let pagesHit = 0, fixed = 0, skipped = 0, failed = 0;

for (const p of pages) {
  const { title, slug, locale } = pageLabel(p);
  const blocks = await listChildren(p.id);
  const targets = blocks.filter((b) => b.type === "quote" && !plain(b.quote.rich_text).trim() && b.has_children);
  if (!targets.length) continue;
  pagesHit++;
  console.log(`▶ ${slug} [${locale}] ${title} — ${targets.length} 个隐形 quote`);

  for (const b of targets) {
    const kids = (await listChildren(b.id)).filter((k) => !k.archived);
    if (!kids.length || !kids.every((k) => k.type === "paragraph")) {
      console.log(`   ⚠️ 跳过 ${b.id}: 子块含非 paragraph(${[...new Set(kids.map((k) => k.type))].join(",")})`);
      skipped++;
      continue;
    }
    const rt = [];
    kids.forEach((k, i) => {
      if (i > 0) rt.push({ type: "text", text: { content: "\n" } });
      rt.push(...(k.paragraph.rich_text || []).map(sanitize));
    });
    if (!rt.length || rt.length > 100 || rt.some((t) => (t.text?.content || "").length > 2000)) {
      console.log(`   ⚠️ 跳过 ${b.id}: rich_text 为空或超 API 上限(${rt.length} 项)`);
      skipped++;
      continue;
    }
    const preview = plain(rt).replace(/\n/g, " ⏎ ").slice(0, 60);
    if (APPLY) {
      try {
        await notion.blocks.update({ block_id: b.id, quote: { rich_text: rt } });
        await sleep(350);
        for (const k of kids) {
          await notion.blocks.delete({ block_id: k.id });
          await sleep(350);
        }
        fixed++;
        console.log(`   ✓ ${preview}`);
      } catch (e) {
        failed++;
        console.log(`   ✗ 失败 ${b.id}: ${e.message}`);
      }
    } else {
      fixed++;
      console.log(`   · ${kids.length} 段 → "${preview}"`);
    }
  }
}

console.log(`\n汇总: ${pagesHit} 行受影响, ${fixed} 个 quote ${APPLY ? "已修复" : "待修复"}, ${skipped} 个跳过, ${failed} 个失败`);
if (!APPLY) console.log("确认无误后加 --apply 真跑。");
if (failed) process.exit(1);
