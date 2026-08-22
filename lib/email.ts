import { Resend } from "resend";
import { readFile } from "fs/promises";
import path from "path";
import { TRADITIONAL_LOCALE, type Locale } from "@/lib/i18n";
import { buildEventIcs } from "@/lib/ics";
import { SITE_URL } from "@/lib/seo";

// 从已在 Resend 验证的子域名 updates.sanmu.ca 发信(根域名 sanmu.ca 未验证);
// 回信地址仍是 info@sanmu.ca(Reply-To 无需域名验证)。
const REPLY_TO = "info@sanmu.ca";
const PDF_PATH = path.join(process.cwd(), "private", "handbook-v2.7.pdf");

// 发件人显示名 + 主题随语言;繁体页提交发繁体邮件,附件(PDF)两者共用同一份。
const FROM = {
  "zh-Hans": "三木有话说 <shouhou@updates.sanmu.ca>",
  "zh-Hant": "三木有話說 <shouhou@updates.sanmu.ca>",
} as const;

const SUBJECT = {
  "zh-Hans": "您的《身后事安心手册》v2.7 来了",
  "zh-Hant": "您的《身後事安心手冊》v2.7 來了",
} as const;

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY 未设置");
  return new Resend(key);
}

function emailTextHans(name: string): string {
  return `${name}，您好：

我是三木有话说频道的小助理 Sunny，感谢您观看我们的 YouTube 视频！很高兴我们的内容对您有帮助。

关于您询问的身后事规划，我们给您准备了一份《身后事安心手册》，里面包含了遗嘱模板、政府福利申请指南等实用信息，都在附件里了，请查收。

在您收到《手册》后，请务必回到视频的评论区里留言说已收到。因为您在评论区的回复，会有机会帮助更多需要这份免费《手册》的人们。

这是一个通用的资料包，但请注意每个人的情况不同，建议您在使用前咨询专业的法律顾问，确保符合您所在地区的具体法律要求。

如果您觉得我们的内容有价值，也希望您能订阅我们的频道并留下评论，这对我们非常重要！

如果您就在大温居住的话，也可以直接给三木打电话咨询，他的手机是 778-828-6881。

请注意：本邮件由系统自动发送，请勿直接回复本邮件。如需联系我们，请发送邮件至 info@sanmu.ca。

祝好！

Sunny · 三木有话说 频道小助理

📞 电话/Phone: 778-828-6881
✉️ 邮箱/Email: info@sanmu.ca
💬 微信/WeChat: yyds3mu
📱 WhatsApp/LINE: 778-828-6881
🎥 YouTube: 三木有话说 @yyds3mu

温馨提示：以上为官方联系方式，请勿轻信其他渠道，谨防诈骗。`;
}

function emailTextHant(name: string): string {
  return `${name}，您好：

我是三木有話說頻道的小助理 Sunny，感謝您觀看我們的 YouTube 影片！很高興我們的內容對您有幫助。

關於您詢問的身後事規劃，我們為您準備了一份《身後事安心手冊》，裡面包含了遺囑模板、政府福利申請指南等實用資訊，都在附件裡了，請查收。

在您收到《手冊》後，請務必回到影片的留言區裡留言說已收到。因為您在留言區的回覆，會有機會幫助更多需要這份免費《手冊》的人們。

這是一份通用的資料包，但請注意每個人的情況不同，建議您在使用前諮詢專業的法律顧問，確保符合您所在地區的具體法律要求。

如果您覺得我們的內容有價值，也希望您能訂閱我們的頻道並留言支持，這對我們非常重要！

如果您就在大溫地區居住，也可以直接致電三木諮詢，他的手機是 778-828-6881。

請注意：本郵件由系統自動發送，請勿直接回覆本郵件。如需聯絡我們，請發送郵件至 info@sanmu.ca。

祝好！

Sunny · 三木有話說 頻道小助理

📞 電話/Phone: 778-828-6881
✉️ 郵箱/Email: info@sanmu.ca
💬 微信/WeChat: yyds3mu
📱 WhatsApp/LINE: 778-828-6881
🎥 YouTube: 三木有話說 @yyds3mu

溫馨提示：以上為官方聯絡方式，請勿輕信其他來源，謹防詐騙。`;
}

/** 发送带 PDF 附件的手册邮件. 繁体页提交发繁体主题+正文, 附件共用. 失败抛错(主路径). */
export async function sendHandbookEmail(params: {
  to: string;
  name: string;
  locale: Locale;
}): Promise<void> {
  const pdf = await readFile(PDF_PATH);
  const isHant = params.locale === TRADITIONAL_LOCALE;
  const { error } = await getResend().emails.send({
    from: isHant ? FROM["zh-Hant"] : FROM["zh-Hans"],
    to: [params.to],
    replyTo: REPLY_TO,
    subject: isHant ? SUBJECT["zh-Hant"] : SUBJECT["zh-Hans"],
    text: isHant ? emailTextHant(params.name) : emailTextHans(params.name),
    attachments: [{ filename: "身后事安心手册-v2.7.pdf", content: pdf }],
  });
  if (error) throw new Error(`Resend 发送失败: ${error.message}`);
}

type EventInfo = {
  slug: string;
  title: string;
  summary: string;
  location: string | null;
  /** ISO 起止时间, 用于生成 .ics 附件 */
  start: string;
  end: string | null;
};

function eventTextHans(name: string, e: EventInfo): string {
  return `${name}，您好：

您已成功报名「${e.title}」。

📅 ${e.summary}${e.location ? `\n📍 ${e.location}` : ""}

请准时参加。如活动有变动，我们会通过邮件通知您。

请注意：本邮件由系统自动发送，请勿直接回复本邮件。如需联系我们，请发送邮件至 info@sanmu.ca。

祝好！

Sunny · 三木有话说 频道小助理

📞 电话/Phone: 778-828-6881
✉️ 邮箱/Email: info@sanmu.ca
💬 微信/WeChat: yyds3mu
📱 WhatsApp/LINE: 778-828-6881
🎥 YouTube: 三木有话说 @yyds3mu

温馨提示：以上为官方联系方式，请勿轻信其他渠道，谨防诈骗。`;
}

function eventTextHant(name: string, e: EventInfo): string {
  return `${name}，您好：

您已成功報名「${e.title}」。

📅 ${e.summary}${e.location ? `\n📍 ${e.location}` : ""}

請準時參加。如活動有變動，我們會透過郵件通知您。

請注意：本郵件由系統自動發送，請勿直接回覆本郵件。如需聯絡我們，請發送郵件至 info@sanmu.ca。

祝好！

Sunny · 三木有話說 頻道小助理

📞 電話/Phone: 778-828-6881
✉️ 郵箱/Email: info@sanmu.ca
💬 微信/WeChat: yyds3mu
📱 WhatsApp/LINE: 778-828-6881
🎥 YouTube: 三木有話說 @yyds3mu

溫馨提示：以上為官方聯絡方式，請勿輕信其他來源，謹防詐騙。`;
}

/** 发送活动「报名成功」确认邮件(附 .ics 日历文件, 随 locale). 失败抛错(主路径). */
export async function sendEventConfirmationEmail(params: {
  to: string;
  name: string;
  locale: Locale;
  event: EventInfo;
}): Promise<void> {
  const isHant = params.locale === TRADITIONAL_LOCALE;
  const e = params.event;
  const eventUrl = `${SITE_URL}${isHant ? "/zh-Hant" : ""}/events/${e.slug}`;
  const ics = buildEventIcs({
    uid: e.slug,
    title: e.title,
    description: `${e.summary}\n${eventUrl}`,
    location: e.location,
    url: eventUrl,
    start: e.start,
    end: e.end,
  });
  const { error } = await getResend().emails.send({
    from: isHant ? FROM["zh-Hant"] : FROM["zh-Hans"],
    to: [params.to],
    replyTo: REPLY_TO,
    subject: `${isHant ? "【報名成功】" : "【报名成功】"}${e.title}`,
    text: isHant
      ? eventTextHant(params.name, e)
      : eventTextHans(params.name, e),
    attachments: [
      {
        filename: isHant ? "活動日程.ics" : "活动日程.ics",
        content: Buffer.from(ics, "utf8"),
      },
    ],
  });
  if (error) throw new Error(`Resend 发送失败: ${error.message}`);
}
