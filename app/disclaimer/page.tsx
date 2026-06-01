import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata = {
  title: "免责声明 · 三木有话说",
  description:
    "三木有话说频道与 sanmu.ca 网站内容性质说明 · 内容仅供参考, 不构成法律 / 医疗 / 金融建议.",
};

export default function DisclaimerPage() {
  return (
    <>
      <section className="border-b border-rule">
        <Container width="card" className="py-16 md:py-20">
          <SectionTitle eyebrow="DISCLAIMER">免责声明</SectionTitle>
          <p className="text-lg opacity-80 leading-relaxed">
            把话说在前面，省得后面误会。
          </p>
        </Container>
      </section>

      <section>
        <Container width="reading" className="py-12 md:py-16">
          <div className="space-y-8 text-lg leading-[1.85]">
            <p>
              我叫三木，一名在加拿大温哥华工作 16 年的殡葬师。这个网站和我的 YouTube 频道《三木有话说》分享我送过 1000 多个家庭后看到的事。
            </p>

            <p>
              <strong className="text-brand-navy">我不是律师，不是医生，不是金融顾问，不是哲学家。</strong>
            </p>

            <p>
              这里所有内容 —— 包括视频、博客文章、《身后事安心手册》—— 都是基于我个人多年的从业经验整理出来的<em>分享</em>。它能帮你<strong>少踩坑、早做准备、看清方向</strong>。
            </p>

            <p>
              但它<strong className="text-brand-navy">不构成专业建议</strong>。具体到你自己的情况：
            </p>

            <ul className="space-y-3 list-disc pl-6">
              <li>
                <strong>遗嘱办理 / 遗产规划</strong> —— 请咨询持牌律师 (notary public / estate lawyer)
              </li>
              <li>
                <strong>政府福利申请</strong> —— 以加拿大联邦及省政府官方网站公告为准, 政策会变
              </li>
              <li>
                <strong>葬礼费用谈判 / 殡仪服务合同</strong> —— 签字前请第三方法律意见
              </li>
              <li>
                <strong>跨国骨灰运输 / 法律手续</strong> —— 因国家、省份、时间不同而变化, 请联系当地殡仪馆或大使馆
              </li>
              <li>
                <strong>心理健康 / 情绪困扰</strong> —— 请咨询持牌心理咨询师或致电当地危机求助热线
              </li>
              <li>
                <strong>财务规划 / 投资</strong> —— 请咨询持牌金融顾问
              </li>
            </ul>

            <h2 className="text-2xl mt-12 mb-3">关于信息时效</h2>
            <p>
              法律条文、政府福利政策、殡仪行业流程都会随时间变化。本网站文章发布时是当时的真实情况, 但你看到的时候可能已经过时几个月或几年。<strong>任何具体操作前请核实当下最新规定</strong>。
            </p>

            <h2 className="text-2xl mt-12 mb-3">关于个案差异</h2>
            <p>
              文章里提到的故事、案例、数字都来自真实经历, 但每个家庭、每个人情况不同。直接套用别人的方案可能不适合你。我分享的是"思考的方向"和"该问的问题", 不是"标准答案"。
            </p>

            <h2 className="text-2xl mt-12 mb-3">关于外部链接</h2>
            <p>
              网站内可能含有指向 YouTube 视频、Google Form 报名表、政府网站、第三方服务的链接。这些链接所在网站的内容、隐私政策、服务质量由对方负责, 与三木无关。
            </p>

            <h2 className="text-2xl mt-12 mb-3">如果你发现错误</h2>
            <p>
              我尽力让每篇内容都准确, 但难免有疏漏。如果你发现错别字、过时信息、或与你专业经验冲突的内容, 请来信告诉我:{" "}
              <a
                href="mailto:info@sanmu.ca"
                className="text-brand-navy font-medium hover:opacity-80 transition-opacity"
              >
                info@sanmu.ca
              </a>
              。我会亲自看, 错误确实存在的话我会修正并致谢。
            </p>

            <h2 className="text-2xl mt-12 mb-3">最后一句话</h2>
            <p className="font-serif text-xl text-brand-navy border-l-4 border-brand-yellow pl-6 my-10 leading-relaxed">
              我不能替你做决定。但如果你愿意听, 我可以告诉你殡仪馆内我看到的那些事。
            </p>
            <p>
              <strong>看完, 你自己判断, 自己决定, 自己负责</strong>。这是我对你的尊重, 也是我能给的所有承诺。
            </p>

            <div className="border-t border-rule pt-6 mt-12 text-sm opacity-60">
              最后更新: 2026-05-31
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
