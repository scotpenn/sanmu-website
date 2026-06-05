# 内链增强 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给博客建立内链 —— ① 让 Notion 正文段落里的链接正确渲染成可点击链接;② 文末按关键词相似度自动推 3 篇相关文章。

**Architecture:** 段落数据从「纯字符串」升级为「带可选 href 的分段(RichSegment[])」;新增共享 `RichText` 组件统一渲染分段(站内 Next `<Link>`、站外 `<a target=_blank>`);新增纯函数 `getRelatedPosts` 按共享 tag 数排序;新增 `RelatedPosts` 组件接入博客详情页。

**Tech Stack:** Next.js 16 (App Router, RSC) + TypeScript + Notion SDK + Tailwind。**本项目无测试框架**,验证 = `npm run build`(类型/构建)+ 抓构建产物 HTML 断言。

**落地顺序:** 功能 B(Task 1)→ 相关模块(Task 2-3)。

---

## File Structure

- `lib/notion.ts`(改):新增 `RichSegment` 类型;`PostBlock` 的 paragraph 变体 `text` → `segments`;改 `parseBlocks` paragraph 分支;新增 `getRelatedPosts()`。
- `components/RichText.tsx`(新建):渲染 `RichSegment[]`,内含站内/站外链接判定与归一。博客、活动详情页共用。
- `components/RelatedPosts.tsx`(新建):相关文章模块。
- `app/blog/[slug]/page.tsx`(改):paragraph 用 `RichText`;底部加「相关阅读」section。
- `app/events/[slug]/page.tsx`(改):paragraph 用 `RichText`。

---

## Task 1: 功能 B — 段落内链接(RichSegment + RichText + 两个渲染处)

> 一次性落地:类型、解析、组件、两个渲染处一起改并提交,保证 build 始终绿色
> (paragraph 类型从 `text` 改成 `segments` 会同时影响两个渲染处)。

**Files:**
- Modify: `lib/notion.ts`(PostBlock 类型 + parseBlocks paragraph 分支)
- Create: `components/RichText.tsx`
- Modify: `app/blog/[slug]/page.tsx:76-82`(paragraph 渲染)
- Modify: `app/events/[slug]/page.tsx:134-140`(paragraph 渲染)

- [ ] **Step 1: 加 RichSegment 类型,改 PostBlock 的 paragraph 变体**

`lib/notion.ts`,把现有:

```ts
export type PostBlock =
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "video"; videoId: string };
```

替换为:

```ts
export type RichSegment = { text: string; href?: string };

export type PostBlock =
  | { type: "paragraph"; segments: RichSegment[] }
  | { type: "quote"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "video"; videoId: string };
```

- [ ] **Step 2: 改 parseBlocks 的 paragraph 分支,保留 href**

`lib/notion.ts` 的 parseBlocks 里,把:

```ts
      case "paragraph": {
        const text = richTextToPlainText(b.paragraph.rich_text).trim();
        if (text) result.push({ type: "paragraph", text });
        break;
      }
```

替换为:

```ts
      case "paragraph": {
        const segments: RichSegment[] = b.paragraph.rich_text.map((rt) => ({
          text: rt.plain_text,
          href: rt.href ?? undefined,
        }));
        if (segments.some((s) => s.text.trim())) {
          result.push({ type: "paragraph", segments });
        }
        break;
      }
```

- [ ] **Step 3: 新建 components/RichText.tsx**

```tsx
import Link from "next/link";
import type { RichSegment } from "@/lib/notion";

// 站内域名: href 命中这些 host 就归一成相对路径, 用 Next <Link> 客户端跳转
const SITE_HOSTS = ["www.sanmu.ca", "sanmu.ca"];
const LINK_CLASS =
  "text-brand-navy underline underline-offset-2 hover:opacity-80 transition-opacity";

function resolveHref(href: string): { to: string; external: boolean } {
  if (href.startsWith("/")) return { to: href, external: false }; // 相对路径
  try {
    const u = new URL(href);
    if (SITE_HOSTS.includes(u.hostname)) {
      return { to: u.pathname + u.search + u.hash, external: false };
    }
  } catch {
    // 非法 URL: 当外链兜底
  }
  return { to: href, external: true };
}

/** 渲染 Notion 段落分段: 无 href 是纯文字, 有 href 按站内/站外渲染成链接. */
export function RichText({ segments }: { segments: RichSegment[] }) {
  return (
    <>
      {segments.map((seg, i) => {
        if (!seg.href) return <span key={i}>{seg.text}</span>;
        const { to, external } = resolveHref(seg.href);
        if (external) {
          return (
            <a
              key={i}
              href={to}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              {seg.text}
            </a>
          );
        }
        return (
          <Link key={i} href={to} className={LINK_CLASS}>
            {seg.text}
          </Link>
        );
      })}
    </>
  );
}
```

- [ ] **Step 4: 博客详情页 paragraph 用 RichText**

`app/blog/[slug]/page.tsx` 顶部加 import:

```tsx
import { RichText } from "@/components/RichText";
```

把 paragraph 渲染:

```tsx
              if (block.type === "paragraph") {
                return (
                  <p key={idx} className="text-lg leading-[1.85]">
                    {block.text}
                  </p>
                );
              }
```

替换为:

```tsx
              if (block.type === "paragraph") {
                return (
                  <p key={idx} className="text-lg leading-[1.85]">
                    <RichText segments={block.segments} />
                  </p>
                );
              }
```

- [ ] **Step 5: 活动详情页 paragraph 用 RichText**

`app/events/[slug]/page.tsx` 顶部加 import:

```tsx
import { RichText } from "@/components/RichText";
```

把 paragraph 渲染:

```tsx
                if (block.type === "paragraph") {
                  return (
                    <p key={idx} className="text-base leading-[1.85]">
                      {block.text}
                    </p>
                  );
                }
```

替换为:

```tsx
                if (block.type === "paragraph") {
                  return (
                    <p key={idx} className="text-base leading-[1.85]">
                      <RichText segments={block.segments} />
                    </p>
                  );
                }
```

- [ ] **Step 6: 构建验证(类型 + 渲染处全部接通)**

Run: `cd sanmu-website && rm -rf .next && npm run build`
Expected: `✓ Compiled successfully`,无类型错误。(若有 `block.text` 残留引用会在此报错。)

- [ ] **Step 7: 提交**

```bash
git add lib/notion.ts components/RichText.tsx "app/blog/[slug]/page.tsx" "app/events/[slug]/page.tsx"
git commit -m "feat(cms): 支持 Notion 段落内链接, 站内走 Next Link 站外开新标签"
```

- [ ] **Step 8: 内容冒烟测试(需要用户配合)**

现有 Notion 文章可能还没有任何正文内链,故渲染需用真实内容验证:
1. 在某篇博客 Notion 正文里,选一段文字设链接 = `https://www.sanmu.ca/blog/<另一篇slug>`;再设一个站外链接(如 `https://example.com`)。
2. `rm -rf .next && npm run build`
3. 抓该页 HTML 断言:

```bash
f=$(find .next/server/app/blog -name "<该篇slug>.html" | head -1)
echo "站内链接(应是相对 /blog/, 无 target=_blank):"; grep -o '<a[^>]*href="/blog/[^"]*"[^>]*>' "$f" | head
echo "站外链接(应带 target=\"_blank\"):"; grep -o '<a[^>]*example.com[^>]*>' "$f" | head
```

Expected:站内链接渲染成相对 `/blog/...`(Next `<Link>`,无 `target=_blank`);站外链接带 `target="_blank" rel="noopener noreferrer"`;其余纯文字段落不变。

---

## Task 2: getRelatedPosts 算法

**Files:**
- Modify: `lib/notion.ts`(在 `getAllSlugs` 附近新增导出函数)

- [ ] **Step 1: 新增 getRelatedPosts**

`lib/notion.ts` 里(放在 `getAllPosts` / `getAllSlugs` 之后)加:

```ts
/**
 * 取与当前文章关键词(tags)最相关的 count 篇.
 * 排序: 共享 tag 数 ↓ → 同 category 优先 → 发布日期较新优先.
 * 共享为 0 的也参与排序, 因此只要总篇数够, 结果总会补满到 count 篇.
 */
export async function getRelatedPosts(
  currentSlug: string,
  count = 3,
): Promise<PostMeta[]> {
  const all = await getAllPosts();
  const current = all.find((p) => p.slug === currentSlug);
  const others = all.filter((p) => p.slug !== currentSlug);
  if (!current) return others.slice(0, count);

  const currentTags = new Set(current.tags);
  const scored = others
    .map((post) => ({
      post,
      shared: post.tags.filter((t) => currentTags.has(t)).length,
      sameCat:
        current.category && post.category === current.category ? 1 : 0,
    }))
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        b.sameCat - a.sameCat ||
        (a.post.date < b.post.date ? 1 : -1),
    );

  return scored.slice(0, count).map((s) => s.post);
}
```

- [ ] **Step 2: 构建验证(类型)**

Run: `cd sanmu-website && npm run build`
Expected:`✓ Compiled successfully`,无类型错误。

- [ ] **Step 3: 提交**

```bash
git add lib/notion.ts
git commit -m "feat(blog): 新增 getRelatedPosts 按共享 tag 数取相关文章"
```

---

## Task 3: RelatedPosts 组件 + 接入博客详情页

**Files:**
- Create: `components/RelatedPosts.tsx`
- Modify: `app/blog/[slug]/page.tsx`(import + fetch related + 底部加 section)

- [ ] **Step 1: 新建 components/RelatedPosts.tsx**

```tsx
import Link from "next/link";
import type { PostMeta } from "@/lib/notion";

/** 文末「相关阅读」: 渲染若干相关文章卡片, 空数组时不渲染. */
export function RelatedPosts({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;
  return (
    <div>
      <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-6 font-medium">
        Read Next · 相关阅读
      </div>
      <div className="grid gap-8">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block group"
          >
            <h3 className="text-xl md:text-2xl leading-tight mb-2 group-hover:text-brand-navy transition-colors">
              {post.title}
            </h3>
            {post.subtitle && (
              <p className="opacity-80 leading-relaxed mb-2 max-w-[640px]">
                {post.subtitle}
              </p>
            )}
            <div className="text-sm opacity-60 font-en">
              <time dateTime={post.date}>{post.date}</time>
              {post.readMinutes ? <> · {post.readMinutes} 分钟</> : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 博客详情页 import + 取 related + 渲染 section**

`app/blog/[slug]/page.tsx` 顶部加 import:

```tsx
import { RelatedPosts } from "@/components/RelatedPosts";
```

把 import 区的 notion 导入补上 `getRelatedPosts`:

```tsx
import { getAllSlugs, getPostBySlug, getRelatedPosts } from "@/lib/notion";
```

在 `PostPage` 里,把:

```tsx
  const post = await getPostBySlug(slug);
  if (!post) notFound();
```

替换为:

```tsx
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(slug, 3);
```

然后在 `{/* 文末四模块 */}` 那个 section **之前**插入:

```tsx
      {/* 相关阅读 */}
      {related.length > 0 && (
        <section className="border-t border-rule">
          <Container width="reading" className="py-16 md:py-20">
            <RelatedPosts posts={related} />
          </Container>
        </section>
      )}

```

- [ ] **Step 3: 构建**

Run: `cd sanmu-website && rm -rf .next && npm run build`
Expected:`✓ Compiled successfully`。

- [ ] **Step 4: 抓产物 HTML 断言(每页 3 篇、不含自己)**

```bash
cd sanmu-website && python3 - << 'PY'
import re, glob, os
bad=0; checked=0
for f in glob.glob(".next/server/app/blog/*.html"):
    slug=os.path.basename(f)[:-5]
    html=open(f,encoding="utf-8").read()
    if "相关阅读" not in html:
        print("✗ 无相关阅读:", slug); bad+=1; continue
    # 取「相关阅读」之后那段里的 /blog/ 链接
    tail=html.split("相关阅读",1)[1]
    links=set(re.findall(r'href="/blog/([^"#]+)"', tail))
    links={l for l in links if l and l!=slug}
    checked+=1
    if slug in re.findall(r'href="/blog/([^"#]+)"', tail):
        print("✗ 推荐里含自己:", slug); bad+=1
    if len(links)<1:
        print("✗ 相关链接为空:", slug); bad+=1
print(f"检查 {checked} 页, 问题 {bad} 处")
PY
```

Expected:`问题 0 处`;每篇博客详情页都有「相关阅读」且不含自己。
(注:全站博客 ≥4 篇时每页应是 3 篇;篇数少则相应减少。)

- [ ] **Step 5: 提交**

```bash
git add components/RelatedPosts.tsx "app/blog/[slug]/page.tsx"
git commit -m "feat(blog): 文末加相关阅读模块(按关键词相似度推 3 篇)"
```

---

## Self-Review

- **Spec 覆盖**:功能 B(类型/解析/渲染/站内外判定/只 paragraph/不碰 bold-italic)→ Task 1 全覆盖;相关模块(算法/组件/接入/补满逻辑)→ Task 2-3 全覆盖。补满逻辑由「共享为 0 也参与排序」隐式实现(spec 一致)。
- **Placeholder**:无 TBD/TODO;每个代码步骤含完整代码。
- **类型一致**:`RichSegment`(Task1)被 RichText 引用;`getRelatedPosts`(Task2)被 blog 页(Task3)引用,签名一致;`PostMeta` 在 RelatedPosts 引用,字段(slug/title/subtitle/date/readMinutes)均来自现有类型。
- **边界**:总篇数 <4 时取不满 3 篇,断言改为「≥1」容错;`getRelatedPosts` 对 current 不存在做了兜底。
