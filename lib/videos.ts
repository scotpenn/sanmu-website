import data from "./data/videos.json";

// ============ Types ============

export type Video = {
  video_id: string;
  title: string;
  description?: string; // YouTube 简介原文 (含链接/话题标签/时间戳等噪音), 用 videoSummary() 清洗
  url: string;
  published_at: string;
  duration_seconds: number;
  view_count: number;
  like_count: number;
  comment_count: number;
};

export type Playlist = {
  id: string;
  title: string;
  description: string;
  published_at: string;
  item_count: number;
  video_ids: string[];
};

const rawData = data as {
  channel: string;
  channel_id: string;
  generated_at: string;
  total: number;
  playlists: Playlist[];
  videos: Video[];
};

const VIDEO_MAP = new Map(rawData.videos.map((v) => [v.video_id, v]));

// 排除 Shorts (标题含 #short 或时长 < 60 秒)
function isLongVideo(v: Video): boolean {
  return !v.title.includes("#short") && v.duration_seconds >= 60;
}

// ============ Playlists ============

/**
 * 获取频道所有 playlist (按 publishedAt 降序, API 默认顺序).
 * 网站调用时可以再 sort 成自定义顺序.
 */
export function getAllPlaylists(): Playlist[] {
  return rawData.playlists;
}

/**
 * 获取某 playlist 内的视频, 默认按 YouTube playlist 内原顺序.
 * sortBy="views" -> 按播放量降序;
 * sortBy="date"  -> 按发布日期降序.
 */
export function getPlaylistVideos(
  playlistId: string,
  opts?: { sortBy?: "views" | "date" | "playlist_order" },
): Video[] {
  const pl = rawData.playlists.find((p) => p.id === playlistId);
  if (!pl) return [];
  const videos = pl.video_ids
    .map((id) => VIDEO_MAP.get(id))
    .filter((v): v is Video => v !== undefined)
    .filter(isLongVideo);

  const sortBy = opts?.sortBy ?? "playlist_order";
  if (sortBy === "views") {
    videos.sort((a, b) => b.view_count - a.view_count);
  } else if (sortBy === "date") {
    videos.sort((a, b) => (a.published_at < b.published_at ? 1 : -1));
  }
  return videos;
}

/**
 * 获取所有不在任何 playlist 里的视频 ("孤儿视频").
 * 注: 不过滤 #short, 全部展示.
 */
export function getOrphanVideos(opts?: {
  sortBy?: "views" | "date";
}): Video[] {
  const inPlaylist = new Set<string>();
  rawData.playlists.forEach((pl) =>
    pl.video_ids.forEach((id) => inPlaylist.add(id)),
  );

  const orphans = rawData.videos.filter((v) => !inPlaylist.has(v.video_id));

  const sortBy = opts?.sortBy ?? "views";
  if (sortBy === "views") {
    orphans.sort((a, b) => b.view_count - a.view_count);
  } else {
    orphans.sort((a, b) => (a.published_at < b.published_at ? 1 : -1));
  }
  return orphans;
}

// ============ Top videos (首页屏 4 用) ============

export function getTopVideos(n: number): Video[] {
  return rawData.videos
    .filter(isLongVideo)
    .slice()
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, n);
}

// ============ Formatters ============

export function formatViewCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, "")} 万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function thumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * 从 YouTube 简介原文提取一句话摘要, 用于 VideoObject.description / 卡片简介.
 * 规则: 取第一段非空行 → 去掉「【视频简介】」这类标签和开头符号 → 超长则截到首句 (加省略号).
 * 简介里的链接/时间戳/话题标签都在后续段落, 取第一行天然避开.
 */
export function videoSummary(
  description: string | undefined,
  maxLen = 120,
): string {
  if (!description) return "";
  const firstLine = description
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (!firstLine) return "";

  const s = firstLine
    .replace(/^[【[][^】\]]*[】\]]\s*/, "") // 去掉开头的【xxx】/[xxx] 标签
    .replace(/^[\s•·\-—📌⏱🎥📘🎯👋🔗]+/, "") // 去掉开头项目符号/emoji
    .trim();
  if (!s) return "";
  if (s.length <= maxLen) return s;

  // 超长: 逐句累加到接近 maxLen 为止
  const parts = (s.match(/[^。！？]*[。！？]?/g) || [s]).filter(Boolean);
  let out = "";
  for (const p of parts) {
    if (out && out.length + p.length > maxLen) break;
    out += p;
    if (out.length >= maxLen) break;
  }
  out = out || s.slice(0, maxLen);
  return /[。！？]$/.test(out) ? out : out.replace(/[，、,\s]+\S*$/, "") + "…";
}

/**
 * 从 YouTube watch/embed/youtu.be 链接里抽出 11 位 videoId. 抽不到返回 null.
 */
export function videoIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match?.[1] ?? null;
}

/**
 * 按 videoId 反查频道视频元数据 (title / published_at / duration 等).
 * 用于给嵌了 YouTube 的页面生成 VideoObject 结构化数据. 视频不在频道数据里时返回 undefined.
 */
export function getVideoById(videoId: string): Video | undefined {
  return VIDEO_MAP.get(videoId);
}

/**
 * 秒数转 ISO 8601 时长 (如 PT1H2M3S), Google VideoObject.duration 要求的格式.
 */
export function iso8601Duration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  let out = "PT";
  if (h > 0) out += `${h}H`;
  if (m > 0) out += `${m}M`;
  if (s > 0 || (h === 0 && m === 0)) out += `${s}S`;
  return out;
}
