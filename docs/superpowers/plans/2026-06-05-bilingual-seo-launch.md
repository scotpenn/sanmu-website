# Bilingual SEO Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Launch sanmu.ca as a Simplified/Traditional Chinese SEO site with Notion-backed locale records, canonical URLs, hreflang alternates, and sitemap entries for both versions.

**Architecture:** Keep root URLs as `zh-Hans` and add `/zh-Hant` mirror URLs. Notion records are filtered by `语言版本`; pages only render content for the requested locale. Static page chrome uses locale-aware helpers while Blog and Events read locale-specific Notion records.

**Tech Stack:** Next.js App Router 16, TypeScript, Notion API, Metadata API, `app/sitemap.ts`, Node verification scripts.

---

### Task 1: Contract Verification

**Files:**
- Create: `scripts/verify-i18n-contract.mjs`
- Modify: `package.json`

- [ ] Add a contract script that checks for locale helpers, `/zh-Hant` routes, locale-aware Notion queries, canonical/hreflang metadata, and sitemap alternates.
- [ ] Run `npm run verify:i18n-contract` and confirm it fails before implementation.

### Task 2: Locale And SEO Helpers

**Files:**
- Create: `lib/i18n.ts`
- Create: `lib/seo.ts`
- Modify: `app/layout.tsx`
- Modify: `components/Header.tsx`
- Modify: `components/Footer.tsx`

- [ ] Add `Locale = "zh-Hans" | "zh-Hant"` helpers for path prefixing, localized labels, and same-page language switching.
- [ ] Add canonical/hreflang helper output for Next Metadata API.
- [ ] Remove global homepage canonical from root layout so child pages can self-canonicalize.
- [ ] Make Header/Footer locale-aware from the current pathname.

### Task 3: Notion Locale Queries

**Files:**
- Modify: `lib/notion.ts`

- [ ] Add locale filtering to Blog and Events queries.
- [ ] Keep default locale `zh-Hans` for existing root routes.
- [ ] Add functions for paired locale discovery so sitemap can emit both URLs only when records exist.
- [ ] Render blog heading blocks; they are already parsed but currently dropped in the blog detail component.

### Task 4: Bilingual Routes And Metadata

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/blog/page.tsx`
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `app/events/page.tsx`
- Modify: `app/events/[slug]/page.tsx`
- Create: `app/zh-Hant/page.tsx`
- Create: `app/zh-Hant/blog/page.tsx`
- Create: `app/zh-Hant/blog/[slug]/page.tsx`
- Create: `app/zh-Hant/events/page.tsx`
- Create: `app/zh-Hant/events/[slug]/page.tsx`
- Create: minimal `/zh-Hant/about`, `/zh-Hant/videos`, `/zh-Hant/resources/handbook`, `/zh-Hant/disclaimer`, `/zh-Hant/privacy` pages or route aliases.

- [ ] Root pages render `zh-Hans`; `/zh-Hant` pages render `zh-Hant`.
- [ ] Every index/detail page has self-canonical metadata.
- [ ] Every paired page has `zh-Hans`, `zh-Hant`, and `x-default` alternates.
- [ ] Detail pages include localized Open Graph URL and locale.

### Task 5: Sitemap

**Files:**
- Modify: `app/sitemap.ts`

- [ ] Add `/zh-Hant` static URLs.
- [ ] Add alternates for static routes.
- [ ] Add both blog/event locale URLs when the corresponding Notion records exist.
- [ ] Keep sitemap revalidation at one hour.

### Task 6: Notion Data Backfill

**Files:**
- Use one-off Notion API script from terminal; do not commit secrets or generated scripts.

- [ ] Query existing `zh-Hans` Blog, Events, and website microcopy records.
- [ ] Create missing `zh-Hant` paired records with the same `Slug` and `翻译组ID`.
- [ ] Copy supported page blocks for Blog/Event content.
- [ ] Use machine Traditional conversion for first launch and leave `SEO复核=false` where human review is still needed.
- [ ] Do not delete old `简体正文 / 繁体正文 / 繁体状态` fields.

### Task 7: Verification

**Files:**
- Use existing build/lint commands.

- [ ] Run `npm run verify:i18n-contract`.
- [ ] Run focused TypeScript checks for changed modules if full generated `.next` types remain stale.
- [ ] Run `npm run build`; if Google Fonts fail under sandbox networking, request escalation.
- [ ] Confirm generated sitemap includes `zh-Hans` and `zh-Hant` blog/event URLs.
- [ ] Report remaining SEO risks, especially machine-converted Traditional copy that still needs human edit.
