# 博客内容管线(核对 + 可靠导入)Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建一套 CLI:简/繁博客 MD 的自动核对 + 用 martian+官方 SDK 忠实导入 Notion(零字符变异),串成「核对→导入」后端管线。

**Architecture:** 三个 Node 脚本在 `sanmu-website/scripts/`:`md-blog.mjs`(解析 MD 格式)、`check-blog.mjs`(简繁核对,导出 `checkMd`)、`import-blog.mjs`(martian 解析正文 + `@notionhq/client` upsert,导入前先 check)。复用现有 MD 格式(`## Notion 页面属性` + `## Page Body`)与现有翻译工具(Python OpenCC,不动)。

**Tech Stack:** Node ESM (.mjs) + `@tryfabric/martian` + `@notionhq/client@5`(均已装)。**无测试框架**,验证 = 跑脚本对 fixture 断言 + 真实建一条 Notion 测试页读回核对(用完归档)。

---

## File Structure

- `scripts/md-blog.mjs`(新建):`parseBlogMd(filePath)` → `{ slug, locale, props, body, hasPropSection, hasBodySection }`。纯解析,无副作用。
- `scripts/gen-common-chars.mjs`(新建):从现有干净 MD 语料生成常用字表(怪字检测白名单)。
- `scripts/data/common-chars.txt`(生成物,提交):语料里出现过的全部汉字。
- `scripts/check-blog.mjs`(新建):导出 `checkMd(filePath)` → `{ reds, yellows }`;直接运行时作 CLI。
- `scripts/import-blog.mjs`(新建):单篇 / `--all` 导入,upsert,保留非 MD 字段,导入前 check。
- `package.json`(改):加 `check:blog` / `import:blog` 脚本。
- `Blog-SEO/BLOG_WRITING_WORKFLOW.md`(改):追加「后端处理」一节。

---

## Task 1: scripts/md-blog.mjs — 解析 MD

**Files:** Create `scripts/md-blog.mjs`; Create `scripts/__fixtures__/blog_demo-article.md`

- [ ] **Step 1: 写 fixture `scripts/__fixtures__/blog_demo-article.md`**

```markdown
# 演示文章标题

> 来源稿件：xxx
> 改写规则：yyy

---

## Notion 页面属性

- **标题**：演示文章标题
- **Slug**：`demo-article`
- **摘要**（约 140 字）：这是一段用于解析测试的摘要文字，长度不重要。
- **类型**：实用指南
- **关键词**：遗嘱、骨灰
- **状态**：草稿
- **阅读时长**：8
- **视频链接**：`https://www.youtube.com/watch?v=abcdefghijk`

---

## Page Body

第一段正文。这里有一个[内链](https://www.sanmu.ca/blog/x)。

## 一个二级标题

第二段正文。
```

- [ ] **Step 2: 写 `scripts/md-blog.mjs`**

```js
import { readFileSync } from "fs";
import { basename } from "path";

// MD 字段名 → 内部 key
const FIELD_ALIASES = {
  "标题": "title",
  "Slug": "slug",
  "摘要": "subtitle",
  "类型": "category",
  "关键词": "keywords",
  "状态": "status",
  "阅读时长": "readMinutes",
  "视频链接": "videoUrl",
};

/** 解析一篇博客 MD. 文件名决定 slug + locale;内容分「属性段」「正文段」. */
export function parseBlogMd(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const file = basename(filePath);
  const m = file.match(/^blog_(.+?)(_zh-Hant)?\.md$/);
  if (!m) throw new Error(`文件名需形如 blog_<slug>[_zh-Hant].md: ${file}`);
  const slug = m[1];
  const locale = m[2] ? "zh-Hant" : "zh-Hans";

  const propStart = raw.indexOf("## Notion 页面属性");
  const bodyStart = raw.indexOf("## Page Body");

  const propSection =
    propStart >= 0
      ? raw.slice(propStart, bodyStart >= 0 ? bodyStart : undefined)
      : "";
  const props = {};
  for (const line of propSection.split(/\r?\n/)) {
    const fm = line.match(/^\s*-\s*\*\*(.+?)\*\*[^：:]*[：:]\s*(.*)$/);
    if (!fm) continue;
    const key = FIELD_ALIASES[fm[1].trim()];
    if (!key) continue;
    props[key] = fm[2].trim().replace(/^`|`$/g, "").trim();
  }

  const body =
    bodyStart >= 0
      ? raw.slice(bodyStart + "## Page Body".length).trim()
      : "";

  return {
    slug,
    locale,
    props,
    body,
    hasPropSection: propStart >= 0,
    hasBodySection: bodyStart >= 0,
  };
}
```

- [ ] **Step 3: 验证解析正确**

Run:
```bash
cd "/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/sanmu-website" && node -e '
import("./scripts/md-blog.mjs").then(({parseBlogMd})=>{
  const r = parseBlogMd("scripts/__fixtures__/blog_demo-article.md");
  const ok = r.slug==="demo-article" && r.locale==="zh-Hans" && r.props.title==="演示文章标题" && r.props.slug==="demo-article" && r.props.readMinutes==="8" && r.props.videoUrl==="https://www.youtube.com/watch?v=abcdefghijk" && r.props.keywords==="遗嘱、骨灰" && r.hasBodySection && r.body.startsWith("第一段正文");
  console.log(ok ? "PASS" : "FAIL", JSON.stringify(r.props));
})'
```
Expected: 以 `PASS` 开头。

- [ ] **Step 4: 提交**

```bash
git add scripts/md-blog.mjs scripts/__fixtures__/blog_demo-article.md
git commit -m "feat(blog-pipeline): md-blog 解析器(属性段+正文段+文件名→slug/locale)"
```

---

## Task 2: 常用字表(怪字检测白名单)

**Files:** Create `scripts/gen-common-chars.mjs`; Create `scripts/data/common-chars.txt`

> 原理:现有 `Blog-SEO/output/blog_*.md` 是**干净源稿**(变异只在 Notion、不在 MD,已验证)。取语料里所有汉字做白名单;新文章里**没在语料出现过的字** = 怪字候选(人工确认)。自维护、无外部依赖。

- [ ] **Step 1: 写 `scripts/gen-common-chars.mjs`**

```js
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";

const outDir = fileURLToPath(new URL("../../Blog-SEO/output/", import.meta.url));
const chars = new Set();
for (const f of readdirSync(outDir)) {
  if (!/^blog_.+\.md$/.test(f)) continue;
  for (const c of readFileSync(outDir + f, "utf8")) {
    if (/[一-鿿]/.test(c)) chars.add(c);
  }
}
const sorted = [...chars].sort().join("");
const dst = fileURLToPath(new URL("./data/common-chars.txt", import.meta.url));
writeFileSync(dst, sorted);
console.log(`已写入 ${chars.size} 个常用汉字 → ${dst}`);
```

- [ ] **Step 2: 生成 + 提交**

```bash
cd "/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/sanmu-website" && mkdir -p scripts/data && node scripts/gen-common-chars.mjs
```
Expected: 打印「已写入 <数千> 个常用汉字」。
```bash
git add scripts/gen-common-chars.mjs scripts/data/common-chars.txt
git commit -m "feat(blog-pipeline): 从语料生成常用字表(怪字检测白名单)"
```

---

## Task 3: scripts/check-blog.mjs — 简繁核对

**Files:** Create `scripts/check-blog.mjs`; Create `scripts/__fixtures__/blog_bad-hant_zh-Hant.md`

- [ ] **Step 1: 写「坏样例」fixture `scripts/__fixtures__/blog_bad-hant_zh-Hant.md`**(故意含 残留简体「这」、大陆词「視頻」「博客」、怪字「嫿」、缺摘要)

```markdown
# 繁體壞樣例

## Notion 页面属性

- **标题**：繁體壞樣例
- **Slug**：`bad-hant`
- **状态**：草稿

---

## Page Body

这是一段含殘留簡體字的正文，还提到視頻和博客，并混入一个怪字嫿。
```

- [ ] **Step 2: 写 `scripts/check-blog.mjs`**

```js
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { parseBlogMd } from "./md-blog.mjs";

const COMMON = new Set(
  [...readFileSync(fileURLToPath(new URL("./data/common-chars.txt", import.meta.url)), "utf8")]
    .filter((c) => /[一-鿿]/.test(c)),
);

// 从 lib/i18n.ts 正则解析 S2T_MAP, 取「繁体形≠简体形」的键为简体专用字
function simplifiedOnlySet() {
  const src = readFileSync(fileURLToPath(new URL("../lib/i18n.ts", import.meta.url)), "utf8");
  const m = src.match(/const S2T_MAP[^{]*{([\s\S]*?)\n};/);
  const set = new Set();
  if (m) {
    for (const mm of m[1].matchAll(/([一-鿿])\s*:\s*"([^"]+)"/g)) {
      if (mm[2] !== mm[1]) set.add(mm[1]);
    }
  }
  return set;
}

// 大陆词 → TW 词(可加)
const VOCAB = {
  "視頻": "影片", "视频": "影片", "信息": "資訊", "博客": "網誌",
  "网络": "網路", "網絡": "網路", "质量": "品質", "用户": "使用者",
  "在线": "線上", "默认": "預設", "软件": "軟體", "邮箱": "電子信箱",
  "点赞": "按讚", "视频号": "頻道", "账号": "帳號", "帐号": "帳號",
};
const YOUTUBE_RE = /(youtube\.com\/watch\?v=|youtu\.be\/)/;
const CJK = (s) => [...s].filter((c) => /[一-鿿]/.test(c));

/** 核对一篇 MD. 返回 { reds(必修), yellows(建议) }. */
export function checkMd(filePath) {
  const reds = [], yellows = [];
  const { locale, props, body, hasPropSection, hasBodySection } = parseBlogMd(filePath);

  if (!hasPropSection) reds.push("缺少『## Notion 页面属性』段");
  if (!hasBodySection) reds.push("缺少『## Page Body』段");
  for (const f of ["title", "slug", "subtitle", "status"]) {
    if (!props[f]) reds.push(`必填字段缺失: ${f}`);
  }
  if (props.slug && !/^[a-z0-9-]+$/.test(props.slug)) reds.push(`Slug 非英文小写连字符: ${props.slug}`);
  if (props.videoUrl && !YOUTUBE_RE.test(props.videoUrl)) yellows.push(`视频链接不是 YouTube: ${props.videoUrl}`);
  if (props.readMinutes && !/^\d+$/.test(props.readMinutes)) yellows.push(`阅读时长不是数字: ${props.readMinutes}`);
  if (props.subtitle) {
    const n = CJK(props.subtitle).length;
    if (n < 80 || n > 160) yellows.push(`摘要 ${n} 字(建议 80-160)`);
  }

  const rare = [...new Set(CJK(body).filter((c) => !COMMON.has(c)))];
  if (rare.length) yellows.push(`怪字候选(需人工确认): ${rare.join(" ")}`);

  if (locale === "zh-Hant") {
    const simp = simplifiedOnlySet();
    const residual = [...new Set(CJK(body).filter((c) => simp.has(c)))];
    if (residual.length) reds.push(`残留简体字: ${residual.join(" ")}`);
    for (const [cn, tw] of Object.entries(VOCAB)) {
      if (body.includes(cn)) yellows.push(`未本地化大陆词「${cn}」→ 建议「${tw}」`);
    }
  }
  return { reds, yellows };
}

// CLI
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) { console.error("用法: node scripts/check-blog.mjs <md>"); process.exit(2); }
  const { reds, yellows } = checkMd(file);
  reds.forEach((r) => console.log("🔴 " + r));
  yellows.forEach((y) => console.log("🟡 " + y));
  if (!reds.length && !yellows.length) console.log("✅ 通过, 无问题");
  process.exit(reds.length ? 1 : 0);
}
```

- [ ] **Step 3: 验证(坏样例必须报红/黄,好样例必须过)**

Run:
```bash
cd "/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/sanmu-website" && echo "--- 坏繁体样例 ---" && node scripts/check-blog.mjs scripts/__fixtures__/blog_bad-hant_zh-Hant.md; echo "exit=$?"; echo "--- 好简体样例 ---" && node scripts/check-blog.mjs scripts/__fixtures__/blog_demo-article.md; echo "exit=$?"
```
Expected:
- 坏繁体:报出 `残留简体字: 这 还`(红)、`未本地化大陆词「視頻」`/「博客」(黄)、`必填字段缺失: subtitle`(红)、`怪字候选: 嫿`(黄);`exit=1`。
- 好简体:`✅ 通过` 或仅黄(摘要字数);`exit=0`(只要无红)。

- [ ] **Step 4: 提交**

```bash
git add scripts/check-blog.mjs scripts/__fixtures__/blog_bad-hant_zh-Hant.md
git commit -m "feat(blog-pipeline): check-blog 简繁核对(格式/字段/残留简体/大陆词/怪字)"
```

---

## Task 4: scripts/import-blog.mjs — martian+SDK 忠实导入

**Files:** Create `scripts/import-blog.mjs`

- [ ] **Step 1: 写 `scripts/import-blog.mjs`**

```js
import { Client } from "@notionhq/client";
import { markdownToBlocks } from "@tryfabric/martian";
import { readdirSync } from "fs";
import { fileURLToPath } from "url";
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
  const dir = fileURLToPath(new URL("../../Blog-SEO/output/", import.meta.url));
  const files = readdirSync(dir).filter((f) => /^blog_.+\.md$/.test(f));
  let ok = 0;
  for (const f of files) if (await importOne(dir + f, { force })) ok++;
  console.log(`\n完成: ${ok}/${files.length} 篇导入`);
} else {
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) { console.error("用法: node scripts/import-blog.mjs <md> [--force] | --all [--force]"); process.exit(2); }
  await importOne(file, { force });
}
```

- [ ] **Step 2: 真实验证(建测试页→读回核对生僻字→归档)**

Run(用 demo fixture 导入,验证生僻字「攥/吭/燊」忠实 + upsert 更新 + 归档清理):
```bash
cd "/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/sanmu-website" && cat > scripts/__fixtures__/blog_pipeline-selftest.md <<'EOF'
## Notion 页面属性

- **标题**：管线自测 攥紧 吭声 何鸿燊
- **Slug**：`pipeline-selftest`
- **摘要**：这是一段足够长的摘要用于通过核对，至少八十个中文字符，凑数凑数凑数凑数凑数凑数凑数凑数凑数凑数凑数凑数凑数凑数凑数凑数凑数凑数凑数凑数。
- **状态**：草稿

---

## Page Body

他攥紧拳头没吭声，想起澳门赌王何鸿燊的家族继承。
EOF
node --env-file=.env.local scripts/import-blog.mjs scripts/__fixtures__/blog_pipeline-selftest.md --force && node --env-file=.env.local -e '
import("@notionhq/client").then(async ({Client})=>{
  const n=new Client({auth:process.env.NOTION_TOKEN});
  const r=await n.dataSources.query({data_source_id:"319407d1-e400-4aed-8e36-dfa0ab19e6ea",filter:{and:[{property:"Slug",rich_text:{equals:"pipeline-selftest"}},{property:"语言版本",select:{equals:"zh-Hans"}}]},page_size:1});
  const id=r.results[0].id;
  let text=""; const b=await n.blocks.children.list({block_id:id,page_size:100}); for(const blk of b.results){const t=blk[blk.type]?.rich_text; if(t)text+=t.map(x=>x.plain_text).join("");}
  const ok=text.includes("攥紧")&&text.includes("吭声")&&text.includes("何鸿燊");
  console.log(ok?"PASS 生僻字忠实":"FAIL "+text.slice(0,40));
  await n.pages.update({page_id:id,archived:true}); console.log("(测试页已归档)");
})'
rm -f scripts/__fixtures__/blog_pipeline-selftest.md
```
Expected: `✓ 新建 pipeline-selftest [zh-Hans]` → `PASS 生僻字忠实` → `(测试页已归档)`。证明 martian+SDK 把「攥/吭/燊」逐字忠实写入,无变异。

- [ ] **Step 3: 提交**

```bash
git add scripts/import-blog.mjs
git commit -m "feat(blog-pipeline): import-blog 用 martian+SDK 忠实导入(upsert/保留非MD字段/导入前核对)"
```

---

## Task 5: package.json 脚本 + 工作流文档

**Files:** Modify `package.json`; Modify `Blog-SEO/BLOG_WRITING_WORKFLOW.md`

- [ ] **Step 1: package.json 加脚本**

在 `"scripts"` 块里加两行(注意 JSON 逗号):
```json
    "check:blog": "node scripts/check-blog.mjs",
    "import:blog": "node --env-file=.env.local scripts/import-blog.mjs",
```

- [ ] **Step 2: 构建/语法不受影响验证**

Run: `cd sanmu-website && node --check scripts/check-blog.mjs && node --check scripts/import-blog.mjs && node --check scripts/md-blog.mjs && echo OK`
Expected: `OK`。

- [ ] **Step 3: `Blog-SEO/BLOG_WRITING_WORKFLOW.md` 追加「后端处理」一节**

在文件末尾追加:
```markdown

---

## 七、后端处理(写完简体后)

> ⚠️ **导入 Notion 一律用 `import:blog`,不要用 MCP 的 markdown 导入(会把生僻字变异)。**

1. **核对简体**:`cd sanmu-website && npm run check:blog -- ../Blog-SEO/output/blog_<slug>.md`
   - 🔴 必修(格式/必填字段/Slug);🟡 建议(怪字/摘要字数)。修到无红。
2. **翻译**:`cat ../Blog-SEO/output/blog_<slug>.md | python3 scripts/zh_hant/build_new_zh_hant.py > ../Blog-SEO/output/blog_<slug>_zh-Hant.md`(在 Blog-SEO/ 下跑)
3. **核对繁体**:`npm run check:blog -- ../Blog-SEO/output/blog_<slug>_zh-Hant.md`
   - 重点看 🔴 残留简体字、🟡 未本地化大陆词,按提示改 MD。
4. **导入**:`npm run import:blog -- ../Blog-SEO/output/blog_<slug>.md` 和 `..._zh-Hant.md`
   - 导入前会自动再核对一遍;有 🔴 会被拦(确认无误可加 `-- ... --force`)。
   - 改完重导一次即更新(upsert),封面图/审核勾选不受影响。
```

- [ ] **Step 4: 提交**

```bash
git add package.json "../Blog-SEO/BLOG_WRITING_WORKFLOW.md"
git commit -m "feat(blog-pipeline): 加 check:blog/import:blog 脚本 + 工作流文档后端步骤"
```

---

## Task 6: 修存量(运营动作,executor 跑、人确认)

**Files:** 无代码(用 Task 1-5 的工具)

- [ ] **Step 1: 补 12 篇缺失的繁体 MD**

找出有简体 MD 但无繁体 MD 的 slug,逐个跑翻译:
```bash
cd "/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/Blog-SEO/output" && for f in blog_*.md; do case "$f" in *_zh-Hant.md) continue;; esac; h="${f%.md}_zh-Hant.md"; [ -f "$h" ] || echo "缺繁体: $f"; done
```
对每个「缺繁体」的简体 MD:`cat blog_<slug>.md | python3 ../scripts/zh_hant/build_new_zh_hant.py > blog_<slug>_zh-Hant.md`,再 `npm run check:blog` 看繁体核对。

- [ ] **Step 2: 批量重导(修变异)**

`cd sanmu-website && npm run import:blog -- --all`
- 会把所有有 MD 的简繁文章 upsert 进 Notion,**以 MD 为源头修掉变异**(何鸿燊/危言耸听/抵消 等)。
- ⚠️ 红色项的会被跳过并汇总;确认无误可 `--all --force`。
- ⚠️ 会覆盖 Notion 手动改动(封面图/审核勾选保留)。

- [ ] **Step 3: 抽查确认变异已修**

对之前 3 个变异点抽查 Notion 现状,确认已是 何鸿燊 / 危言耸听 / 抵消(可复用本会话的对比脚本思路)。

- [ ] **Step 4: 触发部署 / 等 ISR**

点 Notion hub 🚀 或等 1 小时,线上更新。

---

## Self-Review

- **Spec 覆盖**:简体核对(T3)、繁体核对(T3 同脚本 locale 分支)、可靠导入 martian+SDK(T4)、upsert+保留非MD字段+导入前核对+不渲染提醒(T4)、属性映射(T4 buildProps)、MD 格式解析(T1)、怪字白名单(T2)、脚本+文档(T5)、修存量+补繁体(T6)、源头模型/验收——全覆盖。
- **Placeholder**:无 TBD;怪字白名单用语料生成(T2)非占位。
- **类型/签名一致**:`parseBlogMd`(T1)返回 `{slug,locale,props,body,hasPropSection,hasBodySection}` → T3 `checkMd`、T4 `importOne`/`buildProps` 用的字段(props.title/slug/subtitle/category/keywords/status/readMinutes/videoUrl)与 T1 `FIELD_ALIASES` 一致;`checkMd`(T3)返回 `{reds,yellows}` → T4 import 前用 `reds`;`importOne(file,{force})`(T4)签名与 CLI 调用一致;Blog data_source id `319407d1-...` 在 T4 与验证脚本一致;残留简体复用 `lib/i18n.ts` 的 `S2T_MAP` 正则(T3,本会话已多次验证可用)。
- **顺序依赖**:T3 import T1;T4 import T1+T3;T2 的 common-chars.txt 被 T3 读取(故 T2 在 T3 前)。各任务可独立 `node --check` / 跑验证。