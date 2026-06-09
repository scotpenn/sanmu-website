# 活动网页报名 · 设计

日期:2026-06-09
目标:把活动报名从「跳转 Google Form / 外部链接」升级为「在自己品牌下的网页表单 → Server Action 写 Notion 报名库 + Resend 自动发『报名成功』确认邮件(带活动时间地点)」。不跳转、不麻烦,数据统一进 Notion。

---

## 背景与现状

- 活动数据在 Notion「📅 Events 线下活动」库(`d5b3cb57-7b27-4acd-b936-ae2ca6f275f1`),已有 `报名链接`(url)字段;活动详情页 [app/events/[slug]/page.tsx](../../../app/events/[slug]/page.tsx) 现在用「立即报名」按钮跳该链接(Google Form / 第三方)。
- **关键:同款基础设施上周已为「手册自动分发」搭好**——网页表单 → Next Server Action → Resend 发信 + 写 Notion 库。本功能是该模式的「活动版」:换皮 + 加活动关联 + 加「报名方式」开关。
- 已有可复用件:`lib/email.ts`(Resend 发信,发件域名 `updates.sanmu.ca` 已验证)、`components/HandbookForm.tsx`(表单 + useActionState + 蜜罐)、`lib/leads.ts`(写 Notion 模式)、`getEventBySlug`(取活动详情)。
- env 已有 `RESEND_API_KEY`、`NOTION_TOKEN`。

## 已定决策

| 项 | 决策 |
|---|---|
| 托管位置 | **现网站内**,嵌在活动详情页,不跳转 |
| 提交机制 | **Next Server Action**(复用手册表单模式,无单独 API) |
| 表单字段 | 姓名(必填)、邮箱(必填)、电话(选填)、参加人数(选填,默认 1)、留言(选填) |
| 反垃圾 | 隐藏蜜罐字段 |
| 数据存储 | **Notion 新建「活动报名」库**,relation 关联到 Events 库 |
| 不做 | 付费、名额上限、候补 |
| 每活动开关 | Events 库新增 `报名方式` 单选:网页表单 / 外部链接 / 无需报名 |
| 确认邮件 | Resend,随 locale 简繁,自动带该活动日期/时间/地点 |
| 发件 | `三木有话说 <shouhou@updates.sanmu.ca>`,Reply-To `info@sanmu.ca`(与手册一致) |
| 双语 | 表单文案 + 确认邮件都随 locale(活动详情页本就简繁双版本) |

---

## 架构与数据流

```
访客在活动详情页填表(姓名 + 邮箱 + 可选 电话/人数/留言)
  → Server Action registerForEvent(prevState, formData)   // eventSlug、locale 走隐藏字段
    1. 校验:邮箱格式、姓名非空、参加人数 1–20;蜜罐非空 → 静默返回成功(丢弃)
    2. 取活动信息(标题/日期/地点/Notion 页 id):getEventBySlug(eventSlug, locale)
    3. Resend 发「报名成功」确认邮件(称呼 + 活动详情 + 提醒准时)  【必须成功】
    4. 写入 Notion「活动报名」库(关联该活动记录,状态=已报名) 【尽力而为】
  → 返回 { ok, error? },客户端用 useActionState 显示状态
```

**错误处理原则**(与手册一致):邮件是主路径、必须成功;成功后再写 Notion,写入失败只在服务端 `console.error`,不让用户看到失败、不阻断已成功的确认信。邮件失败才向用户报错。

## 文件结构

- `lib/registrations.ts`(新建):`saveRegistration({ eventPageId, eventTitle, eventSlug, name, email, phone, partySize, message, locale })` 写 Notion「活动报名」库;独立 try/catch。
- `lib/email.ts`(改):新增 `sendEventConfirmationEmail({ to, name, locale, event })`,`event` 含标题/日期文案/地点;简繁两版正文 + 主题。
- `app/events/[slug]/actions.ts`(新建):`"use server"` 的 `registerForEvent(prevState, formData)`,串联 校验 → 取活动 → email → registration。`eventSlug` 与 `locale` 通过表单**隐藏字段**传入(与手册表单隐藏 `locale` 同一做法),Server Action 从 `formData` 读取。
- `components/EventRegistrationForm.tsx`(新建,`"use client"`):表单 UI + `useActionState`(提交中/成功/失败);隐藏蜜罐 `company` + 隐藏 `locale`;CASL 同意小字;文案随 locale。
- `app/events/[slug]/page.tsx`(改):按 `event.signupMethod` 渲染——`网页表单`→`<EventRegistrationForm>`;`外部链接`→现有「立即报名」按钮(跳 `报名链接`);`无需报名`→「免费参与,无需报名」提示。
- `lib/notion.ts`(改):`EventItem` 增加 `signupMethod`(读 `报名方式`)与 `pageId`(Notion 页 id,供 relation 用);`parseEventProperties` 一并解析。
- `.env.local` / Vercel(改):加 `NOTION_REGISTRATIONS_DS_ID`。

## Events 库新增字段

- `报名方式` — 单选,选项:`网页表单` / `外部链接` / `无需报名`。
- **回退规则**:字段为空时按 `外部链接` 处理(等于现状),保证已有活动行为不变。

## Notion「活动报名」库 schema(新建)

| 字段 | 类型 | 说明 |
|---|---|---|
| 姓名 | 标题(title) | |
| 邮箱 | 邮箱(email) | |
| 电话 | 电话(phone_number) | 选填 |
| 参加人数 | 数字(number) | 默认 1 |
| 留言 | 文本(text) | 选填 |
| 活动 | 关联(relation → Events 库) | 指向访客所看语言版本的活动记录 |
| 状态 | 单选 | `已报名`(默认)/ `已签到` |
| 来源语言 | 单选 | `zh-Hans` / `zh-Hant` |
| 提交时间 | 创建时间(created_time) | Notion 自动 |

建库后把现有 integration 加进库给写权限(hub 子库通常继承 `NOTION_TOKEN` 权限,实施时验证);data_source_id 存入 env `NOTION_REGISTRATIONS_DS_ID`。

## 确认邮件内容(随 locale)

- From `三木有话说 <shouhou@updates.sanmu.ca>`;Reply-To `info@sanmu.ca`。
- Subject:`【报名成功】{活动标题}`(繁体:`【報名成功】{活動標題}`)。
- 正文(纯文本,Sunny 口吻):称呼开头 → 确认「您已成功报名《活动标题》」→ **自动填入活动 日期/时间 + 地点** → 提醒准时参加、如有变动请留意邮件 → 「请勿直接回复本邮件,联系请发 info@sanmu.ca」→ 官方联系方式 + 防诈骗提示(复用手册邮件的署名块)。
- 繁体活动页提交 → 繁体主题 + 正文。

## 反垃圾 & 合规(CASL)

- **蜜罐**:隐藏 `company` 字段,真人不填;非空即静默返回成功,不发信、不写库。
- **CASL 同意**:提交按钮旁小字「提交即表示同意接收本次活动的相关通知」。报名行为本身构成 express consent。

## 环境变量

| 变量 | 状态 |
|---|---|
| `RESEND_API_KEY` | ✅ 已有 |
| `NOTION_TOKEN` | ✅ 已有 |
| `NOTION_REGISTRATIONS_DS_ID` | 待建库后填(本地 + Vercel) |

## 实施前置(实施阶段由 agent 完成)

1. 用 Notion MCP 建「活动报名」库(含 relation 到 Events 库)→ 拿 data_source_id。
2. 给 Events 库加 `报名方式` 单选字段(网页表单 / 外部链接 / 无需报名)。
3. 把灯塔活动的 `报名方式` 设为 `网页表单`、VPL 设为 `无需报名`(作为首批样例)。
4. `NOTION_REGISTRATIONS_DS_ID` 写入 `.env.local` 与 Vercel;验证 `NOTION_TOKEN` 能写新库。

## 验收

- 灯塔活动(报名方式=网页表单)详情页显示报名表单;填表提交 → 收到「【报名成功】…」邮件(发件 shouhou@、可回 info@、含活动日期/时间/地点);Notion「活动报名」库出现一条记录,关联到该活动、状态=已报名、来源语言正确。
- VPL(无需报名)显示「免费参与,无需报名」。
- 外部链接 / 字段为空的活动:显示跳转按钮(现状不变)。
- 蜜罐被填:不发信、不写库,但前端显示成功。
- 繁体活动页提交:繁体主题 + 繁体正文邮件。
- `npm run build` 通过;活动详情页其余内容不变。

## YAGNI(不做)

- 不做名额上限 / 付费 / 候补 / 退款;不做退订自建;不做活动前的自动提醒邮件(只发报名当下的确认信);「已签到」状态留作日后人工标记,不做扫码签到。
