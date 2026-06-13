import { track } from "@vercel/analytics";

type Params = Record<string, string | number | boolean>;

/**
 * 触发一个转化/自定义事件, 同时打到 GA4(gtag)和 Vercel Analytics.
 * 仅在客户端运行; gtag 未就绪时静默跳过.
 * GA4 里把对应事件标记为「关键事件 / Key Event」即可当转化统计。
 */
export function trackConversion(name: string, params?: Params): void {
  if (typeof window === "undefined") return;
  const w = window as typeof window & {
    gtag?: (command: string, eventName: string, params?: Params) => void;
  };
  w.gtag?.("event", name, params);
  try {
    track(name, params);
  } catch {
    // Vercel Analytics 未加载时忽略
  }
}
