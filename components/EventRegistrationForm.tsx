"use client";

import { useActionState, useEffect } from "react";
import {
  registerForEvent,
  type RegistrationState,
} from "@/app/events/[slug]/actions";
import {
  DEFAULT_LOCALE,
  textForLocale,
  withLocalePrefix,
  type Locale,
} from "@/lib/i18n";
import { trackConversion } from "@/lib/analytics";
import { SENDER_EMAIL } from "@/lib/sender";

const INITIAL: RegistrationState = { ok: false };


export function EventRegistrationForm({
  eventSlug,
  locale = DEFAULT_LOCALE,
}: {
  eventSlug: string;
  locale?: Locale;
}) {
  const [state, action, pending] = useActionState(registerForEvent, INITIAL);

  // 报名成功 → 触发转化事件(GA4 generate_lead + Vercel Analytics).
  useEffect(() => {
    if (state.ok) {
      trackConversion("generate_lead", {
        method: "event_registration",
        event_slug: eventSlug,
        page_locale: locale,
      });
    }
  }, [state.ok, eventSlug, locale]);

  if (state.ok) {
    return (
      <div className="border border-rule bg-paper p-8 md:p-10 max-w-[520px] text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-navy">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7 text-paper"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div className="text-xl font-medium text-brand-navy mb-2">
          {textForLocale(locale, "报名成功", "報名成功")}
        </div>
        <p className="opacity-80 leading-relaxed">
          {textForLocale(
            locale,
            "确认邮件已发到你的邮箱，请查收，届时准时参加。",
            "確認郵件已寄到你的信箱，請查收，屆時準時參加。",
          )}
        </p>
        <p className="mt-5 border-t border-rule pt-5 text-sm opacity-70 leading-relaxed">
          {textForLocale(
            locale,
            "几分钟内没收到？请查看邮箱的「垃圾邮件」或「推广」文件夹。发件人是 ",
            "幾分鐘內沒收到？請查看信箱的「垃圾郵件」或「promotions」資料夾。寄件人是 ",
          )}
          <span className="font-medium text-brand-navy whitespace-nowrap">{SENDER_EMAIL}</span>
          {textForLocale(locale, "。", "。")}
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="border border-rule bg-paper p-8 md:p-10 max-w-[520px] text-left space-y-5"
    >
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="eventSlug" value={eventSlug} />

      <div>
        <label htmlFor="ev-name" className="block text-sm font-medium mb-1">
          {textForLocale(locale, "称呼", "稱呼")} *
        </label>
        <input
          id="ev-name"
          name="name"
          required
          placeholder={textForLocale(locale, "怎么称呼您", "怎麼稱呼您")}
          className="w-full border border-rule px-3 py-2 bg-white focus:outline-none focus:border-brand-navy"
        />
      </div>

      <div>
        <label htmlFor="ev-email" className="block text-sm font-medium mb-1">
          {textForLocale(locale, "邮箱", "信箱")} *
        </label>
        <input
          id="ev-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full border border-rule px-3 py-2 bg-white focus:outline-none focus:border-brand-navy"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ev-phone" className="block text-sm font-medium mb-1">
            {textForLocale(locale, "电话", "電話")} *
          </label>
          <input
            id="ev-phone"
            name="phone"
            type="tel"
            required
            className="w-full border border-rule px-3 py-2 bg-white focus:outline-none focus:border-brand-navy"
          />
        </div>
        <div>
          <label htmlFor="ev-size" className="block text-sm font-medium mb-1">
            {textForLocale(locale, "参加人数", "參加人數")} *
          </label>
          <input
            id="ev-size"
            name="partySize"
            type="number"
            required
            min={1}
            max={20}
            defaultValue={1}
            className="w-full border border-rule px-3 py-2 bg-white focus:outline-none focus:border-brand-navy"
          />
        </div>
      </div>

      <div>
        <label htmlFor="ev-msg" className="block text-sm font-medium mb-1">
          {textForLocale(locale, "留言 / 想了解的问题（选填）", "留言 / 想了解的問題（選填）")}
        </label>
        <textarea
          id="ev-msg"
          name="message"
          rows={3}
          className="w-full border border-rule px-3 py-2 bg-white focus:outline-none focus:border-brand-navy resize-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-700">{state.error}</p>}

      <div className="space-y-3">
        <label className="flex items-start gap-3 text-xs leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            name="consentNotice"
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-brand-navy"
          />
          <span className="opacity-80">
            {textForLocale(
              locale,
              "我同意接收本次活动的通知与提醒，并已阅读",
              "我同意接收本次活動的通知與提醒，並已閱讀",
            )}
            <a
              href={withLocalePrefix("/privacy", locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-navy underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              {textForLocale(locale, "《隐私政策》", "《隱私政策》")}
            </a>
            {textForLocale(locale, "。", "。")}
          </span>
        </label>

        <label className="flex items-start gap-3 text-xs leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            name="consentPortrait"
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-brand-navy"
          />
          <span className="opacity-80">
            {textForLocale(
              locale,
              "我理解讲座现场会拍摄照片及视频，可能拍到我的影像，同意三木将其用于活动记录与官网活动回顾，不用于 YouTube 视频或商业广告。",
              "我理解講座現場會拍攝照片及影片，可能拍到我的影像，同意三木將其用於活動記錄與官網活動回顧，不用於 YouTube 影片或商業廣告。",
            )}
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-brand-navy text-white py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {pending
          ? textForLocale(locale, "提交中…", "提交中…")
          : textForLocale(locale, "✉️ 提交报名", "✉️ 提交報名")}
      </button>
    </form>
  );
}
