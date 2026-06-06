import Image from "next/image";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import {
  getAllPlaylists,
  getPlaylistVideos,
  getOrphanVideos,
  formatViewCount,
  thumbnailUrl,
  watchUrl,
  localizeText,
  localizeVideoTitle,
  type Video,
  type Playlist,
} from "@/lib/videos";
import { VideoJsonLd } from "@/components/VideoJsonLd";
import { TRADITIONAL_LOCALE } from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "影片內容",
  description:
    "三木在 YouTube 上聊過的所有事，按主題系列分組：殯葬師手記、人生必修課、給家人的安心說明書、華人家庭遺產避坑。",
  path: "/videos",
  locale: TRADITIONAL_LOCALE,
});

function VideoCard({ video }: { video: Video }) {
  return (
    <a
      href={watchUrl(video.video_id)}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <VideoJsonLd
        videoId={video.video_id}
        fallbackName={video.title}
        description={video.title}
        fallbackUploadDate={video.published_at}
        locale={TRADITIONAL_LOCALE}
      />
      <div className="aspect-video relative overflow-hidden bg-rule mb-3">
        <Image
          src={thumbnailUrl(video.video_id)}
          alt={localizeVideoTitle(video.title, TRADITIONAL_LOCALE, video.video_id)}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h3 className="text-sm md:text-base font-medium leading-snug mb-1 group-hover:text-brand-navy transition-colors">
        {localizeVideoTitle(video.title, TRADITIONAL_LOCALE, video.video_id)}
      </h3>
      <div className="text-xs opacity-60 font-en">
        {formatViewCount(video.view_count, TRADITIONAL_LOCALE)} views · {video.published_at.slice(0, 10)}
      </div>
    </a>
  );
}

function PlaylistSection({ playlist }: { playlist: Playlist }) {
  const videos = getPlaylistVideos(playlist.id, { sortBy: "views" });
  if (videos.length === 0) return null;

  return (
    <section className="border-b border-rule">
      <Container width="card" className="py-16 md:py-20">
        <div className="border-b border-rule pb-6 mb-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
            <h2 className="text-2xl md:text-3xl">
              {localizeText(playlist.title, TRADITIONAL_LOCALE)}
            </h2>
            <div className="text-xs font-en uppercase tracking-wider text-brand-navy/70 font-medium">
              {videos.length} videos
            </div>
          </div>
          {playlist.description && (
            <p className="text-base opacity-80 leading-relaxed max-w-[720px] whitespace-pre-line">
              {localizeText(playlist.description, TRADITIONAL_LOCALE)}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          {videos.map((v) => (
            <VideoCard key={v.video_id} video={v} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default function TraditionalVideosPage() {
  const playlists = getAllPlaylists().slice().sort((a, b) => b.item_count - a.item_count);
  const orphans = getOrphanVideos({ sortBy: "views" });

  return (
    <>
      <section className="border-b border-rule">
        <Container width="card" className="py-16 md:py-20">
          <SectionTitle eyebrow="VIDEOS">影片內容</SectionTitle>
          <p className="text-lg opacity-80 leading-relaxed">
            三木在 YouTube 上聊過的所有事。
          </p>
          <p className="text-sm opacity-60 mt-3">
            按 {playlists.length} 個主題系列分組 · 點影片跳 YouTube 觀看
          </p>
        </Container>
      </section>

      {playlists.map((pl) => (
        <PlaylistSection key={pl.id} playlist={pl} />
      ))}

      {orphans.length > 0 && (
        <section className="border-b border-rule">
          <Container width="card" className="py-16 md:py-20">
            <div className="border-b border-rule pb-6 mb-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
                <h2 className="text-2xl md:text-3xl">其他影片</h2>
                <div className="text-xs font-en uppercase tracking-wider text-brand-navy/70 font-medium">
                  {orphans.length} videos
                </div>
              </div>
              <p className="text-base opacity-70 leading-relaxed max-w-[720px]">
                尚未歸入主題系列的內容。
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
              {orphans.map((v) => (
                <VideoCard key={v.video_id} video={v} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section>
        <Container width="card" className="py-16 text-center">
          <p className="text-sm opacity-70 mb-3">
            想看完整最新更新，關注我的 YouTube 頻道。
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
