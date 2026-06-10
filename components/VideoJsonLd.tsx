import {
  getVideoById,
  thumbnailUrl,
  watchUrl,
  iso8601Duration,
  videoSummary,
  localizeText,
  localizeVideoTitle,
} from "@/lib/videos";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

type Props = {
  /** YouTube videoId (11 位) */
  videoId: string;
  /** 频道数据里查不到视频时, 用作 name 的兜底 (一般传文章/活动标题) */
  fallbackName: string;
  /** VideoObject.description, Google 必填. 传文章摘要 / 活动简介 */
  description: string;
  /** 频道数据里查不到 published_at 时的兜底上传日期 (ISO date, 一般传文章发布日) */
  fallbackUploadDate: string;
  /** 页面语言. 繁体页传 zh-Hant, 让 JSON-LD 的标题/简介也繁体, 与可见文字一致. */
  locale?: Locale;
};

/**
 * 给嵌了 YouTube 的页面注入 schema.org/VideoObject 结构化数据 (JSON-LD).
 * 让 Google 知道「这一页有视频」, 有资格进视频富媒体结果 / 「视频」标签页.
 * 优先用频道 videos.json 里的真实元数据 (标题/上传日/时长/播放量), 查不到则用兜底值.
 */
export function VideoJsonLd({
  videoId,
  fallbackName,
  description,
  fallbackUploadDate,
  locale = DEFAULT_LOCALE,
}: Props) {
  const video = getVideoById(videoId);

  // 简介优先级: 视频自己的 YouTube 简介(清洗后) > 调用方传入的兜底 > 标题
  const videoDesc = videoSummary(video?.description);

  // 繁体页: 标题走覆盖表+机器转繁, 简介机器转繁 (已是繁体的入参转换是幂等的),
  // 保证结构化数据与页面可见文字同语言.
  const name = video
    ? localizeVideoTitle(video.title, locale)
    : localizeText(fallbackName, locale);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description: localizeText(
      videoDesc || description || video?.title || fallbackName,
      locale,
    ),
    thumbnailUrl: thumbnailUrl(videoId),
    uploadDate: video?.published_at ?? fallbackUploadDate,
    contentUrl: watchUrl(videoId),
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  };

  if (video) {
    jsonLd.duration = iso8601Duration(video.duration_seconds);
    jsonLd.interactionStatistic = {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/WatchAction",
      userInteractionCount: video.view_count,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
