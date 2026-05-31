import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { getAllPosts } from "@/lib/notion";

export const metadata = {
  title: "博客 · 三木有话说",
  description:
    "把视频里讲不完的写在这里。葬礼、遗嘱、骨灰、政府福利、原生家庭、中年危机、终局思维 —— 海外华人值得读的深度文章。",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <Container width="card" className="py-16 md:py-20">
          <SectionTitle eyebrow="BLOG">三木有话说博客</SectionTitle>
          <p className="text-lg opacity-80 leading-relaxed">
            把视频里讲不完的，写在这里。
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
                  href={`/blog/${post.slug}`}
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
                    <span>{post.readMinutes} 分钟</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-16 text-center text-sm opacity-60">
            更多文章正在筹备中 ·{" "}
            <a
              href="mailto:info@sanmu.ca"
              className="text-brand-navy hover:opacity-80 transition-opacity font-medium"
            >
              留邮箱第一时间收到新文 →
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
