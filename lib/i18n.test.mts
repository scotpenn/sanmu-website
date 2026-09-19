import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_LOCALE,
  TRADITIONAL_LOCALE,
  eventStatusLabel,
  toTraditional,
  localizeSiteHref,
} from "./i18n.ts";

test("eventStatusLabel keeps simplified statuses for simplified pages", () => {
  assert.equal(eventStatusLabel("即将举办", DEFAULT_LOCALE), "即将举办");
  assert.equal(eventStatusLabel("报名中", DEFAULT_LOCALE), "报名中");
  assert.equal(eventStatusLabel("已举办", DEFAULT_LOCALE), "已举办");
});

test("eventStatusLabel localizes event statuses for traditional pages", () => {
  assert.equal(eventStatusLabel("即将举办", TRADITIONAL_LOCALE), "即將舉辦");
  assert.equal(eventStatusLabel("报名中", TRADITIONAL_LOCALE), "報名中");
  assert.equal(eventStatusLabel("已举办", TRADITIONAL_LOCALE), "已舉辦");
});

// 2026-09-19：么/两/冲/价 曾不在 S2T_MAP，#61、#62 繁体标题/摘要连续漏转，这几句是当时的原句
test("toTraditional converts 么/两/冲/价 (blog 标题/摘要派生)", () => {
  assert.equal(toTraditional("赶不上父母的最后一面怎么办？"), "趕不上父母的最後一面怎麼辦？");
  assert.equal(toTraditional("跨国真正的两道坎"), "跨國真正的兩道坎");
  assert.equal(toTraditional("拖着行李冲进告别厅"), "拖著行李衝進告別廳");
  assert.equal(toTraditional("以及三种选择各自的代价"), "以及三種選擇各自的代價");
  assert.equal(toTraditional("我儿子不知道中秋是什么"), "我兒子不知道中秋是什麼");
});

// 2026-09-19：繁体 blog 正文里的站内链接原样输出成 /blog/…，繁体读者点进去落到简体页
test("localizeSiteHref keeps simplified pages unchanged", () => {
  assert.equal(localizeSiteHref("/blog/a", DEFAULT_LOCALE), "/blog/a");
  assert.equal(localizeSiteHref("/resources/handbook", DEFAULT_LOCALE), "/resources/handbook");
});

test("localizeSiteHref prefixes localized routes on traditional pages", () => {
  assert.equal(localizeSiteHref("/blog/a", TRADITIONAL_LOCALE), "/zh-Hant/blog/a");
  assert.equal(localizeSiteHref("/blog", TRADITIONAL_LOCALE), "/zh-Hant/blog");
  assert.equal(localizeSiteHref("/blog/a#section", TRADITIONAL_LOCALE), "/zh-Hant/blog/a#section");
  assert.equal(localizeSiteHref("/resources/handbook", TRADITIONAL_LOCALE), "/zh-Hant/resources/handbook");
  assert.equal(localizeSiteHref("/resources/glossary#benefits", TRADITIONAL_LOCALE), "/zh-Hant/resources/glossary#benefits");
  assert.equal(localizeSiteHref("/events/x", TRADITIONAL_LOCALE), "/zh-Hant/events/x");
});

test("localizeSiteHref leaves already-prefixed and non-localized paths alone", () => {
  assert.equal(localizeSiteHref("/zh-Hant/blog/a", TRADITIONAL_LOCALE), "/zh-Hant/blog/a");
  assert.equal(localizeSiteHref("/zh-Hant", TRADITIONAL_LOCALE), "/zh-Hant");
  assert.equal(localizeSiteHref("/api/indexnow", TRADITIONAL_LOCALE), "/api/indexnow");
  assert.equal(localizeSiteHref("/blogger", TRADITIONAL_LOCALE), "/blogger");
});
