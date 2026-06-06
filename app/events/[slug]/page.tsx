import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import {
  getAllEventSlugs,
  getEventBySlug,
  getPublishedEventLocales,
} from "@/lib/notion";
import { videoIdFromUrl } from "@/lib/videos";
import { VideoJsonLd } from "@/components/VideoJsonLd";
import { RichText } from "@/components/RichText";
import {
  DEFAULT_LOCALE,
  localizedPath,
  peopleLabel,
  textForLocale,
  type Locale,
} from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";

// ISR: 每小时后台刷新. 改了活动内容后详情页自动更新; build 后新增的活动也按需生成.
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllEventSlugs(DEFAULT_LOCALE);
  return slugs.map((slug) => ({ slug }));
}

export async function generateEventMetadata(slug: string, locale: Locale) {
  const event = await getEventBySlug(slug, locale);
  if (!event) {
    return pageSeo({
      title: textForLocale(locale, "活动未找到"),
      description: textForLocale(locale, "这个活动不存在或尚未发布。"),
      path: `/events/${slug}`,
      locale,
    });
  }
  const availableLocales = await getPublishedEventLocales(event.slug);
  return pageSeo({
    title: event.title,
    description: event.summary,
    path: `/events/${event.slug}`,
    locale,
    availableLocales: availableLocales.length ? availableLocales : [locale],
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return generateEventMetadata(slug, DEFAULT_LOCALE);
}

function formatDateLabel(isoDate: string, locale: Locale): string {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  const weekdays =
    locale === "zh-Hant"
      ? ["週日", "週一", "週二", "週三", "週四", "週五", "週六"]
      : ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日（${weekdays[d.getDay()]}）`;
}

export async function EventDetail({
  slug,
  locale = DEFAULT_LOCALE,
}: {
  slug: string;
  locale?: Locale;
}) {
  const event = await getEventBySlug(slug, locale);
  if (!event) notFound();

  const isPast = event.status === "已举办";
  const isUpcoming = !isPast;

  return (
    <>
      {/* Hero · 封面图 (如有) */}
      {event.coverImageUrl && (
        <section className="border-b border-rule">
          <div className="relative w-full aspect-[21/9] bg-rule">
            <Image
              src={event.coverImageUrl}
              alt={event.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        </section>
      )}

      {/* 标题 + 基本信息 */}
      <section className="border-b border-rule">
        <Container width="reading" className="py-12 md:py-16">
          <div className="text-xs font-en uppercase tracking-widest text-brand-navy/70 mb-4 font-medium">
            {isPast ? "Past Event" : `${event.status} · Upcoming`}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl leading-tight mb-8">
            {event.title}
          </h1>

          <dl className="text-base space-y-3 mb-8 border-y border-rule py-6">
            <div className="flex gap-6">
              <dt className="font-en uppercase tracking-wide opacity-50 w-20 shrink-0 text-sm pt-1">
                Date
              </dt>
              <dd>
                <time dateTime={event.date}>{formatDateLabel(event.date, locale)}</time>
              </dd>
            </div>
            {event.location && (
              <div className="flex gap-6">
                <dt className="font-en uppercase tracking-wide opacity-50 w-20 shrink-0 text-sm pt-1">
                  Venue
                </dt>
                <dd>{event.location}</dd>
              </div>
            )}
            {event.attendees !== null && (
              <div className="flex gap-6">
                <dt className="font-en uppercase tracking-wide opacity-50 w-20 shrink-0 text-sm pt-1">
                  Scale
                </dt>
                <dd>{peopleLabel(event.attendees, locale)}</dd>
              </div>
            )}
          </dl>

          {event.summary && (
            <p className="text-lg leading-relaxed opacity-85 mb-8">
              {event.summary}
            </p>
          )}

          {isUpcoming && event.signupUrl && (
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" href={event.signupUrl}>
                {textForLocale(locale, "立即报名 →")}
              </Button>
              <Button variant="secondary" href="mailto:info@sanmu.ca">
                ✉️ {textForLocale(locale, "写信咨询")}
              </Button>
            </div>
          )}
        </Container>
      </section>

      {/* 活动详情 (page content blocks 渲染) */}
      {event.blocks.length > 0 && (
        <section className="border-b border-rule">
          <Container width="reading" className="py-12 md:py-16">
            <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-6 font-medium border-b border-rule pb-3">
              {textForLocale(locale, "活动详情")} · About
            </div>
            <div className="space-y-5">
              {event.blocks.map((block, idx) => {
                if (block.type === "paragraph") {
                  return (
                    <p key={idx} className="text-base leading-[1.85]">
                      <RichText segments={block.segments} />
                    </p>
                  );
                }
                if (block.type === "quote") {
                  return (
                    <blockquote
                      key={idx}
                      className="font-serif text-lg md:text-xl text-brand-navy border-l-4 border-brand-yellow pl-5 my-6 leading-relaxed"
                    >
                      {block.text}
                    </blockquote>
                  );
                }
                if (block.type === "heading") {
                  const Tag = block.level === 2 ? "h2" : "h3";
                  return (
                    <Tag
                      key={idx}
                      className={
                        block.level === 2
                          ? "text-2xl md:text-3xl mt-10 mb-3"
                          : "text-xl md:text-2xl mt-8 mb-2"
                      }
                    >
                      {block.text}
                    </Tag>
                  );
                }
                if (block.type === "video") {
                  return (
                    <div key={idx} className="my-8 aspect-video">
                      <VideoJsonLd
                        videoId={block.videoId}
                        fallbackName={event.title}
                        description={event.summary}
                        fallbackUploadDate={event.date}
                        locale={locale}
                      />
                      <iframe
                        src={`https://www.youtube.com/embed/${block.videoId}`}
                        title="Embedded video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </Container>
        </section>
      )}

      {/* 照片墙 */}
      {event.photos.length > 0 && (
        <section className="border-b border-rule">
          <Container width="card" className="py-12 md:py-16">
            <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-6 font-medium border-b border-rule pb-3">
              {textForLocale(locale, "活动现场")} · Photos
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {event.photos.map((photo, idx) => (
                <a
                  key={idx}
                  href={photo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-square relative bg-rule overflow-hidden group"
                >
                  <Image
                    src={photo}
                    alt={`${event.title} 现场照片 ${idx + 1}`}
                    fill
                    sizes="(min-width: 768px) 360px, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </a>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 视频回顾 (YouTube) */}
      {event.videoReviewUrl && (
        <section className="border-b border-rule">
          <Container width="reading" className="py-12 md:py-16">
            <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-6 font-medium border-b border-rule pb-3">
              {textForLocale(locale, "现场回顾")} · Recap Video
            </div>
            <div className="aspect-video">
              {videoIdFromUrl(event.videoReviewUrl) && (
                <VideoJsonLd
                  videoId={videoIdFromUrl(event.videoReviewUrl)!}
                  fallbackName={`${event.title} · ${textForLocale(locale, "现场回顾")}`}
                  description={event.summary}
                  fallbackUploadDate={event.date}
                  locale={locale}
                />
              )}
              <iframe
                src={event.videoReviewUrl.replace(
                  "youtube.com/watch?v=",
                  "youtube.com/embed/",
                )}
                title="Event recap video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </Container>
        </section>
      )}

      {/* 底部 CTA */}
      <section>
        <Container width="reading" className="py-12 md:py-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href={localizedPath("/events", locale)}
              className="text-sm font-medium text-brand-navy hover:opacity-80 transition-opacity"
            >
              {textForLocale(locale, "← 返回活动列表")}
            </Link>
            <Button variant="secondary" href="mailto:info@sanmu.ca">
              ✉️ {textForLocale(locale, "写信咨询 / 通知我下一场")}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <EventDetail slug={slug} locale={DEFAULT_LOCALE} />;
}
