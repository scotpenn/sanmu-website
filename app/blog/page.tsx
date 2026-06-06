import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { getAllPosts } from "@/lib/notion";
import {
  DEFAULT_LOCALE,
  localizedPath,
  minutesLabel,
  textForLocale,
  type Locale,
} from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";

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

export async function BlogIndexPage({
  locale = DEFAULT_LOCALE,
}: {
  locale?: Locale;
}) {
  const posts = await getAllPosts(locale);

  return (
    <>
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

      {/* 文章列表 */}
      <section>
        <Container width="card" className="py-16 md:py-20">
          <div className="grid gap-12">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="border-b border-rule pb-12 last:border-0 last:pb-0"
              >
                <Link
                  href={localizedPath(`/blog/${post.slug}`, locale)}
                  className="block group"
                >
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
                  <h2 className="text-2xl md:text-3xl leading-tight mb-3 group-hover:text-brand-navy transition-colors">
                    {post.title}
                  </h2>
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
            ))}
          </div>

          <div className="mt-16 text-center text-sm opacity-60">
            {textForLocale(locale, "更多文章正在筹备中")} ·{" "}
            <a
              href="mailto:info@sanmu.ca"
              className="text-brand-navy hover:opacity-80 transition-opacity font-medium"
            >
              {textForLocale(locale, "留邮箱第一时间收到新文 →")}
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}

export default function BlogPage() {
  return <BlogIndexPage locale={DEFAULT_LOCALE} />;
}
