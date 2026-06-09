import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { SectionTitle } from "@/components/SectionTitle";
import { getAllPosts, getUpcomingEvents } from "@/lib/notion";
import {
  TRADITIONAL_LOCALE,
  localizedPath,
  minutesLabel,
} from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import {
  getTopVideos,
  formatViewCount,
  thumbnailUrl,
  watchUrl,
  localizeVideoTitle,
} from "@/lib/videos";

export const revalidate = 3600;

export const metadata = pageSeo({
  title: "溫哥華殯葬師陪你看清生死與人生",
  description:
    "16 年北美殯葬經驗，1000+ 真實告別。葬禮避坑、遺囑填坑、政府福利申請、終局思維，海外華人最該看的頻道。",
  path: "/",
  locale: TRADITIONAL_LOCALE,
});

const TRUST_STATS = [
  { value: "16", label: "年北美殯葬" },
  { value: "1000+", label: "真實告別" },
  { value: "6", label: "年頻道營運" },
];

export default async function TraditionalHomePage() {
  const latestPosts = (await getAllPosts(TRADITIONAL_LOCALE)).slice(0, 3);
  const upcomingEvents = (await getUpcomingEvents(TRADITIONAL_LOCALE)).slice(0, 3);
  const topVideos = getTopVideos(3);

  return (
    <>
      <SiteJsonLd locale={TRADITIONAL_LOCALE} />
      <section className="border-b border-rule">
        <Container width="card" className="py-20 md:py-28">
          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
            <div className="md:col-span-7">
              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6">
                你怕什麼，
                <br />
                我就聊什麼。
              </h1>
              <p className="text-lg md:text-xl opacity-80 mb-10 max-w-[480px]">
                溫哥華殯葬師 16 年。送過 1000 多人。拍影片 6 年。
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  href={localizedPath("/resources/handbook", TRADITIONAL_LOCALE)}
                >
                  索取《身後事安心手冊》
                </Button>
                <Button
                  variant="secondary"
                  href={localizedPath("/videos", TRADITIONAL_LOCALE)}
                >
                  觀看最新影片
                </Button>
              </div>
            </div>

            <div className="md:col-span-5 flex justify-center md:justify-end">
              <Link
                href={localizedPath("/resources/handbook", TRADITIONAL_LOCALE)}
                aria-label="查看《身後事安心手冊》完整介紹"
                className="block hover:opacity-90 transition-opacity"
              >
                <Image
                  src="/handbook-cover.png"
                  alt="《身後事安心手冊》v2.7 · 三木有話說頻道整理"
                  width={1414}
                  height={2000}
                  priority
                  className="w-[240px] md:w-[280px] lg:w-[300px] h-auto shadow-xl border border-rule"
                />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-rule bg-brand-yellow/[0.05]">
        <Container width="reading" className="py-20 md:py-24 text-center">
          <SectionTitle align="center" className="mb-6">
            我是三木
          </SectionTitle>
          <p className="text-lg leading-relaxed mb-12 opacity-90">
            我做殯葬師 16 年。送過 1000 多人最後一程。6 年前開始拍影片。把殯儀館內看到的事，講給還來得及的人。
          </p>
          <div className="border-y border-rule py-8 mb-10 grid grid-cols-3 gap-4">
            {TRUST_STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-extrabold text-brand-navy tracking-[-0.02em] mb-1">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm opacity-70 leading-snug">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <Link
            href={localizedPath("/about", TRADITIONAL_LOCALE)}
            className="inline-flex items-center gap-2 text-brand-navy hover:opacity-80 transition-opacity font-medium"
          >
            了解更多關於我 <span aria-hidden>→</span>
          </Link>
        </Container>
      </section>

      <section className="border-b border-rule">
        <Container width="card" className="py-20 md:py-24">
          <SectionTitle align="center">最新內容</SectionTitle>

          <div className="mt-12 mb-16">
            <div className="flex items-end justify-between border-b border-rule pb-3 mb-6">
              <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 font-medium">
                熱門影片 · Top Videos
              </div>
              <a
                href="https://www.youtube.com/@yyds3mu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-navy hover:opacity-80 transition-opacity font-medium"
              >
                去 YouTube 頻道 →
              </a>
            </div>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {topVideos.map((video) => (
                <a
                  key={video.video_id}
                  href={watchUrl(video.video_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="aspect-video relative overflow-hidden bg-rule mb-4">
                    <Image
                      src={thumbnailUrl(video.video_id)}
                      alt={localizeVideoTitle(video.title, TRADITIONAL_LOCALE, video.video_id)}
                      fill
                      sizes="(min-width: 768px) 320px, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-base md:text-lg font-medium leading-snug mb-2 group-hover:text-brand-navy transition-colors">
                    {localizeVideoTitle(video.title, TRADITIONAL_LOCALE, video.video_id)}
                  </h3>
                  <div className="text-xs opacity-50 font-en">
                    {formatViewCount(video.view_count, TRADITIONAL_LOCALE)} views ·{" "}
                    {video.published_at.slice(0, 10)}
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between border-b border-rule pb-3 mb-6">
              <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 font-medium">
                最近文章 · Latest Articles
              </div>
              <Link
                href={localizedPath("/blog", TRADITIONAL_LOCALE)}
                className="text-xs text-brand-navy hover:opacity-80 transition-opacity font-medium"
              >
                查看所有網誌 →
              </Link>
            </div>

            {latestPosts.length === 0 ? (
              <p className="text-sm opacity-60 py-4">
                繁體文章正在整理中 ·{" "}
                <a
                  href="mailto:info@sanmu.ca"
                  className="text-brand-navy hover:opacity-80 transition-opacity font-medium"
                >
                  留 email 第一時間收到新文 →
                </a>
              </p>
            ) : (
              <ul className="space-y-5">
                {latestPosts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={localizedPath(`/blog/${post.slug}`, TRADITIONAL_LOCALE)}
                      className="block hover:opacity-80 transition-opacity"
                    >
                      <h3 className="text-base md:text-lg font-medium leading-snug mb-1">
                        {post.title}
                      </h3>
                      <div className="text-xs opacity-60 font-en">
                        {post.date} · {minutesLabel(post.readMinutes, TRADITIONAL_LOCALE)}
                        {post.tags[0] && ` · ${post.tags[0]}`}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Container>
      </section>

      {/* 線下活動 */}
      {upcomingEvents.length > 0 && (
        <section className="border-b border-rule">
          <Container width="card" className="py-20 md:py-24">
            <SectionTitle align="center">最近的線下活動</SectionTitle>
            <div className="max-w-2xl mx-auto mt-8 space-y-4">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.slug}
                  href={localizedPath(`/events/${event.slug}`, TRADITIONAL_LOCALE)}
                  className="block border border-rule bg-brand-yellow/10 p-6 md:p-7 hover:border-brand-navy transition-colors group"
                >
                  <div className="text-xs font-en uppercase tracking-widest text-brand-navy/70 mb-2 font-medium">
                    即將舉辦 · Upcoming
                  </div>
                  <h3 className="text-lg md:text-xl mb-2 group-hover:text-brand-navy transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm opacity-75 leading-relaxed line-clamp-2">
                    {event.summary}
                  </p>
                </Link>
              ))}
              <div className="text-center pt-2">
                <Link
                  href={localizedPath("/events", TRADITIONAL_LOCALE)}
                  className="text-sm font-medium text-brand-navy hover:opacity-80 transition-opacity"
                >
                  查看全部活動 →
                </Link>
              </div>
            </div>
          </Container>
        </section>
      )}

      <section className="bg-brand-navy text-paper">
        <Container width="reading" className="py-20 md:py-24 text-center">
          <h2 className="text-3xl md:text-4xl text-paper mb-6 font-extrabold tracking-[-0.01em]">
            免費索取《身後事安心手冊》v2.7
          </h2>
          <p className="text-lg opacity-90 mb-4 max-w-[560px] mx-auto leading-relaxed">
            8 份文件 · 80+ 頁 · 加拿大場景
          </p>
          <p className="text-base opacity-80 mb-10 max-w-[560px] mx-auto leading-relaxed">
            它不能替你做所有決定，但能讓你比大多數家庭少踩很多坑。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`${localizedPath("/resources/handbook", TRADITIONAL_LOCALE)}#get`}
              className="inline-block px-7 py-3 bg-brand-yellow text-brand-navy font-medium hover:opacity-90 transition-opacity"
            >
              ✉️ 免費索取手冊
            </Link>
            <Link
              href={localizedPath("/resources/handbook", TRADITIONAL_LOCALE)}
              className="inline-block px-7 py-3 border border-paper/40 text-paper hover:bg-paper/10 transition-colors"
            >
              先看完整介紹 →
            </Link>
          </div>
          <p className="mt-8 text-xs opacity-50">
            填一下信箱和稱呼 · 手冊自動寄到你信箱 · 含 PDF 附件
          </p>
        </Container>
      </section>
    </>
  );
}
