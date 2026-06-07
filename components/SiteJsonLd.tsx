import { type Locale, siteName } from "@/lib/i18n";
import { localeUrl, organizationSchema, personSchema } from "@/lib/seo";

/**
 * 首页结构化数据: WebSite + Person(三木). 帮 Google 建立"品牌 / 人物"实体识别,
 * 关联 YouTube / 小红书等官方主页(sameAs)。
 */
export function SiteJsonLd({ locale }: { locale: Locale }) {
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName[locale],
    url: localeUrl("/", locale),
    inLanguage: locale,
    publisher: organizationSchema(locale),
  };

  const person = {
    "@context": "https://schema.org",
    ...personSchema(locale),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
    </>
  );
}
