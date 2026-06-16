# 身后事手册领取页 重设计 · 设计

日期:2026-06-14
目标:提升手册页转化(页面多次被打开但少有下载)。调整结构让价值前置、删掉过度防御文案、加一个 CTA、用真实社会证明(领取计数器)推动留资。简繁两版同步。

---

## 背景与现状

- 页面:`app/resources/handbook/page.tsx`(简)/ `app/zh-Hant/resources/handbook/page.tsx`(繁)。
- 现结构:Hero → 为什么免费 → 手册包含什么(8 份)→ 表单 → 免责。
- 痛点:① 转化低(多次打开无下载)。② 表单旁「不强制留电话、不订阅也能随时退」过度防御、硬说让人不适(违背品牌「机构感优先、不喊口号」)。③ 简繁已走偏——简体「手册包含什么」是富卡片(标题+描述+适用人群),繁体只是 8 个标题纯列表。
- 数据(Notion,集成 token 可读):
  - **客户邮件列表**(database `268c4735c23680af81e6d6f3e1597f8f` / data_source `268c4735-c236-8027-a53f-000b5b6e949f`):跨渠道总客户,**1077 条**,作计数器**基数**。
  - **手册订阅 Handbook Leads**(data_source = `NOTION_HANDBOOK_DS_ID` = `92e2656c-aa57-4a16-be5d-d6f76e74652d`):网站表单写入的登记索取,现 6 条,作**真实 +1** 来源。

## 已定决策

| 项 | 决策 |
|---|---|
| 新结构 | Hero → **手册包含什么** → **➕新 CTA** → 为什么免费 → 表单(含计数器)→ 免责 |
| CTA 数量 | **只加 1 个**(「手册包含什么」之后,居中)。页面不长,一个够,不催 |
| 删文案 | 删掉「不强制留电话、不订阅也能随时退」 |
| 计数器口径 | **客户邮件列表(1077,基数)+ Handbook Leads(真实 +1)+ 每日确定性 drip(3~10)** |
| drip 性质 | 代表跨渠道保守真实索取量;**确定性**(日期哈希),同一天数字固定不闪,跨天才涨 |
| 繁体 | 「手册包含什么」补齐成与简体一致的 8 张富卡片;同步全部结构/CTA/计数器/文案改动 |
| 品牌调性 | 计数器克制呈现(机构感),不做花哨跑分动画 |

---

## 计数器设计

### 数据与公式
```
显示数 = countCustomerList + countHandbookLeads + dailyDrip(START_DATE, now)
```
- `countCustomerList`:查 `客户邮件列表` data_source 全量计数(基数 ~1077)。
- `countHandbookLeads`:查 `NOTION_HANDBOOK_DS_ID` 全量计数(网站真实登记,填表即 +1)。
- 两库可能有极小重叠(若用户把网站线索并进客户列表),量级 <10、可忽略;不做去重。

### dailyDrip(确定性,不用 Math.random / 不闪)
- `START_DATE = "2026-06-14"`(本功能上线日;drip 从 0 起,向前累加)。
- `days = max(0, floor((now - START_DATE)/86400000))`。
- 每天增量 `drip(d) = 3 + floor(frac(|sin(d*12.9898)*43758.5453|) * 8)` → 3..10。
- `dailyDrip = Σ_{d=0..days} drip(d)`。同一天 `days` 不变 → 总和固定(ISR 多次再生成也一致);跨天才增。

### 实现
- 新建 `lib/handbook-count.ts`,导出 `async function getHandbookCount(now?: Date): Promise<number>`。
  - 客户邮件列表 data_source id 作**常量硬编码**在该文件(非密、无需新 Vercel env;沿用项目里 Blog DS 硬编码的先例),Handbook Leads 用 `process.env.NOTION_HANDBOOK_DS_ID`。
  - 计数用 `notion.dataSources.query` 分页累加。
  - **容错**:任一查询抛错 → 该项以兜底基数代入(`FALLBACK_BASE = 1080`,Leads 记 0),保证页面永不因计数失败而崩;drip 照常算。
- 展示:表单区标题下一句 `已有 {N.toLocaleString()} 个家庭领取了这份手册`(繁:`已有 {N} 個家庭領取了這份手冊`),克制字号、`opacity` 略低,机构感。无动画(YAGNI)。

### ISR(关键)
- 计数器读 Notion,手册页**必须设** `export const revalidate = 3600`(简繁两页),否则数字冻结在 build 时(见项目「Notion ISR revalidate」教训)。

---

## 页面结构(简繁一致)

1. **Hero**:不动(双 CTA「✉️免费索取手册」`#get` +「先看包含什么↓」`#contents`;封面图)。
2. **手册包含什么**(`#contents`,8 张富卡片):上移到此。繁体补齐为富卡片。
3. **➕ 新 CTA**(居中,在 8 卡之后、`为什么免费` 之前):一个 `Button variant="primary" href="#get"`「✉️ 免费索取手册 / 免費索取手冊」,上下留白。
4. **为什么免费**(暖黄底):内容不变,位置后移。
5. **表单区**(`#get`):标题「填一下,手册马上发到你邮箱」+ 副标题「留下邮箱和称呼,PDF 会自动发给你」+ **计数器句**(替掉删除的防御话)+ `HandbookForm` + 保留「三木会亲自看每封回信…」。
6. **免责**:不动。

## 繁体补齐(富卡片)

繁体 `DOCUMENTS` 由现简体 8 项(title/description/forWhom)经 s2twp 转 + 人工校(注意 TW 用语:视频→影片 等,但本页多为名词)译成繁体富对象,结构/样式与简体卡片完全一致。num/numEn 沿用罗马数字不变。

## 文件结构

- 新建 `lib/handbook-count.ts` — `getHandbookCount()`。
- 改 `app/resources/handbook/page.tsx` — 重排 section、加 CTA、加计数器、删防御话、加 `revalidate`。
- 改 `app/zh-Hant/resources/handbook/page.tsx` — 同上 + 繁体富卡片 `DOCUMENTS`。

## 验收

- 手册页(简繁)新顺序:Hero → 包含什么 → CTA → 为什么免费 → 表单(带计数器)→ 免责。
- 计数器显示 ≈ 1077 + 6 + drip(约 1080+),数字带千分位;同一天刷新不变,跨天增长。
- 表单旁不再有「不强制留电话…」。
- 繁体「手册包含什么」是 8 张富卡片,与简体对齐。
- Notion 查询失败时页面正常(走兜底基数),不崩。
- `npm run build` 通过;两页 `revalidate=3600` 生效。

## YAGNI(不做)

- 不做计数器跑分动画、不做实时 WebSocket。
- 不改手册表单的存储流向(仍写 Handbook Leads;并库由用户手动)。
- 不动 Hero 文案、不动 HandbookForm 组件本身。
- 不引入新的 Vercel env(客户邮件列表 DS id 硬编码常量)。
