# 视频自动刷新 + 策展覆盖 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让新 YouTube 视频每周自动上站(GitHub Action),并加一个 Notion「视频策展」覆盖层控制首页精选 / 繁体标题 / 隐藏(渲染时合并,ISR 生效)。

**Architecture:** 原始视频走 YouTube → `videos.json`(GitHub Action 周更 + 提交)。策展走 Notion 库(key=video_id),`lib/notion.ts` 的 `getVideoCuration()` 在页面渲染时读取,`lib/videos.ts` 的纯函数把策展合并进视频列表(隐藏过滤 / 首页精选 / 繁体标题覆盖)。

**Tech Stack:** Next.js 16 (App Router, async Server Components, ISR) + `@notionhq/client@^5` + GitHub Actions。**无测试框架**,验证 = `npm run build` + 本地 `npm run dev` + GitHub Action 手动触发。

---

## File Structure

- `lib/notion.ts`(改):加 `VideoCuration` 类型 + `getVideoCuration()`。
- `lib/videos.ts`(改):`localizeVideoTitle` 改签名(`customHant`)、删 override 引用、加 `homepageVideos` / `visiblePlaylistVideos` / `visibleOrphanVideos`。
- `lib/video-title-overrides.ts`(删)。
- `components/VideoJsonLd.tsx`(改):`localizeVideoTitle` 调用去掉 video_id。
- `app/page.tsx` / `app/zh-Hant/page.tsx`(改):首页视频用 `homepageVideos(curation)`。
- `app/videos/page.tsx` / `app/zh-Hant/videos/page.tsx`(改):playlist/orphan 用 `visible*`,繁体标题走 curation。
- `scripts/refresh-video-index.mjs`(改):upsert 新视频到策展库。
- `.github/workflows/refresh-videos.yml`(新建)。
- `.env.local` / Vercel / GitHub Secrets(改):加 `NOTION_VIDEO_CURATION_DS_ID`。

---

## Task 1: 建 Notion「视频策展」库 + 种 74 行 + 写 env

> 远程资源 + 数据播种。执行者(controller)用 Notion MCP + 一次性脚本完成。无代码提交(只改 .env.local)。

**Files:** Modify `.env.local`

- [ ] **Step 1: 建库**

用 Notion MCP `notion-create-database`,父页 hub `370c4735c2368146a733fd3276d4c922`,schema:
```sql
CREATE TABLE ("video_id" TITLE, "视频标题" RICH_TEXT, "首页精选" CHECKBOX, "繁体标题" RICH_TEXT, "隐藏" CHECKBOX)
```
记下返回的 data_source_id。

- [ ] **Step 2: 写 env**

`.env.local` 追加:`NOTION_VIDEO_CURATION_DS_ID=<step1 的 id>`

- [ ] **Step 3: 种 74 行 + 迁移 2 条繁体标题覆盖**

跑一次性脚本(用 `node --env-file=.env.local`):读 `lib/data/videos.json`,为每条视频在策展库建行(`video_id`=video_id,`视频标题`=该视频简体 title);并给 `Eff5kdJTBRU` 的 `繁体标题` 填 `AI 能復活親人？前提是你得給家人留點"料"`、`K5eRvjn45Uo` 的 `繁体标题` 填 `🇨🇦我與姜昆老師🇺🇸 #加拿大生活 #姜昆 #郭德綱 #溫哥華三木 @yyds3mu #老藝術家`。脚本跑完即删。

- [ ] **Step 4: 验证 + 提示加 Vercel / GitHub Secret**

`node --env-file=.env.local -e 'import("@notionhq/client").then(async({Client})=>{const n=new Client({auth:process.env.NOTION_TOKEN});const r=await n.dataSources.query({data_source_id:process.env.NOTION_VIDEO_CURATION_DS_ID,page_size:100});console.log("策展库行数:",r.results.length)})'`
期望:行数 = 74。提示用户:把 `NOTION_VIDEO_CURATION_DS_ID` 加到 Vercel(Production)+ GitHub Secrets,并把 `YOUTUBE_API_KEY_1/2/3`、`NOTION_TOKEN` 也加到 GitHub Secrets。

---

## Task 2: lib/notion.ts — getVideoCuration()

**Files:** Modify `lib/notion.ts`

- [ ] **Step 1: 在 lib/notion.ts 末尾追加**

复用文件内已有的 `getNotionClient()`、`richTextToPlainText()`、`PageObjectResponse` 类型:
```ts
// ============ 视频策展 ============

export type VideoCuration = {
  featured: boolean;
  titleHant: string | null;
  hidden: boolean;
};

/**
 * 读 Notion「视频策展」库, 以 video_id 为 key. 未配置 / 失败 → 空 Map(全部回退默认).
 * 用于: 首页 / videos 页渲染时合并策展(隐藏 / 首页精选 / 繁体标题).
 */
export async function getVideoCuration(): Promise<Map<string, VideoCuration>> {
  const map = new Map<string, VideoCuration>();
  const dataSourceId = process.env.NOTION_VIDEO_CURATION_DS_ID;
  if (!dataSourceId) return map;
  try {
    const notion = getNotionClient();
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
    });
    for (const page of response.results) {
      if (!("properties" in page)) continue;
      const props = (page as PageObjectResponse).properties;
      const idProp = props["video_id"];
      const videoId =
        idProp?.type === "title" ? richTextToPlainText(idProp.title).trim() : "";
      if (!videoId) continue;
      const hantProp = props["繁体标题"];
      const titleHant =
        hantProp?.type === "rich_text"
          ? richTextToPlainText(hantProp.rich_text).trim()
          : "";
      map.set(videoId, {
        featured:
          props["首页精选"]?.type === "checkbox"
            ? props["首页精选"].checkbox
            : false,
        hidden:
          props["隐藏"]?.type === "checkbox" ? props["隐藏"].checkbox : false,
        titleHant: titleHant || null,
      });
    }
  } catch (e) {
    console.error("[video-curation] 读取失败, 回退默认:", e);
  }
  return map;
}
```

- [ ] **Step 2: 构建验证**

Run: `cd sanmu-website && npm run build 2>&1 | grep -E "Compiled successfully|Error"`
Expected: `✓ Compiled successfully`(未使用导出不报错)。

- [ ] **Step 3: 提交**

```bash
git add lib/notion.ts
git commit -m "feat(videos): getVideoCuration 读 Notion 视频策展库"
```

---

## Task 3: lib/videos.ts — 改 localizeVideoTitle + 合并助手 + 删 override

**Files:** Modify `lib/videos.ts`; Delete `lib/video-title-overrides.ts`

- [ ] **Step 1: 删除 override 引用,改用 notion 的类型**

把 `lib/videos.ts` 顶部这行:
```ts
import { VIDEO_TITLE_OVERRIDES } from "./video-title-overrides";
```
改为:
```ts
import type { VideoCuration } from "./notion";
```

- [ ] **Step 2: 改 localizeVideoTitle 签名**

把现有函数:
```ts
export function localizeVideoTitle(
  title: string,
  locale: Locale,
  videoId?: string,
): string {
  if (locale !== TRADITIONAL_LOCALE) return title;
  if (videoId && VIDEO_TITLE_OVERRIDES[videoId]) {
    return VIDEO_TITLE_OVERRIDES[videoId];
  }
  return toTraditional(title);
}
```
替换为:
```ts
/** 繁体化视频标题: customHant(来自 Notion 策展)非空则用它, 否则机器转繁. */
export function localizeVideoTitle(
  title: string,
  locale: Locale,
  customHant?: string | null,
): string {
  if (locale !== TRADITIONAL_LOCALE) return title;
  if (customHant) return customHant;
  return toTraditional(title);
}
```

- [ ] **Step 3: 加三个合并助手(放在 localizeVideoTitle 之后)**

```ts
/** 首页视频: 先剔除隐藏; 有「首页精选」则用精选(按播放量), 否则回退播放量前 count. */
export function homepageVideos(
  curation: Map<string, VideoCuration>,
  count = 3,
): Video[] {
  const visible = rawData.videos
    .filter(isLongVideo)
    .filter((v) => !curation.get(v.video_id)?.hidden);
  const featured = visible.filter((v) => curation.get(v.video_id)?.featured);
  const pool = featured.length > 0 ? featured : visible;
  return pool
    .slice()
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, count);
}

/** 某 playlist 的可见视频(剔除隐藏). */
export function visiblePlaylistVideos(
  playlistId: string,
  curation: Map<string, VideoCuration>,
  opts?: { sortBy?: "views" | "date" | "playlist_order" },
): Video[] {
  return getPlaylistVideos(playlistId, opts).filter(
    (v) => !curation.get(v.video_id)?.hidden,
  );
}

/** 未归类视频的可见部分(剔除隐藏). */
export function visibleOrphanVideos(
  curation: Map<string, VideoCuration>,
  opts?: { sortBy?: "views" | "date" },
): Video[] {
  return getOrphanVideos(opts).filter((v) => !curation.get(v.video_id)?.hidden);
}
```

- [ ] **Step 4: 删除 override 文件**

Run: `cd sanmu-website && rm lib/video-title-overrides.ts`

- [ ] **Step 5: 构建验证(会暴露所有旧调用方,先不修别处,预期报错)**

Run: `cd sanmu-website && npm run build 2>&1 | grep -E "Compiled successfully|Error|localizeVideoTitle|video-title-overrides" | head`
Expected: **此时会因 Task 4/5/6 的调用方还在传 video_id 而报类型错或编译错**——这是预期的,Task 4-6 会逐一修正。**本任务先不提交**,等 Task 4-6 改完调用方后,在 Task 6 末尾统一构建通过再分别提交。
> 例外:若你想本任务独立提交,可先在调用方把第三个参数从 `video.video_id` 改成 `undefined` 占位再提交,但更简单是按计划顺序连做 Task 3→6。本计划按"连做"处理,故 Task 3 不单独构建/提交,直接进 Task 4。

---

## Task 4: components/VideoJsonLd.tsx — 去掉 video_id 参数

**Files:** Modify `components/VideoJsonLd.tsx`

- [ ] **Step 1: 改调用**

把第 45 行附近:
```tsx
    ? localizeVideoTitle(video.title, locale, video.video_id)
```
改为(JSON-LD 不纳入策展, 用机器转繁):
```tsx
    ? localizeVideoTitle(video.title, locale)
```

- [ ] **Step 2: 进 Task 5(暂不单独构建)**

---

## Task 5: 首页(简 + 繁)接入 homepageVideos

**Files:** Modify `app/page.tsx`, `app/zh-Hant/page.tsx`

- [ ] **Step 1: app/page.tsx(简体首页)**

import 区把 `getTopVideos` 换成 `homepageVideos`,并加 `getVideoCuration`:
```ts
import { homepageVideos, formatViewCount, thumbnailUrl, watchUrl } from "@/lib/videos";
import { getAllPosts, getUpcomingEvents, getVideoCuration } from "@/lib/notion";
```
(注:`getAllPosts`/`getUpcomingEvents` 已从 `@/lib/notion` 导入,把 `getVideoCuration` 加进同一行;`homepageVideos` 加进 `@/lib/videos` 的 import。)

把 `const topVideos = getTopVideos(3);` 改为:
```ts
  const curation = await getVideoCuration();
  const topVideos = homepageVideos(curation, 3);
```
(简体标题不变,无需改 title 渲染。)

- [ ] **Step 2: app/zh-Hant/page.tsx(繁体首页)**

import 同样把 `getTopVideos`→`homepageVideos`、加 `getVideoCuration`(它已从 `@/lib/notion` 导入 getAllPosts/getUpcomingEvents)。

把 `const topVideos = getTopVideos(3);` 改为:
```ts
  const curation = await getVideoCuration();
  const topVideos = homepageVideos(curation, 3);
```

把视频卡片里两处(约 153、160 行)：
```tsx
alt={localizeVideoTitle(video.title, TRADITIONAL_LOCALE, video.video_id)}
...
{localizeVideoTitle(video.title, TRADITIONAL_LOCALE, video.video_id)}
```
都改成传 curation 的繁体标题:
```tsx
alt={localizeVideoTitle(video.title, TRADITIONAL_LOCALE, curation.get(video.video_id)?.titleHant)}
...
{localizeVideoTitle(video.title, TRADITIONAL_LOCALE, curation.get(video.video_id)?.titleHant)}
```

- [ ] **Step 2.5: 进 Task 6(暂不单独构建)**

---

## Task 6: /videos 页(简 + 繁)接入 + 统一构建提交

**Files:** Modify `app/videos/page.tsx`, `app/zh-Hant/videos/page.tsx`

- [ ] **Step 1: app/videos/page.tsx(简体)**

这页有内部组件 `PlaylistSection`(调 `getPlaylistVideos`)和默认导出页(调 `getOrphanVideos`)。把 curation 从页面穿透下去:

import:把 `getPlaylistVideos`、`getOrphanVideos` 换成 `visiblePlaylistVideos`、`visibleOrphanVideos`(保留 `getAllPlaylists`);并 `import { getVideoCuration } from "@/lib/notion";`。

`PlaylistSection` 改为接收 `curation` 参数:
```tsx
function PlaylistSection({
  playlist,
  curation,
}: {
  playlist: Playlist;
  curation: Map<string, VideoCuration>;
}) {
  const videos = visiblePlaylistVideos(playlist.id, curation, { sortBy: "views" });
  ...
}
```
(需 `import type { VideoCuration } from "@/lib/notion";`。)

默认导出页改为 async、取 curation、传下去:
```tsx
export default async function VideosPage() {
  const curation = await getVideoCuration();
  const playlists = sortPlaylists(getAllPlaylists());
  const orphans = visibleOrphanVideos(curation, { sortBy: "views" });
  ...
  // 渲染 playlists.map 时传 curation:
  // <PlaylistSection key={pl.id} playlist={pl} curation={curation} />
}
```
(简体不改标题。若该页原本是同步函数,改成 `async function` 即可。)

- [ ] **Step 2: app/zh-Hant/videos/page.tsx(繁体)**

同上把 `getPlaylistVideos`/`getOrphanVideos` 换成 `visible*`、加 `getVideoCuration` + `type VideoCuration` import。`PlaylistSection`、`VideoCard` 接收 `curation`。

`VideoCard`(约 26 行起)改为接收 curation,并把两处 `localizeVideoTitle(..., video.video_id)` 改为传 curation 繁体标题:
```tsx
function VideoCard({
  video,
  curation,
}: {
  video: Video;
  curation: Map<string, VideoCuration>;
}) {
  const titleHant = curation.get(video.video_id)?.titleHant;
  // alt 与标题:
  // alt={localizeVideoTitle(video.title, TRADITIONAL_LOCALE, titleHant)}
  // {localizeVideoTitle(video.title, TRADITIONAL_LOCALE, titleHant)}
  ...
}
```
`PlaylistSection` 用 `visiblePlaylistVideos(playlist.id, curation, { sortBy: "views" })`,并把 curation 透传给每个 `<VideoCard video={v} curation={curation} />`。默认导出页 `const curation = await getVideoCuration();`、`orphans = visibleOrphanVideos(curation, { sortBy: "views" })`、把 curation 传给 PlaylistSection 和 orphan 的 VideoCard。

- [ ] **Step 3: 清缓存构建(Task 3-6 整体)**

Run: `cd sanmu-website && rm -rf .next && npm run build 2>&1 | grep -E "Compiled successfully|Error|video_id|localizeVideoTitle" | head`
Expected: `✓ Compiled successfully`,无 `video-title-overrides` / 参数类型错。若有调用方漏改(还传 video_id 当第三参),按报错定位修正。

- [ ] **Step 4: 提交 Task 3-6**

```bash
git add lib/videos.ts components/VideoJsonLd.tsx app/page.tsx app/zh-Hant/page.tsx app/videos/page.tsx app/zh-Hant/videos/page.tsx
git rm lib/video-title-overrides.ts
git commit -m "feat(videos): 策展合并(隐藏/首页精选/繁体标题)接入首页与 /videos, 删除代码 override 表"
```

---

## Task 7: refresh 脚本 — upsert 新视频到策展库

**Files:** Modify `scripts/refresh-video-index.mjs`

- [ ] **Step 1: 在脚本写完 videos.json 之后,加 Notion upsert**

在脚本主流程末尾(写文件之后、触发 deploy hook 之前)插入:
```js
// ── 同步新视频到 Notion 视频策展库(尽力而为) ──
async function syncCurationRows(videos) {
  const token = process.env.NOTION_TOKEN;
  const ds = process.env.NOTION_VIDEO_CURATION_DS_ID;
  if (!token || !ds) {
    console.log("跳过策展库同步(未设 NOTION_TOKEN / NOTION_VIDEO_CURATION_DS_ID)");
    return;
  }
  const { Client } = await import("@notionhq/client");
  const notion = new Client({ auth: token });
  // 拉现有所有 video_id
  const existing = new Set();
  let cursor;
  do {
    const r = await notion.dataSources.query({
      data_source_id: ds,
      page_size: 100,
      start_cursor: cursor,
    });
    for (const p of r.results) {
      const t = p.properties?.video_id?.title;
      const id = Array.isArray(t) ? t.map((x) => x.plain_text).join("").trim() : "";
      if (id) existing.add(id);
    }
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  // 为缺失的建行
  let created = 0;
  for (const v of videos) {
    if (existing.has(v.video_id)) continue;
    await notion.pages.create({
      parent: { type: "data_source_id", data_source_id: ds },
      properties: {
        video_id: { title: [{ type: "text", text: { content: v.video_id } }] },
        视频标题: { rich_text: [{ type: "text", text: { content: v.title.slice(0, 2000) } }] },
      },
    });
    created++;
  }
  console.log(`策展库同步: 新建 ${created} 行(已存在 ${existing.size})`);
}
await syncCurationRows(videos);
```
> `videos` 是脚本里已构建好的视频数组(字段含 `video_id`、`title`);若变量名不同,用脚本里实际的视频数组变量。`@notionhq/client` 已是项目依赖。

- [ ] **Step 2: 本地构建/语法验证**

Run: `cd sanmu-website && node --check scripts/refresh-video-index.mjs && echo OK`
Expected: `OK`(语法通过)。不在本地实跑(避免改动 videos.json / 触发部署);真正验证放 Task 9 的 GitHub Action 手动触发。

- [ ] **Step 3: 提交**

```bash
git add scripts/refresh-video-index.mjs
git commit -m "feat(videos): refresh 脚本同步新视频到 Notion 策展库"
```

---

## Task 8: GitHub Action — 每周自动刷新

**Files:** Create `.github/workflows/refresh-videos.yml`

- [ ] **Step 1: 创建 workflow(此仓库 git 根 = sanmu-website, CI 不 cd)**

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
        with:
          node-version: "20"
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
          else
            echo "videos.json 无变化, 不提交"
          fi
```

- [ ] **Step 2: 提交**

```bash
git add .github/workflows/refresh-videos.yml
git commit -m "ci(videos): GitHub Action 每周自动刷新 YouTube 视频"
```

---

## Task 9: 端到端验证

**Files:** 无代码(Notion 数据 + GitHub + 本地验证)

- [ ] **Step 1: 本地起 dev,验证默认行为不变**

`cd sanmu-website && npm run dev`。打开 `http://localhost:3000`(首页"最热视频" = 播放量前 3,和现状一致,因为还没勾任何精选/隐藏)和 `http://localhost:3000/zh-Hant/videos`(繁体标题:复活=復活、姜昆=姜昆,来自 Notion 策展库迁移的两条)。

- [ ] **Step 2: 验证隐藏**

Notion 策展库给某个首页会出现的视频勾「隐藏」→ 本地重启 dev(或等 ISR)→ 首页 + /videos 不再出现它。验证后取消勾选。

- [ ] **Step 3: 验证首页精选**

给 3 个视频勾「首页精选」→ 首页"最热视频"显示这 3 个(而非播放量前 3)。验证后取消。

- [ ] **Step 4: 验证繁体标题覆盖**

给某视频填「繁体标题」→ `/zh-Hant/videos` 显示你填的;清空 → 回退机器转繁。

- [ ] **Step 5: 验证 GitHub Action(需先加好 Secrets)**

GitHub → Actions → "Refresh videos (weekly)" → Run workflow(手动触发)→ 看运行成功;若 YouTube 有新视频则产生一次 `chore(videos)` 提交 + 部署;策展库里新视频自动补了行。

- [ ] **Step 6: 关闭 dev server**

---

## Self-Review

- **Spec 覆盖**:自动刷新(T8 Action + T7 upsert)、周更频率(T8 cron)、策展库(T1)、getVideoCuration(T2)、隐藏/精选/繁体标题合并(T3 助手 + T5/T6 接入)、删 override 表迁 Notion(T1 Step3 + T3 Step4)、env/secrets(T1)、验收(T9)——全覆盖。`VideoJsonLd` 不纳入策展(T4,符合 spec)。
- **Placeholder**:无 TBD;DS_ID 在 T1 真实创建后填入。
- **类型一致**:`VideoCuration`(T2 定义)→ T3 `import type` 用于助手签名、T6 页面组件 props;`localizeVideoTitle(title, locale, customHant?)`(T3)→ T4/T5/T6 调用一致(传 `curation.get(id)?.titleHant` 或省略);`getVideoCuration(): Promise<Map<string, VideoCuration>>`(T2)→ 各页 `await` 使用一致;`homepageVideos`/`visiblePlaylistVideos`/`visibleOrphanVideos`(T3)签名与 T5/T6 调用一致。
- **顺序依赖**:T3 删 override + 改签名会暂时破坏 T4/T5/T6 的调用方,故 T3-T6 连做、在 T6 Step3 统一构建通过后一并提交(T3-T6 不各自构建)。T1/T2/T7/T8 独立可构建/提交。
