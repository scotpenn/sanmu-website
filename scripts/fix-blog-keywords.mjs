// 一次性回填: 把 Blog 库里被 import-blog.mjs 旧分隔符粘成一条的「关键词」拆开。
// 起因: buildProps 的 split 不认 ·(U+00B7), 而 MD 约定写法是「词A · 词B · 词C」,
// 导致 64/102 页的整串变成一个 multi_select 标签 → lib/notion.ts 的相关文章排序(按共同标签数)失效。
// 脚本已在 import-blog.mjs 修好分隔符; 这个只清存量。跑完即可删。
//
//   预览:  node --env-file=.env.local scripts/fix-blog-keywords.mjs --snap /tmp/kw-snapshot.json
//   执行:  node --env-file=.env.local scripts/fix-blog-keywords.mjs --snap /tmp/kw-snapshot.json --apply
//   回滚:  node --env-file=.env.local scripts/fix-blog-keywords.mjs --restore /tmp/kw-snapshot.json
//
// 注意: 网站渲染时本来就用 " · " 拼接 tags(app/blog/[slug]/page.tsx), 所以拆分前后页面显示完全一致。
import { Client } from "@notionhq/client";
import { writeFileSync, readFileSync } from "fs";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DS = "319407d1-e400-4aed-8e36-dfa0ab19e6ea";
const arg = (n) => process.argv[process.argv.indexOf(n) + 1];
const APPLY = process.argv.includes("--apply");
const RESTORE = arg("--restore");

async function allPages() {
  let cursor, rows = [];
  do {
    const r = await notion.dataSources.query({ data_source_id: DS, start_cursor: cursor, page_size: 100 });
    rows.push(...r.results); cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return rows;
}
const setTags = (id, tags) =>
  notion.pages.update({ page_id: id, properties: { 关键词: { multi_select: tags.map((name) => ({ name })) } } });

if (RESTORE) {
  const snap = JSON.parse(readFileSync(RESTORE, "utf8"));
  for (const r of snap) await setTags(r.id, r.tags);
  console.log(`↩️ 已按快照回滚 ${snap.length} 页`);
} else {
  const snapPath = arg("--snap");
  if (!snapPath) { console.error("必须给 --snap <快照路径>(回滚用)"); process.exit(2); }
  const rows = await allPages();
  const snap = rows.map((p) => ({
    id: p.id,
    slug: (p.properties["Slug"].rich_text || []).map((t) => t.plain_text).join(""),
    locale: p.properties["语言版本"].select?.name,
    tags: p.properties["关键词"].multi_select.map((o) => o.name),
  }));
  writeFileSync(snapPath, JSON.stringify(snap, null, 2));
  console.log(`快照已写入 ${snapPath} (${snap.length} 页)\n`);

  const todo = snap.filter((r) => r.tags.some((t) => t.includes("·")));
  for (const r of todo) {
    const after = [...new Set(r.tags.flatMap((t) => t.split("·").map((s) => s.trim()).filter(Boolean)))];
    console.log(`${r.slug} [${r.locale}]\n   前: ${JSON.stringify(r.tags)}\n   后: ${JSON.stringify(after)}`);
    if (APPLY) await setTags(r.id, after);
  }
  console.log(`\n需拆分 ${todo.length} 页`);
  console.log(APPLY ? "✅ 已写入 Notion" : "(预览, 未写入; 加 --apply 执行)");
  if (APPLY) console.log("👉 拆分后, 库里那批粘连的 multi_select 选项已无页面引用, 到 Notion「关键词」属性里手动删掉即可");
}
