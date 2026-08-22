import assert from "node:assert/strict";
import test from "node:test";

import { buildEventIcs } from "./ics.ts";

const BASE = {
  uid: "life-care-lecture-vancouver-2026-09",
  title: "生命关怀公益讲座（第八期）",
  description: "免费遗嘱 + 身后事规划",
  location: "列治文殡仪馆 · 8420 Cambie Road, Richmond, BC",
  url: "https://www.sanmu.ca/events/life-care-lecture-vancouver-2026-09",
  start: "2026-09-27T17:00:00.000Z",
  end: "2026-09-27T20:00:00.000Z",
  now: new Date("2026-08-22T00:00:00.000Z"),
};

/** 把折行还原, 方便按逻辑行断言. 末尾 CRLF 会 split 出一个空串, 去掉 */
function unfold(ics: string): string[] {
  return ics
    .replace(/\r\n[ ]/g, "")
    .split("\r\n")
    .filter((l) => l !== "");
}

test("包含日历骨架与 PUBLISH 方法", () => {
  const lines = unfold(buildEventIcs(BASE));
  assert.equal(lines[0], "BEGIN:VCALENDAR");
  assert.ok(lines.includes("VERSION:2.0"));
  assert.ok(lines.includes("METHOD:PUBLISH"));
  assert.ok(lines.includes("BEGIN:VEVENT"));
  assert.ok(lines.includes("END:VEVENT"));
  assert.equal(lines.at(-1), "END:VCALENDAR");
});

test("时间输出为 UTC 绝对时间", () => {
  const lines = unfold(buildEventIcs(BASE));
  assert.ok(lines.includes("DTSTART:20260927T170000Z"));
  assert.ok(lines.includes("DTEND:20260927T200000Z"));
  assert.ok(lines.includes("DTSTAMP:20260822T000000Z"));
});

test("带时区偏移的输入换算成 UTC", () => {
  const lines = unfold(
    buildEventIcs({
      ...BASE,
      start: "2026-09-27T10:00:00-07:00",
      end: "2026-09-27T13:00:00-07:00",
    }),
  );
  assert.ok(lines.includes("DTSTART:20260927T170000Z"));
  assert.ok(lines.includes("DTEND:20260927T200000Z"));
});

test("缺结束时间时兜底为开始后 2 小时", () => {
  const lines = unfold(buildEventIcs({ ...BASE, end: null }));
  assert.ok(lines.includes("DTSTART:20260927T170000Z"));
  assert.ok(lines.includes("DTEND:20260927T190000Z"));
});

test("纯日期(无时间)的活动输出全天事件", () => {
  const lines = unfold(
    buildEventIcs({ ...BASE, start: "2026-07-26", end: null }),
  );
  assert.ok(lines.includes("DTSTART;VALUE=DATE:20260726"));
  // 全天事件的 DTEND 是排他的次日
  assert.ok(lines.includes("DTEND;VALUE=DATE:20260727"));
});

test("UID 稳定且带域名, 重发不会变成两条日历", () => {
  const a = unfold(buildEventIcs(BASE));
  const b = unfold(buildEventIcs({ ...BASE, now: new Date("2026-09-01T00:00:00.000Z") }));
  assert.ok(a.includes("UID:life-care-lecture-vancouver-2026-09@sanmu.ca"));
  assert.ok(b.includes("UID:life-care-lecture-vancouver-2026-09@sanmu.ca"));
});

test("TEXT 字段按 RFC 5545 转义反斜杠/分号/逗号/换行", () => {
  const lines = unfold(
    buildEventIcs({
      ...BASE,
      title: "讲座, 第八期; 免费\\现场",
      description: "第一行\n第二行",
    }),
  );
  assert.ok(lines.includes("SUMMARY:讲座\\, 第八期\\; 免费\\\\现场"));
  assert.ok(lines.includes("DESCRIPTION:第一行\\n第二行"));
});

test("冒号在 TEXT 里不转义", () => {
  const lines = unfold(buildEventIcs({ ...BASE, title: "时间: 10:00" }));
  assert.ok(lines.includes("SUMMARY:时间: 10:00"));
});

test("地点为空时不输出 LOCATION 行", () => {
  const lines = unfold(buildEventIcs({ ...BASE, location: null }));
  assert.ok(!lines.some((l) => l.startsWith("LOCATION")));
});

test("所有行按 UTF-8 字节折到 75 以内, 且不切断多字节字符", () => {
  const ics = buildEventIcs(BASE);
  for (const line of ics.split("\r\n")) {
    assert.ok(
      Buffer.byteLength(line, "utf8") <= 75,
      `行超过 75 字节: ${line}`,
    );
    // 折行不能把汉字劈成两半 —— 能原样解码回去就说明没劈
    assert.ok(!line.includes("�"), `出现替换字符, 多字节被切断: ${line}`);
  }
});

test("行尾一律 CRLF", () => {
  const ics = buildEventIcs(BASE);
  assert.ok(ics.endsWith("\r\n"));
  assert.ok(!/[^\r]\n/.test(ics), "存在裸 LF");
});
