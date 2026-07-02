import { GlossaryContent } from "@/components/GlossaryContent";
import { TRADITIONAL_LOCALE } from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "加拿大身後事中英術語對照表：葬禮、平安紙、骨灰龕的英文怎麼說",
  description:
    "殯葬師三木整理的加拿大身後事常用術語中英對照：死亡證明書、遺囑認證 Probate、遺囑執行人 Executor、骨灰龕位 Niche、CPP 死亡補助、紓緩治療等，每條配白話解釋。",
  path: "/resources/glossary",
  locale: TRADITIONAL_LOCALE,
});

export default function GlossaryPage() {
  return <GlossaryContent locale={TRADITIONAL_LOCALE} />;
}
