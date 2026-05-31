import data from "./data/videos.json";

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

export type VideoCategory = "feature" | "practical" | "evergreen";

export const CATEGORY_META: Record<
  VideoCategory,
  { label: string; en: string; description: string }
> = {
  feature: {
    label: "破圈精选",
    en: "Featured",
    description: "突破核心受众的高播放代表作",
  },
  practical: {
    label: "实用指南",
    en: "How-to Guides",
    description: "遗嘱 / 葬礼 / 政府福利 等可直接照做的清单",
  },
  evergreen: {
    label: "留存系列",
    en: "Evergreen",
    description: "长期可看的人生议题深度内容",
  },
};

// 高于此阈值归入 "破圈精选"
const FEATURE_VIEW_THRESHOLD = 30000;

// 实用指南关键词. 标题包含任意一个即归入此类.
const PRACTICAL_KEYWORDS =
  /遗嘱|葬礼|骨灰|福利|申请|如何|怎么|应该|生前|手册|墓地|火葬|土葬|临终|步骤|攻略|清单|流程|大坑|避坑/;

export function categorize(video: Video): VideoCategory {
  if (video.view_count >= FEATURE_VIEW_THRESHOLD) return "feature";
  if (PRACTICAL_KEYWORDS.test(video.title)) return "practical";
  return "evergreen";
}

// 排除 shorts (标题含 #short)
function isLongVideo(v: Video): boolean {
  return !v.title.includes("#short");
}

export function getAllVideos(): Video[] {
  return (data.videos as Video[]).filter(isLongVideo);
}

export function getCategoryVideos(cat: VideoCategory): Video[] {
  return getAllVideos()
    .filter((v) => categorize(v) === cat)
    .sort((a, b) => b.view_count - a.view_count);
}

export function getTopVideos(n: number): Video[] {
  return getAllVideos()
    .slice()
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, n);
}

// 209,682 -> "20.9 万"
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
