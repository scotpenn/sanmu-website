import { GlossaryContent } from "@/components/GlossaryContent";
import { TRADITIONAL_LOCALE } from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "「身後事」英文怎麼說？加拿大身後事中英術語對照表（55 個詞）",
  description:
    "「身後事」「處理後事」的英文怎麼說？殯葬師三木整理的加拿大身後事中英術語對照表，55 個常用詞：死亡證明書、遺囑認證 Probate、遺囑執行人 Executor、骨灰龕位 Niche、CPP 死亡補助、紓緩治療，每條配白話解釋。",
  path: "/resources/glossary",
  locale: TRADITIONAL_LOCALE,
});

export default function GlossaryPage() {
  return <GlossaryContent locale={TRADITIONAL_LOCALE} />;
}
