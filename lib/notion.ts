import { Client } from "@notionhq/client";
import type {
  BlockObjectResponse,
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client";

// data_source_id of 📝 Blog 博客 (固定 ID, 不会变)
const BLOG_DATA_SOURCE_ID = "319407d1-e400-4aed-8e36-dfa0ab19e6ea";
// data_source_id of 📅 Events 线下活动
const EVENTS_DATA_SOURCE_ID = "d5b3cb57-7b27-4acd-b936-ae2ca6f275f1";

function getNotionClient(): Client {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error(
      "NOTION_TOKEN 环境变量未设置。本地: 在 .env.local 加 NOTION_TOKEN=secret_xxx。生产: 在 Vercel Settings → Environment Variables 加。",
    );
  }
  return new Client({ auth: token });
}

// ============ Types ============

export type PostBlock =
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "video"; videoId: string };

export type PostCategory = "实用指南" | "精神疗愈" | "关系重塑";

export type PostMeta = {
  slug: string;
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

  if (!titleProp || titleProp.type !== "title") return null;
  if (!slugProp || slugProp.type !== "rich_text") return null;
  if (!dateProp || dateProp.type !== "date") return null;

  const slug = richTextToPlainText(slugProp.rich_text).trim();
  if (!slug) return null;

  const title = richTextToPlainText(titleProp.title).trim();
  if (!title) return null;

  return {
    slug,
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

function parseBlocks(blocks: BlockObjectResponse[]): PostBlock[] {
  const result: PostBlock[] = [];

  for (const b of blocks) {
    switch (b.type) {
      case "paragraph": {
        const text = richTextToPlainText(b.paragraph.rich_text).trim();
        if (text) result.push({ type: "paragraph", text });
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
        const url =
          b.video.type === "external" ? b.video.external.url : null;
        const videoId = extractVideoId(url);
        if (videoId) result.push({ type: "video", videoId });
        break;
      }
      // 其他 block 类型 (bullet/divider/image 等) Phase 2.1 先忽略,
      // Phase 2.2 视实际使用情况按需添加
    }
  }

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
export async function getAllPosts(): Promise<PostMeta[]> {
  const notion = getNotionClient();

  const response = await notion.dataSources.query({
    data_source_id: BLOG_DATA_SOURCE_ID,
    filter: {
      property: "状态",
      select: { equals: "已发布" },
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
export async function getAllSlugs(): Promise<string[]> {
  const posts = await getAllPosts();
  return posts.map((p) => p.slug);
}

// ============ Events ============

export type EventStatus = "草稿" | "即将举办" | "报名中" | "已举办";

export type EventItem = {
  slug: string;
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
  };
}

/**
 * 获取即将举办 / 报名中的活动 (按日期升序, 最近的在前).
 */
export async function getUpcomingEvents(): Promise<EventItem[]> {
  const notion = getNotionClient();
  const response = await notion.dataSources.query({
    data_source_id: EVENTS_DATA_SOURCE_ID,
    filter: {
      or: [
        { property: "状态", select: { equals: "即将举办" } },
        { property: "状态", select: { equals: "报名中" } },
      ],
    },
    sorts: [{ property: "日期", direction: "ascending" }],
    page_size: 50,
  });

  const events: EventItem[] = [];
  for (const page of response.results) {
    if (!("properties" in page)) continue;
    const event = parseEventProperties(page as PageObjectResponse);
    if (event) events.push(event);
  }
  return events;
}

/**
 * 获取已举办活动 (按日期倒序, 最近的在前).
 */
export async function getPastEvents(): Promise<EventItem[]> {
  const notion = getNotionClient();
  const response = await notion.dataSources.query({
    data_source_id: EVENTS_DATA_SOURCE_ID,
    filter: {
      property: "状态",
      select: { equals: "已举办" },
    },
    sorts: [{ property: "日期", direction: "descending" }],
    page_size: 50,
  });

  const events: EventItem[] = [];
  for (const page of response.results) {
    if (!("properties" in page)) continue;
    const event = parseEventProperties(page as PageObjectResponse);
    if (event) events.push(event);
  }
  return events;
}

// ============ Blog single post ============

/**
 * 根据 slug 获取单篇博客 (含 page content blocks).
 * 用于: 博客详情页 /blog/[slug]
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const notion = getNotionClient();

  const response = await notion.dataSources.query({
    data_source_id: BLOG_DATA_SOURCE_ID,
    filter: {
      and: [
        { property: "Slug", rich_text: { equals: slug } },
        { property: "状态", select: { equals: "已发布" } },
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
  return { ...meta, blocks: parseBlocks(blocks) };
}
