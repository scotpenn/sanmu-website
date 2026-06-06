"use server";

import { sendHandbookEmail } from "@/lib/email";
import { saveLead, addToAudience } from "@/lib/leads";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";

export type HandbookState = { ok: boolean; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendHandbook(
  _prev: HandbookState,
  formData: FormData,
): Promise<HandbookState> {
  // 蜜罐: 机器人会填这个隐藏字段, 静默"成功"但什么都不做
  const honeypot = String(formData.get("company") ?? "").trim();
  if (honeypot) return { ok: true };

  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 1000);
  const localeRaw = String(formData.get("locale") ?? "");
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "请填写有效的邮箱地址。" };
  }
  if (!name) {
    return { ok: false, error: "请填写称呼。" };
  }

  // 主路径: 邮件必须成功(繁体页提交发繁体邮件)
  try {
    await sendHandbookEmail({ to: email, name, locale });
  } catch (e) {
    console.error("[handbook] 邮件发送失败:", e);
    return {
      ok: false,
      error: "发送失败，请稍后再试，或直接写信到 info@sanmu.ca。",
    };
  }

  // 尽力而为: 失败不影响已成功的投递
  try {
    await saveLead({ email, name, reason, locale });
  } catch (e) {
    console.error("[handbook] 写 Notion 线索失败:", e);
  }
  try {
    await addToAudience({ email, name });
  } catch (e) {
    console.error("[handbook] 加 Resend Audience 失败:", e);
  }

  return { ok: true };
}
