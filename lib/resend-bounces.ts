import { Client } from "@notionhq/client";

const HANDBOOK_EMAIL_PROPERTY = "邮箱";
const INVALID_PROPERTY = "Invalid";
const BOUNCE_NOTE_PROPERTY = "退信备注";
const BOUNCE_DATE_PROPERTY = "退信时间";
const NOTE_MAX_LENGTH = 1800;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SYNC_EVENTS = new Set(["email.bounced", "email.suppressed", "email.complained"]);

type UnknownRecord = Record<string, unknown>;

type NotionPageLike = { id?: string; object?: string };

type NotionLike = {
  dataSources: {
    query: (args: UnknownRecord) => Promise<{ results: NotionPageLike[] }>;
  };
  pages: {
    update: (args: UnknownRecord) => Promise<unknown>;
  };
};

export type ResendBounceSyncResult = {
  eventType: string | null;
  ignored: boolean;
  emails: string[];
  matched: number;
  updated: number;
};

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeEmail(value: unknown): string | null {
  const email = asString(value).trim().toLowerCase();
  return EMAIL_RE.test(email) ? email : null;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function shouldSyncResendEvent(eventType: unknown): boolean {
  return typeof eventType === "string" && SYNC_EVENTS.has(eventType);
}

export function extractResendRecipientEmails(payload: unknown): string[] {
  const data = asRecord(asRecord(payload).data);
  const rawTo = data.to;
  const candidates = Array.isArray(rawTo) ? rawTo : [rawTo, data.email, data.recipient];

  return unique(
    candidates
      .map(normalizeEmail)
      .filter((email): email is string => Boolean(email)),
  );
}

function extractReason(payload: unknown): string {
  const data = asRecord(asRecord(payload).data);
  const bounce = asRecord(data.bounce);
  const suppressed = asRecord(data.suppressed);
  return (
    asString(bounce.message) ||
    asString(bounce.reason) ||
    asString(suppressed.message) ||
    asString(suppressed.type) ||
    asString(data.reason) ||
    asString(data.error) ||
    asString(data.status) ||
    ""
  ).trim();
}

export function buildResendBounceNote(payload: unknown): string {
  const eventType = asString(asRecord(payload).type) || "unknown";
  const reason = extractReason(payload);
  const note = reason ? `Resend ${eventType}: ${reason}` : `Resend ${eventType}`;
  return note.slice(0, NOTE_MAX_LENGTH);
}

function getHandbookDataSourceId(explicitDataSourceId?: string): string {
  const dataSourceId = explicitDataSourceId || process.env.NOTION_HANDBOOK_DS_ID;
  if (!dataSourceId) {
    throw new Error("NOTION_HANDBOOK_DS_ID 未设置");
  }
  return dataSourceId;
}

function getNotionClient(explicitClient?: NotionLike): NotionLike {
  if (explicitClient) return explicitClient;

  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error("NOTION_TOKEN 未设置");
  }
  return new Client({ auth: token }) as unknown as NotionLike;
}

function todayISO(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

async function findHandbookLeadPages(
  notion: NotionLike,
  dataSourceId: string,
  email: string,
): Promise<NotionPageLike[]> {
  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    page_size: 10,
    filter: {
      property: HANDBOOK_EMAIL_PROPERTY,
      title: { equals: email },
    },
  });
  return response.results.filter((page) => page.object === "page" && page.id);
}

async function markPageInvalid(
  notion: NotionLike,
  pageId: string,
  note: string,
  date: string,
): Promise<void> {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      [INVALID_PROPERTY]: { checkbox: true },
      [BOUNCE_NOTE_PROPERTY]: {
        rich_text: [{ type: "text", text: { content: note } }],
      },
      [BOUNCE_DATE_PROPERTY]: { date: { start: date } },
    },
  });
}

export async function syncResendBounceToHandbookLeads(
  payload: unknown,
  options: {
    notion?: NotionLike;
    dataSourceId?: string;
    now?: Date;
  } = {},
): Promise<ResendBounceSyncResult> {
  const eventType = asString(asRecord(payload).type) || null;
  const emails = extractResendRecipientEmails(payload);

  if (!shouldSyncResendEvent(eventType)) {
    return { eventType, ignored: true, emails, matched: 0, updated: 0 };
  }

  const notion = getNotionClient(options.notion);
  const dataSourceId = getHandbookDataSourceId(options.dataSourceId);
  const note = buildResendBounceNote(payload);
  const date = todayISO(options.now);

  let matched = 0;
  let updated = 0;
  for (const email of emails) {
    const pages = await findHandbookLeadPages(notion, dataSourceId, email);
    matched += pages.length;
    for (const page of pages) {
      await markPageInvalid(notion, page.id!, note, date);
      updated += 1;
    }
  }

  return { eventType, ignored: false, emails, matched, updated };
}
