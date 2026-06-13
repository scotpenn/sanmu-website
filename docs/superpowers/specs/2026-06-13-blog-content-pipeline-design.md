# 博客内容管线(核对 + 可靠导入)· 设计

日期:2026-06-13
目标:把博客的「后端处理」做成可靠管线——**简体核对 → 翻译(已有)→ 繁体核对 → 忠实导入 Notion(零字符变异)**。前端只负责产出简体 MD,后端机器先筛、人只看标红。

---

## 背景与现状

- **完整内容流**:人工口播稿 → 配关键词 → 自动改写成书面博客(简体 MD)→【本次:核对/翻译/校对/导入】→ Notion → 网站(ISR)。
- **现有资产(复用,不重做)**:
  - MD 文件:`SEO/output/blog_<slug>.md`(简)/ `blog_<slug>_zh-Hant.md`(繁)。固定格式:`# 标题` → `## Notion 页面属性`(`- **字段**：值` 列表)→ `## Page Body`(正文)。语言版本由文件名 `_zh-Hant` 区分;翻译组ID = slug。简体 29 篇、繁体 12 篇(其余繁体是上线时机器转的、无 MD)。
  - 翻译:`SEO/scripts/zh_hant/build_new_zh_hant.py`(OpenCC `s2twp` + TW 词汇层),简→繁,质量好。本地 Python。
  - 网站读 Notion:`@notionhq/client`(已装)+ `NOTION_TOKEN`;Blog data_source `319407d1-e400-4aed-8e36-dfa0ab19e6ea`。
- **痛点**:① 导入用 MCP 的 markdown 路径,内部有"模型转写"环节,把生僻字变异(实测:何鸿燊→栞、危言耸听→耺、抵消→掊,线上挂着错字,且每次错得不一样)。② 转换后没有自动核对,只有规范第六章的人工 checklist。
- **已验证**:`@tryfabric/martian`(markdown→Notion blocks,纯代码无 LLM)+ `@notionhq/client` 实测 17 个生僻字/emoji **零变异**。martian 已装。

## 已定决策

| 项 | 决策 |
|---|---|
| 范围 | 后端三件:**简体核对 + 繁体核对 + 可靠导入**;串成管线 |
| 不重做 | 口播稿→博客改写(上游)、`build_new_zh_hant.py`(翻译,已有) |
| 导入实现 | `martian` 解析 + `@notionhq/client` 直连 REST API(绕开 MCP) |
| MD 格式 | 沿用现有(`## Notion 页面属性` + `## Page Body`),不改写作习惯 |
| 源头模型 | **MD 驱动文章内容(属性+正文)**;导入**只动 MD 涉及字段**,保留 封面图/繁体人工校对/SEO复核 等非 MD 字段;文末"相关阅读"是网站渲染、不在 Notion |
| upsert 键 | Slug + 语言版本(存在则更新:清旧正文块→写属性→写新块;否则新建)|
| 核对哲学 | 机器尽量筛(格式/字段/残留简体/大陆词/怪字),报「红=必修 / 黄=建议」;**语义错别字仍需人眼**,但大幅减少漏检 |
| 修存量 | 用本工具批量重导(修变异)+ 给缺失的 12 篇繁体补 MD(跑翻译)→ 收尾运营动作 |

---

## 架构与数据流

```
前端(自动,上游,不在本次):口播稿 + 关键词 → 自动改写 → 简体 blog_<slug>.md
后端(本次,命令驱动):
  ① check:blog <简体md>   —— 格式/字段/怪字/SEO  → 报告 红/黄
  ② build_new_zh_hant.py  —— 简→繁(已有)        → blog_<slug>_zh-Hant.md
  ③ check:blog <繁体md>   —— 残留简体/大陆词/怪字/格式 → 报告 红/黄
  ④ import:blog <md>      —— martian+SDK 忠实导入(零变异), upsert, 保留非MD字段
                            (导入前自动跑对应 check;有红默认拦, --force 强行)
  可选 publish:blog <slug> —— 串 ①→提示跑②→③→④(简繁两版)
→ Notion → 网站(ISR 每小时)
```

## 文件结构

- `scripts/check-blog.mjs`(新建):一个脚本,按文件名 `_zh-Hant` 判定语言,跑对应核对,输出红/黄报告,退出码非 0 表示有红。
- `scripts/import-blog.mjs`(新建):解析 MD → 属性 + martian(正文)→ upsert 进 Blog 库;`--all` 批量;导入前调用 check。
- `lib/md-blog.mjs`(新建,被上面两个共用):解析 MD 的 `## Notion 页面属性`(→ 字段对象)和 `## Page Body`(→ 正文字符串);从文件名取 slug + locale。
- `scripts/data/common-chars.txt`(新建):约 6000 常用汉字表,用于怪字检测(超出表的字判为"怪字候选")。
- `package.json`(改):加 `check:blog` / `import:blog` / `publish:blog` 脚本。
- `SEO/BLOG_WRITING_WORKFLOW.md`(改):把后端步骤写进去(导入改用 `import:blog`,别用 MCP)。

## ① 简体核对(check-blog,简体规则)

解析 MD 后检查:
- **结构(红)**:同时存在 `## Notion 页面属性` 与 `## Page Body` 段。
- **必填字段(红)**:标题、Slug、摘要、状态 非空(从属性段解析)。
- **Slug 格式(红)**:`^[a-z0-9-]+$`。
- **视频链接(黄)**:若填了,需匹配 `youtube.com/watch?v=` 或 `youtu.be/`。
- **阅读时长(黄)**:若填了,是数字。
- **摘要字数(黄)**:80–160 字(SEO)。
- **怪字(黄)**:正文里出现、且不在 `common-chars.txt` 的汉字,逐个列出(含所在句),人确认是错字还是生僻专名。

## ③ 繁体核对(check-blog,繁体规则:文件名含 `_zh-Hant`)

- **结构/必填/Slug/视频/阅读时长/怪字**:同①。
- **残留简体字(红)**:正文+属性里出现"简体专用字"(即在简→繁映射表里、且繁体形 ≠ 简体形的字)→ 列出(s2twp 漏网,需补)。判定复用 `lib/i18n.ts` 的 `S2T_MAP`——`check-blog.mjs` 是纯 .mjs,不能 import TS,故**运行时用正则从 `lib/i18n.ts` 源文解析出 `S2T_MAP`**(`const m = src.match(/const S2T_MAP[^{]*{([\s\S]*?)\n};/)`,再 `matchAll(/([一-鿿])\s*:\s*"([^"]+)"/g)`),取 `值 ≠ 键` 的键为简体专用字。此法已在本项目多次核对脚本中验证可用。
- **未本地化大陆词(黄)**:命中内置词表 → 提示 TW 词:`視頻→影片`、`信息→資訊`、`博客→網誌`、`网络→網路`、`质量→品質`、`用户→使用者`、`在线→線上`、`默认→預設`、`软件→軟體`、`邮箱→電子信箱`、`视频号/账号→帳號`、`点赞→按讚` 等(词表写在脚本顶部,可加)。

## ④ 可靠导入(import-blog)

- **解析**:`lib/md-blog.mjs` 取属性 + 正文;`martian.markdownToBlocks(正文)` → blocks。
- **属性映射** → Blog 库字段:标题(title)、Slug(rich_text)、摘要(rich_text)、类型(select)、关键词(multi-select,按 `、`/`,` 拆)、状态(select)、阅读时长(number)、视频链接(url)、语言版本(select,来自文件名)、翻译组ID(rich_text = Slug)。
- **upsert**:查 Blog 库 Slug+语言版本 → 命中则:`blocks.children.list` 删除所有现有子块 → `pages.update` 写属性 → `blocks.children.append` 写新块;未命中则 `pages.create`(含 children)。
- **保留非 MD 字段**:`pages.update` 只设上面列出的字段,**不碰** 封面图、现场照片、繁体人工校对、SEO复核。
- **导入前自动核对**:先跑 check;有"红" → 打印并退出(除非 `--force`)。
- **不渲染告警**:martian 若产出 列表/图片/code 等网站 `parseBlocks` 暂不渲染的块,导入仍写入,但**打印一条提醒**列出这些块类型(范围 A:三木主要用 段落/标题/引用/视频)。
- **批量** `--all`:遍历 `SEO/output/blog_*.md`(简+繁)逐篇 upsert;每篇先 check,红的跳过并汇总报告。

## 环境 / 依赖

- `@tryfabric/martian`、`@notionhq/client`:已装。
- `NOTION_TOKEN`、`NOTION_BLOG`(data_source 硬编码即可):已有。
- OpenCC(翻译步骤):本地 Python,已有,不在本次脚本内。

## 修存量(收尾运营,用本工具)

1. `import:blog --all` 重导**有 MD 的 29 简 + 12 繁**→ 修掉变异(何鸿燊/危言耸听/抵消 等)。⚠️ 以 MD 为唯一源头,会覆盖 Notion 手动改动(封面/勾选保留)。
2. 缺失的 ~12 篇繁体:对应简体跑 `build_new_zh_hant.py` 补出繁体 MD → check → 导入,纳入管线。

## 验收

- `check:blog` 对一篇故意含残留简体/大陆词/怪字/缺字段的 MD → 准确报出红/黄项。
- `import:blog` 导一篇 → Notion Blog 出现/更新该文,**生僻字逐字对**(如 何鸿燊 正确)、属性都对、封面图/审核勾选未被清掉;重导一次 = 更新不重复建。
- 繁体页提交的文章繁体导入,语言版本/翻译组ID 正确,与简体同 Slug 配对。
- `--all` 批量重导后,之前那 3 处变异在 Notion 里已修正。
- `npm run build` 不受影响(脚本是构建外工具)。

## YAGNI(不做)

- 不做语义级中文错别字检查(没有可靠引擎;靠怪字检测 + 人眼)。
- 不做口播稿→博客的自动改写(上游已有)。不在脚本里重写 OpenCC 翻译(本地 Python 已有)。
- 不扩展网站 parseBlocks 渲染列表/图片(范围 A;以后需要再单独做)。不做 GUI,纯 CLI。
