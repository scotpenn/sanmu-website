# 内链增强设计 · CMS 段落内链接 + 自动相关文章模块

日期:2026-06-05
目标:为博客建立内链(internal linking),提升主题聚合与 SEO。分两个独立功能,**先 B 后相关模块**。

---

## 背景

当前博客文章之间**零内链**:
- 博客详情页底部只有「← 查看更多文章」,无相关文章推荐。
- Notion 正文里设的链接到了网站变成纯文字 —— [lib/notion.ts](../../../lib/notion.ts) 的 `parseBlocks` paragraph 分支用 `richTextToPlainText()` 只取 `plain_text`,丢掉了每个 rich_text 的 `.href`。

两个功能解决两种内链需求:
- **功能 B**:让作者能在正文里**手动**插链接(最自然、最精准的上下文内链)。
- **相关模块**:在文末**自动**按关键词相似度推 3 篇(零维护的批量内链)。

---

## 功能 B · CMS 段落内链接(先做)

### 数据结构(lib/notion.ts)
- 新增 `export type RichSegment = { text: string; href?: string }`
- `PostBlock` 的 paragraph 变体:`{ type: "paragraph"; text: string }` → `{ type: "paragraph"; segments: RichSegment[] }`

### 解析(parseBlocks 的 paragraph 分支)
- 遍历 `b.paragraph.rich_text`,每项 → `{ text: rt.plain_text, href: rt.href ?? undefined }`。
- 段落是否「非空」的判定改为:拼接所有 segment 的 text 后 trim 非空。

### 渲染(blog/[slug]/page.tsx + events/[slug]/page.tsx 的 paragraph 分支)
逐 segment 渲染:
- **无 href** → 纯文字(`<>{text}</>`)。
- **站内链接**(href 以 `/` 开头,或包含 `sanmu.ca`)→ 归一成相对路径,用 Next `<Link>`(客户端跳转、不开新标签)。
- **站外链接** → `<a href target="_blank" rel="noopener noreferrer">`。
- 链接样式:品牌蓝(brand-navy)+ hover 下划线。

归一逻辑:`https://www.sanmu.ca/blog/x` 与 `https://sanmu.ca/blog/x` → `/blog/x`;已是相对路径则原样。

### 在 Notion 怎么用
正文选中文字 → 设链接 → 内链填 `/blog/某slug`(相对)或完整 URL 均可。

### 边界 & YAGNI
- 旧纯文字段落不受影响(无 href 即纯文字)。
- **只做 paragraph**;quote / heading 维持纯文字。
- **不保留 bold/italic**(当前也未保留,非回归);结构已留好,后续可加 `bold?/italic?` 到 RichSegment。

---

## 相关文章模块(后做)

### 算法(lib/notion.ts 新增 `getRelatedPosts(currentSlug, count = 3): Promise<PostMeta[]>`)
1. 取当前文章 tags 集合。
2. 其余每篇打分 = 与当前文章**共享 tag 数**。
3. 排序:① 共享 tag 数 ↓ → ② 同 category 优先 → ③ 发布日期较新优先。
4. score > 0 为「真·关键词相关」;**不足 count 篇时,用「同 category 优先 → 最新」补满**。
5. 始终排除当前文章自身。

### 组件(components/RelatedPosts.tsx,新建)
- 入参:`posts: PostMeta[]`(≤3 篇)。
- 渲染:标题 + 摘要 + 日期,套用现有博客卡片视觉,每篇链到 `/blog/[slug]`。

### 接入(app/blog/[slug]/page.tsx)
- 已有 `getPostBySlug`;新增算 related,放在「文末四模块」**之前**,独立 section「相关阅读 · Read Next」。

### 边界
- 全站文章 < 4 篇:有几篇显示几篇(最多 3)。
- 文章无 tag:直接走 category/日期补满。

### YAGNI
- 不做缓存(已有 ISR)、不做跨类型加权、不做手动指定相关文章。

---

## 验收

- **B**:在 Notion 某篇正文里加一个站内链接 + 一个站外链接 → `rm -rf .next && npm run build` → 该页 HTML 里站内链接是相对 `/blog/...` 的 `<a>`、站外链接带 `target="_blank"`;纯文字段落不变。
- **相关模块**:每篇博客详情页底部出现「相关阅读」3 篇,且不含自己;tag 多的文章推的是共享 tag 最多的。
- 两者都不破坏现有构建,Notion 路由仍是 `revalidate=1h` 的静态 ISR。
