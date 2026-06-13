"use client";

import { useActionState, useEffect } from "react";
import {
  sendHandbook,
  type HandbookState,
} from "@/app/resources/handbook/actions";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { trackConversion } from "@/lib/analytics";

const INITIAL: HandbookState = { ok: false };

/**
 * 手册索取表单. 简繁两个手册页共用同一组件(同一份简体文案 + 同一封邮件);
 * locale 仅用于在 Notion 线索里记录来源页, 不改变文案.
 */
export function HandbookForm({
  locale = DEFAULT_LOCALE,
}: {
  locale?: Locale;
}) {
  const [state, action, pending] = useActionState(sendHandbook, INITIAL);

  // 提交成功 → 触发转化事件(GA4 generate_lead + Vercel Analytics).
  useEffect(() => {
    if (state.ok) {
      trackConversion("generate_lead", {
        method: "handbook_form",
        page_locale: locale,
      });
    }
  }, [state.ok, locale]);

  if (state.ok) {
    return (
      <div className="border border-rule bg-paper p-8 md:p-10 max-w-[520px] mx-auto text-center">
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
        <div className="text-xl font-medium text-brand-navy mb-2">已发送</div>
        <p className="opacity-80 leading-relaxed">
          手册已发到你的邮箱，含 PDF 附件，请查收。
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="border border-rule bg-paper p-8 md:p-10 max-w-[520px] mx-auto text-left space-y-5"
    >
      {/* 蜜罐: 真人看不到, 机器人会填 */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      {/* 来源语言(线索追踪用) */}
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label htmlFor="hb-name" className="block text-sm font-medium mb-1">
          称呼 *
        </label>
        <input
          id="hb-name"
          name="name"
          required
          placeholder="怎么称呼您"
          className="w-full border border-rule px-3 py-2 bg-white focus:outline-none focus:border-brand-navy"
        />
      </div>

      <div>
        <label htmlFor="hb-email" className="block text-sm font-medium mb-1">
          邮箱 *
        </label>
        <input
          id="hb-email"
          name="email"
          type="email"
          required
          placeholder="handbook@example.com"
          className="w-full border border-rule px-3 py-2 bg-white focus:outline-none focus:border-brand-navy"
        />
      </div>

      <div>
        <label htmlFor="hb-reason" className="block text-sm font-medium mb-1">
          想了解的话题 / 来信原因（选填）
        </label>
        <textarea
          id="hb-reason"
          name="reason"
          rows={3}
          placeholder="可以告诉三木你想了解的具体话题，会帮助他未来选题"
          className="w-full border border-rule px-3 py-2 bg-white focus:outline-none focus:border-brand-navy resize-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-700">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-brand-navy text-white py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {pending ? "发送中…" : "✉️ 免费索取手册"}
      </button>

      <p className="text-xs opacity-60 leading-relaxed">
        提交即表示同意收到手册及偶尔的相关更新，可随时退订。
      </p>
    </form>
  );
}
