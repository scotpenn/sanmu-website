import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { EventRegistrationForm } from "@/components/EventRegistrationForm";
import { getEventBySlug } from "@/lib/notion";
import { isValidEventInvite } from "@/lib/event-invite";
import { formatEventDateLabel } from "@/lib/event-dates";
import {
  DEFAULT_LOCALE,
  TRADITIONAL_LOCALE,
  textForLocale,
} from "@/lib/i18n";

// 私密邀请报名页: 名额已满后单独发给个别客户. 不进索引, 口令不对就 404.
// 用法: /events/<slug>/invite?code=<口令>  (繁体加 &lang=hant)
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function EventInvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string; lang?: string }>;
}) {
  const { slug } = await params;
  const { code, lang } = await searchParams;
  if (!isValidEventInvite(code)) notFound();

  const locale = lang === "hant" ? TRADITIONAL_LOCALE : DEFAULT_LOCALE;
  const event = await getEventBySlug(slug, locale);
  if (!event) notFound();

  return (
    <section>
      <Container width="reading" className="py-12 md:py-16">
        <div className="text-xs font-en uppercase tracking-widest text-brand-navy/70 mb-4 font-medium">
          {textForLocale(locale, "邀请报名", "邀請報名")} · Invitation
        </div>
        <h1 className="text-3xl md:text-4xl leading-tight mb-6">{event.title}</h1>
        <p className="text-base mb-2">
          <time dateTime={event.date}>
            {formatEventDateLabel(event.date, event.dateEnd, locale)}
          </time>
        </p>
        {event.location && <p className="text-base mb-8">{event.location}</p>}
        <EventRegistrationForm eventSlug={event.slug} locale={locale} invite={code} />
      </Container>
    </section>
  );
}
