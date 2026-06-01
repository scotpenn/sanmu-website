import data from "./data/videos.json";

// ============ Types ============

export type Video = {
  video_id: string;
  title: string;
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
