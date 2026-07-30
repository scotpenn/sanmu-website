import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCanonicalEventUrl,
  buildEventbritePayload,
  buildEventbriteTicketClassPayload,
  buildNotionSyncProperties,
  getEventbriteOrgId,
  getEventbriteToken,
  validatePublishableEvent,
} from "./events-publish.mjs";

const event = {
  slug: "vancouver-water-splashing-festival-2026",
  title: "2026 温哥华泼水节",
  summary: "三木会在现场，摊位 #6。",
  date: "2026-07-26T11:00:00-07:00",
  dateEnd: "2026-07-26T18:00:00-07:00",
  location: "Swangard Stadium, 6100 Boundary Rd, Burnaby",
  coverImageUrl: "https://res.cloudinary.com/example/poster.png",
  eventbriteId: "",
  pageIds: ["page-hans", "page-hant"],
};

test("buildCanonicalEventUrl returns the simplified Sanmu event URL", () => {
  assert.equal(
    buildCanonicalEventUrl(event.slug),
    "https://www.sanmu.ca/events/vancouver-water-splashing-festival-2026",
  );
});

test("validatePublishableEvent rejects events without a start/end datetime range", () => {
  assert.deepEqual(validatePublishableEvent({ ...event, dateEnd: null }), [
    "Notion 日期必须包含结束时间 date.end",
  ]);
  assert.deepEqual(validatePublishableEvent({ ...event, date: "2026-07-26" }), [
    "Notion 日期.start 必须包含具体时间",
  ]);
});

test("Eventbrite payload includes Sanmu link and platform-friendly date fields", () => {
  const payload = buildEventbritePayload(event);

  assert.equal(payload.event.name.html, event.title);
  assert.equal(payload.event.start.timezone, "America/Vancouver");
  assert.equal(payload.event.start.utc, "2026-07-26T18:00:00Z");
  assert.equal(payload.event.end.timezone, "America/Vancouver");
  assert.equal(payload.event.end.utc, "2026-07-27T01:00:00Z");
  assert.equal("locale" in payload.event, false);
  assert.match(payload.event.description.html, /https:\/\/www\.sanmu\.ca\/events\/vancouver-water-splashing-festival-2026/);
  assert.match(payload.event.description.html, /English information/);
});

test("Eventbrite ticket class payload keeps Sanmu link visible", () => {
  const payload = buildEventbriteTicketClassPayload(event);

  assert.equal(payload.ticket_class.free, true);
  assert.equal(payload.ticket_class.name, "免费入场 / RSVP");
  assert.match(payload.ticket_class.description, /https:\/\/www\.sanmu\.ca\/events\/vancouver-water-splashing-festival-2026/);
  assert.equal(payload.ticket_class.sales_end, "2026-07-27T01:00:00Z");
});

test("buildNotionSyncProperties records Eventbrite success", () => {
  const props = buildNotionSyncProperties(
    {
      eventbrite: {
        ok: true,
        id: "12345",
        url: "https://eventbrite.com/e/12345",
      },
    },
    new Date("2026-07-07T20:00:00Z"),
  );

  assert.deepEqual(props, {
    "平台同步状态": { select: { name: "已同步" } },
    "Eventbrite ID": { rich_text: [{ type: "text", text: { content: "12345" } }] },
    "Eventbrite URL": { url: "https://eventbrite.com/e/12345" },
    "Eventbrite 同步状态": { select: { name: "已同步" } },
    "平台同步错误": { rich_text: [] },
    "平台同步时间": { date: { start: "2026-07-07T20:00:00.000Z" } },
  });
});

test("buildNotionSyncProperties keeps Eventbrite id and url when publish fails", () => {
  const props = buildNotionSyncProperties(
    {
      eventbrite: {
        ok: false,
        id: "1993496889861",
        url: "https://www.eventbrite.ca/e/example-1993496889861",
        error: "Eventbrite 已创建草稿但未公开发布: tickets missing",
      },
    },
    new Date("2026-07-07T20:00:00Z"),
  );

  assert.equal(props["平台同步状态"].select.name, "失败");
  assert.equal(props["Eventbrite 同步状态"].select.name, "失败");
  assert.deepEqual(props["Eventbrite ID"], {
    rich_text: [{ type: "text", text: { content: "1993496889861" } }],
  });
  assert.equal(props["Eventbrite URL"].url, "https://www.eventbrite.ca/e/example-1993496889861");
  assert.match(
    props["平台同步错误"].rich_text[0].text.content,
    /Eventbrite 已创建草稿但未公开发布/,
  );
});

test("getEventbriteToken accepts the existing local env key name", () => {
  assert.equal(
    getEventbriteToken({ Eventbrite_API_Key: "legacy-key" }),
    "legacy-key",
  );
  assert.equal(
    getEventbriteToken({ EVENTBRITE_TOKEN: "token", Eventbrite_API_Key: "legacy-key" }),
    "token",
  );
});

test("getEventbriteOrgId discovers a single organization when env id is absent", async () => {
  const orgId = await getEventbriteOrgId(
    "token",
    "https://eventbrite.test",
    {},
    async (url, options) => {
      assert.equal(url, "https://eventbrite.test/v3/users/me/organizations/");
      assert.equal(options.headers.Authorization, "Bearer token");
      return {
        ok: true,
        text: async () => JSON.stringify({ organizations: [{ id: "3007509900725" }] }),
      };
    },
  );

  assert.equal(orgId, "3007509900725");
});
