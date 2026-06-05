import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { Button } from "@/components/Button";
import {
  getUpcomingEvents,
  getPastEvents,
  type EventItem,
} from "@/lib/notion";

// ISR: 每小时后台刷新, 活动状态/新活动自动更新, 无需 redeploy.
export const revalidate = 3600;

export const metadata = {
  title: "线下活动 · 三木有话说",
  description: "三木举办的面对面线下分享与讲座活动。即将举办与往期回顾。",
};

function formatDateLabel(isoDate: string): string {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${year} 年 ${month} 月 ${day} 日（${weekdays[d.getDay()]}）`;
}

function UpcomingCard({ event }: { event: EventItem }) {
  const href = `/events/${event.slug}`;
  return (
    <article className="border border-rule bg-brand-yellow/10 overflow-hidden">
      <Link href={href} className="block hover:opacity-95 transition-opacity">
        {event.coverImageUrl && (
          <div className="aspect-[16/9] relative bg-rule">
            <Image
              src={event.coverImageUrl}
              alt={event.title}
              fill
              sizes="(min-width: 768px) 1080px, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </Link>
      <div className="p-8 md:p-10">
      <div className="text-xs font-en uppercase tracking-widest text-brand-navy/70 mb-4 font-medium">
        {event.status} · Upcoming
      </div>
      <Link href={href} className="block group">
        <h3 className="text-2xl md:text-3xl mb-3 group-hover:text-brand-navy transition-colors">
          {event.title}
        </h3>
      </Link>
      <p className="text-base opacity-80 mb-6 leading-relaxed">
        {event.summary}
      </p>

      <dl className="text-sm space-y-2 mb-6 border-y border-rule py-5">
        <div className="flex gap-4">
          <dt className="font-en uppercase tracking-wide opacity-50 w-14 shrink-0">
            Date
          </dt>
          <dd>
            <time dateTime={event.date}>{formatDateLabel(event.date)}</time>
          </dd>
        </div>
        {event.location && (
          <div className="flex gap-4">
            <dt className="font-en uppercase tracking-wide opacity-50 w-14 shrink-0">
              Venue
            </dt>
            <dd>{event.location}</dd>
          </div>
        )}
      </dl>

      <div className="flex flex-wrap gap-4">
        {event.signupUrl && (
          <Button variant="primary" href={event.signupUrl}>
            立即报名 →
          </Button>
        )}
        <Button variant="secondary" href="mailto:info@sanmu.ca">
          ✉️ 写信咨询
        </Button>
      </div>
      </div>
    </article>
  );
}

function PastCard({ event }: { event: EventItem }) {
  const href = `/events/${event.slug}`;
  return (
    <article className="border border-rule overflow-hidden">
      <Link href={href} className="block hover:opacity-95 transition-opacity">
        {event.coverImageUrl && (
          <div className="aspect-[16/9] relative bg-rule">
            <Image
              src={event.coverImageUrl}
              alt={event.title}
              fill
              sizes="(min-width: 768px) 540px, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </Link>
      <div className="p-8 md:p-10">
      <div className="text-xs font-en uppercase tracking-widest opacity-50 mb-4">
        Past Event
      </div>
      <Link href={href} className="block group">
        <h3 className="text-xl md:text-2xl mb-2 group-hover:text-brand-navy transition-colors">
          {event.title}
        </h3>
      </Link>

      <dl className="text-sm space-y-2 mb-6 border-y border-rule py-5">
        <div className="flex gap-4">
          <dt className="font-en uppercase tracking-wide opacity-50 w-14 shrink-0">
            Date
          </dt>
          <dd>
            <time dateTime={event.date}>{formatDateLabel(event.date)}</time>
          </dd>
        </div>
        {event.location && (
          <div className="flex gap-4">
            <dt className="font-en uppercase tracking-wide opacity-50 w-14 shrink-0">
              Venue
            </dt>
            <dd>{event.location}</dd>
          </div>
        )}
        {event.attendees !== null && (
          <div className="flex gap-4">
            <dt className="font-en uppercase tracking-wide opacity-50 w-14 shrink-0">
              Scale
            </dt>
            <dd>{event.attendees} 人参与</dd>
          </div>
        )}
      </dl>

      {event.summary && (
        <p className="text-sm leading-relaxed opacity-85 mb-4">{event.summary}</p>
      )}

      {event.videoReviewUrl && (
        <a
          href={event.videoReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-brand-navy hover:opacity-80 transition-opacity"
        >
          观看现场回顾 →
        </a>
      )}
      </div>
    </article>
  );
}

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([
    getUpcomingEvents(),
    getPastEvents(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <Container width="card" className="py-16 md:py-20">
          <SectionTitle eyebrow="EVENTS">线下活动</SectionTitle>
          <p className="text-lg opacity-80 leading-relaxed">
            面对面，把没讲完的话聊透。
          </p>
        </Container>
      </section>

      {/* A · 即将举办 */}
      <section className="border-b border-rule">
        <Container width="card" className="py-16 md:py-20">
          <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-6 font-medium border-b border-rule pb-3">
            即将举办 · Upcoming
          </div>

          {upcoming.length === 0 ? (
            <div className="border border-rule bg-brand-yellow/10 p-8 md:p-12 text-center max-w-2xl mx-auto">
              <p className="text-lg mb-3">📅 下一场活动正在筹备中</p>
              <p className="text-sm opacity-70 mb-6">
                留下邮箱，第一时间收到通知
              </p>
              <a
                href="mailto:info@sanmu.ca"
                className="text-sm font-medium text-brand-navy hover:opacity-80 transition-opacity"
              >
                info@sanmu.ca →
              </a>
            </div>
          ) : (
            <div className="grid gap-6 md:gap-8">
              {upcoming.map((event) => (
                <UpcomingCard key={event.slug} event={event} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* B · 往期回顾 */}
      <section>
        <Container width="card" className="py-16 md:py-20">
          <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-6 font-medium border-b border-rule pb-3">
            往期回顾 · Past Events
          </div>

          {past.length === 0 ? (
            <p className="text-sm opacity-60 py-4 text-center">
              还没有往期记录 · 期待第一场。
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {past.map((event) => (
                <PastCard key={event.slug} event={event} />
              ))}
            </div>
          )}

          <p className="text-center text-sm opacity-60 mt-10">
            想看下一场？{" "}
            <a
              href="mailto:info@sanmu.ca"
              className="text-brand-navy hover:opacity-80 transition-opacity font-medium"
            >
              留下邮箱我通知你 →
            </a>
          </p>
        </Container>
      </section>
    </>
  );
}
