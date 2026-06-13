import { readFileSync } from "fs";
import { basename } from "path";

// MD 字段名 → 内部 key
const FIELD_ALIASES = {
  "标题": "title",
  "Slug": "slug",
  "摘要": "subtitle",
  "类型": "category",
  "关键词": "keywords",
  "状态": "status",
  "阅读时长": "readMinutes",
  "视频链接": "videoUrl",
};

/** 解析一篇博客 MD. 文件名决定 slug + locale;内容分「属性段」「正文段」. */
export function parseBlogMd(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const file = basename(filePath);
  const m = file.match(/^blog_(.+?)(_zh-Hant)?\.md$/);
  if (!m) throw new Error(`文件名需形如 blog_<slug>[_zh-Hant].md: ${file}`);
  const slug = m[1];
  const locale = m[2] ? "zh-Hant" : "zh-Hans";

  const propStart = raw.indexOf("## Notion 页面属性");
  const bodyStart = raw.indexOf("## Page Body");

  const propSection =
    propStart >= 0
      ? raw.slice(propStart, bodyStart >= 0 ? bodyStart : undefined)
      : "";
  const props = {};
  for (const line of propSection.split(/\r?\n/)) {
    const fm = line.match(/^\s*-\s*\*\*(.+?)\*\*[^：:]*[：:]\s*(.*)$/);
    if (!fm) continue;
    const key = FIELD_ALIASES[fm[1].trim()];
    if (!key) continue;
    props[key] = fm[2].trim().replace(/^`|`$/g, "").trim();
  }

  const body =
    bodyStart >= 0
      ? raw.slice(bodyStart + "## Page Body".length).trim()
      : "";

  return {
    slug,
    locale,
    props,
    body,
    hasPropSection: propStart >= 0,
    hasBodySection: bodyStart >= 0,
  };
}
