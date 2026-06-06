# Claude Handoff: Sanmu Bilingual SEO Launch

Date: 2026-06-05
Repo: `/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/sanmu-website`
Branch: `main`

## Objective

Take over testing, cleanup, deployment, and follow-up development for the new Simplified/Traditional Chinese SEO architecture.

The business decision is settled: Traditional Chinese is a formal SEO acquisition channel, not just a readability aid. More than 40% of customers are Traditional Chinese users, so `/zh-Hant` must be treated as a first-class indexed site path.

## What Was Implemented

### Notion Content Model

Three Notion content databases now support locale-paired records:

- `📝 Blog 博客`
- `Events 线下活动`
- `网站微文案`

Fields added:

- `语言版本`: `zh-Hans` / `zh-Hant`
- `翻译组ID`
- `繁体人工校对`
- `SEO复核`

Existing records were backfilled:

- Blog: 14 `zh-Hans` records and 14 `zh-Hant` paired records
- Events: 4 `zh-Hans` records and 4 `zh-Hant` paired records
- Website microcopy: 14 `zh-Hans` records and 14 `zh-Hant` paired records

Important detail:

- Blog has 14 total records per locale, but only 13 are published per locale.
- `200-mubei-zhen-xiang` is `已下线` in both Simplified and Traditional, so it correctly does not appear in generated routes or sitemap.

Traditional records were created by machine conversion as launch drafts. They are live-structured, but not all human-reviewed.

## Website Architecture

Root path remains Simplified:

- `/`
- `/blog`
- `/blog/<slug>`
- `/events`
- `/events/<slug>`

Traditional path uses `/zh-Hant`:

- `/zh-Hant`
- `/zh-Hant/blog`
- `/zh-Hant/blog/<slug>`
- `/zh-Hant/events`
- `/zh-Hant/events/<slug>`
- `/zh-Hant/about`
- `/zh-Hant/videos`
- `/zh-Hant/resources/handbook`
- `/zh-Hant/disclaimer`
- `/zh-Hant/privacy`

This is intended to become the lasting i18n pattern:

- Components should be written once.
- Pass `locale`.
- Static text should come from centralized locale helpers/dictionaries.
- Notion content should be selected by `语言版本`.
- SEO helpers should generate canonical/hreflang/sitemap behavior.

Avoid copying entire pages into `/zh-Hant` as the long-term pattern unless it is a temporary launch bridge.

## Important Files Changed

New helpers:

- `lib/i18n.ts`
  - Defines `Locale`, `DEFAULT_LOCALE`, `TRADITIONAL_LOCALE`
  - Path prefix helpers
  - Nav labels
  - Simple Simplified-to-Traditional conversion helper used for launch

- `lib/seo.ts`
  - Defines site URL helpers
  - Generates self-canonical metadata
  - Generates `zh-Hans`, `zh-Hant`, and `x-default` alternates

- `scripts/verify-i18n-contract.mjs`
  - Structural verification that i18n route/helper/sitemap contracts exist

Updated core CMS access:

- `lib/notion.ts`
  - All Blog and Events queries now filter by `语言版本`
  - Default locale is `zh-Hans`
  - Traditional routes pass `zh-Hant`
  - Notion client uses a custom Node HTTPS fetch wrapper to avoid Next/Vercel persistent fetch cache
  - This is meant to fix the previous stale sitemap/redeploy issue where Notion API responses were cached for too long

Updated SEO:

- `app/layout.tsx`
  - Removed global `canonical: "/"`, which previously caused child pages to canonicalize to the homepage

- `app/sitemap.ts`
  - Emits Simplified and Traditional static URLs
  - Emits Simplified and Traditional Blog/Event URLs
  - Adds alternate language entries for each URL

Updated navigation:

- `components/Header.tsx`
  - Locale-aware links
  - Language switcher
  - Mobile menu lint issue fixed

- `components/Footer.tsx`
  - Locale-aware links and labels

New Traditional route files:

- `app/zh-Hant/page.tsx`
- `app/zh-Hant/about/page.tsx`
- `app/zh-Hant/videos/page.tsx`
- `app/zh-Hant/resources/handbook/page.tsx`
- `app/zh-Hant/disclaimer/page.tsx`
- `app/zh-Hant/privacy/page.tsx`
- `app/zh-Hant/blog/page.tsx`
- `app/zh-Hant/blog/[slug]/page.tsx`
- `app/zh-Hant/events/page.tsx`
- `app/zh-Hant/events/[slug]/page.tsx`

Plan file:

- `docs/superpowers/plans/2026-06-05-bilingual-seo-launch.md`

## Verification Already Run

All passed:

```bash
npm run lint
npx tsc --noEmit --pretty false
npm run verify:i18n-contract
npm run build
```

Production build result:

- 56 pages generated
- `/zh-Hant` route group generated
- Simplified Blog detail pages generated
- Traditional Blog detail pages generated
- Simplified Events detail pages generated
- Traditional Events detail pages generated

Sitemap verification:

```txt
urls: 50
blog zh-Hans: 13
blog zh-Hant: 13
events zh-Hans: 4
events zh-Hant: 4
x-default: true
```

HTML spot-check example:

Traditional page:

```txt
/zh-Hant/blog/golden-24-hours-after-death-canada
```

Has:

```html
<link rel="canonical" href="https://www.sanmu.ca/zh-Hant/blog/golden-24-hours-after-death-canada"/>
<link rel="alternate" hrefLang="zh-Hans" href="https://www.sanmu.ca/blog/golden-24-hours-after-death-canada"/>
<link rel="alternate" hrefLang="zh-Hant" href="https://www.sanmu.ca/zh-Hant/blog/golden-24-hours-after-death-canada"/>
<link rel="alternate" hrefLang="x-default" href="https://www.sanmu.ca/blog/golden-24-hours-after-death-canada"/>
```

## Deployment Status

Not deployed yet.

Reason:

```txt
vercel projects ls
Error: The specified token is not valid. Use `vercel login` to generate a new token.
```

Also:

- Local repo has no `.vercel/project.json`
- Vercel CLI exists locally
- CLI token is invalid
- README says production is `sanmu.ca` / `www.sanmu.ca`
- README says temp domain is `sanmu-website.vercel.app`
- Git remote is `https://github.com/scotpenn/sanmu-website.git`

Likely deployment path:

1. Commit changes.
2. Push to GitHub `main`.
3. Let Vercel Git integration deploy automatically, if connected.

Do not run manual `vercel --prod` until Vercel auth/project link is confirmed.

## Immediate Next Testing Checklist

Run locally after pulling this work:

```bash
cd "/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/sanmu-website"
npm run lint
npx tsc --noEmit --pretty false
npm run verify:i18n-contract
npm run build
```

Then inspect generated sitemap:

```bash
node -e "const fs=require('fs'); const s=fs.readFileSync('.next/server/app/sitemap.xml.body','utf8'); console.log({urls:(s.match(/<url>/g)||[]).length, blogHans:(s.match(/<loc>https:\\/\\/www\\.sanmu\\.ca\\/blog\\//g)||[]).length, blogHant:(s.match(/<loc>https:\\/\\/www\\.sanmu\\.ca\\/zh-Hant\\/blog\\//g)||[]).length, eventsHans:(s.match(/<loc>https:\\/\\/www\\.sanmu\\.ca\\/events\\//g)||[]).length, eventsHant:(s.match(/<loc>https:\\/\\/www\\.sanmu\\.ca\\/zh-Hant\\/events\\//g)||[]).length, hasXDefault:s.includes('hreflang=\"x-default\"')});"
```

Expected:

```txt
urls: 50
blogHans: 13
blogHant: 13
eventsHans: 4
eventsHant: 4
hasXDefault: true
```

Start dev server:

```bash
npm run dev
```

Manual browser checks:

- `/`
- `/zh-Hant`
- `/blog`
- `/zh-Hant/blog`
- `/blog/golden-24-hours-after-death-canada`
- `/zh-Hant/blog/golden-24-hours-after-death-canada`
- `/events`
- `/zh-Hant/events`
- `/sitemap.xml`

For each page:

- Confirm no 404
- Confirm Header links stay in the same locale
- Confirm language switcher maps to same path in the other locale
- Confirm article body renders headings
- Confirm Traditional blog pages are Traditional text, not Simplified records

## Known Risks / Follow-Up Work

### 1. Traditional Content Needs Human Review

The `zh-Hant` Blog/Event records were created by machine conversion. They are suitable for structural launch, but not final editorial quality.

In Notion, prioritize human review by:

- `繁体人工校对=false`
- `SEO复核=false`

Recommended first review targets:

1. Top 5 commercial-intent Blog posts
2. Homepage Traditional copy
3. Handbook Traditional page
4. Blog title/meta descriptions

### 2. Static Traditional Pages Are Launch Bridges

Traditional static pages currently exist as `/zh-Hant/...` files. This is acceptable for launch because the site has limited static text.

Long-term improvement:

- Extract static page copy into a centralized dictionary or Notion microcopy fetch layer.
- Keep components single-source.
- Avoid future full-page duplication.

### 3. `<html lang>` Is Generic

`app/layout.tsx` currently sets:

```html
<html lang="zh">
```

Because root layout is shared across both route trees. SEO-critical language signals are handled by:

- Page content
- canonical
- hreflang
- sitemap alternates

If exact per-locale `html lang` is required later, introduce locale route groups/layouts.

### 4. Brand Name In Header Is Still Simplified

Some places still display `三木有话说` rather than `三木有話說`. SEO title and OG site name are localized via `lib/seo.ts`, but Header brand text may need a small follow-up polish.

### 5. Video Titles Remain Original YouTube Text

Traditional `/zh-Hant/videos` uses YouTube data as-is. This is acceptable because the canonical video source is YouTube, but if Traditional video SEO becomes important, playlist/video metadata should get a locale layer.

## Business Guidance

Do not hold deployment waiting for perfect Traditional copy. The important launch win is:

- Stable `/zh-Hant` URLs
- Correct Notion locale contract
- Correct canonical/hreflang/sitemap
- No wrong-language data leakage

After launch, editorial improvement should happen inside Notion without changing URL structure.

## Suggested Commit Message

```bash
git add .
git commit -m "feat: launch bilingual SEO structure"
```

Then push if Vercel Git integration is active:

```bash
git push origin main
```

## Summary For Continuation

The implementation is functionally complete and verified locally. The main remaining task is deployment/auth and post-launch QA. Do not rework the architecture unless a specific failing test or production issue proves a structural problem.
