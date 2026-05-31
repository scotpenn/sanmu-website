import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata = {
  title: "线下活动 · 三木有话说",
};

export default function EventsPage() {
  return (
    <Container width="reading" className="py-20">
      <SectionTitle eyebrow="EVENTS">线下活动</SectionTitle>
      <p className="opacity-70 mb-4">面对面，把没讲完的话聊透。</p>
      <div className="border border-rule rounded p-8 text-center mt-8 bg-brand-yellow/10">
        <p className="text-lg mb-2">📅 下一场活动正在筹备中</p>
        <p className="text-sm opacity-70">
          留下邮箱，第一时间收到通知 → <a href="mailto:info@sanmu.ca" className="text-brand-navy hover:opacity-80">info@sanmu.ca</a>
        </p>
      </div>
    </Container>
  );
}
