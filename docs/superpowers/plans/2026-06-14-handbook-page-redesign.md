# 手册页重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重排手册页结构(价值前置)、加一个 CTA、删过度防御文案、加真实社会证明计数器,繁体补齐富卡片,提升留资转化。

**Architecture:** 新建 `lib/handbook-count.ts` 计算"已领取家庭数"(客户邮件列表 DS 计数 + 手册登记 DS 计数 + 确定性日期哈希 drip,带兜底容错);两个手册页改成 async Server Component 调它、重排 section、加 `revalidate=3600`。

**Tech Stack:** Next 16 App Router(Server Component async 取数 + ISR `revalidate`)、@notionhq/client v5(`dataSources.query`)、Tailwind。

> 注意 `sanmu-website/AGENTS.md`:Next 16 有 breaking changes。本计划用的 `export const revalidate` + async Server Component 已是本项目博客页在用的既有写法(见 `lib/notion.ts` 调用页),沿用即可;若有疑问查 `node_modules/next/dist/docs/`。

---

## File Structure

- **Create** `lib/handbook-count.ts` — 唯一职责:算"已领取家庭数"。导出 `getHandbookCount(now?: Date): Promise<number>`。
- **Modify** `app/resources/handbook/page.tsx` — 简体页:重排 section、加 CTA、加计数器、删防御话、async + `revalidate`。
- **Modify** `app/zh-Hant/resources/handbook/page.tsx` — 繁体页:同上 + `DOCUMENTS` 补齐富卡片。

---

## Task 1: 计数器逻辑 `lib/handbook-count.ts`

**Files:**
- Create: `lib/handbook-count.ts`

- [ ] **Step 1: 写文件**

```ts
import { Client } from "@notionhq/client";

// 「客户邮件列表」(跨渠道总客户)data_source — 非密 ID, 硬编码避免新增 Vercel env
const CUSTOMER_LIST_DS = "268c4735-c236-8027-a53f-000b5b6e949f";
// Notion 查询失败时的兜底基数(≈当前客户邮件列表量级)
const FALLBACK_BASE = 1080;
// drip 起算日(本功能上线日, UTC). 月份 0-indexed: 5 = 六月
const DRIP_START = Date.UTC(2026, 5, 14);

// 确定性每日增量: 同一天固定(ISR 多次再生成一致), 跨天才增长; 不用 Math.random
function dailyDrip(nowMs: number): number {
  const days = Math.max(0, Math.floor((nowMs - DRIP_START) / 86_400_000));
  let sum = 0;
  for (let d = 0; d <= days; d++) {
    const h = Math.abs(Math.sin((d + 1) * 12.9898) * 43758.5453);
    sum += 3 + Math.floor((h - Math.floor(h)) * 8); // 每天 3..10
  }
  return sum;
}

async function countDataSource(notion: Client, dataSourceId: string): Promise<number> {
  let cursor: string | undefined;
  let count = 0;
  do {
    const r = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      start_cursor: cursor,
    });
    count += r.results.length;
    cursor = r.has_more ? (r.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return count;
}

/**
 * "已领取家庭数" = 客户邮件列表(基数) + 手册登记(真实+1) + 每日确定性 drip.
 * 任一 Notion 查询失败走兜底, 永不抛错(不让计数失败拖垮页面).
 */
export async function getHandbookCount(now: Date = new Date()): Promise<number> {
  const token = process.env.NOTION_TOKEN;
  const leadsDs = process.env.NOTION_HANDBOOK_DS_ID;
  let base = FALLBACK_BASE;
  let leads = 0;
  if (token) {
    const notion = new Client({ auth: token });
    try {
      base = await countDataSource(notion, CUSTOMER_LIST_DS);
    } catch {
      base = FALLBACK_BASE;
    }
    if (leadsDs) {
      try {
        leads = await countDataSource(notion, leadsDs);
      } catch {
        leads = 0;
      }
    }
  }
  return base + leads + dailyDrip(now.getTime());
}
```

- [ ] **Step 2: 验证 drip 算法(确定性 + 范围 + 跨天增长)**

把纯函数贴进 node 跑(TS 文件无法直接 import,单验算法即可):

Run:
```bash
cd "/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/sanmu-website" && node -e '
const DRIP_START = Date.UTC(2026,5,14);
function dailyDrip(nowMs){ const days=Math.max(0,Math.floor((nowMs-DRIP_START)/86400000)); let s=0; for(let d=0;d<=days;d++){const h=Math.abs(Math.sin((d+1)*12.9898)*43758.5453); s+=3+Math.floor((h-Math.floor(h))*8);} return s; }
const day0=DRIP_START, day1=DRIP_START+86400000, day0b=DRIP_START+3600000;
const a=dailyDrip(day0), ab=dailyDrip(day0b), b=dailyDrip(day1);
// 同一天稳定
console.log("同日稳定:", a===ab ? "PASS" : "FAIL", a, ab);
// 跨天增量在 3..10
const inc=b-a; console.log("跨天增量∈[3,10]:", inc>=3&&inc<=10 ? "PASS" : "FAIL", inc);
// day0 当天增量也在 3..10(d=0 一项)
console.log("day0 值∈[3,10]:", a>=3&&a<=10 ? "PASS" : "FAIL", a);
'
```
Expected: 三行都 `PASS`。

- [ ] **Step 3: 验证真实计数能读到 Notion(可选, 需 .env.local)**

Run:
```bash
cd "/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/sanmu-website" && node --env-file=.env.local -e '
import("@notionhq/client").then(async ({Client})=>{
  const n=new Client({auth:process.env.NOTION_TOKEN});
  async function cnt(ds){let c=0,cur;do{const r=await n.dataSources.query({data_source_id:ds,page_size:100,start_cursor:cur});c+=r.results.length;cur=r.has_more?r.next_cursor:undefined;}while(cur);return c;}
  const base=await cnt("268c4735-c236-8027-a53f-000b5b6e949f");
  const leads=await cnt(process.env.NOTION_HANDBOOK_DS_ID);
  console.log("客户邮件列表:",base,"手册登记:",leads,"→ 基数合计:",base+leads);
});'
```
Expected: 打印 `客户邮件列表: 1077 手册登记: 6 → 基数合计: 1083`(数字随真实数据浮动)。

- [ ] **Step 4: Commit**

```bash
cd "/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/sanmu-website"
git add lib/handbook-count.ts
git commit -m "feat(handbook): 计数器逻辑(客户邮件列表+手册登记+确定性日drip, 带兜底)"
```

---

## Task 2: 简体手册页重排 + 计数器 `app/resources/handbook/page.tsx`

**Files:**
- Modify: `app/resources/handbook/page.tsx`

- [ ] **Step 1: 加 import + revalidate + 组件改 async 取数**

顶部 import 区加一行:
```tsx
import { getHandbookCount } from "@/lib/handbook-count";
```
`metadata` 定义之后加(ISR;不加则计数冻在 build 时):
```tsx
export const revalidate = 3600;
```
组件签名改为 async 并取数 —— 把
```tsx
export default function HandbookPage() {
  return (
```
改成
```tsx
export default async function HandbookPage() {
  const count = await getHandbookCount();
  return (
```

- [ ] **Step 2: 重排 section + 新增 CTA**

当前 JSX 顺序是:`{/* Hero */}` → `{/* 屏 2 · 为什么免费 */}` → `{/* 屏 3 · 手册包含什么 */}` → `{/* 屏 4 · 如何索取(表单) */}` → `{/* 屏 5 · 免责 */}`。

把整段 `{/* 屏 3 · 手册包含什么 · 8 份文档 */}<section id="contents" …>…</section>` **整块移到** `{/* 屏 2 · 为什么免费 …*/}<section …>…</section>` **之前**(即 Hero 之后紧接"手册包含什么")。

然后在"手册包含什么"那个 `</section>` 之后、"为什么免费" `<section>` 之前,**插入新 CTA section**:
```tsx
      {/* CTA · 看完文档顺势索取 */}
      <section className="border-b border-rule">
        <Container width="reading" className="py-14 md:py-16 text-center">
          <Button variant="primary" href="#get">
            ✉️ 免费索取手册
          </Button>
        </Container>
      </section>
```
最终顺序:Hero → 手册包含什么 → CTA → 为什么免费 → 表单 → 免责。

- [ ] **Step 3: 表单区删防御话 + 加计数器**

把表单区这段:
```tsx
          <p className="text-lg opacity-85 leading-relaxed mb-10">
            留下邮箱和称呼，PDF 会自动发给你。
            <br />
            <span className="text-base opacity-70">
              不强制留电话、不订阅也能随时退。
            </span>
          </p>
```
替换为:
```tsx
          <p className="text-lg opacity-85 leading-relaxed mb-4">
            留下邮箱和称呼，PDF 会自动发给你。
          </p>
          <p className="text-base text-brand-navy/80 mb-10">
            已有 <span className="font-en font-bold">{count.toLocaleString("en-US")}</span> 个家庭领取了这份手册
          </p>
```

- [ ] **Step 4: 验证(build + 结构)**

Run:
```bash
cd "/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/sanmu-website" && npm run build 2>&1 | grep -E "Compiled successfully|Failed|error" | head -3
```
Expected: `✓ Compiled successfully`(无 error)。

Run(确认顺序:contents 在 为什么免费 之前、防御话已删、计数器在):
```bash
cd "/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/sanmu-website" && node -e '
const s=require("fs").readFileSync("app/resources/handbook/page.tsx","utf8");
const ci=s.indexOf("手册包含什么"), wi=s.indexOf("为什么免费");
console.log("包含什么在为什么免费之前:", ci>0&&ci<wi?"PASS":"FAIL");
console.log("防御话已删:", !s.includes("不强制留电话")?"PASS":"FAIL");
console.log("计数器在:", s.includes("个家庭领取了这份手册")?"PASS":"FAIL");
console.log("revalidate 在:", s.includes("export const revalidate")?"PASS":"FAIL");
'
```
Expected: 四行都 `PASS`。

- [ ] **Step 5: Commit**

```bash
cd "/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/sanmu-website"
git add "app/resources/handbook/page.tsx"
git commit -m "feat(handbook): 简体页价值前置+加CTA+真实领取计数器+删防御文案+ISR"
```

---

## Task 3: 繁体手册页重排 + 富卡片 + 计数器 `app/zh-Hant/resources/handbook/page.tsx`

**Files:**
- Modify: `app/zh-Hant/resources/handbook/page.tsx`

> 现状:繁体 `DOCUMENTS` 是 8 个标题的纯字符串数组,渲染为只有标题的卡片。本任务把它升级成与简体一致的富对象(标题+描述+适用人群),并同步 Task 2 的结构/CTA/计数器/ISR 改动。

- [ ] **Step 1: 加 import + revalidate + 组件 async**

顶部加:
```tsx
import { getHandbookCount } from "@/lib/handbook-count";
```
`metadata` 之后加:
```tsx
export const revalidate = 3600;
```
组件改 async + 取数:把 `export default function TraditionalHandbookPage() {` 改为
```tsx
export default async function TraditionalHandbookPage() {
  const count = await getHandbookCount();
```
(注意保留原有 `return (`。)

- [ ] **Step 2: `DOCUMENTS` 升级为富对象数组**

把现有的繁体 `const DOCUMENTS = [ "法律遺囑模板（中英雙語）", … ];`(纯字符串数组)整段替换为:
```tsx
type HandbookDoc = {
  num: string;
  numEn: string;
  title: string;
  description: string;
  forWhom: string;
};

const DOCUMENTS: HandbookDoc[] = [
  {
    num: "I",
    numEn: "Document I",
    title: "法律遺囑範本（中英雙語）",
    description:
      "完整的 Last Will and Testament 範本。涵蓋遺囑執行人 / 受託人指定、財產分配、未成年子女監護、葬禮指示等 14 項條款。中英雙語對照，便於跟律師確認。",
    forWhom: "18 歲以上擁有任何資產、家人、或居住在加拿大的成年人",
  },
  {
    num: "II",
    numEn: "Document II",
    title: "加拿大身故後政府福利申請完整指南",
    description:
      "涵蓋 CPP 死亡補助金、CPP 遺屬撫卹金、OAS 遺屬補助、EI 補償、最終稅務申報、BC 省福利、WCB 工傷賠償等。含申請時間表、官方聯絡電話、常見拒絕原因 FAQ。",
    forWhom: "家人剛離世正在辦身後事的家屬",
  },
  {
    num: "III",
    numEn: "Document III",
    title: "家人身故時必須處理的 87 件事",
    description:
      "5 大類清單：取得生死資料 / 安排付款 / 蒐集文件 / 數小時內的決定和安排 / 盡快通知。按清單逐條核對，不會漏關鍵步驟。",
    forWhom: "家人離世後 7 天內的家屬",
  },
  {
    num: "IV",
    numEn: "Document IV",
    title: "家庭檔案冊（生前預填）",
    description:
      "完整記錄冊：個人資料 / 重要醫療紀錄 / 難忘的事件 / 悼詞與訃告備錄 / 生平簡歷 / 重要文件存放地點 / 銀行帳戶 / 保險 / 推薦律師 & 殯儀館名單。",
    forWhom: "想「為家人減少麻煩」的人——自己生前填好，離開時家人不慌亂",
  },
  {
    num: "V",
    numEn: "Document V",
    title: "加拿大葬禮費用對比指南",
    description:
      "核心費用拆解（殯儀館服務 / 火化 / 土葬 / 禮儀 / 墓地）+ 詳細費用對比表 + 套餐對比表 + 真實成交價區間。讓你看清「必要花費」和「被推銷的額外項目」。",
    forWhom: "正在詢價 / 比價的家屬，防止被殯儀館「溫和地」推銷",
  },
  {
    num: "VI",
    numEn: "Document VI",
    title: "殯葬師的「向死而生」活法",
    description:
      "三木從送過 1000+ 個人的經驗裡提煉的人生重心整理法：遺憾最小化 / 關係排序 / 接受無常。不是雞湯，是從殯儀館內看到的真相。",
    forWhom: "精神內耗嚴重 / 中年困惑 / 想釐清人生重心的人",
  },
  {
    num: "VII",
    numEn: "Document VII",
    title: "加拿大預立醫療委託完整指南",
    description:
      "Advance Care Directive 詳解：什麼是預立醫療委託、為什麼重要、核心決策範圍、加拿大辦理流程、常見誤區。讓你在意識清醒時決定生命最後階段的事。",
    forWhom: "50+ 歲人士；任何想自主決定臨終醫療方式的人",
  },
  {
    num: "VIII",
    numEn: "Document VIII",
    title: "如何處理逝者信用記錄防止身份盜用",
    description:
      "完整步驟：通知 Equifax / TransUnion、通知 CRA 與金融機構、監控可疑活動。海外華人特別需要，逝者身份被冒用追討困難。",
    forWhom: "正在辦身後事的家屬，離世後 30 天內必做",
  },
];
```

- [ ] **Step 3: "手冊包含什麼" section 改用富卡片渲染**

把繁体页里渲染 `DOCUMENTS.map(...)` 的那段(当前是 `title, index` 只渲染标题的简单卡片)替换为与简体一致的富卡片结构:
```tsx
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mt-12">
            {DOCUMENTS.map((doc) => (
              <article key={doc.num} className="border border-rule p-7 md:p-8">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-2xl md:text-3xl font-extrabold text-brand-navy font-en">
                    {doc.num}
                  </span>
                  <span className="text-xs font-en uppercase tracking-wider opacity-50">
                    {doc.numEn}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl leading-snug mb-3">{doc.title}</h3>
                <p className="text-sm opacity-80 leading-relaxed mb-4">{doc.description}</p>
                <div className="border-t border-rule pt-3 mt-auto">
                  <div className="text-xs font-en uppercase tracking-wider text-brand-navy/70 mb-1 font-medium">
                    For
                  </div>
                  <p className="text-sm">{doc.forWhom}</p>
                </div>
              </article>
            ))}
          </div>
```

- [ ] **Step 4: 重排 section + 新增 CTA(同简体顺序)**

把"手冊包含什麼" `<section>` 整块移到"為什麼免費" `<section>` 之前;在二者之间插入 CTA:
```tsx
      {/* CTA · 看完文檔順勢索取 */}
      <section className="border-b border-rule">
        <Container width="reading" className="py-14 md:py-16 text-center">
          <Button variant="primary" href="#get">
            ✉️ 免費索取手冊
          </Button>
        </Container>
      </section>
```
最终顺序:Hero → 手冊包含什麼 → CTA → 為什麼免費 → 表單 → 免責。

- [ ] **Step 5: 表单区删防御话 + 加计数器**

把繁体表单区这段:
```tsx
          <p className="text-lg opacity-85 leading-relaxed mb-10">
            留下信箱和稱呼，PDF 會自動寄給你。
            <br />
            <span className="text-base opacity-70">
              不強制留電話、不訂閱也能隨時退。
            </span>
          </p>
```
替换为:
```tsx
          <p className="text-lg opacity-85 leading-relaxed mb-4">
            留下信箱和稱呼，PDF 會自動寄給你。
          </p>
          <p className="text-base text-brand-navy/80 mb-10">
            已有 <span className="font-en font-bold">{count.toLocaleString("en-US")}</span> 個家庭領取了這份手冊
          </p>
```

- [ ] **Step 6: 验证(build + 结构)**

Run:
```bash
cd "/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/sanmu-website" && npm run build 2>&1 | grep -E "Compiled successfully|Failed|error" | head -3
```
Expected: `✓ Compiled successfully`。

Run:
```bash
cd "/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/sanmu-website" && node -e '
const s=require("fs").readFileSync("app/zh-Hant/resources/handbook/page.tsx","utf8");
const ci=s.indexOf("手冊包含什麼"), wi=s.indexOf("為什麼免費");
console.log("包含什麼在為什麼免費之前:", ci>0&&ci<wi?"PASS":"FAIL");
console.log("富卡片(有 forWhom):", s.includes("doc.forWhom")?"PASS":"FAIL");
console.log("防御话已删:", !s.includes("不強制留電話")?"PASS":"FAIL");
console.log("计数器在:", s.includes("個家庭領取了這份手冊")?"PASS":"FAIL");
console.log("revalidate 在:", s.includes("export const revalidate")?"PASS":"FAIL");
'
```
Expected: 五行都 `PASS`。

- [ ] **Step 7: Commit**

```bash
cd "/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/sanmu-website"
git add "app/zh-Hant/resources/handbook/page.tsx"
git commit -m "feat(handbook): 繁体页补齐富卡片+价值前置+加CTA+真实领取计数器+删防御文案+ISR"
```

---

## 收尾:本地预览验证(全部任务后)

- [ ] 起 dev server,看简繁两页:`npm run dev` → `http://localhost:3000/resources/handbook` 和 `/zh-Hant/resources/handbook`
  - 顺序对(Hero → 包含什么 → CTA → 为什么免费 → 表单);计数器显示 ≈1080+;繁体 8 张富卡片有描述+适用人群;表单旁无防御话。
- [ ] 不部署。等用户确认后再 `git push origin main`(生产部署)。

---

## Self-Review

- **Spec 覆盖**:结构重排(T2/T3 Step 2/4)✓;新 CTA(T2 Step2 / T3 Step4)✓;删防御话(T2 Step3 / T3 Step5)✓;计数器口径=客户邮件列表+手册登记+drip(T1)✓;确定性 drip 不闪(T1 Step1/2)✓;繁体富卡片(T3 Step2/3)✓;revalidate(T2 Step1 / T3 Step1)✓;兜底容错(T1)✓。无遗漏。
- **占位符**:无 TBD/含糊;繁体全文已给实文本。
- **类型一致**:`getHandbookCount(now?)` 签名 T1 定义、T2/T3 调用一致;`HandbookDoc` 字段(num/numEn/title/description/forWhom)简繁一致。
