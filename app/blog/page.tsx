import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata = {
  title: "博客 · 三木有话说",
  description:
    "把视频里讲不完的写在这里。葬礼、遗嘱、骨灰、政府福利、原生家庭、中年危机、终局思维 —— 海外华人值得读的深度文章。",
};

export default function BlogPage() {
  return (
    <Container width="reading" className="py-20">
      <SectionTitle eyebrow="BLOG">博客</SectionTitle>
      <p className="opacity-70">
        把视频里讲不完的，写在这里。Phase 1 Task 8 会上线博客模板与第一篇示例。Phase 2 接 Notion CMS 后，所有博客从 Notion 拉取。
      </p>
    </Container>
  );
}
