# Claude Handoff: Event Publishing Workflow

Date: 2026-07-07
Repo: `/Users/scotpan/Documents/Claude/Projects/Sanmu Media Website/sanmu-website`

## Objective

Take over the Sanmu event publishing workflow. Normal publishing is:

```txt
Notion Events -> sanmu.ca event pages -> Eventbrite distribution
```

Do not add a parallel static event source. Notion remains the source of record.

## Current Production Result

The 2026 Vancouver Water Splashing Festival has been published through the normal Notion workflow and synced to Eventbrite.

| Item | Value |
|---|---|
| Slug | `vancouver-water-splashing-festival-2026` |
| Sanmu URL | `https://www.sanmu.ca/events/vancouver-water-splashing-festival-2026` |
| Eventbrite event ID | `1993496889861` |
| Eventbrite URL | `https://www.eventbrite.ca/e/2026-18-tickets-1993496889861` |
| Eventbrite status | `live` |
| Eventbrite ticket ID | `3440703179` |
| Ticket name | `免费入场 / RSVP` |
| Ticket quantity | `2000` |
| Notion zh-Hans page | `396c4735-c236-8168-bb95-cc5548e38a8d` |
| Notion zh-Hant page | `396c4735-c236-8138-bdb0-dfa402443630` |

Confirmed by API after publishing:

- Eventbrite event status is `live`.
- Eventbrite event description contains `sanmu.ca`.
- Eventbrite ticket description contains `sanmu.ca`.
- Both Notion locale pages have `平台同步状态 = 已同步` and `Eventbrite 同步状态 = 已同步`.

## Key Business Decision

The original preference was `sanmu.ca` as the only registration entry. Eventbrite blocks live publishing unless an event has at least one ticket class, so the settled decision is:

- Create one free Eventbrite RSVP ticket so the event can be live.
- Keep `sanmu.ca` as the official activity page and backlink target.
- Put the `sanmu.ca` link in both Eventbrite event description and ticket description.

This means Eventbrite is no longer a pure external listing; it also has an RSVP/ticket UI.

## Scripts Added

`package.json`:

```bash
npm run events:publish -- --slug <event-slug> --dry-run
npm run events:publish -- --slug <event-slug>
npm run test:events-publish
npm run test:event-dates
```

Main script:

- `scripts/events-publish.mjs`

Tests:

- `scripts/events-publish.test.mjs`
- `lib/event-dates.test.mts`
- `lib/i18n.test.mts`

## Eventbrite Implementation Notes

Important API facts discovered by real calls:

- Eventbrite create event endpoint creates a draft first.
- Publish endpoint requires at least one ticket; otherwise it returns `event.tickets - MISSING`.
- `event.start.utc` and `event.end.utc` must be `YYYY-MM-DDThh:mm:ssZ`; `.000Z` is rejected.
- `event.locale: "zh_CN"` is rejected; do not send it.
- Existing `.env.local` uses `Eventbrite_API_Key`; the script supports this name plus `EVENTBRITE_TOKEN` and `EVENTBRITE_API_KEY`.
- `EVENTBRITE_ORG_ID` is optional if the account has exactly one organization. Current organization is `Sanmu Media = 3007509900725`.

The script is idempotent for existing events:

- If Notion has `Eventbrite ID`, the script reuses it.
- If the Eventbrite event is already `live`, it does not create another event.
- If no ticket exists, it creates a free ticket class.
- If publish fails after draft creation, it keeps ID/URL in Notion so the next run does not duplicate the event.

## Notion State

Events data source:

- `d5b3cb57-7b27-4acd-b936-ae2ca6f275f1`

Required sync fields:

- `平台同步状态` select
- `Eventbrite ID` rich_text
- `Eventbrite URL` url
- `Eventbrite 同步状态` select
- `平台同步错误` rich_text
- `平台同步时间` date

Luma fields were removed. Do not re-add Luma fields in v1.

## Date Handling

Events now support Notion date ranges with start and end datetimes:

- `lib/event-dates.ts` formats same-day ranges like `2026 年 7 月 26 日（周日）11:00-19:00`.
- `lib/notion.ts` reads `dateEnd`.
- List/detail pages use `formatEventDateLabel(...)`.
- `EventJsonLd` includes `endDate`.

The publishing script rejects:

- date-only start values
- missing end time
- end time earlier than or equal to start time

## Luma And Forums

Luma was removed because API access requires a subscription.

Forum automation was not implemented. Current recommendation:

- Do not rely on browser automation for Vansky/VanPeople/Westca/YorkBBS.
- No public posting API was found.
- If needed later, add `events:forum-kit` to generate a posting package from Notion for manual posting.

## Verification Already Run

Passed before handoff:

```bash
npm run test:events-publish
npm run test:event-dates
node --test --experimental-strip-types --experimental-default-type=module lib/i18n.test.mts
npm run verify:i18n-contract
npm run lint
npm run build
git diff --check
```

`npm run build` needs network access because Next fetches Google Fonts during build.

## Next Agent Checklist

For a future event:

1. Create/update both Notion locale pages with the same `Slug`.
2. Ensure `日期` has start and end datetimes.
3. Ensure cover image is an external URL, normally Cloudinary via the existing media upload flow.
4. Run dry-run:

```bash
npm run events:publish -- --slug <event-slug> --dry-run
```

5. Confirm payload contains `https://www.sanmu.ca/events/<event-slug>`.
6. Run publish:

```bash
npm run events:publish -- --slug <event-slug>
```

7. Verify Eventbrite status is `live` and Notion sync fields are `已同步`.

Do not manually create local/static event data unless the user explicitly changes the project workflow.
