# 身后事手册自动分发 · 设计

日期:2026-06-05
目标:把手册索取从「人工 mailto 回信」升级为「填表单 → 自动用 Resend 发送附 PDF 的邮件 → 同时记录线索」。

---

## 背景与现状

- 手册页 [app/resources/handbook/page.tsx](../../../app/resources/handbook/page.tsx) 现在是纯静态 + `mailto:` 按钮,三木人工回信附 PDF。
- 无任何后端:无 API、无邮件库、env 仅 `NOTION_TOKEN`(现已加 `RESEND_API_KEY`)。
- 手册 PDF:一份合并 PDF,**3.2MB**,现在位于项目根 `assets/【身后事安心手册】-三木有话说频道-v2.7.pdf`(在 Next 应用 `sanmu-website/` 之外)。

## 已定决策

| 项 | 决策 |
|---|---|
| 投递方式 | PDF 作邮件**附件**(3.2MB,远低于上限) |
| 表单字段 | 邮箱(必填)、称呼(必填)、想了解的话题/原因(选填) |
| 线索存储 | **Notion 新建「手册订阅」库 + Resend Audience** 都存 |
| 提交机制 | **Next Server Action**(Next 16 原生,无单独 API) |
| 发件地址 | `三木有话说 <shouhou@sanmu.ca>`,Reply-To `info@sanmu.ca` |
| 旧 mailto | **彻底换成表单** |
| 建库/Audience | 实施时由 agent 用 Notion MCP / Resend API 创建 |

---

## 架构与数据流

```
访客填表(邮箱 + 称呼 + 可选原因)
  → Server Action sendHandbook(formData)
    1. 校验:邮箱格式、称呼非空、长度上限;蜜罐字段非空 → 静默返回成功(丢弃)
    2. Resend 发信:三木口吻正文(用称呼个性化)+ 附 3.2MB PDF   【必须成功】
    3. 写入 Notion「手册订阅」库(邮箱/称呼/原因/状态=新线索) 【尽力而为】
    4. 加入 Resend Audience                                  【尽力而为】
  → 返回 { ok, error? } 给表单, 客户端用 useActionState 显示状态
```

**错误处理原则**:**邮件发送是主路径,必须成功**;成功后再做 Notion + Audience 写入,这两步是**尽力而为** —— 失败只在服务端 `console.error` 记录,不让用户看到失败、不阻断已成功的投递。邮件发送失败才向用户报错(提示稍后重试或写信 info@sanmu.ca)。

## 文件结构

- `lib/email.ts`(新建):封装 Resend 客户端 + `sendHandbookEmail({ to, name })` —— 读 PDF、组装正文、发送。
- `lib/leads.ts`(新建):`saveLead({ email, name, reason })` 写 Notion 库;`addToAudience({ email, name })` 加 Resend Audience。两者各自 try/catch,互不影响。
- `app/resources/handbook/actions.ts`(新建):`"use server"` 的 Server Action `sendHandbook`,串联校验 → email → leads。
- `components/HandbookForm.tsx`(新建,`"use client"`):表单 UI + `useActionState`(提交中/成功/失败);含隐藏蜜罐字段 + CASL 同意小字。
- `app/resources/handbook/page.tsx`(改):删掉 mailto 相关常量与按钮,屏 4「怎么拿到」区换成 `<HandbookForm/>`。
- `sanmu-website/private/handbook-v2.7.pdf`(新增):把根 `assets/` 的 PDF 复制进来(非 public)。
- `next.config.ts`(改):`outputFileTracingIncludes` 把该 PDF 打包进 Server Action 函数,确保 Vercel 上能读到。

## Notion「手册订阅」库 schema

| 字段 | 类型 | 说明 |
|---|---|---|
| 邮箱 | 标题(title) | 主标识 |
| 称呼 | 文本 | |
| 原因 | 文本 | 选填;选题线索 |
| 状态 | 单选 | 选项:新线索 / 已跟进(默认新线索) |
| 提交时间 | 创建时间(created_time) | Notion 自动 |

建库后需把现有 integration 加进该库并给**编辑权限**(现有 token 只读过博客/活动库,写新库要单独授权)。data_source_id 存入 env `NOTION_HANDBOOK_DS_ID`。

## 邮件内容

- From:`三木有话说 <shouhou@sanmu.ca>`;Reply-To:`info@sanmu.ca`
- Subject:`您的《身后事安心手册》v2.7 来了`
- 正文(纯文本或简单 HTML,三木口吻):用「称呼」开头;一句话说明这是 8 份 80+ 页文档;提醒仅供参考、具体事务咨询专业人士(呼应免责声明);底部一行 CASL 退订说明。
- 附件:`身后事安心手册-v2.7.pdf`(读自 `private/handbook-v2.7.pdf`)。

## 反垃圾 & 合规(CASL)

- **蜜罐**:表单加一个 CSS 隐藏字段(如 `company`),真人不会填;非空即判定机器人,静默返回成功但不发信、不存库。
- **CASL 同意**:提交按钮旁小字「提交即表示同意收到手册及偶尔的相关更新,可随时退订」。索取手册本身构成 express consent;Resend Audience 自带退订。

## 环境变量

| 变量 | 状态 |
|---|---|
| `RESEND_API_KEY` | ✅ 已填 |
| `NOTION_TOKEN` | ✅ 已有 |
| `RESEND_AUDIENCE_ID` | 待创建 Audience 后填 |
| `NOTION_HANDBOOK_DS_ID` | 待建库后填 |

## 实施前置(实施阶段由 agent 完成)

1. 用 Notion MCP 创建「手册订阅」库 → 拿 data_source_id;提示用户把 integration 加进库给写权限。
2. 用 Resend API 创建 Audience → 拿 audience_id。
3. 两个 id 写入 `.env.local`(及 Vercel env)。
4. 复制 PDF 进 `sanmu-website/private/`。

## 验收

- 本地填表提交 → 真实收到带 PDF 附件的邮件(发件 shouhou@、可回复到 info@)。
- Notion「手册订阅」库出现一条新记录(邮箱/称呼/原因)。
- Resend Audience 出现该联系人。
- 蜜罐字段被填时:不发信、不存库,但前端仍显示成功。
- Resend 故意失败时:前端显示错误,不误报成功。
- `npm run build` 通过;手册页其余静态内容不变。

## YAGNI(不做)

- 不做双重确认(double opt-in)邮件;不做验证码(先用蜜罐);不做附件之外的下载页;不做退订自建(用 Resend 自带)。
