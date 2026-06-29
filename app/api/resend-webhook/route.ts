// POST /api/resend-webhook
//
// Resend webhook endpoint for deliverability events.
// Marks matching records in Notion「手册订阅 Handbook Leads」as Invalid.

import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { syncResendBounceToHandbookLeads } from "@/lib/resend-bounces";

export const runtime = "nodejs";

function requireWebhookSecret(): string {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("RESEND_WEBHOOK_SECRET 未设置");
  }
  return secret;
}

export async function POST(req: NextRequest) {
  let event: unknown;
  try {
    const payload = await req.text();
    const resend = new Resend(process.env.RESEND_API_KEY);
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: req.headers.get("svix-id") ?? "",
        timestamp: req.headers.get("svix-timestamp") ?? "",
        signature: req.headers.get("svix-signature") ?? "",
      },
      webhookSecret: requireWebhookSecret(),
    });
  } catch (error) {
    console.error("[resend-webhook] 签名验证失败:", error);
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  try {
    const result = await syncResendBounceToHandbookLeads(event);
    if (!result.ignored && result.matched === 0 && result.emails.length > 0) {
      console.warn("[resend-webhook] 手册订阅库未匹配到退信邮箱:", {
        eventType: result.eventType,
        emails: result.emails.map((email) => email.replace(/^(.{2}).*(@.*)$/, "$1***$2")),
      });
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[resend-webhook] Notion 同步失败:", error);
    return NextResponse.json({ error: "notion sync failed" }, { status: 502 });
  }
}
