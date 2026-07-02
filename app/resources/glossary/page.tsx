import { GlossaryContent } from "@/components/GlossaryContent";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "加拿大身后事中英术语对照表：葬礼、遗嘱、骨灰的英文怎么说",
  description:
    "殡葬师三木整理的加拿大身后事常用术语中英对照：死亡证明、遗嘱认证 Probate、遗嘱执行人 Executor、骨灰安置所 Columbarium、CPP 死亡补助、舒缓治疗等，每条配白话解释。",
  path: "/resources/glossary",
  locale: DEFAULT_LOCALE,
});

export default function GlossaryPage() {
  return <GlossaryContent locale={DEFAULT_LOCALE} />;
}
