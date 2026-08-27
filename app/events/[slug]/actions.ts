"use server";

import { sendEventConfirmationEmail } from "@/lib/email";
import { saveRegistration } from "@/lib/registrations";
import { getEventBySlug } from "@/lib/notion";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";

export type RegistrationState = { ok: boolean; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerForEvent(
  _prev: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  // 蜜罐: 机器人会填这个隐藏字段, 静默"成功"但什么都不做
  const honeypot = String(formData.get("company") ?? "").trim();
  if (honeypot) return { ok: true };

  const slug = String(formData.get("eventSlug") ?? "").trim();
  const localeRaw = String(formData.get("locale") ?? "");
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 50);
  const message = String(formData.get("message") ?? "").trim().slice(0, 1000);
  const sizeRaw = parseInt(String(formData.get("partySize") ?? ""), 10);
  const partySize = Math.min(Math.max(sizeRaw, 1), 20);

  if (!name) return { ok: false, error: "请填写称呼。" };
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "请填写有效的邮箱地址。" };
  }
  if (!phone) return { ok: false, error: "请填写电话。" };
  if (!Number.isFinite(sizeRaw)) {
    return { ok: false, error: "请填写参加人数。" };
  }
  // 两条同意都是必勾, 浏览器已拦一道; 这里防绕过前端直接提交
  if (!formData.get("consentNotice")) {
    return { ok: false, error: "请勾选同意接收活动通知。" };
  }
  if (!formData.get("consentPortrait")) {
    return { ok: false, error: "请勾选同意现场影像采集。" };
  }

  const event = await getEventBySlug(slug, locale);
  if (!event) return { ok: false, error: "活动不存在或已结束。" };

  // 主路径: 邮件必须成功
  try {
    await sendEventConfirmationEmail({
      to: email,
      name,
      locale,
      event: {
        slug: event.slug,
        title: event.title,
        summary: event.summary,
        location: event.location,
        start: event.date,
        end: event.dateEnd,
      },
    });
  } catch (e) {
    console.error("[event-reg] 邮件发送失败:", e);
    return {
      ok: false,
      error: "提交失败，请稍后再试，或写信到 info@sanmu.ca。",
    };
  }

  // 尽力而为: 失败不影响已成功的确认信
  try {
    await saveRegistration({
      eventPageId: event.pageId,
      name,
      email,
      phone,
      partySize,
      message,
      locale,
    });
  } catch (e) {
    console.error("[event-reg] 写 Notion 报名失败:", e);
  }

  return { ok: true };
}
