// GET /api/indexnow/cron
//
// Vercel Cron 每天调用一次, 把 sitemap 里的全部 URL 推给 IndexNow.
// 调度在 vercel.json 里配 (默认每天 04:00 UTC = 北京时间中午 12 点).
//
// 鉴权: Vercel Cron 会自动带 Authorization: Bearer ${CRON_SECRET} (Vercel 注入).

import { NextResponse, type NextRequest } from "next/server";
import sitemap from "@/app/sitemap";
import { pingIndexNow } from "@/lib/indexnow";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const entries = await sitemap();
  const urls = entries.map((e) => e.url);
  const result = await pingIndexNow(urls);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
