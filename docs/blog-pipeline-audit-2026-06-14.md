# 博客内容管线 + 列表/表格渲染 — 总结与审计报告

**日期**:2026-06-14
**范围**:① 新建博客「后端处理」管线(核对/导入,替代会变异生僻字的 MCP 导入)② 修存量(批量重导线上文章)③ 网站新增列表/表格渲染
**部署状态**:🟡 **全部改动仅本地 commit,未 push,生产零改动**(`main` 领先 `origin/main` 12 个提交)。Notion 数据已改动(见 §4)。

---

## 1. 为什么做(背景)

- 旧的 MD→Notion 导入走 Claude MCP 的 markdown 路径,内部有「模型转写」环节,会把**生僻字变异**(实测:何鸿燊→栞/燊、危言耸听→耸/耺、抵消→掊),且每次错得不一样,线上挂着错字。
- 没有自动核对,简繁体质量靠人眼。
- 顺带发现:很多文章正文用了**列表/表格**,但网站 `parseBlocks` 从 Phase 2.1 起就忽略它们 → 这些清单/对比表内容在线上**一直隐形**(占部分文章 30–47% 的篇幅)。

## 2. 做了什么(交付物)

### 2.1 后端管线(`sanmu-website/scripts/`)
| 命令 | 作用 |
|---|---|
| `npm run check:blog -- <md>` | 核对:结构/必填字段/Slug 格式/摘要字数/怪字;繁体另查**残留简体字**+大陆词。🔴红=必修(exit 1)、🟡黄=建议 |
| `npm run import:blog -- <md>` / `-- --all` | `@tryfabric/martian`(markdown→blocks,纯代码无 LLM)+ `@notionhq/client` 直连导入,**生僻字零变异**。导入前自动跑 check,有红拦截(`--force` 强行) |

**关键设计**(踩坑后定的,审计重点):
1. **upsert 键** = Slug + 语言版本(存在则清旧正文块→更新属性→写新块;否则新建)。
2. **只动 MD 涉及字段**,不碰 封面图/现场照片/繁体人工校对/SEO复核。
3. **「状态」字段永不在更新时覆盖**(见 §3 事故)——MD 里的状态会过期,只在新建文章时用。
4. **繁体 MD 是 body-only**(翻译脚本 `build_new_zh_hant.py` 只转正文):导入时正文取繁体 MD,属性取同 slug 简体 MD;**记录已存在时只更新正文、保留 Notion 现有标题/摘要/状态**(上线时 s2twp 已校好的不动)。
5. **正文 `<video src="youtube">` 标签** → 转成 Notion video 块(martian 不认 HTML,会丢;视频是文章重要组成)。
6. **YAML frontmatter 格式**也支持(部分文章用 `---\nslug:...\n---` 而非 bullet 属性段)。
7. **空壳占位符硬拒绝**:正文是「已推 Notion 待回填」之类占位符的 MD,**连 --force 都拒绝导入**(防止用占位符覆盖 Notion 真内容)。

### 2.2 网站渲染(`lib/notion.ts` + 两个文章页)
- `parseBlocks` 改 async,新增 `bulleted_list_item`/`numbered_list_item`(连续项归组、嵌套子项展平)和 `table`(抓 table_row 子块)。**段落/引用/标题/视频逻辑一字未动**(只增不改)。
- `app/blog/[slug]/page.tsx` + `app/events/[slug]/page.tsx` 新增 list/table 渲染分支。

## 3. ⚠️ 事故记录:误下线 18 篇文章(已修复,需复查确认)

**这是本次最该复查的一项。**

- **现象**:`import:blog --all` 重导时,从 MD 覆盖了「状态」字段。但 MD 的「状态」是陈旧的(写稿填「待发布」,后来在 Notion 手动改「已发布」上线,MD 未同步)→ 把 **18 篇线上简体文章打回「待发布」= 下线**。
- **发现**:本地测试时 dev server 直读 Notion,多篇简体页变 **404**。
- **修复**:以**线上 sitemap**(`https://www.sanmu.ca/sitemap.xml`,只列已发布,且当时仍是旧 ISR 缓存=止损前真相)为权威清单,把 18 篇恢复「已发布」。现 Notion 简体「已发布」**25 篇**,与 sitemap 一致。
- **影响面**:**繁体未受影响**(繁体导入本就保留属性)。**无真实用户外溢**——生产 ISR 缓存当时还 held 旧的「已发布」状态没 revalidate,在过期前已修好。
- **根因加固**:commit `3e442e7` —— 更新已存在文章时剥离「状态」,永不覆盖。已验证重导后状态保持「已发布」。
- **复查这 18 篇**(都应「已发布」):apology-letter-to-heaven, bring-ashes-back-to-canada, canada-cemetery-6-investment-traps, canada-cpp-3-survivor-benefits-traps, canada-end-of-life-complete-guide, canada-funeral-5-pricing-traps, canada-funeral-benefits-11-pitfalls, canada-funeral-cost-breakdown, digital-legacy-4-step-plan, family-archive-handbook-6-modules, golden-24-hours-after-death-canada, keychain-after-will, midlife-crisis-psychological-funeral, parents-gone-lost-north, some-parents-cant-love-you, talk-end-of-life-with-immigrant-parents, ten-good-years-after-70, unemployment-isnt-losing-yourself。

## 4. Notion 数据改动清单(不在 git,已是线上数据)

1. **正文重导**:25 篇简体 + 17 篇繁体(有 MD 的)被 martian 重导,**正文块全部重写**(修字符变异)。简体属性按 MD 覆盖(除状态);繁体仅正文、属性保留。
2. **状态恢复**:§3 的 18 篇简体 → 已发布。
3. **who-fears-death-more-men-or-women(简体)**:YAML 草稿,--force 导入(状态保持「待发布」,本就未上线)。
4. **测试页**:流程中建过几个测试页(slug 含 `vtest`/`selftest`/`pipeline-`),均已 `archived`。**复查项**:Notion Blog 库确认无残留 vtest/selftest 页。

**跳过未导入**(check 拦截,符合预期):8 篇草稿 `body_*_for_notion`、2 篇空壳(ten-good-years_zh-Hant、who-fears_zh-Hant,真内容只在 Notion)。

## 5. 验证结果

- **简体 25 篇全量本地测试:25/25 通过** —— 每篇 200 不崩、段落零丢失、列表/表格内容全部渲染(脚本逐篇从 MD 取「段落探针+列表探针+表格探针」比对渲染页)。
- **繁体抽查**:digital-legacy `<li>×71`、cpp `<li>×60`、will `<li>×36`,均 200 + 列表渲染。
- **`npm run build`**:编译成功,67 页全过,TS 无报错。
- **生僻字抽查**:canada-will 的 何鸿燊/危言耸听 简繁两版逐字忠实、无残留错字。

## 6. 审计复查清单(复查人可逐条跑)

```bash
cd sanmu-website

# A. 代码层
git log --oneline origin/main..HEAD          # 应见 12 个未推送提交
git diff origin/main..HEAD -- lib/notion.ts   # 确认 parseBlocks 只增 list/table, 旧逻辑未改
npm run build                                 # 应编译成功

# B. 工具行为(需 .env.local 里的 NOTION_TOKEN)
npm run check:blog -- ../SEO/output/blog_canada-will-4-things-before-lawyer_zh-Hant.md   # 干净繁体应 exit 0
npm run check:blog -- ../SEO/output/blog_ten-good-years-after-70_zh-Hant.md              # 空壳应报红「占位符」

# C. Notion 状态(关键: 确认无误下线)
#   查 Blog 库「语言版本=zh-Hans 且 状态=已发布」应为 25 篇, 与线上 sitemap 一致
curl -s https://www.sanmu.ca/sitemap.xml | grep -oE '/blog/[a-z0-9-]+' | sort -u | wc -l   # 25

# D. 渲染(本地 dev): 抽查列表/表格文章
npm run dev    # 然后浏览器看:
#   /blog/digital-legacy-4-step-plan      (4步清单应显示)
#   /blog/canada-cpp-3-survivor-benefits-traps  (福利对比表应显示)
#   /zh-Hant/blog/digital-legacy-4-step-plan
```

## 7. 已知限制 / 后续

- **2 篇空壳繁体**(ten-good-years_zh-Hant、who-fears_zh-Hant)真内容只在 Notion、无 MD 源 → 它们的繁体正文若有变异**未修**。要修需对应简体跑 `build_new_zh_hant.py` 补出繁体 MD。
- **9 篇有繁体 Notion 记录但无繁体 MD** 的文章:繁体正文未重导(无源),变异未修。同上,补 MD 后可纳管。
- **check 的「残留简体字」对多义字会误报**:划(划算)、里(公里)在繁体合法,会被标红;复查时凭上下文判断(本次已人工确认 4 篇「划算」是误报、will-only 的「耳機里→裡」是真错并已修)。
- **`SEO/BLOG_WRITING_WORKFLOW.md`** 的「七、后端处理」章节改动在磁盘,但 SEO/ 在 sanmu-website git repo 外,未纳入版本管理。
- **表格嵌套/多级列表**:当前嵌套列表项做展平处理(不丢内容,但不保留多级缩进)。

## 8. 部署建议

改动已本地验证充分,但**尚未 push**。批准后:`git push origin main` → Vercel 自动构建部署。
- 部署后生产才会渲染列表/表格(目前生产仍跑旧代码,列表隐形)。
- Notion 内容改动会随 ISR(每小时)自然生效。
- 建议部署后再抽查 2–3 篇线上列表文章确认。

---
*生成者:Claude(Opus 4.8)。本报告供人工复查。涉及生产部署与 Notion 数据,请以实际核查为准。*
