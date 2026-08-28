import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "关于三木",
  description:
    "三木，温哥华殡葬师，16 年送过 1000+ 个人最后一程。在 YouTube 频道《三木有话说》分享殡仪馆内看到的事。",
  path: "/about",
  locale: DEFAULT_LOCALE,
});

const WORKS = [
  {
    label: "视频",
    desc: "已上线 72+ 个视频，覆盖 12 个主题",
    href: "/videos",
    cta: "前往视频专区",
  },
  {
    label: "手册",
    desc: "《身后事安心手册》v2.8，累计迭代 8 次",
    href: "/resources/handbook",
    cta: "申请索取",
  },
  {
    label: "活动",
    desc: "不定期举办线下分享",
    href: "/events",
    cta: "查看线下活动",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* 屏 1 · Hero · 大幅肖像 + 引言 */}
      <section className="border-b border-rule">
        <Container width="card" className="py-16 md:py-24">
          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
            {/* 左 · 肖像 */}
            <div className="md:col-span-6">
              <Image
                src="/portrait.jpg"
                alt="三木 · 温哥华殡葬师"
                width={1279}
                height={1347}
                priority
                className="w-full max-w-[480px] mx-auto md:mx-0 h-auto shadow-xl"
              />
            </div>

            {/* 右 · 引言 */}
            <div className="md:col-span-6">
              <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed text-brand-navy">
                <p className="mb-2">「我每年要送走两百多个人。</p>
                <p className="mb-2">摸过太多冰冷的手，</p>
                <p className="mb-2">听过太多来不及的话。</p>
                <p className="mb-2">我做这个频道，</p>
                <p className="mb-2">不是为了让你看见死亡，</p>
                <p className="mb-2">是为了让你重新看见，</p>
                <p>自己还有多少时间。」</p>
              </blockquote>
              <footer className="mt-8 text-sm font-en opacity-60">— 三木</footer>
            </div>
          </div>
        </Container>
      </section>

      {/* 屏 2 · 我是谁 */}
      <section className="border-b border-rule bg-brand-yellow/[0.05]">
        <Container width="reading" className="py-20 md:py-24">
          <SectionTitle>我是谁</SectionTitle>
          <div className="space-y-6 text-lg leading-relaxed">
            <p>我是三木，温哥华一名殡葬师。</p>
            <p>
              这一行我做了 16 年。送过老人也送过孩子，见过体面的告别，也见过来不及的遗憾。6 年前我开始在 YouTube 上拍视频，把这些经历讲出来。不是为了让你害怕死亡，是为了让你早一点看见 —— 时间永远比你以为的少。
            </p>
            <p>这个频道叫《三木有话说》。你怕的事，我都聊。</p>
          </div>
        </Container>
      </section>

      {/* 屏 3 · 我做了什么 */}
      <section className="border-b border-rule">
        <Container width="card" className="py-20 md:py-24">
          <SectionTitle align="center">我做了什么</SectionTitle>
          <p className="text-center opacity-70 mb-12 max-w-[520px] mx-auto">
            不是「资历」，是「整理了什么有用的东西」。
          </p>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {WORKS.map((work) => {
              const inner = (
                <>
                  <h3 className="text-xl mb-3">{work.label}</h3>
                  <p className="text-sm opacity-80 leading-relaxed mb-4 min-h-[3rem]">
                    {work.desc}
                  </p>
                  {work.cta && (
                    <span className="text-sm font-medium text-brand-navy">
                      {work.cta} →
                    </span>
                  )}
                </>
              );

              if (work.href) {
                return (
                  <Link
                    key={work.label}
                    href={work.href}
                    className="block border border-rule p-6 hover:border-brand-navy hover:bg-brand-navy/[0.02] transition-colors"
                  >
                    {inner}
                  </Link>
                );
              }
              return (
                <div
                  key={work.label}
                  className="border border-rule p-6 opacity-60"
                >
                  {inner}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 屏 4 · 给读者的一段话 */}
      <section className="border-b border-rule">
        <Container width="reading" className="py-20 md:py-24 text-center">
          <SectionTitle align="center" className="mb-10">
            给读者的一段话
          </SectionTitle>
          <blockquote className="font-serif text-xl md:text-2xl leading-relaxed text-brand-navy">
            <p className="mb-4">
              我不是律师，不是医生，不是哲学家，
              <br className="hidden md:block" />
              我不能替你做决定。
            </p>
            <p>
              但如果你愿意听，我可以告诉你殡仪馆内我看到的那些事 ——
              <br className="hidden md:block" />
              那些可能让你重新思考人生的事。
            </p>
          </blockquote>
        </Container>
      </section>

      {/* 屏 5 · 联系方式 */}
      <section>
        <Container width="reading" className="py-20 md:py-24 text-center">
          <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-3 font-medium">
            Get in touch
          </div>
          <h2 className="text-2xl md:text-3xl mb-8">写信给我</h2>
          <a
            href="mailto:info@sanmu.ca"
            className="inline-block text-2xl md:text-3xl font-extrabold text-brand-navy hover:opacity-80 transition-opacity tracking-[-0.01em] mb-6"
          >
            info@sanmu.ca
          </a>
          <p className="text-base opacity-70 max-w-[520px] mx-auto">
            任何咨询、合作、媒体采访请来信。我会亲自回复。
          </p>
        </Container>
      </section>
    </>
  );
}
