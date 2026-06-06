import {
  EventsIndexPage,
  generateEventsIndexMetadata,
} from "@/app/events/page";
import { TRADITIONAL_LOCALE } from "@/lib/i18n";

export const revalidate = 3600;

export const metadata = generateEventsIndexMetadata(TRADITIONAL_LOCALE);

export default function TraditionalEventsPage() {
  return <EventsIndexPage locale={TRADITIONAL_LOCALE} />;
}
