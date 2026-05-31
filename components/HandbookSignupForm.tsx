"use client";

import { useState } from "react";

export function HandbookSignupForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="text-center py-2 text-paper/90">
        <p className="text-lg mb-1">✓ 谢谢你留下邮箱</p>
        <p className="text-sm opacity-75">
          三木会亲自把手册发给你
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
    >
      <input
        type="email"
        placeholder="your@email.com"
        required
        className="flex-1 px-4 py-3 bg-paper text-ink placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow text-base"
      />
      <button
        type="submit"
        className="bg-paper text-brand-navy px-7 py-3 text-base font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
      >
        申请索取
      </button>
    </form>
  );
}
