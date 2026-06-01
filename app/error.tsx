"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 上报给 Vercel / GA4 错误监控 (浏览器层面)
    console.error("[sanmu.ca] page-level error:", error);
  }, [error]);

  return (
    <section>
      <Container width="reading" className="py-20 md:py-32 text-center">
        <div className="text-xs font-en uppercase tracking-widest text-brand-navy/70 mb-4 font-medium">
          Something went wrong
        </div>
        <h1 className="text-3xl md:text-4xl mb-6">页面出了点问题</h1>
        <p className="text-lg opacity-80 mb-10 max-w-[520px] mx-auto leading-relaxed">
          这不是你的错。可能是网络抽风，也可能是我们代码里的 bug。点下面"再试一次"通常能恢复。
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Button variant="primary" onClick={reset}>
            再试一次
          </Button>
          <Link
            href="/"
            className="text-sm font-medium text-brand-navy hover:opacity-80 transition-opacity"
          >
            ← 回首页
          </Link>
        </div>

        {error.digest && (
          <p className="text-xs opacity-50 font-en mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <p className="text-sm opacity-60">
          反复出现？把上面 Error ID 截图发给三木：{" "}
          <a
            href="mailto:info@sanmu.ca"
            className="text-brand-navy hover:opacity-80 transition-opacity font-medium"
          >
            info@sanmu.ca
          </a>
        </p>
      </Container>
    </section>
  );
}
