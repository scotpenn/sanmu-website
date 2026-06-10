# 视频自动刷新 + 策展覆盖 · 设计

日期:2026-06-09
目标:① 让新 YouTube 视频**每周自动**同步上站(不再靠手动跑命令);② 在 Notion 加一个轻量「策展」覆盖层,让三木/Scot 能控制**首页精选、繁体标题、隐藏**,改完约 1 小时自动生效。

---

## 背景与现状

- 视频数据源 = **YouTube Data API**。脚本 `scripts/refresh-video-index.mjs`(`npm run refresh:videos`)拉频道全部视频 → 写入 `lib/data/videos.json`(74 条,已提交进 git)。网站 `lib/videos.ts` 读这个 JSON(同步)。
- 现状痛点:`refresh` 是**手动命令、无定时**,且脚本**自己不 commit**——新视频要"跑命令 + 提交 videos.json + 部署"才上站,容易忘、会漏。
- 繁体视频标题:现由代码静态表 `lib/video-title-overrides.ts` 覆盖(只改了 `复活`/`姜昆` 两条),其余机器转繁。
- 视频展示位:首页"最热视频"(`getTopVideos(3)` 取播放量前 3)、`/videos` 页(按 playlist 分组,简繁各一)。
- env 已有:本地根 `.env` 有 `YOUTUBE_API_KEY_1/2/3`、`NOTION_TOKEN`;Vercel 有 `NOTION_TOKEN`。

## 已定决策

| 项 | 决策 |
|---|---|
| 自动刷新方式 | **GitHub Action 定时任务**(复用现有脚本)|
| 刷新频率 | **每周一次**(可调)+ 支持手动触发 |
| 策展存储 | **Notion「视频策展」库**,key = YouTube `video_id` |
| 策展能力 | ① 首页精选 ② 自定义繁体标题 ④ 隐藏(**不做** ③ 手动分类)|
| 合并时机 | **渲染时合并(ISR)**:Notion 改完约 1 小时自动生效 |
| 繁体标题覆盖表 | 从代码迁到 Notion,删除 `lib/video-title-overrides.ts` |
| 新视频建策展行 | refresh 脚本顺带 upsert(④i)|

---

## Part A · 自动刷新(GitHub Action)

### 数据流
```
GitHub 定时(每周一)/ 手动触发
  → checkout 仓库 → 跑 refresh 脚本(env 来自 GitHub Secrets)
    · 拉 YouTube → 重写 sanmu-website/lib/data/videos.json
    · upsert: 给策展库里还没有的 video_id 建行(video_id + 简体标题)
  → 若 videos.json 有变化: git commit + push
  → push 触发 Vercel git 集成自动部署 → 新视频上站
```

### 文件
- `.github/workflows/refresh-videos.yml`(新建):
  ```yaml
  name: Refresh videos (weekly)
  on:
    schedule:
      - cron: "0 16 * * 1"   # 每周一 16:00 UTC (≈ 温哥华周一上午)
    workflow_dispatch: {}
  permissions:
    contents: write
  jobs:
    refresh:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with: { node-version: "20" }
        - run: npm ci
        - run: node scripts/refresh-video-index.mjs
          env:
            YOUTUBE_API_KEY_1: ${{ secrets.YOUTUBE_API_KEY_1 }}
            YOUTUBE_API_KEY_2: ${{ secrets.YOUTUBE_API_KEY_2 }}
            YOUTUBE_API_KEY_3: ${{ secrets.YOUTUBE_API_KEY_3 }}
            NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
            NOTION_VIDEO_CURATION_DS_ID: ${{ secrets.NOTION_VIDEO_CURATION_DS_ID }}
        - name: Commit & push if changed
          run: |
            if ! git diff --quiet -- lib/data/videos.json; then
              git config user.name "github-actions[bot]"
              git config user.email "github-actions[bot]@users.noreply.github.com"
              git add lib/data/videos.json
              git commit -m "chore(videos): weekly auto-refresh from YouTube"
              git push
            fi
  ```
  > 注:此仓库的 git 根目录**就是 `sanmu-website`**(`.git` 在这一层),故 CI 里直接在根跑、不 `cd`;`video_url_index.json` 写在仓库外的上级目录、不入库,只提交 `lib/data/videos.json`。脚本若用 `--env-file` 启动需去掉(CI 用 Secrets 注入 env);CI 不设 `VERCEL_DEPLOY_HOOK_URL`,靠 git push 触发部署。
- `scripts/refresh-video-index.mjs`(改):拉完视频后,若 `NOTION_TOKEN` 与 `NOTION_VIDEO_CURATION_DS_ID` 都存在,则:① 查策展库现有所有 `video_id`;② 为缺失的 video_id 建行(`video_id` 作标题 + `视频标题`=简体标题,其余字段留空)。两者任一缺失则**跳过 upsert**(本地无这俩 env 时不影响刷新)。**不要在 CI 设置 `VERCEL_DEPLOY_HOOK_URL`**——靠 git push 触发部署,避免在 push 之前用旧 commit 误触发部署。

### 你要做的一次性设置
- GitHub 仓库 → Settings → Secrets and variables → Actions,添加:
  `YOUTUBE_API_KEY_1`、`YOUTUBE_API_KEY_2`、`YOUTUBE_API_KEY_3`、`NOTION_TOKEN`、`NOTION_VIDEO_CURATION_DS_ID`(值在实施时给你)。

---

## Part B · 策展覆盖层(Notion + ISR)

### Notion「视频策展」库(新建,我建 + 种 74 行)
| 字段 | 类型 | 用途 |
|---|---|---|
| video_id | 标题(title) | YouTube 11 位 id,主键 |
| 视频标题 | 文本 | 简体标题,**纯参考**(refresh 自动写,方便你认) |
| 首页精选 | 复选框 | 勾了 → 上首页"最热视频" |
| 繁体标题 | 文本 | 选填,覆盖机器转繁 |
| 隐藏 | 复选框 | 勾了 → 全站不显示 |

### 读取与合并
- `lib/notion.ts` 新增:
  ```ts
  export type VideoCuration = { featured: boolean; titleHant: string | null; hidden: boolean };
  export async function getVideoCuration(): Promise<Map<string, VideoCuration>>;
  ```
  读策展库全部行(`page_size: 100`,74 < 100),以 `video_id` 为 key 返回 Map。`NOTION_VIDEO_CURATION_DS_ID` 缺失或查询失败时返回**空 Map**(优雅降级:策展全部回退默认)。
- `lib/videos.ts` 新增纯函数(接收 `curation: Map` 作为参数,保持同步、无 Notion 依赖):
  - `homepageVideos(curation, count = 3): Video[]` —— 先剔除 `hidden`;取 `featured` 的(按播放量降序)前 `count`;**一个 featured 都没有 → 回退播放量前 `count`**。
  - `visiblePlaylistVideos(playlistId, curation, opts): Video[]` —— 同 `getPlaylistVideos`,但剔除 `hidden`。
  - `visibleOrphanVideos(curation, opts): Video[]` —— 同 `getOrphanVideos`,剔除 `hidden`。
  - `localizeVideoTitle(title, locale, customHant?)` —— 改签名:`customHant` 非空则用它,否则机器转繁(删除对静态 override 表的依赖)。
- 删除 `lib/video-title-overrides.ts`;`复活`/`姜昆` 两条迁入 Notion 策展库的 `繁体标题` 字段。

### 接入页面(渲染时 `const curation = await getVideoCuration()`)
- `app/page.tsx`(简体首页):`getTopVideos(3)` → `homepageVideos(curation, 3)`;标题用简体原文。
- `app/zh-Hant/page.tsx`:`homepageVideos(curation, 3)`;标题 `localizeVideoTitle(v.title, zh-Hant, curation.get(v.video_id)?.titleHant)`。
- `app/videos/page.tsx`(简体):playlist 视频改用 `visiblePlaylistVideos` / `visibleOrphanVideos`(剔除隐藏)。
- `app/zh-Hant/videos/page.tsx`:同上 + 标题走 `localizeVideoTitle(..., curation.get(id)?.titleHant)`。
- `VideoJsonLd`(博客/活动内嵌视频)**不在本次范围**:保持机器转繁;它是文章内容的一部分,不属视频策展。

> 说明:`getTopVideos` 等原始访问器保留;新增的是"带策展过滤"的版本,页面改调新版本。

---

## 环境变量 / Secrets

| 名称 | 用途 | 位置 |
|---|---|---|
| `NOTION_VIDEO_CURATION_DS_ID` | 渲染时读策展库 | **Vercel(Production)** + 本地 `.env.local` + GitHub Secret |
| `YOUTUBE_API_KEY_1/2/3` | Action 拉 YouTube | GitHub Secret(本地根 `.env` 已有) |
| `NOTION_TOKEN` | Action upsert 策展行 + 渲染读库 | GitHub Secret(Vercel/本地已有) |

## 实施前置(实施阶段由 agent 完成)

1. 用 Notion MCP 建「视频策展」库(父页 hub `370c4735c2368146a733fd3276d4c922`)→ 拿 data_source_id。
2. 写脚本:把现有 `videos.json` 的 74 条**种进策展库**(每条 `video_id` + `视频标题`=简体标题);并把 `复活`(Eff5kdJTBRU)、`姜昆`(K5eRvjn45Uo)两条的 `繁体标题` 一并填上。
3. `NOTION_VIDEO_CURATION_DS_ID` 写入 `.env.local`;提示用户加到 Vercel + GitHub Secrets。
4. 验证 `NOTION_TOKEN` 能读写新库(hub 子库通常继承权限)。

## 验收

- **自动刷新**:手动触发(workflow_dispatch)GitHub Action → 跑通 → 若 YouTube 有新视频则 videos.json 被提交、Vercel 部署、新视频上站;无新视频则不产生空提交。
- **策展库 upsert**:Action 跑后,策展库里每个 video_id 都有行(新视频自动补行)。
- **隐藏**:某视频勾"隐藏" → 约 1 小时后首页 + /videos 都不显示它。
- **首页精选**:勾 3 个"首页精选" → 首页"最热视频"显示这 3 个;全不勾 → 回退播放量前 3。
- **繁体标题**:某视频填"繁体标题" → 繁体页显示你填的;没填 → 机器转繁。
- `npm run build` 通过;删除 `lib/video-title-overrides.ts` 后无残留引用。

## YAGNI(不做)

- 不做手动分类(③);不做 /videos 页精选区(只接管首页);`VideoJsonLd` 内嵌视频标题不纳入策展;不把整个视频管线改成运行时拉 YouTube(继续用 videos.json + 周更);不做更细的刷新频率/失败告警(GitHub Action 自带运行记录)。
