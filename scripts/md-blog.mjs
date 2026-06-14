import { readFileSync } from "fs";
import { basename } from "path";

// MD 字段名(bullet 格式)→ 内部 key
const FIELD_ALIASES = {
  "标题": "title", "Slug": "slug", "摘要": "subtitle", "类型": "category",
  "关键词": "keywords", "状态": "status", "阅读时长": "readMinutes", "视频链接": "videoUrl",
};
// YAML frontmatter 键 → 内部 key
const YAML_ALIASES = {
  slug: "slug", title: "title", type: "category", keywords: "keywords",
  read_minutes: "readMinutes", status: "status", summary: "subtitle",
  subtitle: "subtitle", video_url: "videoUrl", video: "videoUrl",
};

/** 解析一篇博客 MD. 文件名决定 slug + locale.
 *  支持三种属性/正文格式: ① bullet「## Notion 页面属性」② YAML frontmatter ③ 繁体 body-only.
 *  isStub: 正文是占位符空壳(真内容在 Notion), 不可从 MD 导入. */
export function parseBlogMd(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const file = basename(filePath);
  const m = file.match(/^blog_(.+?)(_zh-Hant)?\.md$/);
  if (!m) throw new Error(`文件名需形如 blog_<slug>[_zh-Hant].md: ${file}`);
  const slug = m[1];
  const locale = m[2] ? "zh-Hant" : "zh-Hans";

  const props = {};

  // YAML frontmatter(首行 ---)
  const yamlMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const isYaml = !!yamlMatch;
  if (isYaml) {
    for (const line of yamlMatch[1].split(/\r?\n/)) {
      const ym = line.match(/^([a-z_]+):\s*(.*)$/);
      if (!ym) continue;
      const key = YAML_ALIASES[ym[1]];
      if (!key) continue;
      let val = ym[2].trim();
      if (key === "keywords") {
        val = val.replace(/^\[|\]$/g, "").split(/[,，、]/).map((s) => s.trim()).filter(Boolean).join("、");
      }
      props[key] = val;
    }
  }

  const propStart = raw.indexOf("## Notion 页面属性");
  const bodyStart = raw.indexOf("## Page Body");
  const bodyOnly = locale === "zh-Hant" && !isYaml && propStart < 0 && bodyStart < 0;

  // bullet 属性段(非 YAML)
  if (!isYaml && propStart >= 0) {
    const propSection = raw.slice(propStart, bodyStart >= 0 ? bodyStart : undefined);
    for (const line of propSection.split(/\r?\n/)) {
      const fm = line.match(/^\s*-\s*\*\*(.+?)\*\*[^：:]*[：:]\s*(.*)$/);
      if (!fm) continue;
      const key = FIELD_ALIASES[fm[1].trim()];
      if (!key) continue;
      props[key] = fm[2].trim().replace(/^`|`$/g, "").trim();
    }
  }

  const body = bodyOnly
    ? raw.trim()
    : bodyStart >= 0
      ? raw.slice(bodyStart + "## Page Body".length).trim()
      : "";

  const isStub = /已推\s*Notion|字符变异验证后回填|完整正文已推/.test(body);

  return {
    slug, locale, props, body,
    hasPropSection: propStart >= 0,
    hasBodySection: bodyStart >= 0,
    bodyOnly, isYaml, isStub,
  };
}
