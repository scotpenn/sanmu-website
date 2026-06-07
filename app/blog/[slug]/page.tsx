import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import {
  getAllSlugs,
  getPostBySlug,
  getPublishedPostLocales,
  getRelatedPosts,
} from "@/lib/notion";
import { VideoJsonLd } from "@/components/VideoJsonLd";
import { ArticleJsonLd } from "@/components/ArticleJsonLd";
import { RichText } from "@/components/RichText";
import { RelatedPosts } from "@/components/RelatedPosts";
import {
  DEFAULT_LOCALE,
  localizedPath,
  minutesLabel,
  textForLocale,
  type Locale,
} from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";

// ISR: 每小时后台刷新. 改了文章内容后详情页自动更新; build 后新增的文章
// (不在 generateStaticParams 里) 也会在首次访问时按需生成.
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllSlugs(DEFAULT_LOCALE);
  return slugs.map((slug) => ({ slug }));
}

export async function generatePostMetadata(slug: string, locale: Locale) {
  const post = await getPostBySlug(slug, locale);
  if (!post) {
    return pageSeo({
      title: textForLocale(locale, "文章未找到"),
      description: textForLocale(locale, "这篇文章不存在或尚未发布。"),
      path: `/blog/${slug}`,
      locale,
    });
  }
  const availableLocales = await getPublishedPostLocales(post.slug);
  return pageSeo({
    title: post.title,
    description: post.subtitle,
    path: `/blog/${post.slug}`,
    locale,
    type: "article",
    availableLocales: availableLocales.length ? availableLocales : [locale],
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return generatePostMetadata(slug, DEFAULT_LOCALE);
}

export async function BlogPostPage({
  slug,
  locale = DEFAULT_LOCALE,
}: {
  slug: string;
  locale?: Locale;
}) {
  const post = await getPostBySlug(slug, locale);
  if (!post) notFound();
  const related = await getRelatedPosts(slug, 3, locale);

  return (
    <>
      <ArticleJsonLd post={post} locale={locale} />
      {/* 文章头 */}
      <section className="border-b border-rule">
        <Container width="reading" className="py-16 md:py-20">
          <div className="text-xs font-en uppercase tracking-widest text-brand-navy/60 mb-5 font-medium">
            {post.tags.map((t, i) => (
              <span key={t}>
                {t}
                {i < post.tags.length - 1 && (
                  <span className="opacity-40 mx-2">·</span>
                )}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
            {post.title}
          </h1>
          <p className="text-lg md:text-xl opacity-85 leading-relaxed mb-8">
            {post.subtitle}
          </p>
          <div className="text-sm opacity-60 font-en flex flex-wrap gap-x-3">
            <time dateTime={post.date}>{post.date}</time>
            <span>·</span>
            <span>{minutesLabel(post.readMinutes, locale)}</span>
            <span>·</span>
            <span>三木</span>
          </div>
        </Container>
      </section>

      {/* 正文 */}
      <article>
        <Container width="reading" className="py-12 md:py-16">
          <div className="space-y-7">
            {post.blocks.map((block, idx) => {
              if (block.type === "paragraph") {
                return (
                  <p key={idx} className="text-lg leading-[1.85]">
                    <RichText segments={block.segments} />
                  </p>
                );
              }
              if (block.type === "quote") {
                return (
                  <blockquote
                    key={idx}
                    className="font-serif text-xl md:text-2xl text-brand-navy border-l-4 border-brand-yellow pl-6 my-10 leading-relaxed"
                  >
                    {block.text}
                  </blockquote>
                );
              }
              if (block.type === "heading") {
                const Tag = block.level === 2 ? "h2" : "h3";
                return (
                  <Tag
                    key={idx}
                    className={
                      block.level === 2
                        ? "text-2xl md:text-3xl mt-12 mb-4"
                        : "text-xl md:text-2xl mt-10 mb-3"
                    }
                  >
                    {block.text}
                  </Tag>
                );
              }
              if (block.type === "video") {
                return (
                  <div key={idx} className="my-10">
                    <VideoJsonLd
                      videoId={block.videoId}
                      fallbackName={post.title}
                      description={post.subtitle}
                      fallbackUploadDate={post.date}
                      locale={locale}
                    />
                    <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-3 font-medium">
                      {textForLocale(locale, "Watch on YouTube")}
                    </div>
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${block.videoId}`}
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </Container>
      </article>

      {/* 相关阅读 */}
      {related.length > 0 && (
        <section className="border-t border-rule">
          <Container width="reading" className="py-16 md:py-20">
            <RelatedPosts posts={related} locale={locale} />
          </Container>
        </section>
      )}

      {/* 文末四模块 */}
      <section className="border-t border-rule bg-brand-yellow/[0.05]">
        <Container width="reading" className="py-16 md:py-20 space-y-12">
          {/* 1 · 手册申请 */}
          <div>
            <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-3 font-medium">
              Free Handbook
            </div>
            <h3 className="text-2xl mb-3">
              {textForLocale(locale, "想读完这篇之后能直接用的清单？")}
            </h3>
            <p className="opacity-80 mb-5 leading-relaxed">
              {textForLocale(
                locale,
                "我整理了一份《身后事安心手册》v2.7，包含遗嘱模板、政府福利申请清单、家人身故必处理 87 件事。留邮箱免费领。",
              )}
            </p>
            <Button
              variant="primary"
              href={localizedPath("/resources/handbook", locale)}
            >
              {textForLocale(locale, "申请索取《身后事安心手册》")}
            </Button>
          </div>

          {/* 2 · 写信 */}
          <div className="border-t border-rule pt-12">
            <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-3 font-medium">
              Write to me
            </div>
            <h3 className="text-2xl mb-3">
              {textForLocale(locale, "写信给三木")}
            </h3>
            <p className="opacity-80 mb-5 leading-relaxed">
              {textForLocale(
                locale,
                "你对这篇有想法？或者你身边有类似的故事？写信给我，我会亲自看。",
              )}
            </p>
            <Button variant="secondary" href="mailto:info@sanmu.ca">
              ✉️ info@sanmu.ca
            </Button>
          </div>

          {/* 3 · 转发邀请 */}
          <div className="border-t border-rule pt-12">
            <p className="text-base opacity-80 leading-relaxed">
              {textForLocale(locale, "如果你身边正有人需要这些信息，欢迎转发给他们。", "如果你身邊正有人需要這些資訊，歡迎轉發給他們。")}
              <br />
              {textForLocale(locale, "这件事，谁都早一点知道好一点。")}
            </p>
          </div>

          {/* 4 · 返回博客列表 */}
          <div className="border-t border-rule pt-12">
            <Link
              href={localizedPath("/blog", locale)}
              className="text-sm font-medium text-brand-navy hover:opacity-80 transition-opacity"
            >
              {textForLocale(locale, "← 查看更多文章")}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostPage slug={slug} locale={DEFAULT_LOCALE} />;
}
