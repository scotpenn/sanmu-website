import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { SectionTitle } from "@/components/SectionTitle";
import { getAllPosts, getUpcomingEvents } from "@/lib/notion";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";
import {
  getTopVideos,
  formatViewCount,
  thumbnailUrl,
  watchUrl,
} from "@/lib/videos";

// ISR: 每小时后台刷新, 首页"最近文章"发新文后自动更新, 无需 redeploy.
export const revalidate = 3600;

export const metadata = pageSeo({
  title: "温哥华殡葬师陪你看清生死与人生",
  description:
    "16 年北美殡葬经验，1000+ 真实告别。葬礼避坑、遗嘱填坑、政府福利申请、终局思维 —— 海外华人最该看的频道。",
  path: "/",
  locale: DEFAULT_LOCALE,
});

const TRUST_STATS = [
  { value: "16", label: "年北美殡葬" },
  { value: "1000+", label: "真实告别" },
  { value: "6", label: "年频道运营" },
];

// RECENT_POSTS 已迁移到 Notion (Phase 2.1). 见 lib/notion.ts.

// RECENT_VIDEOS 已迁到 lib/videos.ts (Phase 2.3) · 从 lib/data/videos.json 动态读取 top 3

const TOPIC_CATEGORIES = [
  {
    title: "实用指南",
    description:
      "葬礼避坑、遗嘱填坑、骨灰运输、政府福利申请 —— 一份能直接用的清单。",
    href: "/blog",
  },
  {
    title: "精神疗愈",
    description:
      "精神内耗、中年危机、终局思维 —— 从殡仪馆内的视角，看清你的纠结。",
    href: "/blog",
  },
  {
    title: "关系重塑",
    description: "婚姻、原生家庭、无效社交 —— 殡仪馆里看到的真实关系。",
    href: "/blog",
  },
];

export default async function HomePage() {
  const latestPosts = (await getAllPosts()).slice(0, 3);
  const upcomingEvents = (await getUpcomingEvents()).slice(0, 3);
  const topVideos = getTopVideos(3);

  return (
    <>
      <SiteJsonLd locale={DEFAULT_LOCALE} />
      {/* 屏 1 · Hero */}
      <section className="border-b border-rule">
        <Container width="card" className="py-20 md:py-28">
          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
            {/* 左侧文字 */}
            <div className="md:col-span-7">
              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6">
                你怕什么，
                <br />
                我就聊什么。
              </h1>
              <p className="text-lg md:text-xl opacity-80 mb-10 max-w-[480px]">
                温哥华殡葬师 16 年。送过 1000 多人。拍视频 6 年。
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" href="/resources/handbook">
                  索取《身后事安心手册》
                </Button>
                <Button variant="secondary" href="/videos">
                  观看最新视频
                </Button>
              </div>
            </div>

            {/* 右侧手册封面 · 点击跳 /resources/handbook */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <Link
                href="/resources/handbook"
                aria-label="查看《身后事安心手册》完整介绍"
                className="block hover:opacity-90 transition-opacity"
              >
                <Image
                  src="/handbook-cover.png"
                  alt="《身后事安心手册》v2.7 · 三木有话说频道整理"
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

      {/* 屏 2 · 我是三木 + 信任数字带 · 暖黄淡底 */}
      <section className="border-b border-rule bg-brand-yellow/[0.05]">
        <Container width="reading" className="py-20 md:py-24 text-center">
          <SectionTitle align="center" className="mb-6">
            我是三木
          </SectionTitle>

          <p className="text-lg leading-relaxed mb-12 opacity-90">
            我做殡葬师 16 年。送过 1000 多人最后一程。6 年前开始拍视频。把殡仪馆内看到的事，讲给还来得及的人。时间永远比你以为的少。
          </p>

          {/* 信任数字带 */}
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
            href="/about"
            className="inline-flex items-center gap-2 text-brand-navy hover:opacity-80 transition-opacity font-medium"
          >
            了解更多关于我 <span aria-hidden>→</span>
          </Link>
        </Container>
      </section>

      {/* 屏 3 · 我聊三类话题 */}
      <section className="border-b border-rule">
        <Container width="card" className="py-20 md:py-24">
          <SectionTitle align="center">我聊三类话题</SectionTitle>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mt-12">
            {TOPIC_CATEGORIES.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="block border border-rule p-8 hover:border-brand-navy hover:bg-brand-navy/[0.02] transition-colors"
              >
                <h3 className="text-xl md:text-2xl mb-4">{cat.title}</h3>
                <p className="text-sm leading-relaxed opacity-80 mb-6">
                  {cat.description}
                </p>
                <span className="text-sm font-medium text-brand-navy">
                  查看相关内容 →
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 屏 4 · 最新内容 · 视频 3 列网格 + 文章紧凑 list */}
      <section className="border-b border-rule">
        <Container width="card" className="py-20 md:py-24">
          <SectionTitle align="center">最新内容</SectionTitle>

          {/* 最热视频 · 3 列卡片带 thumbnail */}
          <div className="mt-12 mb-16">
            <div className="flex items-end justify-between border-b border-rule pb-3 mb-6">
              <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 font-medium">
                最热视频 · Top Videos
              </div>
              <a
                href="https://www.youtube.com/@yyds3mu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-navy hover:opacity-80 transition-opacity font-medium"
              >
                去 YouTube 频道 →
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
                      alt={video.title}
                      fill
                      sizes="(min-width: 768px) 320px, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-base md:text-lg font-medium leading-snug mb-2 group-hover:text-brand-navy transition-colors">
                    {video.title}
                  </h3>
                  <div className="text-xs opacity-50 font-en">
                    {formatViewCount(video.view_count)} views · {video.published_at.slice(0, 10)}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* 最近文章 · 紧凑 list */}
          <div>
            <div className="flex items-end justify-between border-b border-rule pb-3 mb-6">
              <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 font-medium">
                最近文章 · Latest Articles
              </div>
              <Link
                href="/blog"
                className="text-xs text-brand-navy hover:opacity-80 transition-opacity font-medium"
              >
                查看所有博客 →
              </Link>
            </div>

            {latestPosts.length === 0 ? (
              <p className="text-sm opacity-60 py-4">
                博客刚开张，还没有文章 ·{" "}
                <a
                  href="mailto:info@sanmu.ca"
                  className="text-brand-navy hover:opacity-80 transition-opacity font-medium"
                >
                  留邮箱第一时间收到新文 →
                </a>
              </p>
            ) : (
              <ul className="space-y-5">
                {latestPosts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block hover:opacity-80 transition-opacity"
                    >
                      <h3 className="text-base md:text-lg font-medium leading-snug mb-1">
                        {post.title}
                      </h3>
                      <div className="text-xs opacity-60 font-en">
                        {post.date} · {post.readMinutes} 分钟
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

      {/* 屏 5a · 线下活动 */}
      <section className="border-b border-rule">
        <Container width="card" className="py-20 md:py-24">
          <SectionTitle align="center">最近的线下活动</SectionTitle>

          {upcomingEvents.length > 0 ? (
            <div className="max-w-2xl mx-auto mt-8 space-y-4">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.slug}
                  href={`/events/${event.slug}`}
                  className="block border border-rule bg-brand-yellow/10 p-6 md:p-7 hover:border-brand-navy transition-colors group"
                >
                  <div className="text-xs font-en uppercase tracking-widest text-brand-navy/70 mb-2 font-medium">
                    即将举办 · Upcoming
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
                  href="/events"
                  className="text-sm font-medium text-brand-navy hover:opacity-80 transition-opacity"
                >
                  查看全部活动 →
                </Link>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto border border-rule bg-brand-yellow/10 p-8 text-center mt-8">
              <p className="text-lg mb-2">📅 下一场活动正在筹备中</p>
              <p className="text-sm opacity-70 mb-6">
                留下邮箱，第一时间收到通知
              </p>
              <Link
                href="/events"
                className="text-sm font-medium text-brand-navy hover:opacity-80 transition-opacity"
              >
                查看全部活动 →
              </Link>
            </div>
          )}
        </Container>
      </section>

      {/* 屏 5b · 手册申请 · JC 风藏蓝实底 hard CTA */}
      <section className="bg-brand-navy text-paper">
        <Container width="reading" className="py-20 md:py-24 text-center">
          <h2 className="text-3xl md:text-4xl text-paper mb-6 font-extrabold tracking-[-0.01em]">
            免费索取《身后事安心手册》v2.7
          </h2>
          <p className="text-lg opacity-90 mb-4 max-w-[560px] mx-auto leading-relaxed">
            8 份文档 · 80+ 页 · 加拿大场景
          </p>
          <p className="text-base opacity-80 mb-10 max-w-[560px] mx-auto leading-relaxed">
            整理 1 年。迭代 7 版。它不会让你看完就死无牵挂，但能让你比 90% 的家庭少踩很多坑。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/resources/handbook#get"
              className="inline-block px-7 py-3 bg-brand-yellow text-brand-navy font-medium hover:opacity-90 transition-opacity"
            >
              ✉️ 免费索取手册
            </Link>
            <Link
              href="/resources/handbook"
              className="inline-block px-7 py-3 border border-paper/40 text-paper hover:bg-paper/10 transition-colors"
            >
              先看完整介绍 →
            </Link>
          </div>
          <p className="mt-8 text-xs opacity-50">
            填一下邮箱和称呼 · 手册自动发到你邮箱 · 含 PDF 附件
          </p>
        </Container>
      </section>
    </>
  );
}
