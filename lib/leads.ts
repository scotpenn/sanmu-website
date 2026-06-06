import { Client } from "@notionhq/client";
import { Resend } from "resend";
import type { Locale } from "@/lib/i18n";

export type Lead = {
  email: string;
  name: string;
  reason: string;
  locale: Locale;
};

/** 写入 Notion「手册订阅」库. 失败抛错, 由调用方决定是否吞掉. */
export async function saveLead(lead: Lead): Promise<void> {
  const token = process.env.NOTION_TOKEN;
  const dataSourceId = process.env.NOTION_HANDBOOK_DS_ID;
  if (!token || !dataSourceId) {
    throw new Error("NOTION_TOKEN 或 NOTION_HANDBOOK_DS_ID 未设置");
  }
  const notion = new Client({ auth: token });
  await notion.pages.create({
    parent: { type: "data_source_id", data_source_id: dataSourceId },
    properties: {
      邮箱: { title: [{ type: "text", text: { content: lead.email } }] },
      称呼: { rich_text: [{ type: "text", text: { content: lead.name } }] },
      原因: {
        rich_text: lead.reason
          ? [{ type: "text", text: { content: lead.reason } }]
          : [],
      },
      状态: { select: { name: "新线索" } },
      来源语言: { select: { name: lead.locale } },
    },
  });
}

/**
 * 加入 Resend Audience(给将来发 newsletter 用). 尽力而为:
 * 未配置 RESEND_AUDIENCE_ID 时直接跳过(当前的受限 key 无法管理 Audience).
 */
export async function addToAudience(params: {
  email: string;
  name: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audienceId) return; // 未配置 → 静默跳过, 不影响主流程
  const resend = new Resend(key);
  const { error } = await resend.contacts.create({
    email: params.email,
    firstName: params.name,
    unsubscribed: false,
    audienceId,
  });
  if (error) throw new Error(`Resend Audience 写入失败: ${error.message}`);
}
