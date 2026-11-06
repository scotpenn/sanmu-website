export const REFERRAL_SOURCES = [
  "youtube",
  "xiaohongshu",
  "douyin",
  "other_social_media",
  "google",
  "website",
  "friend_referral",
  "other",
] as const;

export type ReferralSource = (typeof REFERRAL_SOURCES)[number];

export const REFERRAL_SOURCE_NOTION_LABELS: Record<ReferralSource, string> = {
  youtube: "YouTube",
  xiaohongshu: "小红书",
  douyin: "抖音",
  other_social_media: "其他自媒体",
  google: "Google",
  website: "网站",
  friend_referral: "朋友介绍",
  other: "其他",
};

export function isReferralSource(value: string): value is ReferralSource {
  return REFERRAL_SOURCES.includes(value as ReferralSource);
}

/**
 * 单场活动专属的获知渠道(如推荐人), 在 Notion 活动库「额外获知渠道」里配置.
 * 表单 value 用此前缀与固定渠道区分; 写入报名库时直接用名字作为「获知渠道」.
 */
export const EXTRA_REFERRAL_PREFIX = "extra:";
