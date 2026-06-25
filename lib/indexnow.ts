// IndexNow: 通知 Bing/Yandex/Seznam 内容已更新
// 协议文档: https://www.indexnow.org/documentation
//
// 用法:
//   import { pingIndexNow } from "@/lib/indexnow";
//   await pingIndexNow(["https://www.sanmu.ca/blog/foo"]);

const HOST = "www.sanmu.ca";
const ENDPOINT = "https://api.indexnow.org/indexnow";

export type IndexNowResult = {
  ok: boolean;
  status: number;
  message: string;
  submitted: number;
};

export async function pingIndexNow(urls: string[]): Promise<IndexNowResult> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    return { ok: false, status: 0, message: "INDEXNOW_KEY not set", submitted: 0 };
  }
  const list = urls.filter((u) => u.startsWith(`https://${HOST}/`));
  if (list.length === 0) {
    return { ok: false, status: 0, message: "no valid URLs", submitted: 0 };
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key,
      keyLocation: `https://${HOST}/${key}.txt`,
      urlList: list,
    }),
  });

  // 200 = OK, 202 = Accepted (排队中), 都视为成功
  const ok = res.status === 200 || res.status === 202;
  return {
    ok,
    status: res.status,
    message: ok ? "ok" : await res.text().catch(() => "unknown"),
    submitted: list.length,
  };
}
