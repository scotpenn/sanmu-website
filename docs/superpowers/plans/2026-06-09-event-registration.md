# 活动网页报名 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把活动报名从「跳转外部链接」升级为「站内网页表单 → Server Action 自动发『报名成功』确认邮件 + 写 Notion 活动报名库」,不跳转、数据进 Notion。

**Architecture:** 复用手册自动分发的同款链路。每个活动详情页按 Notion 的 `报名方式` 字段渲染表单 / 外链按钮 / 无需报名。表单提交走 Next Server Action:取活动详情 → Resend 发确认邮件(必达)→ 写 Notion「活动报名」库(尽力而为)。确认邮件与表单文案随 locale 简繁。

**Tech Stack:** Next.js 16 (App Router, Server Actions) + React 19 (`useActionState`) + Resend Node SDK + `@notionhq/client@^5` + Tailwind。**无测试框架**,验证 = `npm run build` + 本地 `npm run dev` 端到端真实提交。

---

## File Structure

- `lib/notion.ts`(改):`EventItem` 增加 `signupMethod` 与 `pageId`;`parseEventProperties` 解析 `报名方式` 与 `page.id`。
- `lib/registrations.ts`(新建):`saveRegistration(...)` 写 Notion「活动报名」库。
- `lib/email.ts`(改):新增 `sendEventConfirmationEmail(...)`(简繁两版正文,无附件)。
- `app/events/[slug]/actions.ts`(新建):`"use server"` 的 `registerForEvent(prevState, formData)`。
- `components/EventRegistrationForm.tsx`(新建,`"use client"`):报名表单 + `useActionState` + 蜜罐 + CASL。
- `app/events/[slug]/page.tsx`(改):按 `event.signupMethod` 渲染表单 / 外链按钮 / 无需报名。
- `.env.local` + Vercel(改):加 `NOTION_REGISTRATIONS_DS_ID`。

---

## Task 1: 建 Notion「活动报名」库 + Events 库加「报名方式」字段 + 写 env

> 真实远程资源创建。执行者用 Notion MCP 操作,完成后把 id 写进 `.env.local`(及 Vercel)。无代码提交。

**Files:** Modify: `.env.local`

- [ ] **Step 1: 给 Events 库加「报名方式」单选字段**

用 Notion MCP `notion-update-data-source`(data_source `d5b3cb57-7b27-4acd-b936-ae2ca6f275f1`)新增属性:
- `报名方式` — select,选项:`网页表单`(blue)/ `外部链接`(gray)/ `无需报名`(gray)

- [ ] **Step 2: 创建 Notion「活动报名」库**

用 Notion MCP `notion-create-database`,父页面 = hub `370c4735c2368146a733fd3276d4c922`。schema(SQL DDL):

```sql
CREATE TABLE ("姓名" TITLE, "邮箱" EMAIL, "电话" PHONE_NUMBER, "参加人数" NUMBER, "留言" RICH_TEXT, "活动" RELATION('d5b3cb57-7b27-4acd-b936-ae2ca6f275f1'), "状态" SELECT('已报名':blue, '已签到':green), "来源语言" SELECT('zh-Hans':gray, 'zh-Hant':blue), "提交时间" CREATED_TIME)
```

记下返回的 **data_source_id**。

- [ ] **Step 3: 把 id 写进 `.env.local`**

追加一行(用真实 id):
```
NOTION_REGISTRATIONS_DS_ID=<step2 的 data_source_id>
```

- [ ] **Step 4: 验证 NOTION_TOKEN 能访问新库**

Run:
```bash
cd "sanmu-website" && node --env-file=.env.local -e 'import("@notionhq/client").then(async ({Client})=>{const n=new Client({auth:process.env.NOTION_TOKEN});await n.dataSources.query({data_source_id:process.env.NOTION_REGISTRATIONS_DS_ID,page_size:1});console.log("✅ 可访问")}).catch(e=>console.log("❌",e.code||e.message))'
```
Expected: `✅ 可访问`(若失败,在 Notion 把 integration 加进新库给写权限)。

- [ ] **Step 5: 把 `NOTION_REGISTRATIONS_DS_ID` 加到 Vercel 环境变量(Production)**

提示用户在 Vercel → Settings → Environment Variables 添加,值同 step2。

---

## Task 2: lib/notion.ts — EventItem 加 signupMethod + pageId

**Files:** Modify: `lib/notion.ts`

- [ ] **Step 1: 加 SignupMethod 类型并扩展 EventItem**

在 `EventItem` 类型定义中(`export type EventItem = { ... }`)加两个字段,并在其上方加类型:

```ts
export type SignupMethod = "网页表单" | "外部链接" | "无需报名";
```

`EventItem` 内新增:
```ts
  signupMethod: SignupMethod;
  pageId: string;
```

- [ ] **Step 2: 在 parseEventProperties 里解析这两个字段**

`parseEventProperties(page: PageObjectResponse)` 的返回对象里加(`props` 即 `page.properties`):

```ts
    pageId: page.id,
    signupMethod:
      props["报名方式"]?.type === "select" && props["报名方式"].select
        ? (props["报名方式"].select.name as SignupMethod)
        : "外部链接", // 空 → 外部链接(等于现状, 不影响已有活动)
```

- [ ] **Step 3: 构建验证**

Run: `cd sanmu-website && npm run build 2>&1 | grep -E "Compiled successfully|Error"`
Expected: `✓ Compiled successfully`。

- [ ] **Step 4: 提交**

```bash
git add lib/notion.ts
git commit -m "feat(events): EventItem 增加 signupMethod + pageId(读 Notion 报名方式)"
```

---

## Task 3: lib/registrations.ts — 写 Notion 活动报名库

**Files:** Create: `lib/registrations.ts`

- [ ] **Step 1: 写 lib/registrations.ts**

```ts
import { Client } from "@notionhq/client";
import type { Locale } from "@/lib/i18n";

export type Registration = {
  eventPageId: string;
  name: string;
  email: string;
  phone: string;
  partySize: number;
  message: string;
  locale: Locale;
};

/** 写入 Notion「活动报名」库. 失败抛错, 由调用方决定是否吞掉. */
export async function saveRegistration(reg: Registration): Promise<void> {
  const token = process.env.NOTION_TOKEN;
  const dataSourceId = process.env.NOTION_REGISTRATIONS_DS_ID;
  if (!token || !dataSourceId) {
    throw new Error("NOTION_TOKEN 或 NOTION_REGISTRATIONS_DS_ID 未设置");
  }
  const notion = new Client({ auth: token });
  await notion.pages.create({
    parent: { type: "data_source_id", data_source_id: dataSourceId },
    properties: {
      姓名: { title: [{ type: "text", text: { content: reg.name } }] },
      邮箱: { email: reg.email },
      电话: { phone_number: reg.phone || null },
      参加人数: { number: reg.partySize },
      留言: {
        rich_text: reg.message
          ? [{ type: "text", text: { content: reg.message } }]
          : [],
      },
      活动: { relation: [{ id: reg.eventPageId }] },
      状态: { select: { name: "已报名" } },
      来源语言: { select: { name: reg.locale } },
    },
  });
}
```

- [ ] **Step 2: 构建验证**

Run: `cd sanmu-website && npm run build 2>&1 | grep -E "Compiled successfully|Error"`
Expected: `✓ Compiled successfully`(未使用导出不报错)。

- [ ] **Step 3: 提交**

```bash
git add lib/registrations.ts
git commit -m "feat(events): lib/registrations 写 Notion 活动报名库(关联活动)"
```

---

## Task 4: lib/email.ts — sendEventConfirmationEmail(随 locale)

**Files:** Modify: `lib/email.ts`

- [ ] **Step 1: 在 lib/email.ts 末尾加确认邮件函数**

在文件末尾追加(复用已有的 `getResend`、`FROM`、`REPLY_TO`、`TRADITIONAL_LOCALE`、`Locale`):

```ts
type EventInfo = { title: string; summary: string; location: string | null };

function eventTextHans(name: string, e: EventInfo): string {
  return `${name}，您好：

您已成功报名「${e.title}」。

📅 ${e.summary}${e.location ? `\n📍 ${e.location}` : ""}

请准时参加。如活动有变动，我们会通过邮件通知您。

请注意：本邮件由系统自动发送，请勿直接回复本邮件。如需联系我们，请发送邮件至 info@sanmu.ca。

祝好！

Sunny · 三木有话说 频道小助理

📞 电话/Phone: 778-828-6881
✉️ 邮箱/Email: info@sanmu.ca
💬 微信/WeChat: yyds3mu
📱 WhatsApp/LINE: 778-828-6881
🎥 YouTube: 三木有话说 @yyds3mu

温馨提示：以上为官方联系方式，请勿轻信其他渠道，谨防诈骗。`;
}

function eventTextHant(name: string, e: EventInfo): string {
  return `${name}，您好：

您已成功報名「${e.title}」。

📅 ${e.summary}${e.location ? `\n📍 ${e.location}` : ""}

請準時參加。如活動有變動，我們會透過郵件通知您。

請注意：本郵件由系統自動發送，請勿直接回覆本郵件。如需聯絡我們，請發送郵件至 info@sanmu.ca。

祝好！

Sunny · 三木有話說 頻道小助理

📞 電話/Phone: 778-828-6881
✉️ 郵箱/Email: info@sanmu.ca
💬 微信/WeChat: yyds3mu
📱 WhatsApp/LINE: 778-828-6881
🎥 YouTube: 三木有話說 @yyds3mu

溫馨提示：以上為官方聯絡方式，請勿輕信其他來源，謹防詐騙。`;
}

/** 发送活动「报名成功」确认邮件(无附件, 随 locale). 失败抛错(主路径). */
export async function sendEventConfirmationEmail(params: {
  to: string;
  name: string;
  locale: Locale;
  event: EventInfo;
}): Promise<void> {
  const isHant = params.locale === TRADITIONAL_LOCALE;
  const { error } = await getResend().emails.send({
    from: isHant ? FROM["zh-Hant"] : FROM["zh-Hans"],
    to: [params.to],
    replyTo: REPLY_TO,
    subject: `${isHant ? "【報名成功】" : "【报名成功】"}${params.event.title}`,
    text: isHant
      ? eventTextHant(params.name, params.event)
      : eventTextHans(params.name, params.event),
  });
  if (error) throw new Error(`Resend 发送失败: ${error.message}`);
}
```

- [ ] **Step 2: 构建验证**

Run: `cd sanmu-website && npm run build 2>&1 | grep -E "Compiled successfully|Error"`
Expected: `✓ Compiled successfully`。

- [ ] **Step 3: 提交**

```bash
git add lib/email.ts
git commit -m "feat(events): lib/email 加 sendEventConfirmationEmail(简繁确认邮件)"
```

---

## Task 5: Server Action — registerForEvent

**Files:** Create: `app/events/[slug]/actions.ts`

- [ ] **Step 1: 写 actions.ts**

```ts
"use server";

import { sendEventConfirmationEmail } from "@/lib/email";
import { saveRegistration } from "@/lib/registrations";
import { getEventBySlug } from "@/lib/notion";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";

export type RegistrationState = { ok: boolean; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerForEvent(
  _prev: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  // 蜜罐: 机器人会填这个隐藏字段, 静默"成功"但什么都不做
  const honeypot = String(formData.get("company") ?? "").trim();
  if (honeypot) return { ok: true };

  const slug = String(formData.get("eventSlug") ?? "").trim();
  const localeRaw = String(formData.get("locale") ?? "");
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 50);
  const message = String(formData.get("message") ?? "").trim().slice(0, 1000);
  const sizeRaw = parseInt(String(formData.get("partySize") ?? "1"), 10);
  const partySize = Number.isFinite(sizeRaw)
    ? Math.min(Math.max(sizeRaw, 1), 20)
    : 1;

  if (!name) return { ok: false, error: "请填写称呼。" };
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "请填写有效的邮箱地址。" };
  }

  const event = await getEventBySlug(slug, locale);
  if (!event) return { ok: false, error: "活动不存在或已结束。" };

  // 主路径: 邮件必须成功
  try {
    await sendEventConfirmationEmail({
      to: email,
      name,
      locale,
      event: {
        title: event.title,
        summary: event.summary,
        location: event.location,
      },
    });
  } catch (e) {
    console.error("[event-reg] 邮件发送失败:", e);
    return {
      ok: false,
      error: "提交失败，请稍后再试，或写信到 info@sanmu.ca。",
    };
  }

  // 尽力而为: 失败不影响已成功的确认信
  try {
    await saveRegistration({
      eventPageId: event.pageId,
      name,
      email,
      phone,
      partySize,
      message,
      locale,
    });
  } catch (e) {
    console.error("[event-reg] 写 Notion 报名失败:", e);
  }

  return { ok: true };
}
```

> 注:`getEventBySlug` 返回的 `EventItem` 已含 `pageId`、`location`、`summary`、`title`(Task 2 + 现有字段)。

- [ ] **Step 2: 构建验证**

Run: `cd sanmu-website && npm run build 2>&1 | grep -E "Compiled successfully|Error"`
Expected: `✓ Compiled successfully`。

- [ ] **Step 3: 提交**

```bash
git add "app/events/[slug]/actions.ts"
git commit -m "feat(events): registerForEvent Server Action(校验+蜜罐+编排)"
```

---

## Task 6: EventRegistrationForm 客户端组件

**Files:** Create: `components/EventRegistrationForm.tsx`

- [ ] **Step 1: 写 EventRegistrationForm.tsx**

```tsx
"use client";

import { useActionState } from "react";
import {
  registerForEvent,
  type RegistrationState,
} from "@/app/events/[slug]/actions";
import { DEFAULT_LOCALE, textForLocale, type Locale } from "@/lib/i18n";

const INITIAL: RegistrationState = { ok: false };

export function EventRegistrationForm({
  eventSlug,
  locale = DEFAULT_LOCALE,
}: {
  eventSlug: string;
  locale?: Locale;
}) {
  const [state, action, pending] = useActionState(registerForEvent, INITIAL);

  if (state.ok) {
    return (
      <div className="border border-rule bg-paper p-8 md:p-10 max-w-[520px] text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-navy">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7 text-paper"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div className="text-xl font-medium text-brand-navy mb-2">
          {textForLocale(locale, "报名成功", "報名成功")}
        </div>
        <p className="opacity-80 leading-relaxed">
          {textForLocale(
            locale,
            "确认邮件已发到你的邮箱，请查收。届时准时参加。",
            "確認郵件已寄到你的信箱，請查收。屆時準時參加。",
          )}
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="border border-rule bg-paper p-8 md:p-10 max-w-[520px] text-left space-y-5"
    >
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="eventSlug" value={eventSlug} />

      <div>
        <label htmlFor="ev-name" className="block text-sm font-medium mb-1">
          {textForLocale(locale, "称呼", "稱呼")} *
        </label>
        <input
          id="ev-name"
          name="name"
          required
          placeholder={textForLocale(locale, "怎么称呼您", "怎麼稱呼您")}
          className="w-full border border-rule px-3 py-2 bg-white focus:outline-none focus:border-brand-navy"
        />
      </div>

      <div>
        <label htmlFor="ev-email" className="block text-sm font-medium mb-1">
          {textForLocale(locale, "邮箱", "信箱")} *
        </label>
        <input
          id="ev-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full border border-rule px-3 py-2 bg-white focus:outline-none focus:border-brand-navy"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ev-phone" className="block text-sm font-medium mb-1">
            {textForLocale(locale, "电话（选填）", "電話（選填）")}
          </label>
          <input
            id="ev-phone"
            name="phone"
            type="tel"
            className="w-full border border-rule px-3 py-2 bg-white focus:outline-none focus:border-brand-navy"
          />
        </div>
        <div>
          <label htmlFor="ev-size" className="block text-sm font-medium mb-1">
            {textForLocale(locale, "参加人数", "參加人數")}
          </label>
          <input
            id="ev-size"
            name="partySize"
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            className="w-full border border-rule px-3 py-2 bg-white focus:outline-none focus:border-brand-navy"
          />
        </div>
      </div>

      <div>
        <label htmlFor="ev-msg" className="block text-sm font-medium mb-1">
          {textForLocale(locale, "留言 / 想了解的问题（选填）", "留言 / 想了解的問題（選填）")}
        </label>
        <textarea
          id="ev-msg"
          name="message"
          rows={3}
          className="w-full border border-rule px-3 py-2 bg-white focus:outline-none focus:border-brand-navy resize-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-700">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-brand-navy text-white py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {pending
          ? textForLocale(locale, "提交中…", "提交中…")
          : textForLocale(locale, "✉️ 提交报名", "✉️ 提交報名")}
      </button>

      <p className="text-xs opacity-60 leading-relaxed">
        {textForLocale(
          locale,
          "提交即表示同意接收本次活动的相关通知。",
          "提交即表示同意接收本次活動的相關通知。",
        )}
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
git add components/EventRegistrationForm.tsx
git commit -m "feat(events): EventRegistrationForm 报名表单(useActionState+蜜罐+双语)"
```

---

## Task 7: 活动详情页按 报名方式 渲染

**Files:** Modify: `app/events/[slug]/page.tsx`

- [ ] **Step 1: 加 import**

在顶部 import 区(与现有 `import { Button }` 同处)加:

```tsx
import { EventRegistrationForm } from "@/components/EventRegistrationForm";
```

- [ ] **Step 2: 替换报名按钮块**

把现有这段(`{isUpcoming && event.signupUrl && ( ... )}`):

```tsx
          {isUpcoming && event.signupUrl && (
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" href={event.signupUrl}>
                {textForLocale(locale, "立即报名 →")}
              </Button>
              <Button variant="secondary" href="mailto:info@sanmu.ca">
                ✉️ {textForLocale(locale, "写信咨询")}
              </Button>
            </div>
          )}
```

替换为:

```tsx
          {isUpcoming && event.signupMethod === "网页表单" && (
            <EventRegistrationForm eventSlug={event.slug} locale={locale} />
          )}
          {isUpcoming && event.signupMethod === "无需报名" && (
            <p className="text-base text-brand-navy font-medium">
              {textForLocale(locale, "免费参与，无需报名。", "免費參與，無需報名。")}
            </p>
          )}
          {isUpcoming && event.signupMethod === "外部链接" && event.signupUrl && (
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" href={event.signupUrl}>
                {textForLocale(locale, "立即报名 →")}
              </Button>
              <Button variant="secondary" href="mailto:info@sanmu.ca">
                ✉️ {textForLocale(locale, "写信咨询")}
              </Button>
            </div>
          )}
```

- [ ] **Step 3: 清缓存构建**

Run: `cd sanmu-website && rm -rf .next && npm run build 2>&1 | grep -E "Compiled successfully|Error"`
Expected: `✓ Compiled successfully`。

- [ ] **Step 4: 提交**

```bash
git add "app/events/[slug]/page.tsx"
git commit -m "feat(events): 活动详情页按 报名方式 渲染(表单/外链/无需报名)"
```

---

## Task 8: 设样例数据 + 端到端真实验证

**Files:** 无代码(Notion 数据 + 本地验证)

- [ ] **Step 1: 设样例活动的报名方式**

用 Notion MCP 更新 Events 库:
- 灯塔活动(slug `lighthouse-senior-benefits-2026-06`,简繁两条)→ `报名方式 = 网页表单`
- VPL 活动(slug `vpl-life-salon-2026-06`,简繁两条)→ `报名方式 = 无需报名`

- [ ] **Step 2: 启 dev server**

Run: `cd sanmu-website && npm run dev`(后台运行),打开 `http://localhost:3000/events/lighthouse-senior-benefits-2026-06`。

- [ ] **Step 3: 真实提交报名(灯塔)**

填:称呼=测试、邮箱=你能收到的真实邮箱、电话/人数/留言随意。点「提交报名」。
Expected:页面显示「报名成功」;邮箱收到主题「【报名成功】不留遗憾的人生准备…」、发件 shouhou@updates.sanmu.ca、含活动日期/地点。

- [ ] **Step 4: 核对 Notion**

「活动报名」库出现一条记录:姓名/邮箱/参加人数/状态=已报名/来源语言=zh-Hans/「活动」关联到灯塔活动。

- [ ] **Step 5: 验证另外两种渲染**

- `http://localhost:3000/events/vpl-life-salon-2026-06` → 显示「免费参与，无需报名」(无表单)。
- 任取一个 `报名方式` 为空 / 外部链接 且有 `报名链接` 的活动 → 显示「立即报名」跳转按钮(现状不变)。
- `http://localhost:3000/zh-Hant/events/lighthouse-senior-benefits-2026-06` → 表单文案繁体;提交后确认邮件为繁体主题+正文。

- [ ] **Step 6: 蜜罐反向验证(可选)**

devtools 给隐藏 `company` 输入框填值再提交 → 页面仍显示成功,但**不应**收到邮件、Notion 不应新增记录。

- [ ] **Step 7: 关闭 dev server**

---

## Self-Review

- **Spec 覆盖**:网页表单(T6)、Server Action(T5)、Notion 报名库 + relation(T1/T3)、确认邮件随 locale 带活动时间地点(T4)、报名方式三态渲染(T2/T7)、蜜罐+CASL(T5/T6)、邮件必达/CRM 尽力而为(T5)、env(T1)、样例数据 + 验收(T8)——全覆盖。
- **Placeholder**:无 TBD;远程资源 id 在 T1 真实创建后填入。
- **类型一致**:`RegistrationState`(T5)被 T6 import;`registerForEvent`/`saveRegistration`/`sendEventConfirmationEmail` 签名在 T3/T4/T5 定义与调用一致;`EventItem.signupMethod`/`pageId`(T2)在 T5/T7 使用;`SignupMethod` 三个字面量("网页表单"/"外部链接"/"无需报名")在 T2 定义、T7 比较时一字不差。
- **边界**:邮箱/称呼校验在 Action;参加人数截断 1–20;留言截断 1000;电话截断 50;蜜罐静默成功;`报名方式` 空 → 回退「外部链接」保证旧活动不变。
