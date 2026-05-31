import Image from "next/image";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import {
  getCategoryVideos,
  CATEGORY_META,
  formatViewCount,
  thumbnailUrl,
  watchUrl,
  type Video,
  type VideoCategory,
} from "@/lib/videos";

export const metadata = {
  title: "视频内容 · 三木有话说",
  description:
    "三木在 YouTube 上聊过的所有事 · 破圈精选、实用指南、留存系列 三大主题。",
};

function VideoCard({ video }: { video: Video }) {
  return (
    <a
      href={watchUrl(video.video_id)}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="aspect-video relative overflow-hidden bg-rule mb-3">
        <Image
          src={thumbnailUrl(video.video_id)}
          alt={video.title}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h3 className="text-sm md:text-base font-medium leading-snug mb-1 group-hover:text-brand-navy transition-colors">
        {video.title}
      </h3>
      <div className="text-xs opacity-60 font-en">
        {formatViewCount(video.view_count)} views · {video.published_at.slice(0, 10)}
      </div>
    </a>
  );
}

function CategorySection({ category }: { category: VideoCategory }) {
  const videos = getCategoryVideos(category);
  const meta = CATEGORY_META[category];

  if (videos.length === 0) return null;

  return (
    <section className="border-b border-rule">
      <Container width="card" className="py-16 md:py-20">
        <div className="flex items-end justify-between border-b border-rule pb-3 mb-6">
          <div>
            <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-1 font-medium">
              {meta.en}
            </div>
            <h2 className="text-2xl md:text-3xl">{meta.label}</h2>
          </div>
          <div className="text-sm opacity-60 hidden md:block">
            {videos.length} 个视频
          </div>
        </div>
        <p className="text-sm opacity-70 mb-8">{meta.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          {videos.map((v) => (
            <VideoCard key={v.video_id} video={v} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default function VideosPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <Container width="card" className="py-16 md:py-20">
          <SectionTitle eyebrow="VIDEOS">视频内容</SectionTitle>
          <p className="text-lg opacity-80 leading-relaxed">
            三木在 YouTube 上聊过的所有事。
          </p>
          <p className="text-sm opacity-60 mt-3">
            按主题分三类 · 点任意视频跳 YouTube 观看
          </p>
        </Container>
      </section>

      {/* 三大子分类 · 按 PRD §4.4 */}
      <CategorySection category="feature" />
      <CategorySection category="practical" />
      <CategorySection category="evergreen" />

      {/* 底部 · 去 YouTube 频道 */}
      <section>
        <Container width="card" className="py-16 text-center">
          <p className="text-sm opacity-70 mb-3">
            想看完整最新更新，关注我的 YouTube 频道。
          </p>
          <a
            href="https://www.youtube.com/@yyds3mu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-base font-medium text-brand-navy hover:opacity-80 transition-opacity"
          >
            前往 YouTube · @yyds3mu →
          </a>
        </Container>
      </section>
    </>
  );
}
