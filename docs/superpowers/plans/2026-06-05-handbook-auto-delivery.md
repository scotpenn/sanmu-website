# 身后事手册自动分发 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把手册索取从「人工 mailto 回信」升级为「填表单 → Server Action 用 Resend 自动发附 PDF 的邮件 → 同时写 Notion 线索库 + Resend Audience」。

**Architecture:** Next 16 Server Action 承接表单提交;`lib/email.ts` 封装 Resend 发信(附 3.2MB PDF),`lib/leads.ts` 封装 Notion 写库 + Resend Audience;邮件为必达主路径,CRM 写入尽力而为。客户端 `HandbookForm`(`use client`)用 `useActionState` 显示状态。

**Tech Stack:** Next.js 16 (App Router, Server Actions) + React 19 (`useActionState`) + Resend Node SDK + Notion SDK v5 (`@notionhq/client@^5`) + Tailwind。**无测试框架**,验证 = `npm run build` + 本地 `npm run dev` 真实提交端到端测。

---

## File Structure

- `sanmu-website/private/handbook-v2.7.pdf`(新增):从根 `assets/` 复制的手册 PDF(非 public)。
- `next.config.ts`(改):`outputFileTracingIncludes` 把 PDF 打包进函数。
- `lib/email.ts`(新建):Resend 客户端 + `sendHandbookEmail({ to, name })`。
- `lib/leads.ts`(新建):`saveLead({ email, name, reason })`(Notion)+ `addToAudience({ email, name })`(Resend)。
- `app/resources/handbook/actions.ts`(新建):`"use server"` 的 `sendHandbook(prevState, formData)`。
- `components/HandbookForm.tsx`(新建,`"use client"`):表单 + `useActionState` + 蜜罐 + CASL 小字。
- `app/resources/handbook/page.tsx`(改):删 mailto,屏 4 换成 `<HandbookForm/>`。
- `.env.local`(改):加 `RESEND_AUDIENCE_ID`、`NOTION_HANDBOOK_DS_ID`。

---

## Task 1: 装依赖 + 放 PDF + 配置打包

**Files:**
- Modify: `package.json`(装 resend)
- Create: `sanmu-website/private/handbook-v2.7.pdf`
- Modify: `next.config.ts`

- [ ] **Step 1: 安装 resend**

Run: `cd sanmu-website && npm install resend`
Expected: `package.json` dependencies 出现 `resend`。

- [ ] **Step 2: 复制 PDF 进应用内 private 目录**

Run:
```bash
cd sanmu-website && mkdir -p private && cp "../assets/【身后事安心手册】-三木有话说频道-v2.7.pdf" private/handbook-v2.7.pdf && ls -lh private/handbook-v2.7.pdf
```
Expected: `private/handbook-v2.7.pdf` ~3.2M。

- [ ] **Step 3: next.config 打包该 PDF 进 Server Action 函数**

把 `next.config.ts` 改为(在 nextConfig 里加 `outputFileTracingIncludes`):

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/resources/handbook": ["./private/handbook-v2.7.pdf"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 4: 构建验证(配置不报错)**

Run: `cd sanmu-website && npm run build 2>&1 | grep -E "Compiled successfully|Error"`
Expected: `✓ Compiled successfully`。

- [ ] **Step 5: 提交**

```bash
git add package.json package-lock.json next.config.ts private/handbook-v2.7.pdf
git commit -m "chore(handbook): 装 resend + 放手册 PDF + 配置函数打包"
```

---

## Task 2: 创建 Resend Audience + Notion「手册订阅」库

> 这两步是真实远程资源创建。执行者(agent)操作,完成后把 id 写进 `.env.local`。

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: 创建 Resend Audience**

Run(用已配置的 key,读 .env.local 里的 RESEND_API_KEY):
```bash
cd sanmu-website && KEY=$(grep '^RESEND_API_KEY=' .env.local | cut -d= -f2-) && curl -s -X POST https://api.resend.com/audiences -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"name":"手册订阅 Handbook Leads"}'
```
Expected: 返回 JSON 含 `"id":"<audience_id>"`。记下该 id。

- [ ] **Step 2: 创建 Notion「手册订阅」库**

用 Notion MCP `mcp__claude_ai_Notion__notion-create-database` 创建,父页面选用户 Notion 里合适的位置(可先用 `notion-search` 找现有「三木」相关页面作父级)。属性:
- `邮箱` — title
- `称呼` — rich_text
- `原因` — rich_text
- `状态` — select,选项 `新线索` / `已跟进`
- (`提交时间` 用 Notion 自带 created_time,无需手建)

记下返回的 **data_source_id**(v5 库含 data source)。

- [ ] **Step 3: 把两个 id 写入 .env.local**

在 `.env.local` 追加(用真实 id 替换):
```
RESEND_AUDIENCE_ID=<step1 的 audience id>
NOTION_HANDBOOK_DS_ID=<step2 的 data_source_id>
```

- [ ] **Step 4: 提示用户授权**

告诉用户:在 Notion 打开新建的「手册订阅」库 → 右上 `...` → Connections → 添加现有 integration(与 NOTION_TOKEN 对应那个),否则后端写不进去。等待用户确认。

> 本 Task 无代码提交(只改本地 .env.local,该文件不入库)。

---

## Task 3: lib/email.ts — Resend 发手册信

**Files:**
- Create: `lib/email.ts`

- [ ] **Step 1: 写 lib/email.ts**

```ts
import { Resend } from "resend";
import { readFile } from "fs/promises";
import path from "path";

const FROM = "三木有话说 <shouhou@sanmu.ca>";
const REPLY_TO = "info@sanmu.ca";
const PDF_PATH = path.join(process.cwd(), "private", "handbook-v2.7.pdf");

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY 未设置");
  return new Resend(key);
}

function emailText(name: string): string {
  return `${name}，您好：

这是您索取的《身后事安心手册》v2.7 —— 8 份文档、80+ 页、针对加拿大场景。附件 PDF 请查收。

这份手册是我做殡葬师 16 年里，看到家属反复踩的坑、被错误信息坑过的钱、错过的政府福利窗口，整理成的清单、模板和流程图。希望您永远用不到，但需要时它已经在您抽屉里。

手册内容仅供参考，不构成法律 / 医疗 / 金融建议，具体事务请咨询持牌专业人士。

有任何问题，直接回复这封邮件即可，我会亲自看。

三木`;
}

/** 发送带 PDF 附件的手册邮件. 失败会抛错(主路径, 由调用方处理). */
export async function sendHandbookEmail(params: {
  to: string;
  name: string;
}): Promise<void> {
  const pdf = await readFile(PDF_PATH);
  const { error } = await getResend().emails.send({
    from: FROM,
    to: [params.to],
    replyTo: REPLY_TO,
    subject: "您的《身后事安心手册》v2.7 来了",
    text: emailText(params.name),
    attachments: [
      { filename: "身后事安心手册-v2.7.pdf", content: pdf },
    ],
  });
  if (error) throw new Error(`Resend 发送失败: ${error.message}`);
}
```

- [ ] **Step 2: 构建验证(类型)**

Run: `cd sanmu-website && npm run build 2>&1 | grep -E "Compiled successfully|Error"`
Expected: `✓ Compiled successfully`(未使用导出不报错)。

- [ ] **Step 3: 提交**

```bash
git add lib/email.ts
git commit -m "feat(handbook): lib/email 用 Resend 发附 PDF 的手册邮件"
```

---

## Task 4: lib/leads.ts — 写 Notion 库 + 加 Resend Audience

**Files:**
- Create: `lib/leads.ts`

- [ ] **Step 1: 写 lib/leads.ts**

```ts
import { Client } from "@notionhq/client";
import { Resend } from "resend";

export type Lead = { email: string; name: string; reason: string };

/** 写入 Notion「手册订阅」库. 失败抛错, 由调用方决定是否吞掉. */
export async function saveLead(lead: Lead): Promise<void> {
  const token = process.env.NOTION_TOKEN;
  const dataSourceId = process.env.NOTION_HANDBOOK_DS_ID;
  if (!token || !dataSourceId) {
    throw new Error("NOTION_TOKEN 或 NOTION_HANDBOOK_DS_ID 未设置");
  }
  const notion = new Client({ auth: token });
  await notion.pages.create({
    parent: { type: "data_source_id", data_source_id: dataSourceId },
    properties: {
      邮箱: { title: [{ type: "text", text: { content: lead.email } }] },
      称呼: { rich_text: [{ type: "text", text: { content: lead.name } }] },
      原因: {
        rich_text: lead.reason
          ? [{ type: "text", text: { content: lead.reason } }]
          : [],
      },
      状态: { select: { name: "新线索" } },
    },
  });
}

/** 加入 Resend Audience. 失败抛错, 由调用方决定是否吞掉. */
export async function addToAudience(params: {
  email: string;
  name: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audienceId) {
    throw new Error("RESEND_API_KEY 或 RESEND_AUDIENCE_ID 未设置");
  }
  const resend = new Resend(key);
  const { error } = await resend.contacts.create({
    email: params.email,
    firstName: params.name,
    unsubscribed: false,
    audienceId,
  });
  // 重复邮箱等情况 Resend 可能返回 error, 由调用方吞掉, 这里仍抛出便于日志
  if (error) throw new Error(`Resend Audience 写入失败: ${error.message}`);
}
```

- [ ] **Step 2: 构建验证(类型,确认 Notion v5 建页签名正确)**

Run: `cd sanmu-website && npm run build 2>&1 | grep -E "Compiled successfully|Error"`
Expected: `✓ Compiled successfully`。若 `properties` 类型报错,核对 `node_modules/@notionhq/client/build/src/api-endpoints/pages.d.ts` 的 CreatePageBodyParameters。

- [ ] **Step 3: 提交**

```bash
git add lib/leads.ts
git commit -m "feat(handbook): lib/leads 写 Notion 线索库 + 加 Resend Audience"
```

---

## Task 5: Server Action — sendHandbook

**Files:**
- Create: `app/resources/handbook/actions.ts`

- [ ] **Step 1: 写 actions.ts**

```ts
"use server";

import { sendHandbookEmail } from "@/lib/email";
import { saveLead, addToAudience } from "@/lib/leads";

export type HandbookState = { ok: boolean; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendHandbook(
  _prev: HandbookState,
  formData: FormData,
): Promise<HandbookState> {
  // 蜜罐: 机器人会填这个隐藏字段, 静默"成功"但什么都不做
  const honeypot = String(formData.get("company") ?? "").trim();
  if (honeypot) return { ok: true };

  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 1000);

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "请填写有效的邮箱地址。" };
  }
  if (!name) {
    return { ok: false, error: "请填写称呼。" };
  }

  // 主路径: 邮件必须成功
  try {
    await sendHandbookEmail({ to: email, name });
  } catch (e) {
    console.error("[handbook] 邮件发送失败:", e);
    return {
      ok: false,
      error: "发送失败，请稍后再试，或直接写信到 info@sanmu.ca。",
    };
  }

  // 尽力而为: 失败不影响已成功的投递
  try {
    await saveLead({ email, name, reason });
  } catch (e) {
    console.error("[handbook] 写 Notion 线索失败:", e);
  }
  try {
    await addToAudience({ email, name });
  } catch (e) {
    console.error("[handbook] 加 Resend Audience 失败:", e);
  }

  return { ok: true };
}
```

- [ ] **Step 2: 构建验证**

Run: `cd sanmu-website && npm run build 2>&1 | grep -E "Compiled successfully|Error"`
Expected: `✓ Compiled successfully`。

- [ ] **Step 3: 提交**

```bash
git add "app/resources/handbook/actions.ts"
git commit -m "feat(handbook): sendHandbook Server Action(校验+蜜罐+编排)"
```

---

## Task 6: HandbookForm 客户端组件

**Files:**
- Create: `components/HandbookForm.tsx`

- [ ] **Step 1: 写 HandbookForm.tsx**

```tsx
"use client";

import { useActionState } from "react";
import { sendHandbook, type HandbookState } from "@/app/resources/handbook/actions";

const INITIAL: HandbookState = { ok: false };

export function HandbookForm() {
  const [state, action, pending] = useActionState(sendHandbook, INITIAL);

  if (state.ok) {
    return (
      <div className="border border-rule bg-paper p-8 md:p-10 max-w-[520px] mx-auto text-center">
        <div className="text-2xl mb-3">✅ 已发送</div>
        <p className="opacity-80 leading-relaxed">
          手册已发到你的邮箱（含 PDF 附件）。如果几分钟内没收到，请检查垃圾邮件，或写信到 info@sanmu.ca。
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="border border-rule bg-paper p-8 md:p-10 max-w-[520px] mx-auto text-left space-y-5"
    >
      {/* 蜜罐: 真人看不到, 机器人会填 */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="hb-name" className="block text-sm font-medium mb-1">
          称呼 *
        </label>
        <input
          id="hb-name"
          name="name"
          required
          placeholder="怎么称呼您"
          className="w-full border border-rule px-3 py-2 bg-white focus:outline-none focus:border-brand-navy"
        />
      </div>

      <div>
        <label htmlFor="hb-email" className="block text-sm font-medium mb-1">
          邮箱 *
        </label>
        <input
          id="hb-email"
          name="email"
          type="email"
          required
          placeholder="handbook@example.com"
          className="w-full border border-rule px-3 py-2 bg-white focus:outline-none focus:border-brand-navy"
        />
      </div>

      <div>
        <label htmlFor="hb-reason" className="block text-sm font-medium mb-1">
          想了解的话题 / 来信原因（选填）
        </label>
        <textarea
          id="hb-reason"
          name="reason"
          rows={3}
          placeholder="可以告诉三木你想了解的具体话题，会帮助他未来选题"
          className="w-full border border-rule px-3 py-2 bg-white focus:outline-none focus:border-brand-navy resize-none"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-brand-navy text-white py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {pending ? "发送中…" : "✉️ 免费索取手册"}
      </button>

      <p className="text-xs opacity-60 leading-relaxed">
        提交即表示同意收到手册及偶尔的相关更新，可随时退订。
      </p>
    </form>
  );
}
```

- [ ] **Step 2: 构建验证**

Run: `cd sanmu-website && npm run build 2>&1 | grep -E "Compiled successfully|Error"`
Expected: `✓ Compiled successfully`。

- [ ] **Step 3: 提交**

```bash
git add components/HandbookForm.tsx
git commit -m "feat(handbook): HandbookForm 表单组件(useActionState + 蜜罐 + CASL)"
```

---

## Task 7: 手册页接入表单(替换 mailto)

**Files:**
- Modify: `app/resources/handbook/page.tsx`

- [ ] **Step 1: 删 mailto 常量,加 HandbookForm import**

把文件顶部的 import 区改成(加一行 import):

```tsx
import Image from "next/image";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { Button } from "@/components/Button";
import { HandbookForm } from "@/components/HandbookForm";
```

删除这三段 mailto 常量(`SUBJECT` / `BODY` / `MAILTO_HREF`):

```tsx
const SUBJECT = "申请《身后事安心手册》v2.7";
const BODY = `您好 三木，
...
`;
const MAILTO_HREF = `mailto:info@sanmu.ca?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;
```

- [ ] **Step 2: Hero 里的 mailto 按钮改成锚点到表单**

把 Hero 区的:

```tsx
                <Button variant="primary" href={MAILTO_HREF}>
                  ✉️ 来信索取
                </Button>
```

改成:

```tsx
                <Button variant="primary" href="#get">
                  ✉️ 免费索取手册
                </Button>
```

- [ ] **Step 3: 屏 4「怎么拿到」整段换成表单**

把屏 4 整个 `<section>`(从 `{/* 屏 4 · 如何索取 */}` 到它的 `</section>`)替换为:

```tsx
      {/* 屏 4 · 如何索取(表单) */}
      <section id="get" className="border-b border-rule scroll-mt-12">
        <Container width="reading" className="py-20 md:py-24 text-center">
          <SectionTitle align="center" className="mb-6">
            填一下，手册马上发到你邮箱
          </SectionTitle>
          <p className="text-lg opacity-85 leading-relaxed mb-10">
            留下邮箱和称呼，PDF 会自动发给你。
            <br />
            <span className="text-base opacity-70">
              不强制留电话、不订阅也能随时退。
            </span>
          </p>
          <HandbookForm />
          <p className="text-sm opacity-60 mt-6 max-w-[480px] mx-auto leading-relaxed">
            三木会亲自看每一封回信。如果几分钟内没收到手册，请检查垃圾邮件，或写信到 info@sanmu.ca。
          </p>
        </Container>
      </section>
```

- [ ] **Step 4: 清缓存构建**

Run: `cd sanmu-website && rm -rf .next && npm run build 2>&1 | grep -E "Compiled successfully|Error|MAILTO|is not defined"`
Expected: `✓ Compiled successfully`,无残留 `MAILTO_HREF` 引用报错。

- [ ] **Step 5: 提交**

```bash
git add "app/resources/handbook/page.tsx"
git commit -m "feat(handbook): 手册页用自动分发表单替换 mailto"
```

---

## Task 8: 端到端真实验证(本地 dev)

**Files:** 无(纯验证)

- [ ] **Step 1: 启 dev server**

Run: `cd sanmu-website && npm run dev`(后台运行)
打开 `http://localhost:3000/resources/handbook`。

- [ ] **Step 2: 用真实邮箱提交表单**

在表单填:称呼=测试、邮箱=你能收到的真实邮箱、原因=随便。点提交。
Expected:页面显示「✅ 已发送」。

- [ ] **Step 3: 核对三处**

- 邮箱:收到主题「您的《身后事安心手册》v2.7 来了」、发件 shouhou@sanmu.ca、带 PDF 附件;点回复地址是 info@sanmu.ca。
- Notion「手册订阅」库:出现一条新记录(邮箱/称呼/原因/状态=新线索)。
- Resend 后台 Audience:出现该联系人。

- [ ] **Step 4: 蜜罐反向验证(可选)**

用浏览器 devtools 给隐藏的 `company` 输入框填个值再提交 → 页面仍显示成功,但**不应**收到邮件、Notion 不应新增记录。

- [ ] **Step 5: 关闭 dev server**

---

## Self-Review

- **Spec 覆盖**:投递附件(Task1+3)、表单字段(Task6)、Notion+Audience 存储(Task2+4)、Server Action(Task5)、发件 shouhou@/reply-to info@(Task3)、换掉 mailto(Task7)、蜜罐+CASL(Task5+6)、错误处理邮件必达/CRM 尽力而为(Task5)、env(Task2)、文件打包(Task1)、验收(Task8)——全覆盖。
- **Placeholder**:无 TBD;远程资源 id 在 Task2 真实创建后填入,非占位。
- **类型一致**:`HandbookState`(Task5)被 Task6 import;`sendHandbookEmail`/`saveLead`/`addToAudience` 签名在 Task3/4 定义、Task5 调用一致;Notion 建页 parent 用 `{ type: "data_source_id", data_source_id }`(已核对 SDK v5 类型);Resend `replyTo`/`attachments`/`contacts.create` 为 Node SDK 字段名。
- **边界**:邮箱/称呼校验在 Action;原因截断 1000 字;蜜罐静默成功;重复邮箱 Audience 报错被吞掉。
