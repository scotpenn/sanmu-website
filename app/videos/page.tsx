import Image from "next/image";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import {
  getAllPlaylists,
  getPlaylistVideos,
  formatViewCount,
  thumbnailUrl,
  watchUrl,
  type Video,
  type Playlist,
} from "@/lib/videos";

export const metadata = {
  title: "视频内容 · 三木有话说",
  description:
    "三木在 YouTube 上聊过的所有事 · 按主题系列分组 · 殡葬师手记 / 人生必修课 / 给家人的安心说明书 / 殡葬业热点 / 华人家庭遗产避坑.",
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

function PlaylistSection({ playlist }: { playlist: Playlist }) {
  const videos = getPlaylistVideos(playlist.id, { sortBy: "views" });
  if (videos.length === 0) return null;

  return (
    <section className="border-b border-rule">
      <Container width="card" className="py-16 md:py-20">
        <div className="border-b border-rule pb-6 mb-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
            <h2 className="text-2xl md:text-3xl">{playlist.title}</h2>
            <div className="text-xs font-en uppercase tracking-wider text-brand-navy/70 font-medium">
              {videos.length} videos
            </div>
          </div>
          {playlist.description && (
            <p className="text-base opacity-80 leading-relaxed max-w-[720px] whitespace-pre-line">
              {playlist.description}
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

// 排序: 按 video 数量降序 (内容厚度优先)
function sortPlaylists(playlists: Playlist[]): Playlist[] {
  return playlists.slice().sort((a, b) => b.item_count - a.item_count);
}

export default function VideosPage() {
  const playlists = sortPlaylists(getAllPlaylists());

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
            按 {playlists.length} 个主题系列分组 · 点视频跳 YouTube 观看
          </p>
        </Container>
      </section>

      {/* 5 个 playlist sections */}
      {playlists.map((pl) => (
        <PlaylistSection key={pl.id} playlist={pl} />
      ))}

      {/* 底部 · YouTube 频道引流 */}
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
