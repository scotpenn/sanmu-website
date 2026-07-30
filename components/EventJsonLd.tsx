import { type Locale, navLabels } from "@/lib/i18n";
import { absoluteUrl, localeUrl, organizationSchema } from "@/lib/seo";
import type { EventItem } from "@/lib/notion";

/**
 * 线下活动的结构化数据: Event(活动富媒体) + BreadcrumbList(面包屑).
 */
export function EventJsonLd({
  event,
  locale,
}: {
  event: EventItem;
  locale: Locale;
}) {
  const url = localeUrl(`/events/${event.slug}`, locale);

  const ev = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary,
    startDate: event.date,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    inLanguage: locale,
    url,
    image: event.coverImageUrl || absoluteUrl("/portrait.jpg"),
    organizer: organizationSchema(locale),
    ...(event.dateEnd ? { endDate: event.dateEnd } : {}),
    ...(event.location
      ? { location: { "@type": "Place", name: event.location } }
      : {}),
    ...(event.signupUrl
      ? {
          offers: {
            "@type": "Offer",
            url: event.signupUrl,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: navLabels[locale].home,
        item: localeUrl("/", locale),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: navLabels[locale].events,
        item: localeUrl("/events", locale),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: event.title,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ev) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}
