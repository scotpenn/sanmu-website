import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "文章未找到 · 三木有话说" };
  return {
    title: `${post.title} · 三木有话说`,
    description: post.subtitle,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
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
            <span>{post.readTime}</span>
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
                    {block.text}
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
              if (block.type === "video") {
                return (
                  <div key={idx} className="my-10">
                    <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-3 font-medium">
                      Watch on YouTube
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

      {/* 文末四模块 */}
      <section className="border-t border-rule bg-brand-yellow/[0.05]">
        <Container width="reading" className="py-16 md:py-20 space-y-12">
          {/* 1 · 手册申请 */}
          <div>
            <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-3 font-medium">
              Free Handbook
            </div>
            <h3 className="text-2xl mb-3">想读完这篇之后能直接用的清单？</h3>
            <p className="opacity-80 mb-5 leading-relaxed">
              我整理了一份《身后事安心手册》v2.7，包含遗嘱模板、政府福利申请清单、家人身故必处理 87 件事。留邮箱免费领。
            </p>
            <Button variant="primary" href="/resources/handbook">
              申请索取《身后事安心手册》
            </Button>
          </div>

          {/* 2 · 写信 */}
          <div className="border-t border-rule pt-12">
            <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-3 font-medium">
              Write to me
            </div>
            <h3 className="text-2xl mb-3">写信给三木</h3>
            <p className="opacity-80 mb-5 leading-relaxed">
              你对这篇有想法？或者你身边有类似的故事？写信给我，我会亲自看。
            </p>
            <Button variant="secondary" href="mailto:info@sanmu.ca">
              ✉️ info@sanmu.ca
            </Button>
          </div>

          {/* 3 · 转发邀请 */}
          <div className="border-t border-rule pt-12">
            <p className="text-base opacity-80 leading-relaxed">
              如果你身边正有人需要这些信息，欢迎转发给他们。
              <br />
              这件事，谁都早一点知道好一点。
            </p>
          </div>

          {/* 4 · 返回博客列表 */}
          <div className="border-t border-rule pt-12">
            <Link
              href="/blog"
              className="text-sm font-medium text-brand-navy hover:opacity-80 transition-opacity"
            >
              ← 查看更多文章
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
