import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { SectionTitle } from "@/components/SectionTitle";
import { HandbookSignupForm } from "@/components/HandbookSignupForm";

const TRUST_STATS = [
  { value: "16", label: "年北美殡葬经验" },
  { value: "1000+", label: "真实告别经历" },
  { value: "12", label: "大主题持续输出" },
];

const RECENT_POSTS = [
  {
    title: "加拿大葬礼费用：8 件家属一定要避开的坑",
    date: "2026-05-22",
    readTime: "8 分钟",
    tag: "葬礼",
  },
  {
    title: "中年精神内耗，是因为你还没看清这件事",
    date: "2026-05-15",
    readTime: "6 分钟",
    tag: "内耗",
  },
  {
    title: "海外华人遗产传承：3 个最常见的法律误区",
    date: "2026-05-08",
    readTime: "10 分钟",
    tag: "遗产和遗嘱",
  },
];

const RECENT_VIDEOS = [
  {
    videoId: "DYV4Ps3UqDQ",
    title: "送走1000人再无精神内耗-我用“殡葬师思维”戒掉了精神内耗",
    hook: "在火化炉前 16 年，我用一种特殊的方式想通了。现在分享给你。",
    views: "209K",
    date: "2025-11-28",
  },
  {
    videoId: "5OoMNtryaBY",
    title: "人间幸福大半是假：刻完上百块墓碑，我发现多数人的“幸福”都是假的",
    hook: "刻完上百块墓碑后，多数人挂在墙上的「幸福」，回头看都是假的。",
    views: "100K",
    date: "2026-03-06",
  },
  {
    videoId: "FrDlYi50hGQ",
    title: "加拿大遗嘱八个大坑千万别踩",
    hook: "这 8 个坑我亲眼看过太多家庭踩 —— 一份能直接照着填的清单。",
    views: "76K",
    date: "2025-09-06",
  },
];

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
      "精神内耗、中年危机、终局思维 —— 从火化炉前的视角，看清你的纠结。",
    href: "/blog",
  },
  {
    title: "关系重塑",
    description: "婚姻、原生家庭、无效社交 —— 殡仪馆里看到的真实关系。",
    href: "/blog",
  },
];

export default function HomePage() {
  return (
    <>
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
                温哥华殡葬师 · 用 16 年告别经验，陪你看清生死与人生
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

            {/* 右侧手册封面 */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <Image
                src="/handbook-cover.jpg"
                alt="《身后事安心手册》v2.7 · 三木有话说频道整理"
                width={1655}
                height={2340}
                priority
                className="w-[240px] md:w-[280px] lg:w-[300px] h-auto shadow-xl border border-rule"
              />
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
            我做殡葬师 16 年。送过 1000 多个人最后一程。三年前开始拍视频，把火化炉前看到的事讲给还来得及的人听 —— 因为时间永远比你以为的少。
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
              {RECENT_VIDEOS.map((video) => (
                <a
                  key={video.videoId}
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="aspect-video relative overflow-hidden bg-rule mb-4">
                    <Image
                      src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
                      alt={video.title}
                      fill
                      sizes="(min-width: 768px) 320px, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-base md:text-lg font-medium leading-snug mb-2 group-hover:text-brand-navy transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm opacity-70 leading-relaxed mb-3">
                    {video.hook}
                  </p>
                  <div className="text-xs opacity-50 font-en">
                    {video.views} views · {video.date}
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

            <ul className="space-y-5">
              {RECENT_POSTS.map((post) => (
                <li key={post.title}>
                  <Link
                    href="/blog"
                    className="block hover:opacity-80 transition-opacity"
                  >
                    <h3 className="text-base md:text-lg font-medium leading-snug mb-1">
                      {post.title}
                    </h3>
                    <div className="text-xs opacity-60 font-en">
                      {post.date} · {post.readTime} · {post.tag}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* 屏 5a · 线下活动 */}
      <section className="border-b border-rule">
        <Container width="card" className="py-20 md:py-24">
          <SectionTitle align="center">最近的线下活动</SectionTitle>

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
        </Container>
      </section>

      {/* 屏 5b · 手册申请 · JC 风藏蓝实底 hard CTA */}
      <section className="bg-brand-navy text-paper">
        <Container width="reading" className="py-20 md:py-24 text-center">
          <div className="text-sm font-en uppercase tracking-wider opacity-60 mb-3 font-medium">
            Free Handbook
          </div>
          <h2 className="text-3xl md:text-4xl text-paper mb-6 font-extrabold tracking-[-0.01em]">
            免费索取《身后事安心手册》
          </h2>
          <p className="text-lg opacity-90 mb-10 max-w-[520px] mx-auto leading-relaxed">
            这份手册我整理了一年，迭代过 7 个版本。它不会让你看完就死无牵挂，但能让你比 90% 的家庭少踩很多坑。留下邮箱，我把它发给你。
          </p>
          <HandbookSignupForm />
          <p className="mt-6 text-xs opacity-50">
            我不会群发广告 · 任何时候可一键退订
          </p>
        </Container>
      </section>
    </>
  );
}
