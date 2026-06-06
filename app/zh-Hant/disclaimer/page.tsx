import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { TRADITIONAL_LOCALE } from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "免責聲明",
  description:
    "三木有話說頻道與 sanmu.ca 網站內容性質說明 · 內容僅供參考, 不構成法律 / 醫療 / 金融建議.",
  path: "/disclaimer",
  locale: TRADITIONAL_LOCALE,
});

export default function TraditionalDisclaimerPage() {
  return (
    <>
      <section className="border-b border-rule">
        <Container width="card" className="py-16 md:py-20">
          <SectionTitle eyebrow="DISCLAIMER">免責聲明</SectionTitle>
          <p className="text-lg opacity-80 leading-relaxed">
            把話說在前面，省得後面誤會。
          </p>
        </Container>
      </section>

      <section>
        <Container width="reading" className="py-12 md:py-16">
          <div className="space-y-8 text-lg leading-[1.85]">
            <p>
              我叫三木，一名在加拿大溫哥華工作 16 年的殯葬師。這個網站和我的 YouTube 頻道《三木有話說》分享我送過 1000 多個家庭後看到的事。
            </p>

            <p>
              <strong className="text-brand-navy">我不是律師，不是醫生，不是金融顧問，不是哲學家。</strong>
            </p>

            <p>
              這裡所有內容 —— 包括影片、網誌文章、《身後事安心手冊》—— 都是基於我個人多年的從業經驗整理出來的<em>分享</em>。它能幫你<strong>少踩坑、早做準備、看清方向</strong>。
            </p>

            <p>
              但它<strong className="text-brand-navy">不構成專業建議</strong>。具體到你自己的情況：
            </p>

            <ul className="space-y-3 list-disc pl-6">
              <li>
                <strong>遺囑辦理 / 遺產規劃</strong> —— 請諮詢持牌律師 (notary public / estate lawyer)
              </li>
              <li>
                <strong>政府福利申請</strong> —— 以加拿大聯邦及省政府官方網站公告為準, 政策會變
              </li>
              <li>
                <strong>葬禮費用談判 / 殯儀服務合約</strong> —— 簽字前請第三方法律意見
              </li>
              <li>
                <strong>跨國骨灰運輸 / 法律手續</strong> —— 因國家、省份、時間不同而變化, 請聯絡當地殯儀館或大使館
              </li>
              <li>
                <strong>心理健康 / 情緒困擾</strong> —— 請諮詢持牌心理諮商師或致電當地危機求助熱線
              </li>
              <li>
                <strong>財務規劃 / 投資</strong> —— 請諮詢持牌金融顧問
              </li>
            </ul>

            <h2 className="text-2xl mt-12 mb-3">關於資訊時效</h2>
            <p>
              法律條文、政府福利政策、殯儀行業流程都會隨時間變化。本網站文章發布時是當時的真實情況, 但你看到的時候可能已經過時幾個月或幾年。<strong>任何具體操作前請核實當下最新規定</strong>。
            </p>

            <h2 className="text-2xl mt-12 mb-3">關於個案差異</h2>
            <p>
              文章裡提到的故事、案例、數字都來自真實經歷, 但每個家庭、每個人情況不同。直接套用別人的方案可能不適合你。我分享的是「思考的方向」和「該問的問題」, 不是「標準答案」。
            </p>

            <h2 className="text-2xl mt-12 mb-3">關於外部連結</h2>
            <p>
              網站內可能含有指向 YouTube 影片、Google Form 報名表、政府網站、第三方服務的連結。這些連結所在網站的內容、隱私政策、服務品質由對方負責, 與三木無關。
            </p>

            <h2 className="text-2xl mt-12 mb-3">如果你發現錯誤</h2>
            <p>
              我盡力讓每篇內容都準確, 但難免有疏漏。如果你發現錯別字、過時資訊、或與你專業經驗衝突的內容, 請來信告訴我:{" "}
              <a
                href="mailto:info@sanmu.ca"
                className="text-brand-navy font-medium hover:opacity-80 transition-opacity"
              >
                info@sanmu.ca
              </a>
              。我會親自看, 錯誤確實存在的話我會修正並致謝。
            </p>

            <h2 className="text-2xl mt-12 mb-3">最後一句話</h2>
            <p className="font-serif text-xl text-brand-navy border-l-4 border-brand-yellow pl-6 my-10 leading-relaxed">
              我不能替你做決定。但如果你願意聽, 我可以告訴你殯儀館內我看到的那些事。
            </p>
            <p>
              <strong>看完, 你自己判斷, 自己決定, 自己負責</strong>。這是我對你的尊重, 也是我能給的所有承諾。
            </p>

            <div className="border-t border-rule pt-6 mt-12 text-sm opacity-60">
              最後更新: 2026-05-31
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
