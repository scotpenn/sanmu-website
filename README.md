# sanmu.ca · 三木有话说官网

> 「三木有话说」频道的独立官网。以打造三木个人 IP 为核心，承担信任建设、内容延伸、私域沉淀三重功能。

**生产地址**：https://sanmu.ca · https://www.sanmu.ca
**临时域名**：https://sanmu-website.vercel.app
**仓库**：https://github.com/scotpenn/sanmu-website

---

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16 (App Router) + TypeScript |
| 样式 | Tailwind CSS v4（配置写在 `app/globals.css` 的 `@theme` 块） |
| 字体 | Noto Sans SC（中文主） + Noto Serif SC（引文） + Inter（英文 UI），均通过 `next/font/google` self-host |
| 代码托管 | GitHub |
| 部署 | Vercel（推 main 即自动重建） |
| CDN | Vercel 全球边缘节点 |
| 域名 | GoDaddy 注册 · DNS 指向 Vercel |
| 内容管理 | Phase 1 静态硬编码（`lib/posts.ts`） · Phase 2 接 Notion |
| 邮件订阅 | Phase 1 占位前端 · Phase 3 接 MailerLite |

---

## 本地开发

```bash
cd sanmu-website
npm install         # 安装依赖（首次）
npm run dev         # 启动开发服务器 → http://localhost:3000
npm run build       # 生产构建（验证可上线）
npm run lint        # ESLint 检查
```

**改 `app/globals.css` 的 `@theme` 块后**：Turbopack HMR 不会自动重新生成 Tailwind utility 类，必须 `rm -rf .next` + 重启 `npm run dev`。

---

## 活动发布工作流

活动内容以 Notion Events 库为 source of record，不维护本地静态活动数据。发布外部分发时先 dry-run，再真实同步：

```bash
npm run events:publish -- --slug <event-slug> --dry-run
npm run events:publish -- --slug <event-slug>
```

Eventbrite 发布会自动创建一个免费 `免费入场 / RSVP` ticket，因为 Eventbrite live 发布强制要求 ticket。`sanmu.ca` 活动链接会写入 Eventbrite 活动描述和 ticket 描述。详细交接见 `docs/claude-handoff-2026-07-07-event-publishing.md`。

---

## 目录结构

```
sanmu-website/
├── app/                          # Next.js App Router 路由
│   ├── layout.tsx                # 全站布局（Header + main + Footer + 字体 + metadata）
│   ├── page.tsx                  # 首页 5 屏
│   ├── globals.css               # 全局样式 + Tailwind v4 @theme（5 品牌色 / 字号梯度 / 容器宽度）
│   ├── about/page.tsx            # About 5 屏
│   ├── blog/
│   │   ├── page.tsx              # 博客列表
│   │   └── [slug]/page.tsx       # 单篇文章动态路由模板
│   ├── events/page.tsx           # 线下活动列表（Upcoming + Past）
│   ├── resources/handbook/       # 手册申请页
│   ├── videos/                   # 视频专区（Phase 2 充实）
│   └── test-style/page.tsx       # 视觉系统验收页（生产可访问，不入主导航）
├── components/                   # 复用组件
│   ├── Container.tsx             # 三档宽度容器（reading 720 / card 1080 / wide 1280）
│   ├── Button.tsx                # 主/次按钮
│   ├── SectionTitle.tsx          # 区块标题（含 eyebrow）
│   ├── Header.tsx                # 顶部导航（usePathname active 高亮）
│   ├── Footer.tsx                # 富页脚
│   └── HandbookSignupForm.tsx    # 手册申请表单（Phase 1 占位 onSubmit）
├── lib/
│   └── posts.ts                  # 博客文章静态数据 + 工具函数
├── public/
│   ├── handbook-cover.jpg        # 手册封面图
│   └── portrait.jpg              # 三木肖像照
└── next.config.ts                # Next.js 配置（含 i.ytimg.com 图片域名白名单）
```

---

## 视觉系统（PRD v0.3 §5 + JC 风调整）

**5 个品牌色**（在 `app/globals.css` 的 `@theme` 声明）：

| 名称 | HEX | 用途 | 比例 |
|---|---|---|---|
| `paper` | `#FAF7F2` | 页面主底色 | 70% |
| `ink` | `#3F3D3A` | 正文 | 20% |
| `brand-navy` | `#1E3A8A` | Logo / 标题 / 主按钮 | 7% |
| `brand-yellow` | `#F2C12E` | 引文装饰 / 高亮 | 3% |
| `rule` | `#E5E0D8` | 分割线 / 边框 | — |

**字体角色**（参考 jamesclear.com）：
- **思源黑体**（Noto Sans SC, weight 800）：全站标题 + 正文
- **思源宋体**（Noto Serif SC）：仅用于 `<blockquote>` 引文，制造仪式感
- **Inter**：英文 UI 标签 / 数字

---

## 部署流程

1. 改代码 → `git add` + `git commit` + `git push origin main`
2. Vercel 自动检测 push，触发 build
3. 2-3 分钟后新版本上线（同时保留所有历史版本可一键回滚）

**手动触发重新部署**（不改代码也想重建，例如未来 Notion 内容更新时）：
- Vercel Dashboard → Deployments → 任意一条 → Redeploy
- 或在 Vercel Settings → Git → Deploy Hooks 配置一个 URL，访问该 URL 即触发

---

## Phase 路线图（v0.3）

- **Phase 1** ✅ 最小可发布版（当前）—— 8 个页面 / 5 个组件 / 1 篇真实博客 / 1 个真实往期活动 / 真手册图 / 真肖像
- **Phase 2** ⏳ Notion CMS + i18n —— 博客 / 视频 / 活动从 Notion 拉取 / 双语路由 + OpenCC
- **Phase 3** ⏳ 私域闭环 + MailerLite —— 手册 PDF 自动发送
- **Phase 4** ⏳ SEO + 适老化 —— sitemap / OG / hreflang / 辅助阅读模式
- **Phase 5** ⏳ 写信 / 持续迭代 —— 来信表单 / newsletter

---

## 文档与策划文件位置

项目根目录（非仓库内）：

- `网站策划草案_v0.3.md` —— PRD
- `网站占位文案集_v1.0.md` —— Phase 1 占位文案
- `Phase1_开发清单_v1.0.md` —— Phase 1 11 个 Task 清单
- `三木亲笔区清单_v1.0.md` —— 等三木交稿的内容点

---

## 工作流约定

- 每完成一个 Task 做一次 `git commit`
- 改 `globals.css` 的 `@theme` 后清 `.next` 缓存再重启 dev server
- 不在 Phase 1 引入 i18n / Notion / MailerLite 任何依赖
- 设计原则：**机构感优先于网红风**（PRD §1）
- 视觉参考：jamesclear.com 的克制感
