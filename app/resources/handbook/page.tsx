import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { Button } from "@/components/Button";

export const metadata = {
  title: "《身后事安心手册》免费索取 · 三木有话说",
  description:
    "温哥华殡葬师整理的实用手册。法律遗嘱模板 + 政府丧葬福利申请 + 家人身故必处理 87 件事。留下邮箱，免费下载。",
};

export default function HandbookPage() {
  return (
    <Container width="reading" className="py-20">
      <SectionTitle eyebrow="FREE DOWNLOAD" align="center">
        《身后事安心手册》v2.7
      </SectionTitle>
      <p className="text-center opacity-70 mb-8">
        由温哥华殡葬师三木整理 · 三份核心文档 · 累计迭代 7 次
      </p>
      <div className="border border-rule rounded p-8 bg-paper">
        <p className="mb-6">这份手册包含三份文档：</p>
        <ul className="space-y-2 mb-8 opacity-80">
          <li>· 加拿大法律遗嘱模板与填写指南</li>
          <li>· 各级政府丧葬福利申请清单</li>
          <li>· 家人身故必处理的 87 件事</li>
        </ul>
        <div className="flex justify-center">
          <Button variant="primary">申请索取（即将开放）</Button>
        </div>
      </div>
    </Container>
  );
}
