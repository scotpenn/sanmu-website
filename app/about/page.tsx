import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata = {
  title: "关于三木 · 三木有话说",
  description:
    "三木，温哥华殡葬师，16 年送过 1000+ 个人最后一程。在 YouTube 频道《三木有话说》分享火化炉前看到的事。",
};

export default function AboutPage() {
  return (
    <Container width="reading" className="py-20">
      <SectionTitle eyebrow="ABOUT">关于三木</SectionTitle>
      <p className="opacity-70">
        这里将放三木的完整故事。Phase 1 Task 7 会完成这页的 5 屏设计 —— 大幅黑白肖像 + 三木亲笔的"我是谁"自述。
      </p>
    </Container>
  );
}
