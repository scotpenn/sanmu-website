"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  localeFromPathname,
  navLabels,
  siteName,
  withLocalePrefix,
} from "@/lib/i18n";

const CONTENT_LINKS = [
  { href: "/blog", key: "blog" },
  { href: "/videos", key: "videos" },
  { href: "/events", key: "events" },
  { href: "/resources/handbook", key: "resources" },
] as const;

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" aria-hidden>
      <path
        fill="#FF0000"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      />
      <path fill="#fff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function XiaohongshuIcon() {
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#FF2442] text-white text-xs font-extrabold leading-none shrink-0"
      aria-hidden
    >
      红
    </span>
  );
}

const SOCIAL_LINKS = [
  {
    href: "https://www.youtube.com/@yyds3mu",
    name: "YouTube",
    handle: "@yyds3mu",
    Icon: YouTubeIcon,
  },
  {
    href: "https://xhslink.com/m/51jimi2BVtR",
    name: "小红书",
    handle: "@温哥华三木",
    Icon: XiaohongshuIcon,
  },
];

export function Footer() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const isTraditional = locale === "zh-Hant";

  return (
    <footer className="border-t border-rule mt-auto">
      <div className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* 列 1 · Logo + 一句简介 */}
          <div>
            <div className="text-2xl font-extrabold text-brand-navy tracking-[-0.01em] mb-3">
              {siteName[locale]}
            </div>
            <p className="text-sm leading-relaxed opacity-70">
              {isTraditional
                ? "溫哥華殯葬師，16 年送過 1000+ 個人最後一程。你怕什麼，他就聊什麼。"
                : "温哥华殡葬师，16 年送过 1000+ 个人最后一程。你怕什么，他就聊什么。"}
            </p>
          </div>

          {/* 列 2 · 内容导航 */}
          <div>
            <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-3">
              Content
            </div>
            <ul className="space-y-2 text-sm">
              {CONTENT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={withLocalePrefix(item.href, locale)}
                    className="hover:text-brand-navy transition-colors"
                  >
                    {navLabels[locale][item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 列 3 · 联系 + 社交矩阵 */}
          <div>
            <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-3">
              Connect
            </div>
            <a
              href="mailto:info@sanmu.ca"
              className="block text-sm mb-4 hover:text-brand-navy transition-colors"
            >
              info@sanmu.ca
            </a>
            <ul className="space-y-2 text-sm">
              {SOCIAL_LINKS.map(({ href, name, handle, Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${name} ${handle}`}
                    className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <Icon />
                    <span>{handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 简要免责声明 */}
        <div className="border-t border-rule pt-6 mb-5 text-xs leading-relaxed opacity-60">
          <p>
            <span className="font-medium">
              {isTraditional ? "免責聲明：" : "免责声明："}
            </span>
            {isTraditional
              ? "本網站及《三木有話說》頻道的全部內容（包括影片、文章與下載資料），均基於三木個人從業經驗整理，僅供一般參考與教育用途，不構成法律、醫療、財務、心理健康或其他專業建議。涉及遺囑與遺產規劃、政府福利申請、殯儀服務合約等具體事項，請以官方最新規定為準，並諮詢相關持牌專業人士。"
              : "本网站及《三木有话说》频道的全部内容（包括视频、文章与下载资料），均基于三木个人从业经验整理，仅供一般参考与教育用途，不构成法律、医疗、财务、心理健康或其他专业建议。涉及遗嘱与遗产规划、政府福利申请、殡仪服务合同等具体事项，请以官方最新规定为准，并咨询相关持牌专业人士。"}
            <Link
              href={withLocalePrefix("/disclaimer", locale)}
              className="underline underline-offset-2 hover:text-brand-navy transition-colors ml-1"
            >
              {isTraditional ? "閱讀完整免責聲明" : "阅读完整免责声明"}
            </Link>
          </p>
        </div>

        {/* 底部 · 版权行 */}
        <div className="flex flex-wrap justify-between gap-3 text-xs opacity-60">
          <div>
            © 2026 {siteName[locale]} ·{" "}
            {isTraditional ? "由三木個人營運" : "由三木个人运营"} · sanmu.ca
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link
              href={withLocalePrefix("/disclaimer", locale)}
              className="hover:text-brand-navy transition-colors"
            >
              {isTraditional ? "免責聲明" : "免责声明"}
            </Link>
            <Link
              href={withLocalePrefix("/privacy", locale)}
              className="hover:text-brand-navy transition-colors"
            >
              {isTraditional ? "隱私政策" : "隐私政策"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
