import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { TRADITIONAL_LOCALE } from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "隱私政策",
  description:
    "sanmu.ca 網站隱私政策 · 收集什麼資料 / 如何使用 / 你的權利.",
  path: "/privacy",
  locale: TRADITIONAL_LOCALE,
});

export default function TraditionalPrivacyPage() {
  return (
    <>
      <section className="border-b border-rule">
        <Container width="card" className="py-16 md:py-20">
          <SectionTitle eyebrow="PRIVACY">隱私政策</SectionTitle>
          <p className="text-lg opacity-80 leading-relaxed">
            我們收集什麼、用來做什麼、你能怎麼管。
          </p>
        </Container>
      </section>

      <section>
        <Container width="reading" className="py-12 md:py-16">
          <div className="space-y-8 text-base leading-[1.85]">
            <p>
              sanmu.ca（以下簡稱「本網站」）由 Sanmu Media Inc. 營運，致力於以最少的方式收集你最少的資料。本頁告訴你具體我們收集什麼、為什麼、你能怎麼處理。
            </p>

            <h2 className="text-2xl mt-12 mb-3">一、本網站收集的資料</h2>

            <h3 className="text-xl mt-8 mb-2">1.1 自動收集（頁面造訪資料）</h3>
            <p>
              你造訪 sanmu.ca 任何頁面時，會自動記錄以下資料，用於了解哪些內容被讀得多、網站效能是否健康：
            </p>

            <p className="mt-6">
              <strong>· Vercel Analytics</strong>（部署平台 Vercel 提供）—— 記錄：
            </p>
            <ul className="space-y-2 list-disc pl-6">
              <li>造訪的頁面路徑（如 /blog/xxx）</li>
              <li>來源（你是從哪個網站點過來的，比如 YouTube）</li>
              <li>所在國家（僅大致地理位置，不精確到城市）</li>
              <li>裝置類型（手機 / 桌面 / 平板）和瀏覽器</li>
            </ul>
            <p>
              <strong className="text-brand-navy">不使用 cookie</strong>，不識別你是誰，不建立使用者輪廓。原始資料 30 天後自動刪除。
            </p>

            <p className="mt-6">
              <strong>· Vercel Speed Insights</strong> —— 記錄頁面載入效能（Core Web Vitals），匿名彙總。
            </p>

            <p className="mt-6">
              <strong>· Google Analytics 4 (GA4)</strong> —— 評估 ID <code className="font-en text-sm bg-rule px-1 rounded">G-V4MB01ZJ32</code>，記錄：
            </p>
            <ul className="space-y-2 list-disc pl-6">
              <li>頁面瀏覽量、捲動深度、站外連結點擊、影片互動等「加強型評估」事件</li>
              <li>工作階段時長、使用者路徑、流量來源（自然搜尋 / 直接造訪 / YouTube 等）</li>
              <li>大致地理位置、裝置 / 瀏覽器 / 作業系統</li>
            </ul>
            <p>
              <strong className="text-brand-navy">GA4 使用 cookie</strong>（`_ga`、`_ga_*` 等）來識別同一使用者的多次造訪。Google 可能將這些資料與你造訪過的其他網站資料關聯（如果你登入了 Google 帳號），用於改進 Google 自身服務。詳見{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-navy hover:opacity-80 transition-opacity"
              >
                Google 隱私政策
              </a>
              。如果你想完全封鎖 GA4，可以安裝{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-navy hover:opacity-80 transition-opacity"
              >
                Google Analytics Opt-out 瀏覽器擴充功能
              </a>
              。
            </p>

            <h3 className="text-xl mt-8 mb-2">1.2 你主動提交的資料</h3>
            <p>
              如果你在網站上做以下操作，會主動提供資料：
            </p>
            <ul className="space-y-2 list-disc pl-6">
              <li>
                <strong>線下活動報名</strong>：跳轉到 Google Form 後，你填的電子信箱、稱呼等資訊存到 Google 伺服器（受{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-navy hover:opacity-80 transition-opacity"
                >
                  Google 隱私政策
                </a>
                {" "}約束）
              </li>
              <li>
                <strong>來信</strong>：透過{" "}
                <a
                  href="mailto:info@sanmu.ca"
                  className="text-brand-navy hover:opacity-80 transition-opacity"
                >
                  info@sanmu.ca
                </a>
                {" "}給三木寫信，郵件內容由我們的郵件服務商保存（這是郵件本身的運作機制）
              </li>
            </ul>

            <h2 className="text-2xl mt-12 mb-3">二、這些資料用來做什麼</h2>
            <ul className="space-y-2 list-disc pl-6">
              <li>看哪些文章 / 影片被讀得多，決定寫什麼類型的下一篇</li>
              <li>看從哪個 YouTube 影片來的人最多，最佳化引導路徑</li>
              <li>看手機 / 桌面造訪比例，決定行動端最佳化優先順序</li>
              <li>給線下活動報名的人發活動通知 / 提醒</li>
              <li>回覆你給三木的來信</li>
            </ul>
            <p>
              <strong className="text-brand-navy">不賣給任何人。</strong>不用於廣告定向。不與第三方共享（除非法律強制要求）。
            </p>

            <h2 className="text-2xl mt-12 mb-3">三、你的權利</h2>
            <p>
              不管你在哪個國家，都有以下權利：
            </p>
            <ul className="space-y-2 list-disc pl-6">
              <li>
                <strong>知道我們存了你哪些資料</strong> —— 給{" "}
                <a
                  href="mailto:info@sanmu.ca"
                  className="text-brand-navy hover:opacity-80 transition-opacity"
                >
                  info@sanmu.ca
                </a>
                {" "}發郵件問即可
              </li>
              <li>
                <strong>要求刪除你的資料</strong> —— 同上，30 天內處理
              </li>
              <li>
                <strong>退訂活動通知</strong> —— Google Form 的報名資訊會在活動結束後保留半年，半年後自動刪除
              </li>
              <li>
                <strong>反對處理</strong> —— 同樣郵件即可
              </li>
            </ul>

            <h2 className="text-2xl mt-12 mb-3">四、第三方服務清單</h2>
            <p>本網站使用以下第三方服務：</p>
            <ul className="space-y-2 list-disc pl-6">
              <li><strong>Vercel</strong>（美國）—— 網站部署 / 流量分析 / 效能監控</li>
              <li><strong>Google Analytics 4</strong>（美國）—— 詳細流量分析（使用 cookie，見上文 §1.1）</li>
              <li><strong>Google Forms</strong>（美國）—— 活動報名表（僅你主動填寫時使用）</li>
              <li><strong>YouTube</strong>（Google 美國）—— 影片嵌入</li>
              <li><strong>Cloudinary</strong>（以色列）—— 活動照片託管</li>
              <li><strong>Notion</strong>（美國）—— 我們的內容管理後台（你看到的網站內容來源）</li>
            </ul>

            <h2 className="text-2xl mt-12 mb-3">五、未成年人</h2>
            <p>
              本網站內容面向成年人，特別是 35 歲以上的海外華人。我們不主動收集未成年人資料。如果你是未成年人的監護人，發現孩子在我們這裡留了資料，請來信我會立刻刪除。
            </p>

            <h2 className="text-2xl mt-12 mb-3">六、政策更新</h2>
            <p>
              本政策可能在以下情況更新：增加新的第三方服務、變更資料保留期、應法律要求。更新時本頁底部「最後更新」日期會變。重大變更會在網站顯眼位置提醒，並透過郵件通知已經報名活動的使用者。
            </p>

            <h2 className="text-2xl mt-12 mb-3">七、聯絡方式</h2>
            <p>
              任何關於本政策的問題、資料請求、投訴，請來信：{" "}
              <a
                href="mailto:info@sanmu.ca"
                className="text-brand-navy font-medium hover:opacity-80 transition-opacity"
              >
                info@sanmu.ca
              </a>
              。我會親自處理，48 小時內回覆。
            </p>

            <div className="border-t border-rule pt-6 mt-12 text-sm opacity-60">
              最後更新: 2026-05-31 · 適用範圍: sanmu.ca 全部子網域
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
