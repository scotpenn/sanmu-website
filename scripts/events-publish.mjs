#!/usr/bin/env node

import { Client as NotionClient } from "@notionhq/client";
import { fileURLToPath } from "node:url";

const EVENTS_DATA_SOURCE_ID = "d5b3cb57-7b27-4acd-b936-ae2ca6f275f1";
const SITE_BASE_URL = "https://www.sanmu.ca";
const TIME_ZONE = "America/Vancouver";

const REQUIRED_SYNC_PROPERTIES = {
  平台同步状态: "select",
  "Eventbrite ID": "rich_text",
  "Eventbrite URL": "url",
  "Eventbrite 同步状态": "select",
  平台同步错误: "rich_text",
  平台同步时间: "date",
};

function richTextToPlainText(richText = []) {
  return richText.map((item) => item.plain_text ?? "").join("");
}

function titleToPlainText(title = []) {
  return title.map((item) => item.plain_text ?? "").join("");
}

function firstExternalFileUrl(prop) {
  if (!prop || prop.type !== "files") return null;
  const file = prop.files.find((item) => item.type === "external");
  return file?.external?.url ?? null;
}

function selectName(prop) {
  return prop?.type === "select" ? prop.select?.name ?? "" : "";
}

function urlValue(prop) {
  return prop?.type === "url" ? prop.url ?? "" : "";
}

function textValue(prop) {
  return prop?.type === "rich_text" ? richTextToPlainText(prop.rich_text).trim() : "";
}

function isDateTime(value) {
  return typeof value === "string" && value.includes("T");
}

export function buildCanonicalEventUrl(slug, baseUrl = SITE_BASE_URL) {
  return `${baseUrl.replace(/\/+$/, "")}/events/${slug}`;
}

export function getEventbriteToken(env = process.env) {
  return env.EVENTBRITE_TOKEN || env.EVENTBRITE_API_KEY || env.Eventbrite_API_Key || "";
}

export async function getEventbriteOrgId(
  token,
  baseUrl,
  env = process.env,
  fetchImpl = fetch,
) {
  if (env.EVENTBRITE_ORG_ID) return env.EVENTBRITE_ORG_ID;

  const response = await fetchImpl(`${baseUrl}/v3/users/me/organizations/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Eventbrite organizations API ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = body ? JSON.parse(body) : {};
  const organizations = Array.isArray(data.organizations) ? data.organizations : [];
  if (organizations.length === 1 && organizations[0]?.id) {
    return organizations[0].id;
  }
  if (organizations.length > 1) {
    const ids = organizations
      .map((org) => `${org.name || "(unnamed)"}=${org.id}`)
      .join(", ");
    throw new Error(`Eventbrite 账号下有多个 organization, 请设置 EVENTBRITE_ORG_ID: ${ids}`);
  }
  throw new Error("Eventbrite 账号下没有可用 organization");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function textParagraphsToHtml(lines) {
  return lines
    .filter((line) => line && line.trim())
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function buildPlatformDescriptionHtml(event) {
  const canonicalUrl = buildCanonicalEventUrl(event.slug);
  const chinese = [
    event.summary,
    event.location ? `地点：${event.location}` : "",
    `官方活动页 / 报名入口：${canonicalUrl}`,
  ];
  const english = [
    "English information",
    `Official event page and registration: ${canonicalUrl}`,
    event.location ? `Venue: ${event.location}` : "",
    "All registration and latest updates are handled on sanmu.ca.",
  ];

  return [
    textParagraphsToHtml(chinese),
    "<hr>",
    textParagraphsToHtml(english),
  ].join("");
}

function isoUtc(value) {
  return new Date(value).toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function validatePublishableEvent(event) {
  const errors = [];
  if (!event.slug) errors.push("Notion Slug 不能为空");
  if (!event.title) errors.push("Notion 标题不能为空");
  if (!event.date) errors.push("Notion 日期.start 不能为空");
  if (event.date && !isDateTime(event.date)) {
    errors.push("Notion 日期.start 必须包含具体时间");
  }
  if (!event.dateEnd) {
    errors.push("Notion 日期必须包含结束时间 date.end");
  } else if (!isDateTime(event.dateEnd)) {
    errors.push("Notion 日期.end 必须包含具体时间");
  }
  if (event.date && event.dateEnd && new Date(event.dateEnd) <= new Date(event.date)) {
    errors.push("Notion 日期.end 必须晚于 date.start");
  }
  return errors;
}

export function buildEventbritePayload(event) {
  return {
    event: {
      name: { html: event.title },
      description: { html: buildPlatformDescriptionHtml(event) },
      start: {
        timezone: TIME_ZONE,
        utc: isoUtc(event.date),
      },
      end: {
        timezone: TIME_ZONE,
        utc: isoUtc(event.dateEnd),
      },
      currency: "CAD",
      online_event: false,
      listed: true,
      shareable: true,
      invite_only: false,
    },
  };
}

export function buildEventbriteTicketClassPayload(event) {
  const canonicalUrl = buildCanonicalEventUrl(event.slug);
  return {
    // Eventbrite requires at least one ticket class before an event can go live.
    ticket_class: {
      name: "免费入场 / RSVP",
      description: `官方活动页 / Official event page: ${canonicalUrl}`,
      free: true,
      quantity_total: 2000,
      sales_start: isoUtc(new Date()),
      sales_end: isoUtc(event.dateEnd || event.date),
      donation: false,
    },
  };
}

function richTextProperty(value) {
  return {
    rich_text: value
      ? [{ type: "text", text: { content: String(value).slice(0, 1900) } }]
      : [],
  };
}

export function buildNotionSyncProperties(results, now = new Date()) {
  const props = {
    平台同步时间: { date: { start: now.toISOString() } },
  };
  const errors = [];
  const platformOutcomes = [];

  if (results.eventbrite) {
    platformOutcomes.push(results.eventbrite.ok);
    props["Eventbrite 同步状态"] = {
      select: { name: results.eventbrite.ok ? "已同步" : "失败" },
    };
    if (results.eventbrite.id) {
      props["Eventbrite ID"] = richTextProperty(results.eventbrite.id);
    }
    if ("url" in results.eventbrite) {
      props["Eventbrite URL"] = { url: results.eventbrite.url || null };
    }
    if (results.eventbrite.ok) {
      // ID and URL are handled above so partial states can also avoid duplicates.
    } else if (results.eventbrite.error) {
      errors.push(results.eventbrite.error);
    }
  }

  const okCount = platformOutcomes.filter(Boolean).length;
  const failedCount = platformOutcomes.length - okCount;
  const overall =
    failedCount === 0 ? "已同步" : okCount > 0 ? "部分失败" : "失败";

  props["平台同步状态"] = { select: { name: overall } };
  props["平台同步错误"] = richTextProperty(errors.join("；"));
  return props;
}

export function validateSyncSchema(dataSource) {
  const missing = [];
  const wrongType = [];
  const properties = dataSource?.properties ?? {};
  for (const [name, expectedType] of Object.entries(REQUIRED_SYNC_PROPERTIES)) {
    const prop = properties[name];
    if (!prop) {
      missing.push(name);
    } else if (prop.type !== expectedType) {
      wrongType.push(`${name} 应为 ${expectedType}, 当前是 ${prop.type}`);
    }
  }
  return { missing, wrongType, ok: missing.length === 0 && wrongType.length === 0 };
}

function eventbriteUrlFor(id, data = {}) {
  return data.url || data.vanity_url || (id ? `https://www.eventbrite.com/e/${id}` : "");
}

function parseEventPage(page) {
  const props = page.properties ?? {};
  const date = props["日期"]?.type === "date" ? props["日期"].date : null;
  return {
    pageId: page.id,
    slug: textValue(props["Slug"]),
    locale: selectName(props["语言版本"]) || "zh-Hans",
    title: props["标题"]?.type === "title" ? titleToPlainText(props["标题"].title).trim() : "",
    summary: textValue(props["简介"]),
    date: date?.start ?? "",
    dateEnd: date?.end ?? null,
    location: textValue(props["地点"]),
    status: selectName(props["状态"]),
    coverImageUrl: firstExternalFileUrl(props["封面图"]),
    eventbriteId: textValue(props["Eventbrite ID"]),
    eventbriteUrl: urlValue(props["Eventbrite URL"]),
    eventbriteSyncStatus: selectName(props["Eventbrite 同步状态"]),
  };
}

function mergeEventPages(pages) {
  const parsed = pages.map(parseEventPage);
  const primary = parsed.find((page) => page.locale === "zh-Hans") ?? parsed[0];
  if (!primary) return null;
  return {
    ...primary,
    pageIds: parsed.map((page) => page.pageId),
    eventbriteId: parsed.find((page) => page.eventbriteId)?.eventbriteId ?? primary.eventbriteId,
    eventbriteUrl: parsed.find((page) => page.eventbriteUrl)?.eventbriteUrl ?? primary.eventbriteUrl,
  };
}

async function findEventBySlug(notion, slug) {
  const response = await notion.dataSources.query({
    data_source_id: EVENTS_DATA_SOURCE_ID,
    filter: { property: "Slug", rich_text: { equals: slug } },
    page_size: 10,
  });
  const pages = response.results.filter((item) => "properties" in item);
  return mergeEventPages(pages);
}

async function createEventbriteEvent(event) {
  const token = getEventbriteToken();
  if (!token) {
    throw new Error("缺少 EVENTBRITE_TOKEN, EVENTBRITE_API_KEY 或 Eventbrite_API_Key");
  }
  const baseUrl = process.env.EVENTBRITE_API_BASE_URL || "https://www.eventbriteapi.com";

  async function readEvent(id) {
    const response = await fetch(`${baseUrl}/v3/events/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await response.text();
    if (!response.ok) {
      throw new Error(`Eventbrite get event API ${response.status}: ${body.slice(0, 500)}`);
    }
    const data = body ? JSON.parse(body) : {};
    return {
      id,
      url: eventbriteUrlFor(id, data),
      status: data.status || "",
    };
  }

  async function ensureTicketClass(id) {
    const listResponse = await fetch(`${baseUrl}/v3/events/${id}/ticket_classes/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listBody = await listResponse.text();
    if (!listResponse.ok) {
      throw new Error(`Eventbrite ticket classes API ${listResponse.status}: ${listBody.slice(0, 500)}`);
    }
    const existing = listBody ? JSON.parse(listBody) : {};
    if (Array.isArray(existing.ticket_classes) && existing.ticket_classes.length > 0) {
      return existing.ticket_classes[0];
    }

    const createResponse = await fetch(`${baseUrl}/v3/events/${id}/ticket_classes/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildEventbriteTicketClassPayload(event)),
    });
    const createBody = await createResponse.text();
    if (!createResponse.ok) {
      throw new Error(`Eventbrite create ticket API ${createResponse.status}: ${createBody.slice(0, 500)}`);
    }
    return createBody ? JSON.parse(createBody) : {};
  }

  async function publishEvent(id, fallbackUrl) {
    const current = await readEvent(id);
    if (current.status === "live") {
      return { ok: true, id, url: current.url || fallbackUrl, status: current.status };
    }

    await ensureTicketClass(id);

    const response = await fetch(`${baseUrl}/v3/events/${id}/publish/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await response.text();
    if (!response.ok) {
      return {
        ok: false,
        id,
        url: current.url || fallbackUrl,
        status: current.status,
        error: `Eventbrite 已创建草稿但未公开发布: ${body.slice(0, 500)}`,
      };
    }

    const published = await readEvent(id);
    return {
      ok: published.status === "live",
      id,
      url: published.url || fallbackUrl,
      status: published.status,
      error: published.status === "live" ? undefined : `Eventbrite publish 后状态仍为 ${published.status}`,
    };
  }

  if (event.eventbriteId) {
    return publishEvent(event.eventbriteId, event.eventbriteUrl || `https://www.eventbrite.com/e/${event.eventbriteId}`);
  }

  const orgId = await getEventbriteOrgId(token, baseUrl);
  const response = await fetch(`${baseUrl}/v3/organizations/${orgId}/events/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildEventbritePayload(event)),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Eventbrite API ${response.status}: ${body.slice(0, 500)}`);
  }
  const data = body ? JSON.parse(body) : {};
  const id = data.id || data.event?.id;
  if (!id) {
    throw new Error(`Eventbrite create event API 未返回 id: ${body.slice(0, 500)}`);
  }
  return publishEvent(id, eventbriteUrlFor(id, data));
}

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--slug") {
      args.slug = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.slug) {
    console.error("用法: npm run events:publish -- --slug <event-slug> [--dry-run]");
    process.exit(2);
  }
  if (!process.env.NOTION_TOKEN) {
    console.error("✗ 缺少 NOTION_TOKEN");
    process.exit(1);
  }

  const notion = new NotionClient({ auth: process.env.NOTION_TOKEN });
  const dataSource = await notion.dataSources.retrieve({
    data_source_id: EVENTS_DATA_SOURCE_ID,
  });
  const schema = validateSyncSchema(dataSource);
  if (!schema.ok) {
    console.error("✗ Notion Events 库缺少平台同步字段:");
    for (const name of schema.missing) console.error(`  - 缺少: ${name}`);
    for (const item of schema.wrongType) console.error(`  - 类型错误: ${item}`);
    process.exit(1);
  }

  const event = await findEventBySlug(notion, args.slug);
  if (!event) {
    console.error(`✗ Notion Events 库里没找到 slug="${args.slug}" 的活动`);
    process.exit(1);
  }

  const validationErrors = validatePublishableEvent(event);
  if (validationErrors.length) {
    console.error("✗ 活动资料不完整, 不会同步外部平台:");
    for (const error of validationErrors) console.error(`  - ${error}`);
    process.exit(1);
  }

  const payloads = {
    eventbrite: buildEventbritePayload(event),
  };
  console.log(`→ 活动: ${event.title}`);
  console.log(`→ 官网: ${buildCanonicalEventUrl(event.slug)}`);
  if (args.dryRun) {
    console.log("\n--dry-run: 不调用外部 API, 不回写 Notion。\n");
    console.log(JSON.stringify(payloads, null, 2));
    return;
  }

  const results = {};
  try {
    results.eventbrite = await createEventbriteEvent(event);
    if (results.eventbrite.ok) {
      console.log(`✓ eventbrite 同步完成: ${results.eventbrite.id || "(no id)"}`);
    } else {
      console.error(`✗ eventbrite 同步失败: ${results.eventbrite.error}`);
    }
  } catch (error) {
    results.eventbrite = { ok: false, error: error.message };
    console.error(`✗ eventbrite 同步失败: ${error.message}`);
  }

  const properties = buildNotionSyncProperties(results);
  for (const pageId of event.pageIds) {
    await notion.pages.update({ page_id: pageId, properties });
  }
  console.log("✓ Notion 平台同步字段已回写");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(`\n✗ 失败: ${error.message}`);
    process.exit(1);
  });
}
