// POST /api/indexnow
//
// 手动 / Notion webhook / cron 触发 IndexNow ping. 通知 Bing/Yandex/Seznam 内容有更新.
//
// 鉴权: 必须带 Authorization: Bearer ${INDEXNOW_SECRET}
//
// Body 形式:
//   { "urls": ["https://www.sanmu.ca/blog/foo", ...] }  → ping 指定 URL
//   { "all": true }                                       → ping 整个 sitemap (冷启动用)
//
// 例:
//   curl -X POST https://www.sanmu.ca/api/indexnow \
//     -H "Authorization: Bearer $INDEXNOW_SECRET" \
//     -H "Content-Type: application/json" \
//     -d '{"all": true}'

import { NextResponse, type NextRequest } from "next/server";
import sitemap from "@/app/sitemap";
import { pingIndexNow } from "@/lib/indexnow";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.INDEXNOW_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { urls?: unknown; all?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  let urls: string[] = [];
  if (body.all === true) {
    const entries = await sitemap();
    urls = entries.map((e) => e.url);
  } else if (Array.isArray(body.urls)) {
    urls = body.urls.filter((u): u is string => typeof u === "string");
  } else {
    return NextResponse.json(
      { error: "expected { urls: string[] } or { all: true }" },
      { status: 400 },
    );
  }

  const result = await pingIndexNow(urls);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
