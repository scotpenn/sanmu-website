import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata = {
  title: "视频内容 · 三木有话说",
};

export default function VideosPage() {
  return (
    <Container width="reading" className="py-20">
      <SectionTitle eyebrow="VIDEOS">视频内容</SectionTitle>
      <p className="opacity-70">
        三木在 YouTube 上聊过的所有事，分留存系列、破圈精选、实用指南三个子分类。
        视频专区正在整理中，请先在 YouTube 频道《三木有话说》观看。
      </p>
    </Container>
  );
}
