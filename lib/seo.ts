import type { Metadata } from "next";
import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  localeOgLocale,
  siteName,
  withLocalePrefix,
} from "@/lib/i18n";

export const SITE_URL = "https://www.sanmu.ca";
export const SITE_NAME = siteName[DEFAULT_LOCALE];

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function localePath(path: string, locale: Locale): string {
  return withLocalePrefix(path, locale);
}

export function localeUrl(path: string, locale: Locale): string {
  return absoluteUrl(localePath(path, locale));
}

/**
 * 生成 canonical + hreflang.
 * availableLocales = 该路径实际存在(已发布)的语言版本.
 * 静态页两种语言都有, 用默认值; 博客/活动按该 slug 实际存在的语言传入,
 * 避免给「只有繁体」的文章 emit 指向 404 简体页的 hreflang。
 * x-default 优先简体, 没有简体版时回退到第一个可用语言。
 */
/** hreflang 语言→URL 映射 (含 x-default). 只列实际存在的语言版本. */
export function hreflangLanguages(
  path: string,
  availableLocales: readonly Locale[] = LOCALES,
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of availableLocales) {
    languages[l] = localeUrl(path, l);
  }
  const xDefaultLocale = availableLocales.includes(DEFAULT_LOCALE)
    ? DEFAULT_LOCALE
    : availableLocales[0];
  if (xDefaultLocale) {
    languages["x-default"] = localeUrl(path, xDefaultLocale);
  }
  return languages;
}

export function localizedAlternates(
  path: string,
  locale: Locale,
  availableLocales: readonly Locale[] = LOCALES,
): NonNullable<Metadata["alternates"]> {
  return {
    canonical: localeUrl(path, locale),
    languages: hreflangLanguages(path, availableLocales),
  };
}

// 官方社交主页, 用于 schema.org 的 sameAs (帮 Google 建立实体识别)
export const SOCIAL_PROFILES = [
  "https://www.youtube.com/@yyds3mu",
  "https://xhslink.com/m/51jimi2BVtR",
];

/** schema.org Person 节点(三木), 用作文章 author. */
export function personSchema(locale: Locale) {
  return {
    "@type": "Person",
    name: "三木",
    url: localeUrl("/about", locale),
    image: absoluteUrl("/portrait.jpg"),
    jobTitle: locale === DEFAULT_LOCALE ? "殡葬师" : "殯葬師",
    sameAs: SOCIAL_PROFILES,
  };
}

/** schema.org Organization 节点(品牌), 用作文章 publisher. */
export function organizationSchema(locale: Locale) {
  return {
    "@type": "Organization",
    name: siteName[locale],
    legalName: "Sanmu Media Inc.",
    url: localeUrl("/", locale),
    logo: absoluteUrl("/portrait.jpg"),
    sameAs: SOCIAL_PROFILES,
  };
}

export function pageSeo({
  title,
  description,
  path,
  locale,
  image = "/portrait.jpg",
  type = "website",
  availableLocales,
}: {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  image?: string;
  type?: "website" | "article";
  /** 该路径实际存在的语言版本. 不传 = 两种语言都有(静态页). */
  availableLocales?: readonly Locale[];
}): Metadata {
  const url = localeUrl(path, locale);
  const localeSiteName = siteName[locale];
  const fullTitle = `${title} · ${localeSiteName}`;

  return {
    title: {
      absolute: fullTitle,
    },
    description,
    alternates: localizedAlternates(path, locale, availableLocales),
    openGraph: {
      type,
      locale: localeOgLocale[locale],
      url,
      siteName: localeSiteName,
      title: fullTitle,
      description,
      images: [
        {
          url: image,
          width: 1279,
          height: 1347,
          alt: "三木 · 温哥华殡葬师",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
