import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata = {
  title: "线下活动 · 三木有话说",
  description:
    "三木举办的面对面线下分享与讲座活动。即将举办与往期回顾。",
};

type PastEvent = {
  slug: string;
  title: string;
  subtitle: string;
  dateISO: string;
  dateLabel: string;
  location: string;
  capacity: string;
  summary: string;
};

const PAST_EVENTS: PastEvent[] = [
  {
    slug: "houshi-na-xie-shi-er-2026-05",
    title: "「身后那些事儿」分享会",
    subtitle: "生命关怀与终极陪伴",
    dateISO: "2026-05-24",
    dateLabel: "2026 年 5 月 24 日（周日）上午 10 点",
    location: "列治文殡仪馆 · 8420 Cambie Road, Richmond BC",
    capacity: "限额 30 人 · 满员",
    summary:
      "三木现场分享身后事相关干货：遗嘱办理、葬礼避坑、政府福利申请。互动答疑 + 现场免费领取遗嘱一份 + 抽奖福利（空气净化器、商超代金券）。",
  },
];

export default function EventsPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <Container width="reading" className="py-16 md:py-20">
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
        </Container>
      </section>

      {/* B · 往期回顾 */}
      <section>
        <Container width="card" className="py-16 md:py-20">
          <div className="text-sm font-en uppercase tracking-wider text-brand-navy/70 mb-6 font-medium border-b border-rule pb-3">
            往期回顾 · Past Events
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {PAST_EVENTS.map((event) => (
              <article
                key={event.slug}
                className="border border-rule p-8 md:p-10"
              >
                <div className="text-xs font-en uppercase tracking-widest opacity-50 mb-4">
                  Past Event
                </div>
                <h3 className="text-xl md:text-2xl mb-2">{event.title}</h3>
                <p className="text-base opacity-80 mb-6">{event.subtitle}</p>

                <dl className="text-sm space-y-2 mb-6 border-y border-rule py-5">
                  <div className="flex gap-4">
                    <dt className="font-en uppercase tracking-wide opacity-50 w-14 shrink-0">
                      Date
                    </dt>
                    <dd>
                      <time dateTime={event.dateISO}>{event.dateLabel}</time>
                    </dd>
                  </div>
                  <div className="flex gap-4">
                    <dt className="font-en uppercase tracking-wide opacity-50 w-14 shrink-0">
                      Venue
                    </dt>
                    <dd>{event.location}</dd>
                  </div>
                  <div className="flex gap-4">
                    <dt className="font-en uppercase tracking-wide opacity-50 w-14 shrink-0">
                      Scale
                    </dt>
                    <dd>{event.capacity}</dd>
                  </div>
                </dl>

                <p className="text-sm leading-relaxed opacity-85">
                  {event.summary}
                </p>
              </article>
            ))}
          </div>

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
