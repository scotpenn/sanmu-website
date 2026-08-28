import Image from "next/image";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { Button } from "@/components/Button";
import { HandbookForm } from "@/components/HandbookForm";
import { TRADITIONAL_LOCALE } from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";
import { getHandbookCount } from "@/lib/handbook-count";

export const metadata = pageSeo({
  title: "《身後事安心手冊》v2.8 · 免費索取",
  description:
    "溫哥華殯葬師三木整理的加拿大身後事實用文件，包含遺囑模板、政府福利申請、87 件事清單、葬禮費用對比與家庭檔案冊。",
  path: "/resources/handbook",
  locale: TRADITIONAL_LOCALE,
});

export const revalidate = 3600;

type HandbookDoc = {
  num: string;
  numEn: string;
  title: string;
  description: string;
  forWhom: string;
};

const DOCUMENTS: HandbookDoc[] = [
  {
    num: "I",
    numEn: "Document I",
    title: "法律遺囑範本（中英雙語）",
    description:
      "完整的 Last Will and Testament 範本。涵蓋遺囑執行人 / 受託人指定、財產分配、未成年子女監護、葬禮指示等 14 項條款。中英雙語對照，便於跟律師確認。",
    forWhom: "18 歲以上擁有任何資產、家人、或居住在加拿大的成年人",
  },
  {
    num: "II",
    numEn: "Document II",
    title: "加拿大身故後政府福利申請完整指南",
    description:
      "涵蓋 CPP 死亡補助金、CPP 遺屬撫卹金、OAS 遺屬補助、EI 補償、最終稅務申報、BC 省福利、WCB 工傷賠償等。含申請時間表、官方聯絡電話、常見拒絕原因 FAQ。",
    forWhom: "家人剛離世正在辦身後事的家屬",
  },
  {
    num: "III",
    numEn: "Document III",
    title: "家人身故時必須處理的 87 件事",
    description:
      "5 大類清單：取得生死資料 / 安排付款 / 蒐集文件 / 數小時內的決定和安排 / 盡快通知。按清單逐條核對，不會漏關鍵步驟。",
    forWhom: "家人離世後 7 天內的家屬",
  },
  {
    num: "IV",
    numEn: "Document IV",
    title: "家庭檔案冊（生前預填）",
    description:
      "完整記錄冊：個人資料 / 重要醫療紀錄 / 難忘的事件 / 悼詞與訃告備錄 / 生平簡歷 / 重要文件存放地點 / 銀行帳戶 / 保險 / 推薦律師 & 殯儀館名單。",
    forWhom: "想「為家人減少麻煩」的人——自己生前填好，離開時家人不慌亂",
  },
  {
    num: "V",
    numEn: "Document V",
    title: "加拿大葬禮費用對比指南",
    description:
      "核心費用拆解（殯儀館服務 / 火化 / 土葬 / 禮儀 / 墓地）+ 詳細費用對比表 + 套餐對比表 + 真實成交價區間。讓你看清「必要花費」和「被推銷的額外項目」。",
    forWhom: "正在詢價 / 比價的家屬，防止被殯儀館「溫和地」推銷",
  },
  {
    num: "VI",
    numEn: "Document VI",
    title: "殯葬師的「向死而生」活法",
    description:
      "三木從送過 1000+ 個人的經驗裡提煉的人生重心整理法：遺憾最小化 / 關係排序 / 接受無常。不是雞湯，是從殯儀館內看到的真相。",
    forWhom: "精神內耗嚴重 / 中年困惑 / 想釐清人生重心的人",
  },
  {
    num: "VII",
    numEn: "Document VII",
    title: "加拿大預立醫療委託完整指南",
    description:
      "Advance Care Directive 詳解：什麼是預立醫療委託、為什麼重要、核心決策範圍、加拿大辦理流程、常見誤區。讓你在意識清醒時決定生命最後階段的事。",
    forWhom: "50+ 歲人士；任何想自主決定臨終醫療方式的人",
  },
  {
    num: "VIII",
    numEn: "Document VIII",
    title: "如何處理逝者信用記錄防止身份盜用",
    description:
      "完整步驟：通知 Equifax / TransUnion、通知 CRA 與金融機構、監控可疑活動。海外華人特別需要，逝者身份被冒用追討困難。",
    forWhom: "正在辦身後事的家屬，離世後 30 天內必做",
  },
];

export default async function TraditionalHandbookPage() {
  const count = await getHandbookCount();
  return (
    <>
      <section className="border-b border-rule">
        <Container width="card" className="py-16 md:py-24">
          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
            <div className="md:col-span-7">
              <div className="text-xs font-en uppercase tracking-widest text-brand-navy/70 mb-4 font-medium">
                Free Handbook · v2.8
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
                希望你永遠用不到，
                <br />
                但需要時它已經在你抽屜裡。
              </h1>
              <p className="text-lg md:text-xl opacity-85 leading-relaxed mb-6">
                《身後事安心手冊》—— 8 份文件 / 90+ 頁 / 加拿大場景。
              </p>
              <p className="text-base opacity-75 leading-relaxed mb-10 max-w-[520px]">
                三木在加拿大做殯葬師 16 年。送過 1000+ 個家庭。頻道 6 年。
                <br />
                這本手冊是他看到家屬反覆踩的坑、被錯誤資訊坑過的錢、錯過的政府福利窗口期，整理成的清單、範本和流程圖。
              </p>
              <div className="flex items-center gap-2 mb-8">
                <span className="text-base opacity-75">已有</span>
                <span className="font-en font-extrabold text-2xl md:text-3xl text-brand-navy bg-brand-yellow px-2 py-0.5 leading-none">
                  {count.toLocaleString("en-US")}
                </span>
                <span className="text-base opacity-75">個家庭領取</span>
              </div>
              <Button variant="primary" href="#get">
                ✉️ 免費索取手冊
              </Button>
            </div>

            <div className="md:col-span-5 flex justify-center md:justify-end">
              <Image
                src="/handbook-cover.png"
                alt="《身後事安心手冊》v2.8 · 三木有話說頻道整理"
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

      <section className="border-b border-rule">
        <Container width="card" className="py-20 md:py-24">
          <SectionTitle align="center">手冊包含什麼</SectionTitle>
          <p className="text-center opacity-70 mb-12 max-w-[560px] mx-auto">
            8 份獨立文件，按「事發緊急程度」和「使用場景」組織。可以單獨列印某一份，也可以整本存檔。
          </p>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {DOCUMENTS.map((doc) => (
              <article key={doc.num} className="border border-rule p-7 md:p-8">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-2xl md:text-3xl font-extrabold text-brand-navy font-en">
                    {doc.num}
                  </span>
                  <span className="text-xs font-en uppercase tracking-wider opacity-50">
                    {doc.numEn}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl leading-snug mb-3">{doc.title}</h3>
                <p className="text-sm opacity-80 leading-relaxed mb-4">{doc.description}</p>
                <div className="border-t border-rule pt-3 mt-auto">
                  <div className="text-xs font-en uppercase tracking-wider text-brand-navy/70 mb-1 font-medium">
                    For
                  </div>
                  <p className="text-sm">{doc.forWhom}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA · 看完文檔順勢索取 */}
      <section className="border-b border-rule">
        <Container width="reading" className="py-14 md:py-16 text-center">
          <Button variant="primary" href="#get">
            ✉️ 免費索取手冊
          </Button>
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

      {/* 索取(表单) */}
      <section id="get" className="border-b border-rule scroll-mt-12">
        <Container width="reading" className="py-20 md:py-24 text-center">
          <SectionTitle align="center" className="mb-6">
            填一下，手冊馬上寄到你信箱
          </SectionTitle>
          <p className="text-lg opacity-85 leading-relaxed mb-10">
            留下信箱和稱呼，PDF 會自動寄給你。
          </p>

          <HandbookForm locale={TRADITIONAL_LOCALE} />

          <p className="text-sm opacity-60 mt-6 max-w-[480px] mx-auto leading-relaxed">
            三木會親自看每一封回信。如果幾分鐘內沒收到手冊，請檢查垃圾郵件，或寫信到 info@sanmu.ca。
          </p>
        </Container>
      </section>

      {/* 免責提示 */}
      <section>
        <Container width="reading" className="py-12 md:py-16 text-center">
          <p className="text-sm opacity-70 leading-relaxed max-w-[560px] mx-auto">
            ⚠️ 手冊內容來自三木 16 年北美殯葬實務經驗整理，<strong>僅供參考</strong>，不構成法律 / 醫療 / 金融建議。具體事務請諮詢持牌律師 / 醫生 / 金融顧問。詳見{" "}
            <a
              href="/zh-Hant/disclaimer"
              className="text-brand-navy hover:opacity-80 transition-opacity font-medium"
            >
              免責聲明
            </a>
            。
          </p>
        </Container>
      </section>
    </>
  );
}
