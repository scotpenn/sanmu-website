import Image from "next/image";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { TRADITIONAL_LOCALE } from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "關於三木",
  description:
    "三木，溫哥華殯葬師，16 年送過 1000+ 個人最後一程。在 YouTube 頻道《三木有話說》分享殯儀館內看到的事。",
  path: "/about",
  locale: TRADITIONAL_LOCALE,
});

export default function TraditionalAboutPage() {
  return (
    <>
      <section className="border-b border-rule">
        <Container width="card" className="py-16 md:py-24">
          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
            <div className="md:col-span-6">
              <Image
                src="/portrait.jpg"
                alt="三木 · 溫哥華殯葬師"
                width={1279}
                height={1347}
                priority
                className="w-full max-w-[480px] mx-auto md:mx-0 h-auto shadow-xl"
              />
            </div>
            <div className="md:col-span-6">
              <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed text-brand-navy">
                <p className="mb-2">「我每年要送走兩百多個人。</p>
                <p className="mb-2">摸過太多冰冷的手，</p>
                <p className="mb-2">聽過太多來不及的話。</p>
                <p className="mb-2">我做這個頻道，</p>
                <p className="mb-2">不是為了讓你看見死亡，</p>
                <p className="mb-2">是為了讓你重新看見，</p>
                <p>自己還有多少時間。」</p>
              </blockquote>
              <footer className="mt-8 text-sm font-en opacity-60">— 三木</footer>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-rule bg-brand-yellow/[0.05]">
        <Container width="reading" className="py-20 md:py-24">
          <SectionTitle>我是誰</SectionTitle>
          <div className="space-y-6 text-lg leading-relaxed">
            <p>我是三木，溫哥華一名殯葬師。</p>
            <p>
              這一行我做了 16 年。送過老人，也送過孩子；見過體面的告別，也見過來不及的遺憾。6 年前我開始在 YouTube 上拍影片，把這些經歷講出來。
            </p>
            <p>
              不是為了讓你害怕死亡，是為了讓你早一點看見：時間永遠比你以為的少。
            </p>
          </div>
        </Container>
      </section>

      <section>
        <Container width="reading" className="py-20 md:py-24 text-center">
          <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-3 font-medium">
            Get in touch
          </div>
          <h2 className="text-2xl md:text-3xl mb-8">寫信給我</h2>
          <a
            href="mailto:info@sanmu.ca"
            className="inline-block text-2xl md:text-3xl font-extrabold text-brand-navy hover:opacity-80 transition-opacity tracking-[-0.01em] mb-6"
          >
            info@sanmu.ca
          </a>
          <p className="text-base opacity-70 max-w-[520px] mx-auto">
            任何諮詢、合作、媒體採訪請來信。我會親自回覆。
          </p>
        </Container>
      </section>
    </>
  );
}
