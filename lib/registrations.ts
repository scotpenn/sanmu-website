import { Client } from "@notionhq/client";
import type { Locale } from "@/lib/i18n";
import {
  REFERRAL_SOURCE_NOTION_LABELS,
  type ReferralSource,
} from "@/lib/referral-sources";

export type Registration = {
  eventPageId: string;
  name: string;
  email: string;
  phone: string;
  partySize: number;
  message: string;
  referralSource: ReferralSource;
  referralOther: string;
  locale: Locale;
};

/**
 * 报名表同意条款的文案版本. 改动 EventRegistrationForm 里两条同意的措辞时,
 * 这里必须跟着升版 —— 否则无法区分某位报名者当初同意的是哪一版.
 */
const CONSENT_VERSION = "2026-08-v1";

/** 写入 Notion「活动报名」库. 失败抛错, 由调用方决定是否吞掉. */
export async function saveRegistration(reg: Registration): Promise<void> {
  const token = process.env.NOTION_TOKEN;
  const dataSourceId = process.env.NOTION_REGISTRATIONS_DS_ID;
  if (!token || !dataSourceId) {
    throw new Error("NOTION_TOKEN 或 NOTION_REGISTRATIONS_DS_ID 未设置");
  }
  const notion = new Client({ auth: token });
  await notion.pages.create({
    parent: { type: "data_source_id", data_source_id: dataSourceId },
    properties: {
      姓名: { title: [{ type: "text", text: { content: reg.name } }] },
      邮箱: { email: reg.email },
      电话: { phone_number: reg.phone || null },
      参加人数: { number: reg.partySize },
      留言: {
        rich_text: reg.message
          ? [{ type: "text", text: { content: reg.message } }]
          : [],
      },
      活动: { relation: [{ id: reg.eventPageId }] },
      状态: { select: { name: "已报名" } },
      来源语言: { select: { name: reg.locale } },
      获知渠道: {
        select: { name: REFERRAL_SOURCE_NOTION_LABELS[reg.referralSource] },
      },
      其他来源说明: {
        rich_text: reg.referralOther
          ? [{ type: "text", text: { content: reg.referralOther } }]
          : [],
      },
      同意版本: { select: { name: CONSENT_VERSION } },
    },
  });
}
