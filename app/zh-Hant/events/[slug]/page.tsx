import {
  EventDetail,
  generateEventMetadata,
} from "@/app/events/[slug]/page";
import { getAllEventSlugs } from "@/lib/notion";
import { TRADITIONAL_LOCALE } from "@/lib/i18n";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllEventSlugs(TRADITIONAL_LOCALE);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return generateEventMetadata(slug, TRADITIONAL_LOCALE);
}

export default async function TraditionalEventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <EventDetail slug={slug} locale={TRADITIONAL_LOCALE} />;
}
