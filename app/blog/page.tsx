import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { getAllPosts, type PostMeta, type PostCategory } from "@/lib/notion";
import {
  DEFAULT_LOCALE,
  localizedPath,
  minutesLabel,
  textForLocale,
  type Locale,
} from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";
import { BlogListJsonLd } from "@/components/BlogListJsonLd";

// ISR: 每小时后台刷新, 发新文章后列表自动更新, 无需 redeploy.
export const revalidate = 3600;

export function generateBlogIndexMetadata(locale: Locale) {
  return pageSeo({
    title: textForLocale(locale, "博客", "網誌"),
    description: textForLocale(
      locale,
      "把视频里讲不完的写在这里。葬礼、遗嘱、骨灰、政府福利、原生家庭、中年危机、终局思维 —— 海外华人值得读的深度文章。",
      "把影片裡講不完的寫在這裡。葬禮、遺囑、骨灰、政府福利、原生家庭、中年危機、終局思維 —— 海外華人值得讀的深度文章。",
    ),
    path: "/blog",
    locale,
  });
}

export const metadata = generateBlogIndexMetadata(DEFAULT_LOCALE);

// pillar 总览文(置顶, 不进任何分区, 避免重复)
const PILLAR_SLUG = "canada-end-of-life-complete-guide";

// 三大脉络分区: 与首页三卡片对应, 锚点与首页 href 一致
const BLOG_SECTIONS: {
  key: PostCategory;
  anchor: string;
  title: [string, string];
  intro: [string, string];
}[] = [
  {
    key: "实用指南",
    anchor: "guides",
    title: ["实用指南", "實用指南"],
    intro: [
      "能直接拿去用的东西。葬礼怎么避坑、遗嘱怎么不填错、政府福利怎么申、家里那份“万一”的档案怎么提前备好——十六年里见过的弯路，我整理成一份份清单，省得你到那一刻才手忙脚乱。",
      "能直接拿去用的東西。葬禮怎麼避坑、遺囑怎麼不填錯、政府福利怎麼申、家裡那份「萬一」的檔案怎麼提前備好——十六年裡見過的彎路，我整理成一份份清單，省得你到那一刻才手忙腳亂。",
    ],
  },
  {
    key: "精神疗愈",
    anchor: "healing",
    title: ["精神疗愈", "精神療癒"],
    intro: [
      "在殡仪馆待久了，看人会换个角度。中年的焦虑、失去亲人的日子、站在终点回望的视角——这些绕不开的事，我想用送过上千人之后的眼光，陪你把心里的结慢慢看清。",
      "在殯儀館待久了，看人會換個角度。中年的焦慮、失去親人的日子、站在終點回望的視角——這些繞不開的事，我想用送過上千人之後的眼光，陪你把心裡的結慢慢看清。",
    ],
  },
  {
    key: "关系重塑",
    anchor: "relationships",
    title: ["关系重塑", "關係重塑"],
    intro: [
      "人走到最后，剩下的全是关系。原生家庭欠下的、和父母还没说出口的、对逝者的那份思念——这些葬礼上反复出现的画面，趁还来得及，我想和你聊聊。",
      "人走到最後，剩下的全是關係。原生家庭欠下的、和父母還沒說出口的、對逝者的那份思念——這些葬禮上反覆出現的畫面，趁還來得及，我想和你聊聊。",
    ],
  },
];

function PostCard({ post, locale }: { post: PostMeta; locale: Locale }) {
  return (
    <article className="border-b border-rule pb-12 last:border-0 last:pb-0">
      <Link
        href={localizedPath(`/blog/${post.slug}`, locale)}
        className="block group"
      >
        {post.tags.length > 0 && (
          <div className="text-xs font-en uppercase tracking-widest text-brand-navy/60 mb-3 font-medium">
            {post.tags.slice(0, 3).map((t, i) => (
              <span key={t}>
                {t}
                {i < Math.min(post.tags.length, 3) - 1 && (
                  <span className="opacity-40 mx-2">·</span>
                )}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-2xl md:text-3xl leading-tight mb-3 group-hover:text-brand-navy transition-colors">
          {post.title}
        </h3>
        <p className="text-lg opacity-80 leading-relaxed mb-4 max-w-[640px]">
          {post.subtitle}
        </p>
        <div className="text-sm opacity-60 font-en flex flex-wrap gap-x-3">
          <time dateTime={post.date}>{post.date}</time>
          <span>·</span>
          <span>{minutesLabel(post.readMinutes, locale)}</span>
        </div>
      </Link>
    </article>
  );
}

export async function BlogIndexPage({
  locale = DEFAULT_LOCALE,
}: {
  locale?: Locale;
}) {
  const posts = await getAllPosts(locale);
  const pillar = posts.find((p) => p.slug === PILLAR_SLUG) ?? null;
  const rest = posts.filter((p) => p.slug !== PILLAR_SLUG);
  const sectionKeys = new Set<PostCategory>(BLOG_SECTIONS.map((s) => s.key));
  const uncategorized = rest.filter(
    (p) => !p.category || !sectionKeys.has(p.category),
  );

  return (
    <>
      <BlogListJsonLd locale={locale ?? DEFAULT_LOCALE} posts={posts} />
      {/* Hero */}
      <section className="border-b border-rule">
        <Container width="card" className="py-16 md:py-20">
          <SectionTitle eyebrow="BLOG">
            {textForLocale(locale, "三木有话说博客", "三木有話說網誌")}
          </SectionTitle>
          <p className="text-lg opacity-80 leading-relaxed">
            {textForLocale(locale, "把视频里讲不完的，写在这里。", "把影片裡講不完的，寫在這裡。")}
          </p>
        </Container>
      </section>

      {/* 从这里开始 · pillar 总览置顶 */}
      {pillar && (
        <section className="border-b border-rule bg-brand-yellow/[0.05]">
          <Container width="card" className="py-12 md:py-16">
            <div className="text-sm font-en uppercase tracking-widest text-brand-navy/70 mb-4 font-medium">
              {textForLocale(locale, "从这里开始", "從這裡開始")} · START HERE
            </div>
            <Link
              href={localizedPath(`/blog/${pillar.slug}`, locale)}
              className="block group"
            >
              <h2 className="text-3xl md:text-4xl leading-tight mb-3 group-hover:text-brand-navy transition-colors">
                {pillar.title}
              </h2>
              <p className="text-lg opacity-80 leading-relaxed mb-4 max-w-[680px]">
                {pillar.subtitle}
              </p>
              <span className="text-sm font-medium text-brand-navy">
                {textForLocale(locale, "阅读完整指南 →", "閱讀完整指南 →")}
              </span>
            </Link>
          </Container>
        </section>
      )}

      {/* 三大脉络分区 */}
      {BLOG_SECTIONS.map((sec) => {
        const items = rest.filter((p) => p.category === sec.key);
        if (items.length === 0) return null;
        return (
          <section
            key={sec.anchor}
            id={sec.anchor}
            className="border-b border-rule scroll-mt-24"
          >
            <Container width="card" className="py-16 md:py-20">
              <SectionTitle>
                {textForLocale(locale, sec.title[0], sec.title[1])}
              </SectionTitle>
              <p className="text-lg opacity-80 leading-relaxed mt-4 mb-12 max-w-[680px]">
                {textForLocale(locale, sec.intro[0], sec.intro[1])}
              </p>
              <div className="grid gap-12">
                {items.map((post) => (
                  <PostCard key={post.slug} post={post} locale={locale} />
                ))}
              </div>
            </Container>
          </section>
        );
      })}

      {/* 未归类文章兜底 */}
      {uncategorized.length > 0 && (
        <section className="border-b border-rule">
          <Container width="card" className="py-16 md:py-20">
            <SectionTitle>{textForLocale(locale, "更多文章", "更多文章")}</SectionTitle>
            <div className="grid gap-12 mt-12">
              {uncategorized.map((post) => (
                <PostCard key={post.slug} post={post} locale={locale} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 底部 CTA */}
      <section>
        <Container
          width="card"
          className="py-12 text-center text-sm opacity-60"
        >
          {textForLocale(locale, "更多文章正在筹备中")} ·{" "}
          <a
            href="mailto:info@sanmu.ca"
            className="text-brand-navy hover:opacity-80 transition-opacity font-medium"
          >
            {textForLocale(locale, "留邮箱第一时间收到新文 →")}
          </a>
        </Container>
      </section>
    </>
  );
}

export default function BlogPage() {
  return <BlogIndexPage locale={DEFAULT_LOCALE} />;
}
