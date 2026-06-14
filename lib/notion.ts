import { Client } from "@notionhq/client";
import https from "node:https";
import type {
  BlockObjectResponse,
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/i18n";

// data_source_id of 📝 Blog 博客 (固定 ID, 不会变)
const BLOG_DATA_SOURCE_ID = "319407d1-e400-4aed-8e36-dfa0ab19e6ea";
// data_source_id of 📅 Events 线下活动
const EVENTS_DATA_SOURCE_ID = "d5b3cb57-7b27-4acd-b936-ae2ca6f275f1";

let notionClient: Client | null = null;

async function notionHttpFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const request = new Request(input, init);
  const url = new URL(request.url);
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : Buffer.from(await request.arrayBuffer());

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: request.method,
        protocol: url.protocol,
        hostname: url.hostname,
        path: `${url.pathname}${url.search}`,
        headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => {
          const responseHeaders = new Headers();
          for (const [key, value] of Object.entries(res.headers)) {
            if (Array.isArray(value)) {
              for (const item of value) responseHeaders.append(key, item);
            } else if (value !== undefined) {
              responseHeaders.set(key, value);
            }
          }
          resolve(
            new Response(Buffer.concat(chunks), {
              status: res.statusCode,
              statusText: res.statusMessage,
              headers: responseHeaders,
            }),
          );
        });
      },
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function getNotionClient(): Client {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error(
      "NOTION_TOKEN 环境变量未设置。本地: 在 .env.local 加 NOTION_TOKEN=secret_xxx。生产: 在 Vercel Settings → Environment Variables 加。",
    );
  }
  if (!notionClient) {
    notionClient = new Client({ auth: token, fetch: notionHttpFetch });
  }
  return notionClient;
}

// ============ Types ============

export type RichSegment = { text: string; href?: string };

export type PostBlock =
  | { type: "paragraph"; segments: RichSegment[] }
  | { type: "quote"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "video"; videoId: string }
  | { type: "list"; ordered: boolean; items: RichSegment[][] }
  | { type: "table"; hasColumnHeader: boolean; rows: RichSegment[][][] };

export type PostCategory = "实用指南" | "精神疗愈" | "关系重塑";

export type PostMeta = {
  slug: string;
  locale: Locale;
  title: string;
  subtitle: string;
  date: string; // ISO date string
  readMinutes: number;
  tags: string[];
  category: PostCategory | null;
  videoId: string | null;
};

export type Post = PostMeta & {
  blocks: PostBlock[];
};

// ============ Helpers ============

function richTextToPlainText(richText: RichTextItemResponse[]): string {
  return richText.map((rt) => rt.plain_text).join("");
}

function extractVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  return match?.[1] ?? null;
}

function parseProperties(page: PageObjectResponse): PostMeta | null {
  const props = page.properties;

  const titleProp = props["标题"];
  const slugProp = props["Slug"];
  const subtitleProp = props["摘要"];
  const dateProp = props["发布日期"];
  const readProp = props["阅读时长"];
  const tagsProp = props["关键词"];
  const categoryProp = props["类型"];
  const videoProp = props["视频链接"];
  const localeProp = props["语言版本"];

  if (!titleProp || titleProp.type !== "title") return null;
  if (!slugProp || slugProp.type !== "rich_text") return null;
  if (!dateProp || dateProp.type !== "date") return null;

  const slug = richTextToPlainText(slugProp.rich_text).trim();
  if (!slug) return null;

  const title = richTextToPlainText(titleProp.title).trim();
  if (!title) return null;

  return {
    slug,
    locale:
      localeProp?.type === "select" && localeProp.select
        ? (localeProp.select.name as Locale)
        : DEFAULT_LOCALE,
    title,
    subtitle:
      subtitleProp?.type === "rich_text"
        ? richTextToPlainText(subtitleProp.rich_text).trim()
        : "",
    date: dateProp.date?.start ?? "",
    readMinutes: readProp?.type === "number" ? readProp.number ?? 0 : 0,
    tags:
      tagsProp?.type === "multi_select"
        ? tagsProp.multi_select.map((t) => t.name)
        : [],
    category:
      categoryProp?.type === "select" && categoryProp.select
        ? (categoryProp.select.name as PostCategory)
        : null,
    videoId:
      videoProp?.type === "url" ? extractVideoId(videoProp.url) : null,
  };
}

async function parseBlocks(
  blocks: BlockObjectResponse[],
  notion: Client,
): Promise<PostBlock[]> {
  const result: PostBlock[] = [];
  let listBuffer: { ordered: boolean; items: RichSegment[][] } | null = null;

  const flushList = () => {
    if (listBuffer && listBuffer.items.length) {
      result.push({ type: "list", ordered: listBuffer.ordered, items: listBuffer.items });
    }
    listBuffer = null;
  };
  const toSegments = (rt: { plain_text: string; href: string | null }[]): RichSegment[] =>
    rt.map((t) => ({ text: t.plain_text, href: t.href ?? undefined }));

  for (const b of blocks) {
    // 连续列表项归组
    if (b.type === "bulleted_list_item" || b.type === "numbered_list_item") {
      const ordered = b.type === "numbered_list_item";
      const seg = toSegments(
        b.type === "numbered_list_item"
          ? b.numbered_list_item.rich_text
          : b.bulleted_list_item.rich_text,
      );
      if (!listBuffer || listBuffer.ordered !== ordered) {
        flushList();
        listBuffer = { ordered, items: [] };
      }
      if (seg.some((s) => s.text.trim())) listBuffer.items.push(seg);
      // 嵌套子项: 展平追加(不丢内容)
      if (b.has_children) {
        const kids = await fetchAllBlocks(notion, b.id);
        for (const k of kids) {
          if (k.type === "bulleted_list_item" || k.type === "numbered_list_item") {
            const ks = toSegments(
              k.type === "numbered_list_item"
                ? k.numbered_list_item.rich_text
                : k.bulleted_list_item.rich_text,
            );
            if (ks.some((s) => s.text.trim())) listBuffer.items.push(ks);
          }
        }
      }
      continue;
    }
    flushList();

    switch (b.type) {
      case "paragraph": {
        // —— 与原实现一致 ——
        const segments: RichSegment[] = b.paragraph.rich_text.map((rt) => ({
          text: rt.plain_text,
          href: rt.href ?? undefined,
        }));
        if (segments.some((s) => s.text.trim())) {
          result.push({ type: "paragraph", segments });
        }
        break;
      }
      case "quote": {
        const text = richTextToPlainText(b.quote.rich_text).trim();
        if (text) result.push({ type: "quote", text });
        break;
      }
      case "heading_2": {
        const text = richTextToPlainText(b.heading_2.rich_text).trim();
        if (text) result.push({ type: "heading", level: 2, text });
        break;
      }
      case "heading_3": {
        const text = richTextToPlainText(b.heading_3.rich_text).trim();
        if (text) result.push({ type: "heading", level: 3, text });
        break;
      }
      case "video": {
        const url = b.video.type === "external" ? b.video.external.url : null;
        const videoId = extractVideoId(url);
        if (videoId) result.push({ type: "video", videoId });
        break;
      }
      case "table": {
        const rowBlocks = await fetchAllBlocks(notion, b.id);
        const rows: RichSegment[][][] = [];
        for (const rb of rowBlocks) {
          if (rb.type === "table_row") {
            rows.push(rb.table_row.cells.map((cell) => toSegments(cell)));
          }
        }
        if (rows.length) {
          result.push({ type: "table", hasColumnHeader: b.table.has_column_header, rows });
        }
        break;
      }
    }
  }
  flushList();
  return result;
}

async function fetchAllBlocks(
  notion: Client,
  blockId: string,
): Promise<BlockObjectResponse[]> {
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined = undefined;
  do {
    const resp = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const b of resp.results) {
      if ("type" in b) blocks.push(b as BlockObjectResponse);
    }
    cursor = resp.next_cursor ?? undefined;
  } while (cursor);
  return blocks;
}

// ============ Public API ============

/**
 * 获取所有「已发布」状态的博客 (按发布日期降序). 不含 page content blocks.
 * 用于: 博客列表页 / 首页"最近文章"
 */
export async function getAllPosts(
  locale: Locale = DEFAULT_LOCALE,
): Promise<PostMeta[]> {
  const notion = getNotionClient();

  const response = await notion.dataSources.query({
    data_source_id: BLOG_DATA_SOURCE_ID,
    filter: {
      and: [
        { property: "状态", select: { equals: "已发布" } },
        { property: "语言版本", select: { equals: locale } },
      ],
    },
    sorts: [{ property: "发布日期", direction: "descending" }],
    page_size: 100,
  });

  const posts: PostMeta[] = [];
  for (const page of response.results) {
    if (!("properties" in page)) continue;
    const meta = parseProperties(page as PageObjectResponse);
    if (meta) posts.push(meta);
  }
  return posts;
}

/**
 * 获取所有「已发布」博客的 slug 列表, 给 generateStaticParams 用.
 */
export async function getAllSlugs(
  locale: Locale = DEFAULT_LOCALE,
): Promise<string[]> {
  const posts = await getAllPosts(locale);
  return posts.map((p) => p.slug);
}

/**
 * 某博客 slug 已发布的语言版本集合 (按 简→繁 稳定排序). 给 hreflang 用.
 * 规范上简繁一起发布会返回两种; 过渡期(只发了一种)会只返回一种,
 * 让 hreflang 不去 emit 指向 404 的另一语言版本。
 */
export async function getPublishedPostLocales(slug: string): Promise<Locale[]> {
  const notion = getNotionClient();
  const response = await notion.dataSources.query({
    data_source_id: BLOG_DATA_SOURCE_ID,
    filter: {
      and: [
        { property: "Slug", rich_text: { equals: slug } },
        { property: "状态", select: { equals: "已发布" } },
      ],
    },
    page_size: 10,
  });
  const found = new Set<Locale>();
  for (const page of response.results) {
    if (!("properties" in page)) continue;
    const lp = (page as PageObjectResponse).properties["语言版本"];
    if (lp?.type === "select" && lp.select) {
      const name = lp.select.name;
      if (name === "zh-Hans" || name === "zh-Hant") found.add(name);
    }
  }
  return LOCALES.filter((l) => found.has(l));
}

/** 某活动 slug 已发布的语言版本集合 (按 简→繁 稳定排序). 给 hreflang 用. */
export async function getPublishedEventLocales(slug: string): Promise<Locale[]> {
  const notion = getNotionClient();
  const response = await notion.dataSources.query({
    data_source_id: EVENTS_DATA_SOURCE_ID,
    filter: {
      and: [
        { property: "Slug", rich_text: { equals: slug } },
        {
          or: [
            { property: "状态", select: { equals: "即将举办" } },
            { property: "状态", select: { equals: "报名中" } },
            { property: "状态", select: { equals: "已举办" } },
          ],
        },
      ],
    },
    page_size: 10,
  });
  const found = new Set<Locale>();
  for (const page of response.results) {
    if (!("properties" in page)) continue;
    const lp = (page as PageObjectResponse).properties["语言版本"];
    if (lp?.type === "select" && lp.select) {
      const name = lp.select.name;
      if (name === "zh-Hans" || name === "zh-Hant") found.add(name);
    }
  }
  return LOCALES.filter((l) => found.has(l));
}

/**
 * 取与当前文章关键词(tags)最相关的 count 篇.
 * 排序: 共享 tag 数 ↓ → 同 category 优先 → 发布日期较新优先.
 * 共享为 0 的也参与排序, 因此只要总篇数够, 结果总会补满到 count 篇.
 */
export async function getRelatedPosts(
  currentSlug: string,
  count = 3,
  locale: Locale = DEFAULT_LOCALE,
): Promise<PostMeta[]> {
  const all = await getAllPosts(locale);
  const current = all.find((p) => p.slug === currentSlug);
  const others = all.filter((p) => p.slug !== currentSlug);
  if (!current) return others.slice(0, count);

  const currentTags = new Set(current.tags);
  const scored = others
    .map((post) => ({
      post,
      shared: post.tags.filter((t) => currentTags.has(t)).length,
      sameCat:
        current.category && post.category === current.category ? 1 : 0,
    }))
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        b.sameCat - a.sameCat ||
        (a.post.date < b.post.date ? 1 : -1),
    );

  return scored.slice(0, count).map((s) => s.post);
}

// ============ Events ============

export type EventStatus = "草稿" | "即将举办" | "报名中" | "已举办";

export type SignupMethod = "网页表单" | "外部链接" | "无需报名";

export type EventItem = {
  slug: string;
  locale: Locale;
  title: string;
  summary: string;
  date: string;
  location: string;
  status: EventStatus;
  attendees: number | null;
  signupUrl: string | null;
  videoReviewUrl: string | null;
  coverImageUrl: string | null;
  photos: string[];
  signupMethod: SignupMethod;
  pageId: string;
};

export type EventDetail = EventItem & {
  blocks: PostBlock[];
};

/**
 * 从 Notion Files 字段提取外部 URL.
 * **只接受 external 类型** (Notion "Link" 模式), 跳过 upload 类型 (1 小时过期 S3 URL).
 * 用户需在 Notion 文件字段用 "Link" 模式贴 Cloudinary / 其他图床的 URL.
 */
function parseExternalFiles(
  prop: PageObjectResponse["properties"][string] | undefined,
): string[] {
  if (!prop || prop.type !== "files") return [];
  const urls: string[] = [];
  for (const f of prop.files) {
    if (f.type === "external") urls.push(f.external.url);
    // f.type === "file" 是 Notion 上传 (1 小时过期), 忽略.
  }
  return urls;
}

function parseEventProperties(page: PageObjectResponse): EventItem | null {
  const props = page.properties;

  const titleProp = props["标题"];
  const slugProp = props["Slug"];
  const summaryProp = props["简介"];
  const dateProp = props["日期"];
  const locationProp = props["地点"];
  const statusProp = props["状态"];
  const attendeesProp = props["参与人数"];
  const signupProp = props["报名链接"];
  const videoReviewProp = props["视频回顾"];
  const coverProp = props["封面图"];
  const photosProp = props["现场照片"];
  const localeProp = props["语言版本"];

  if (!titleProp || titleProp.type !== "title") return null;
  if (!slugProp || slugProp.type !== "rich_text") return null;
  if (!dateProp || dateProp.type !== "date") return null;
  if (!statusProp || statusProp.type !== "select" || !statusProp.select) {
    return null;
  }

  const slug = richTextToPlainText(slugProp.rich_text).trim();
  const title = richTextToPlainText(titleProp.title).trim();
  if (!slug || !title) return null;

  const coverImages = parseExternalFiles(coverProp);

  return {
    slug,
    locale:
      localeProp?.type === "select" && localeProp.select
        ? (localeProp.select.name as Locale)
        : DEFAULT_LOCALE,
    title,
    summary:
      summaryProp?.type === "rich_text"
        ? richTextToPlainText(summaryProp.rich_text).trim()
        : "",
    date: dateProp.date?.start ?? "",
    location:
      locationProp?.type === "rich_text"
        ? richTextToPlainText(locationProp.rich_text).trim()
        : "",
    status: statusProp.select.name as EventStatus,
    attendees:
      attendeesProp?.type === "number" ? attendeesProp.number ?? null : null,
    signupUrl: signupProp?.type === "url" ? signupProp.url || null : null,
    videoReviewUrl:
      videoReviewProp?.type === "url" ? videoReviewProp.url || null : null,
    coverImageUrl: coverImages[0] ?? null,
    photos: parseExternalFiles(photosProp),
    pageId: page.id,
    signupMethod:
      props["报名方式"]?.type === "select" && props["报名方式"].select
        ? (props["报名方式"].select.name as SignupMethod)
        : "外部链接", // 空 → 外部链接(等于现状, 不影响已有活动)
  };
}

/**
 * 活动是否已过期: 活动日期早于「今天」(以温哥华时区计) 即视为已结束.
 * 配合页面 ISR 每小时重刷, 日期过后约 1 小时内自动从「即将」转「已结束」, 无需手动改状态.
 */
export function isEventPast(dateISO: string): boolean {
  if (!dateISO) return false;
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Vancouver",
  }); // "YYYY-MM-DD"
  return dateISO.slice(0, 10) < today;
}

/**
 * 获取即将举办 / 报名中、且日期未过的活动 (按日期升序, 最近的在前).
 */
export async function getUpcomingEvents(
  locale: Locale = DEFAULT_LOCALE,
): Promise<EventItem[]> {
  const notion = getNotionClient();
  const response = await notion.dataSources.query({
    data_source_id: EVENTS_DATA_SOURCE_ID,
    filter: {
      and: [
        { property: "语言版本", select: { equals: locale } },
        {
          or: [
            { property: "状态", select: { equals: "即将举办" } },
            { property: "状态", select: { equals: "报名中" } },
          ],
        },
      ],
    },
    sorts: [{ property: "日期", direction: "ascending" }],
    page_size: 50,
  });

  const events: EventItem[] = [];
  for (const page of response.results) {
    if (!("properties" in page)) continue;
    const event = parseEventProperties(page as PageObjectResponse);
    // 日期已过的(即使状态还没手动改)自动排除出「即将举办」.
    if (event && !isEventPast(event.date)) events.push(event);
  }
  return events;
}

/**
 * 获取所有活动的 slug 列表 (含 upcoming / past / 草稿外), 给 generateStaticParams 用.
 */
export async function getAllEventSlugs(
  locale: Locale = DEFAULT_LOCALE,
): Promise<string[]> {
  const notion = getNotionClient();
  const response = await notion.dataSources.query({
    data_source_id: EVENTS_DATA_SOURCE_ID,
    filter: {
      and: [
        { property: "语言版本", select: { equals: locale } },
        {
          or: [
            { property: "状态", select: { equals: "即将举办" } },
            { property: "状态", select: { equals: "报名中" } },
            { property: "状态", select: { equals: "已举办" } },
          ],
        },
      ],
    },
    page_size: 100,
  });
  const slugs: string[] = [];
  for (const page of response.results) {
    if (!("properties" in page)) continue;
    const slugProp = (page as PageObjectResponse).properties["Slug"];
    if (slugProp?.type === "rich_text") {
      const s = richTextToPlainText(slugProp.rich_text).trim();
      if (s) slugs.push(s);
    }
  }
  return slugs;
}

/**
 * 根据 slug 获取单个活动 (含 page content blocks).
 * 用于: 活动详情页 /events/[slug]
 */
export async function getEventBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<EventDetail | null> {
  const notion = getNotionClient();
  const response = await notion.dataSources.query({
    data_source_id: EVENTS_DATA_SOURCE_ID,
    filter: {
      and: [
        { property: "Slug", rich_text: { equals: slug } },
        { property: "语言版本", select: { equals: locale } },
        {
          or: [
            { property: "状态", select: { equals: "即将举办" } },
            { property: "状态", select: { equals: "报名中" } },
            { property: "状态", select: { equals: "已举办" } },
          ],
        },
      ],
    },
    page_size: 1,
  });
  if (response.results.length === 0) return null;
  const page = response.results[0];
  if (!("properties" in page)) return null;

  const event = parseEventProperties(page as PageObjectResponse);
  if (!event) return null;

  const blocks = await fetchAllBlocks(notion, page.id);
  return { ...event, blocks: await parseBlocks(blocks, notion) };
}

/**
 * 获取已举办活动 (按日期倒序, 最近的在前).
 */
export async function getPastEvents(
  locale: Locale = DEFAULT_LOCALE,
): Promise<EventItem[]> {
  const notion = getNotionClient();
  const response = await notion.dataSources.query({
    data_source_id: EVENTS_DATA_SOURCE_ID,
    filter: {
      and: [
        { property: "语言版本", select: { equals: locale } },
        {
          or: [
            { property: "状态", select: { equals: "即将举办" } },
            { property: "状态", select: { equals: "报名中" } },
            { property: "状态", select: { equals: "已举办" } },
          ],
        },
      ],
    },
    sorts: [{ property: "日期", direction: "descending" }],
    page_size: 50,
  });

  const events: EventItem[] = [];
  for (const page of response.results) {
    if (!("properties" in page)) continue;
    const event = parseEventProperties(page as PageObjectResponse);
    // 日期已过, 或手动标记已举办 → 归入「已结束」.
    if (event && (isEventPast(event.date) || event.status === "已举办")) {
      events.push(event);
    }
  }
  return events;
}

// ============ Blog single post ============

/**
 * 根据 slug 获取单篇博客 (含 page content blocks).
 * 用于: 博客详情页 /blog/[slug]
 */
export async function getPostBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Post | null> {
  const notion = getNotionClient();

  const response = await notion.dataSources.query({
    data_source_id: BLOG_DATA_SOURCE_ID,
    filter: {
      and: [
        { property: "Slug", rich_text: { equals: slug } },
        { property: "状态", select: { equals: "已发布" } },
        { property: "语言版本", select: { equals: locale } },
      ],
    },
    page_size: 1,
  });

  if (response.results.length === 0) return null;
  const page = response.results[0];
  if (!("properties" in page)) return null;

  const meta = parseProperties(page as PageObjectResponse);
  if (!meta) return null;

  const blocks = await fetchAllBlocks(notion, page.id);
  return { ...meta, blocks: await parseBlocks(blocks, notion) };
}

// ============ 视频策展 ============

export type VideoCuration = {
  featured: boolean;
  titleHant: string | null;
  hidden: boolean;
};

/**
 * 读 Notion「视频策展」库, 以 video_id 为 key. 未配置 / 失败 → 空 Map(全部回退默认).
 * 用于: 首页 / videos 页渲染时合并策展(隐藏 / 首页精选 / 繁体标题).
 */
export async function getVideoCuration(): Promise<Map<string, VideoCuration>> {
  const map = new Map<string, VideoCuration>();
  const dataSourceId = process.env.NOTION_VIDEO_CURATION_DS_ID;
  if (!dataSourceId) return map;
  try {
    const notion = getNotionClient();
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
    });
    for (const page of response.results) {
      if (!("properties" in page)) continue;
      const props = (page as PageObjectResponse).properties;
      const idProp = props["video_id"];
      const videoId =
        idProp?.type === "title" ? richTextToPlainText(idProp.title).trim() : "";
      if (!videoId) continue;
      const hantProp = props["繁体标题"];
      const titleHant =
        hantProp?.type === "rich_text"
          ? richTextToPlainText(hantProp.rich_text).trim()
          : "";
      map.set(videoId, {
        featured:
          props["首页精选"]?.type === "checkbox"
            ? props["首页精选"].checkbox
            : false,
        hidden:
          props["隐藏"]?.type === "checkbox" ? props["隐藏"].checkbox : false,
        titleHant: titleHant || null,
      });
    }
  } catch (e) {
    console.error("[video-curation] 读取失败, 回退默认:", e);
  }
  return map;
}
