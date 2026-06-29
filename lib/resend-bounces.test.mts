import assert from "node:assert/strict";
import test from "node:test";

import {
  buildResendBounceNote,
  extractResendRecipientEmails,
  shouldSyncResendEvent,
  syncResendBounceToHandbookLeads,
} from "./resend-bounces.ts";

test("shouldSyncResendEvent only accepts deliverability risk events", () => {
  assert.equal(shouldSyncResendEvent("email.bounced"), true);
  assert.equal(shouldSyncResendEvent("email.suppressed"), true);
  assert.equal(shouldSyncResendEvent("email.complained"), true);

  assert.equal(shouldSyncResendEvent("email.delivered"), false);
  assert.equal(shouldSyncResendEvent("email.opened"), false);
  assert.equal(shouldSyncResendEvent(undefined), false);
});

test("extractResendRecipientEmails normalizes recipient addresses", () => {
  const emails = extractResendRecipientEmails({
    data: {
      to: [" Cindy@example.COM ", "bad-value", "second@example.com"],
    },
  });

  assert.deepEqual(emails, ["cindy@example.com", "second@example.com"]);
});

test("buildResendBounceNote includes event type and reason without leaking raw payload", () => {
  const note = buildResendBounceNote({
    type: "email.bounced",
    data: {
      bounce: {
        message: "mailbox does not exist",
      },
    },
  });

  assert.match(note, /Resend email\.bounced/);
  assert.match(note, /mailbox does not exist/);
  assert.ok(note.length < 500);
});

test("buildResendBounceNote includes suppressed event details", () => {
  const note = buildResendBounceNote({
    type: "email.suppressed",
    data: {
      suppressed: {
        message: "address is on suppression list",
      },
    },
  });

  assert.equal(note, "Resend email.suppressed: address is on suppression list");
});

test("syncResendBounceToHandbookLeads marks matching handbook lead invalid", async () => {
  const queries: unknown[] = [];
  const updates: unknown[] = [];
  const notion = {
    dataSources: {
      async query(args: unknown) {
        queries.push(args);
        return { results: [{ object: "page", id: "page-123" }] };
      },
    },
    pages: {
      async update(args: unknown) {
        updates.push(args);
        return {};
      },
    },
  };

  const result = await syncResendBounceToHandbookLeads(
    {
      type: "email.bounced",
      data: {
        to: ["lead@example.com"],
        bounce: { message: "mailbox not found" },
      },
    },
    {
      notion,
      dataSourceId: "handbook-ds",
      now: new Date("2026-06-28T10:00:00Z"),
    },
  );

  assert.deepEqual(result, {
    eventType: "email.bounced",
    ignored: false,
    emails: ["lead@example.com"],
    matched: 1,
    updated: 1,
  });
  assert.equal(queries.length, 1);
  assert.equal(updates.length, 1);
  assert.deepEqual(updates[0], {
    page_id: "page-123",
    properties: {
      Invalid: { checkbox: true },
      退信备注: {
        rich_text: [{ type: "text", text: { content: "Resend email.bounced: mailbox not found" } }],
      },
      退信时间: { date: { start: "2026-06-28" } },
    },
  });
});

test("syncResendBounceToHandbookLeads ignores non-risk events before touching Notion", async () => {
  const notion = {
    dataSources: {
      async query() {
        throw new Error("should not query Notion");
      },
    },
    pages: {
      async update() {
        throw new Error("should not update Notion");
      },
    },
  };

  const result = await syncResendBounceToHandbookLeads(
    { type: "email.delivered", data: { to: ["lead@example.com"] } },
    { notion, dataSourceId: "handbook-ds" },
  );

  assert.deepEqual(result, {
    eventType: "email.delivered",
    ignored: true,
    emails: ["lead@example.com"],
    matched: 0,
    updated: 0,
  });
});
