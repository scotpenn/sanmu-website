import assert from "node:assert/strict";
import test from "node:test";

import {
  formatEventDateLabel,
  isEventPast,
} from "./event-dates.ts";

test("formatEventDateLabel preserves date-only labels without timezone drift", () => {
  assert.equal(
    formatEventDateLabel("2026-07-26", null, "zh-Hant"),
    "2026 年 7 月 26 日（週日）",
  );
});

test("formatEventDateLabel includes a same-day time range for datetime events", () => {
  assert.equal(
    formatEventDateLabel(
      "2026-07-26T11:00:00-07:00",
      "2026-07-26T18:00:00-07:00",
      "zh-Hans",
    ),
    "2026 年 7 月 26 日（周日）11:00-18:00",
  );
});

test("isEventPast compares datetime ranges by their Vancouver end date", () => {
  const now = new Date("2026-07-27T08:00:00Z"); // 2026-07-27 01:00 Vancouver

  assert.equal(
    isEventPast("2026-07-26T23:00:00-07:00", "2026-07-27T00:30:00-07:00", now),
    false,
  );
  assert.equal(
    isEventPast("2026-07-25T11:00:00-07:00", "2026-07-25T18:00:00-07:00", now),
    true,
  );
});
