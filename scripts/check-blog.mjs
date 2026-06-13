import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { resolve, basename } from "path";
import { parseBlogMd } from "./md-blog.mjs";

const COMMON = new Set(
  [...readFileSync(fileURLToPath(new URL("./data/common-chars.txt", import.meta.url)), "utf8")]
    .filter((c) => /[一-鿿]/.test(c)),
);

// 从 lib/i18n.ts 正则解析 S2T_MAP, 取「繁体形≠简体形」的键为简体专用字
function simplifiedOnlySet() {
  const src = readFileSync(fileURLToPath(new URL("../lib/i18n.ts", import.meta.url)), "utf8");
  const m = src.match(/const S2T_MAP[^{]*{([\s\S]*?)\n};/);
  const set = new Set();
  if (m) {
    for (const mm of m[1].matchAll(/([一-鿿])\s*:\s*"([^"]+)"/g)) {
      if (mm[2] !== mm[1]) set.add(mm[1]);
    }
  }
  return set;
}

// 大陆词 → TW 词(可加)
const VOCAB = {
  "視頻": "影片", "视频": "影片", "信息": "資訊", "博客": "網誌",
  "网络": "網路", "網絡": "網路", "质量": "品質", "用户": "使用者",
  "在线": "線上", "默认": "預設", "软件": "軟體", "邮箱": "電子信箱",
  "点赞": "按讚", "视频号": "頻道", "账号": "帳號", "帐号": "帳號",
};
const YOUTUBE_RE = /(youtube\.com\/watch\?v=|youtu\.be\/)/;
const CJK = (s) => [...s].filter((c) => /[一-鿿]/.test(c));

/** 核对一篇 MD. 返回 { reds(必修), yellows(建议) }. */
export function checkMd(filePath) {
  const reds = [], yellows = [];
  const { locale, props, body, hasPropSection, hasBodySection, bodyOnly } = parseBlogMd(filePath);

  if (bodyOnly) {
    // 繁体 body-only: 属性导入时从简体取, 这里只核对正文; 确认简体兄弟文件存在
    const sib = filePath.replace(/_zh-Hant\.md$/, ".md");
    if (!existsSync(sib)) reds.push(`找不到对应简体 MD(繁体导入需从它取属性): ${basename(sib)}`);
  } else {
    if (!hasPropSection) reds.push("缺少『## Notion 页面属性』段");
    if (!hasBodySection) reds.push("缺少『## Page Body』段");
    for (const f of ["title", "slug", "subtitle", "status"]) {
      if (!props[f]) reds.push(`必填字段缺失: ${f}`);
    }
    if (props.slug && !/^[a-z0-9-]+$/.test(props.slug)) reds.push(`Slug 非英文小写连字符: ${props.slug}`);
    if (props.videoUrl && !YOUTUBE_RE.test(props.videoUrl)) yellows.push(`视频链接不是 YouTube: ${props.videoUrl}`);
    if (props.readMinutes && !/^\d+$/.test(props.readMinutes)) yellows.push(`阅读时长不是数字: ${props.readMinutes}`);
    if (props.subtitle) {
      const n = CJK(props.subtitle).length;
      if (n < 80 || n > 160) yellows.push(`摘要 ${n} 字(建议 80-160)`);
    }
  }

  // 正文内 <video> 链接校验(简繁都查, 视频很关键)
  for (const vm of body.matchAll(/<video\s+src="([^"]+)"/gi)) {
    if (!YOUTUBE_RE.test(vm[1])) yellows.push(`正文 video 链接不是 YouTube: ${vm[1]}`);
  }

  const rare = [...new Set(CJK(body).filter((c) => !COMMON.has(c)))];
  if (rare.length) yellows.push(`怪字候选(需人工确认): ${rare.join(" ")}`);

  if (locale === "zh-Hant") {
    const simp = simplifiedOnlySet();
    const residual = [...new Set(CJK(body).filter((c) => simp.has(c)))];
    if (residual.length) reds.push(`残留简体字: ${residual.join(" ")}`);
    for (const [cn, tw] of Object.entries(VOCAB)) {
      if (body.includes(cn)) yellows.push(`未本地化大陆词「${cn}」→ 建议「${tw}」`);
    }
  }
  return { reds, yellows };
}

// CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const file = process.argv[2];
  if (!file) { console.error("用法: node scripts/check-blog.mjs <md>"); process.exit(2); }
  const { reds, yellows } = checkMd(file);
  reds.forEach((r) => console.log("🔴 " + r));
  yellows.forEach((y) => console.log("🟡 " + y));
  if (!reds.length && !yellows.length) console.log("✅ 通过, 无问题");
  process.exit(reds.length ? 1 : 0);
}
