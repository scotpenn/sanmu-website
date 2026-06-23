import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { EventRegistrationForm } from "@/components/EventRegistrationForm";
import {
  getAllEventSlugs,
  getEventBySlug,
  getPublishedEventLocales,
  isEventPast,
} from "@/lib/notion";
import { videoIdFromUrl } from "@/lib/videos";
import { VideoJsonLd } from "@/components/VideoJsonLd";
import { EventJsonLd } from "@/components/EventJsonLd";
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
  // 纯日历日期: 用 UTC 取值, 避免被运行环境时区(如温哥华)偏移一天.
  const d = new Date(isoDate);
  const weekdays =
    locale === "zh-Hant"
      ? ["週日", "週一", "週二", "週三", "週四", "週五", "週六"]
      : ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${d.getUTCFullYear()} 年 ${d.getUTCMonth() + 1} 月 ${d.getUTCDate()} 日（${weekdays[d.getUTCDay()]}）`;
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

  // 日期已过(温哥华时区)或手动标记已举办 → 已结束. 日期驱动, 无需手动改状态.
  const isPast = isEventPast(event.date) || event.status === "已举办";
  const isUpcoming = !isPast;

  return (
    <>
      <EventJsonLd event={event} locale={locale} />
      {/* Hero · 封面图 / 海报 (如有, 完整不裁切) */}
      {event.coverImageUrl && (
        <section className="border-b border-rule bg-rule/30">
          <div className="mx-auto max-w-[600px] px-6 py-8 md:py-12">
            <div className="relative w-full aspect-[3/4]">
              <Image
                src={event.coverImageUrl}
                alt={event.title}
                fill
                sizes="(min-width: 768px) 600px, 100vw"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </section>
      )}

      {/* 标题 + 基本信息 */}
      <section className="border-b border-rule">
        <Container width="reading" className="py-12 md:py-16">
          <div className="text-xs font-en uppercase tracking-widest text-brand-navy/70 mb-4 font-medium">
            {isPast
              ? `${textForLocale(locale, "活动已结束", "活動已結束")} · Ended`
              : `${event.status} · Upcoming`}
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

          {isUpcoming && event.signupMethod === "网页表单" && (
            <EventRegistrationForm eventSlug={event.slug} locale={locale} />
          )}
          {isUpcoming && event.signupMethod === "无需报名" && (
            <p className="text-base text-brand-navy font-medium">
              {textForLocale(locale, "免费参与，无需报名。", "免費參與，無需報名。")}
            </p>
          )}
          {isUpcoming && event.signupMethod === "外部链接" && event.signupUrl && (
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" href={event.signupUrl}>
                {textForLocale(locale, "前往观看 →", "前往觀看 →")}
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
                if (block.type === "list") {
                  const ListTag = block.ordered ? "ol" : "ul";
                  return (
                    <ListTag
                      key={idx}
                      className={`pl-6 space-y-2 text-base leading-[1.85] ${block.ordered ? "list-decimal" : "list-disc"}`}
                    >
                      {block.items.map((item, i) => (
                        <li key={i}>
                          <RichText segments={item} />
                        </li>
                      ))}
                    </ListTag>
                  );
                }
                if (block.type === "table") {
                  return (
                    <div key={idx} className="my-6 overflow-x-auto">
                      <table className="w-full border-collapse text-base">
                        <tbody>
                          {block.rows.map((row, ri) => (
                            <tr key={ri} className="border-b border-rule">
                              {row.map((cell, ci) => {
                                const isHeader = block.hasColumnHeader && ri === 0;
                                const Cell = isHeader ? "th" : "td";
                                return (
                                  <Cell
                                    key={ci}
                                    className={`px-4 py-2 align-top border border-rule ${isHeader ? "font-semibold text-left bg-brand-yellow/[0.06]" : ""}`}
                                  >
                                    <RichText segments={cell} />
                                  </Cell>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
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

      {/* 已结束但还没上传回顾内容 → 占位 (后续手动补照片/视频后自动替换) */}
      {isPast && event.photos.length === 0 && !event.videoReviewUrl && (
        <section className="border-b border-rule">
          <Container width="reading" className="py-16 md:py-20 text-center">
            <p className="text-lg text-brand-navy font-medium mb-2">
              {textForLocale(locale, "活动回顾整理中", "活動回顧整理中")}
            </p>
            <p className="text-sm opacity-70">
              {textForLocale(
                locale,
                "现场照片与回顾视频稍后补上，敬请期待。",
                "現場照片與回顧影片稍後補上，敬請期待。",
              )}
            </p>
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
