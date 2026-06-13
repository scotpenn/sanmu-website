import Image from "next/image";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { Button } from "@/components/Button";
import { HandbookForm } from "@/components/HandbookForm";
import { TRADITIONAL_LOCALE } from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "《身後事安心手冊》v2.7 · 免費索取",
  description:
    "溫哥華殯葬師三木整理的加拿大身後事實用文件，包含遺囑模板、政府福利申請、87 件事清單、葬禮費用對比與家庭檔案冊。",
  path: "/resources/handbook",
  locale: TRADITIONAL_LOCALE,
});

const DOCUMENTS = [
  "法律遺囑模板（中英雙語）",
  "加拿大身故後政府福利申請完整指南",
  "家人身故時必須處理的 87 件事",
  "家庭檔案冊（生前預填）",
  "加拿大葬禮費用對比指南",
  "殯葬師的「向死而生」活法",
  "加拿大預立醫療委託完整指南",
  "如何處理逝者信用記錄防止身份盜用",
];

export default function TraditionalHandbookPage() {
  return (
    <>
      <section className="border-b border-rule">
        <Container width="card" className="py-16 md:py-24">
          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
            <div className="md:col-span-7">
              <div className="text-xs font-en uppercase tracking-widest text-brand-navy/70 mb-4 font-medium">
                Free Handbook · v2.7
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
                希望你永遠用不到，
                <br />
                但需要時它已經在你抽屜裡。
              </h1>
              <p className="text-lg md:text-xl opacity-85 leading-relaxed mb-6">
                《身後事安心手冊》—— 8 份文件 / 80+ 頁 / 加拿大場景。
              </p>
              <p className="text-base opacity-75 leading-relaxed mb-10 max-w-[520px]">
                三木在加拿大做殯葬師 16 年。這本手冊把家屬最容易漏掉、最容易花冤枉錢、最容易錯過時限的事整理成清單、模板和流程。
              </p>
              <Button variant="primary" href="#get">
                ✉️ 免費索取手冊
              </Button>
            </div>

            <div className="md:col-span-5 flex justify-center md:justify-end">
              <Image
                src="/handbook-cover.png"
                alt="《身後事安心手冊》v2.7 · 三木有話說頻道整理"
                width={1414}
                height={2000}
                priority
                sizes="(min-width: 1024px) 340px, (min-width: 768px) 320px, 280px"
                className="w-[280px] md:w-[320px] lg:w-[340px] h-auto shadow-xl border border-rule"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-rule bg-brand-yellow/[0.05]">
        <Container width="reading" className="py-20 md:py-24 text-center">
          <SectionTitle align="center" className="mb-6">
            為什麼免費
          </SectionTitle>
          <div className="space-y-5 text-lg leading-relaxed opacity-90">
            <p>這份手冊不是行銷贈品，也不是付費門檻。</p>
            <p>
              是我看到太多家庭在親人離世後手忙腳亂、被錯誤資訊坑錢坑感情，所以整理出來。
            </p>
            <p className="font-serif text-xl md:text-2xl text-brand-navy mt-8 leading-relaxed">
              我希望你永遠用不到它。
              <br />
              但當你需要它的時候，它已經在你抽屜裡了。
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-rule">
        <Container width="card" className="py-20 md:py-24">
          <SectionTitle align="center">手冊包含什麼</SectionTitle>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mt-12">
            {DOCUMENTS.map((title, index) => (
              <article key={title} className="border border-rule p-7 md:p-8">
                <div className="text-2xl md:text-3xl font-extrabold text-brand-navy font-en mb-3">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="text-lg md:text-xl leading-snug">{title}</h3>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 索取(表单) */}
      <section id="get" className="border-b border-rule scroll-mt-12">
        <Container width="reading" className="py-20 md:py-24 text-center">
          <SectionTitle align="center" className="mb-6">
            填一下，手冊馬上寄到你信箱
          </SectionTitle>
          <p className="text-lg opacity-85 leading-relaxed mb-10">
            留下信箱和稱呼，PDF 會自動寄給你。
            <br />
            <span className="text-base opacity-70">
              不強制留電話、不訂閱也能隨時退。
            </span>
          </p>

          <HandbookForm locale={TRADITIONAL_LOCALE} />

          <p className="text-sm opacity-60 mt-6 max-w-[480px] mx-auto leading-relaxed">
            三木會親自看每一封回信。如果幾分鐘內沒收到手冊，請檢查垃圾郵件，或寫信到 info@sanmu.ca。
          </p>
        </Container>
      </section>
    </>
  );
}
