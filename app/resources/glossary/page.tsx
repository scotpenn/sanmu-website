import { GlossaryContent } from "@/components/GlossaryContent";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "「身后事」英文怎么说？加拿大身后事中英术语对照表（55 个词）",
  description:
    "「身后事」「处理后事」的英文怎么说？殡葬师三木整理的加拿大身后事中英术语对照表，55 个常用词：死亡证明、遗嘱认证 Probate、遗嘱执行人 Executor、骨灰安置所 Columbarium、CPP 死亡补助、舒缓治疗，每条配白话解释。",
  path: "/resources/glossary",
  locale: DEFAULT_LOCALE,
});

export default function GlossaryPage() {
  return <GlossaryContent locale={DEFAULT_LOCALE} />;
}
