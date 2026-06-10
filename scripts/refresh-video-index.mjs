#!/usr/bin/env node
/**
 * refresh-video-index.mjs
 * 用 YouTube Data API v3 刷新三木频道全部视频的实时 view/like/comment 统计.
 * 输出: 项目根目录的 video_url_index.json (覆盖)
 *
 * 用法 (在 sanmu-website/ 目录下):
 *   node --env-file=../.env scripts/refresh-video-index.mjs
 * 或 (已在 package.json scripts):
 *   npm run refresh:videos
 *
 * 数据更新点 (相对 2026-05-28 旧版):
 *   - 新增 like_count 字段
 *   - 新增 duration_seconds 字段 (来自 contentDetails.duration ISO-8601)
 *   - 新增 description 字段 (来自 snippet.description, 用于 VideoObject 结构化数据简介)
 *   - generated_at 改为完整 ISO 时间戳
 */

import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

const CHANNEL_ID = "UCMhsp4Iyvgc_rCNfkaSNh0Q"; // 三木有话说 @yyds3mu
// 项目根 data/ 目录 (2026-05-31 整理后)
const OUTPUT_PATH = resolve(
  process.cwd(),
  "..",
  "data",
  "video_url_index.json",
);
// 同步写入项目内 (Next.js build 时 lib/videos.ts 读取此文件)
const PROJECT_OUTPUT_PATH = resolve(
  process.cwd(),
  "lib",
  "data",
  "videos.json",
);

const API_KEYS = [
  process.env.YOUTUBE_API_KEY_1,
  process.env.YOUTUBE_API_KEY_2,
  process.env.YOUTUBE_API_KEY_3,
].filter(Boolean);

if (API_KEYS.length === 0) {
  console.error(
    "✗ 没有找到 YOUTUBE_API_KEY_* 环境变量. 请确保用 --env-file=../.env 启动.",
  );
  process.exit(1);
}

let currentKeyIndex = 0;

async function ytFetch(url) {
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    const key = API_KEYS[currentKeyIndex];
    const fullUrl = `${url}&key=${key}`;
    const res = await fetch(fullUrl);
    if (res.ok) return res.json();
    const body = await res.text();
    if (res.status === 403 && body.includes("quotaExceeded")) {
      console.warn(`! Key #${currentKeyIndex + 1} 配额耗尽, 切换下一个`);
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
      continue;
    }
    throw new Error(`YouTube API error ${res.status}: ${body.slice(0, 200)}`);
  }
  throw new Error("所有 API key 都已耗尽配额");
}

function parseISODuration(iso) {
  // PT1H2M3S -> 3723
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const [, h, min, s] = m;
  return (parseInt(h || 0) * 3600) + (parseInt(min || 0) * 60) + parseInt(s || 0);
}

async function getAllVideoIds() {
  // 拿到 uploads playlist
  const ch = await ytFetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}`,
  );
  const uploads = ch.items[0].contentDetails.relatedPlaylists.uploads;

  // 翻页拉取全部 videoId
  const ids = [];
  let pageToken = "";
  do {
    const data = await ytFetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploads}&maxResults=50${
        pageToken ? `&pageToken=${pageToken}` : ""
      }`,
    );
    data.items.forEach((it) => ids.push(it.snippet.resourceId.videoId));
    pageToken = data.nextPageToken || "";
  } while (pageToken);
  return ids;
}

async function getVideoStats(ids) {
  // videos.list 最多 50 个 id, 分批
  const results = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50).join(",");
    const data = await ytFetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${batch}`,
    );
    data.items.forEach((v) => {
      results.push({
        video_id: v.id,
        title: v.snippet.title,
        description: v.snippet.description || "",
        url: `https://www.youtube.com/watch?v=${v.id}`,
        published_at: v.snippet.publishedAt,
        duration_seconds: parseISODuration(v.contentDetails.duration),
        view_count: parseInt(v.statistics.viewCount || 0),
        like_count: parseInt(v.statistics.likeCount || 0),
        comment_count: parseInt(v.statistics.commentCount || 0),
      });
    });
  }
  return results;
}

async function getAllPlaylists() {
  const data = await ytFetch(
    `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${CHANNEL_ID}&maxResults=50`,
  );
  return (data.items || []).map((pl) => ({
    id: pl.id,
    title: pl.snippet.title,
    description: pl.snippet.description || "",
    published_at: pl.snippet.publishedAt,
    item_count: pl.contentDetails.itemCount,
  }));
}

async function getPlaylistVideoIds(playlistId) {
  const ids = [];
  let pageToken = "";
  do {
    const data = await ytFetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50${
        pageToken ? `&pageToken=${pageToken}` : ""
      }`,
    );
    data.items.forEach((it) => ids.push(it.snippet.resourceId.videoId));
    pageToken = data.nextPageToken || "";
  } while (pageToken);
  return ids;
}

function loadPrevious() {
  try {
    return JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
  } catch {
    return null;
  }
}

function summarizeDelta(prev, curr) {
  if (!prev || !prev.videos) return;
  const prevMap = new Map(prev.videos.map((v) => [v.video_id, v]));
  const grew = [];
  const newOnes = [];
  curr.forEach((v) => {
    const p = prevMap.get(v.video_id);
    if (!p) {
      newOnes.push(v);
    } else {
      const dv = v.view_count - (p.view_count || 0);
      const dc = v.comment_count - (p.comment_count || 0);
      if (dv > 0 || dc > 0) grew.push({ ...v, dv, dc });
    }
  });
  grew.sort((a, b) => b.dv - a.dv);

  console.log("\n────────────────────────────────");
  console.log(`相对上一版变化 (上版 generated_at: ${prev.generated_at || "未知"})`);
  console.log("────────────────────────────────");
  if (newOnes.length > 0) {
    console.log(`\n🆕 新增 ${newOnes.length} 条视频:`);
    newOnes.forEach((v) => {
      console.log(`  ${v.published_at.slice(0, 10)} · ${v.view_count.toLocaleString()} views · ${v.title.slice(0, 50)}`);
    });
  }
  if (grew.length > 0) {
    console.log(`\n📈 播放增长 Top 10:`);
    grew.slice(0, 10).forEach((v) => {
      console.log(`  +${v.dv.toLocaleString().padStart(8)} views (+${v.dc} comments) · ${v.title.slice(0, 50)}`);
    });
  }
}

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
  let created = 0;
  for (const v of videos) {
    if (existing.has(v.video_id)) continue;
    await notion.pages.create({
      parent: { type: "data_source_id", data_source_id: ds },
      properties: {
        video_id: { title: [{ type: "text", text: { content: v.video_id } }] },
        视频标题: { rich_text: [{ type: "text", text: { content: (v.title || "").slice(0, 2000) } }] },
      },
    });
    created++;
  }
  console.log(`策展库同步: 新建 ${created} 行(已存在 ${existing.size})`);
}

(async () => {
  console.log("→ 拉取频道全部 videoId...");
  const ids = await getAllVideoIds();
  console.log(`  共 ${ids.length} 条`);

  console.log("→ 批量拉取视频统计 (50/batch)...");
  const videos = await getVideoStats(ids);
  console.log(`  已拿到 ${videos.length} 条`);

  // 按发布日期倒序
  videos.sort((a, b) => (a.published_at < b.published_at ? 1 : -1));

  console.log("→ 拉取频道全部 playlists...");
  const playlistsMeta = await getAllPlaylists();
  console.log(`  共 ${playlistsMeta.length} 个 playlist`);

  console.log("→ 拉取每个 playlist 的视频成员...");
  const playlists = [];
  for (const pl of playlistsMeta) {
    const videoIds = await getPlaylistVideoIds(pl.id);
    playlists.push({ ...pl, video_ids: videoIds });
    console.log(`  ${pl.title}: ${videoIds.length} 个视频`);
  }

  const prev = loadPrevious();

  const output = {
    channel: "@yyds3mu",
    channel_id: CHANNEL_ID,
    generated_at: new Date().toISOString(),
    total: videos.length,
    playlists,
    videos,
  };

  const json = JSON.stringify(output, null, 2);
  // 写前确保目录存在(CI 里仓库外的 ../data 目录可能不存在).
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  mkdirSync(dirname(PROJECT_OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, json);
  console.log(`✓ 写入 ${OUTPUT_PATH}`);
  writeFileSync(PROJECT_OUTPUT_PATH, json);
  console.log(`✓ 写入 ${PROJECT_OUTPUT_PATH} (Next.js build 读取)`);

  summarizeDelta(prev, videos);

  await syncCurationRows(videos);

  // 频道汇总
  const totalViews = videos.reduce((s, v) => s + v.view_count, 0);
  const totalComments = videos.reduce((s, v) => s + v.comment_count, 0);
  const totalLikes = videos.reduce((s, v) => s + v.like_count, 0);
  console.log("\n────────────────────────────────");
  console.log("频道当前汇总");
  console.log("────────────────────────────────");
  console.log(`视频总数: ${videos.length}`);
  console.log(`总播放:   ${totalViews.toLocaleString()}`);
  console.log(`总评论:   ${totalComments.toLocaleString()}`);
  console.log(`总点赞:   ${totalLikes.toLocaleString()}`);
  console.log(`平均播放: ${Math.round(totalViews / videos.length).toLocaleString()} / 视频`);

  // 自动触发 Vercel deploy hook
  const deployHook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (deployHook) {
    console.log(`\n→ 触发 Vercel Deploy Hook`);
    try {
      const resp = await fetch(deployHook, { method: "POST" });
      if (resp.ok) {
        const data = await resp.json();
        console.log(`  ✓ Deploy 已触发 (job ${data?.job?.id ?? "?"})`);
        console.log(`  等 2-3 分钟, sanmu.ca/videos 反映最新数据`);
      } else {
        console.warn(`  ! Deploy Hook 返回 HTTP ${resp.status}, 请手动点 Notion hub 页的部署按钮`);
      }
    } catch (e) {
      console.warn(`  ! Deploy Hook 调用失败: ${e.message}`);
    }
  } else {
    console.log(
      `\n提示: 在 .env 添加 VERCEL_DEPLOY_HOOK_URL=... 可自动触发部署`,
    );
  }
})().catch((e) => {
  console.error(`✗ 失败: ${e.message}`);
  process.exit(1);
});
