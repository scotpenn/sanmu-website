import Image from "next/image";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { Button } from "@/components/Button";
import { HandbookForm } from "@/components/HandbookForm";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";
import { getHandbookCount } from "@/lib/handbook-count";

export const metadata = pageSeo({
  title: "《身后事安心手册》v2.7 · 免费索取",
  description:
    "温哥华殡葬师三木整理的 8 份加拿大实用文档·遗嘱模板·政府福利申请·87 件事清单·葬礼费用对比·向死而生活法·预立医疗委托·信用记录防盗·80+ 页. 来信免费获取.",
  path: "/resources/handbook",
  locale: DEFAULT_LOCALE,
});

export const revalidate = 3600;

type HandbookDoc = {
  num: string;
  numEn: string;
  title: string;
  description: string;
  forWhom: string;
};

const DOCUMENTS: HandbookDoc[] = [
  {
    num: "I",
    numEn: "Document I",
    title: "法律遗嘱模板（中英双语）",
    description:
      "完整的 Last Will and Testament 模板。涵盖遗嘱执行人 / 受托人指定、财产分配、未成年子女监护、葬礼指示等 14 项条款。中英双语对照，便于跟律师确认。",
    forWhom: "18 岁以上拥有任何资产、家人、或居住在加拿大的成年人",
  },
  {
    num: "II",
    numEn: "Document II",
    title: "加拿大身故后政府福利申请完整指南",
    description:
      "覆盖 CPP 死亡补助金、CPP 遗属抚恤金、OAS 遗属补助、EI 补偿、最终税务申报、BC 省福利、WCB 工伤赔偿等。含申请时间表、官方联系电话、常见拒绝原因 FAQ。",
    forWhom: "家人刚离世正在办身后事的家属",
  },
  {
    num: "III",
    numEn: "Document III",
    title: "家人身故时必须处理的 87 件事",
    description:
      "5 大类清单：取得生死资料 / 安排付款 / 搜集文件 / 数小时内的决定和安排 / 尽快通知。按清单逐条核对，不会漏关键步骤。",
    forWhom: "家人离世后 7 天内的家属",
  },
  {
    num: "IV",
    numEn: "Document IV",
    title: "家庭档案册（生前预填）",
    description:
      "完整记录册：个人资料 / 重要医疗纪录 / 难忘的事件 / 悼词与讣告备录 / 生平简历 / 重要文件存放地点 / 银行账户 / 保险 / 推荐律师 & 殡仪馆名单。",
    forWhom: "想「为家人减少麻烦」的人——自己生前填好，离开时家人不抓瞎",
  },
  {
    num: "V",
    numEn: "Document V",
    title: "加拿大葬礼费用对比指南",
    description:
      "核心费用拆解（殡仪馆服务 / 火化 / 土葬 / 礼仪 / 墓地）+ 详细费用对比表 + 套餐对比表 + 真实成交价区间。让你看清「必要花费」和「被推销的额外项目」。",
    forWhom: "正在询价 / 比价的家属，防止被殡仪馆「温和地」推销",
  },
  {
    num: "VI",
    numEn: "Document VI",
    title: "殡葬师的「向死而生」活法",
    description:
      "三木从送过 1000+ 个人的经验里提炼的人生重心整理法：遗憾最小化 / 关系排序 / 接受无常。不是鸡汤，是从殡仪馆内看到的真相。",
    forWhom: "精神内耗严重 / 中年困惑 / 想厘清人生重心的人",
  },
  {
    num: "VII",
    numEn: "Document VII",
    title: "加拿大预立医疗委托完整指南",
    description:
      "Advance Care Directive 详解：什么是预立医疗委托、为什么重要、核心决策范围、加拿大办理流程、常见误区。让你在意识清醒时决定生命最后阶段的事。",
    forWhom: "50+ 岁人士；任何想自主决定临终医疗方式的人",
  },
  {
    num: "VIII",
    numEn: "Document VIII",
    title: "如何处理逝者信用记录防止身份盗用",
    description:
      "完整步骤：通知 Equifax / TransUnion、通知 CRA 与金融机构、监控可疑活动。海外华人特别需要，逝者身份被冒用追讨困难。",
    forWhom: "正在办身后事的家属，离世后 30 天内必做",
  },
];

export default async function HandbookPage() {
  const count = await getHandbookCount();
  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <Container width="card" className="py-16 md:py-24">
          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
            {/* 左 · 文字 */}
            <div className="md:col-span-7">
              <div className="text-xs font-en uppercase tracking-widest text-brand-navy/70 mb-4 font-medium">
                Free Handbook · v2.7
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
                希望你永远用不到，
                <br />
                但需要时它已经在你抽屉里。
              </h1>
              <p className="text-lg md:text-xl opacity-85 leading-relaxed mb-6">
                《身后事安心手册》—— 8 份文档 / 80+ 页 / 加拿大场景。
              </p>
              <p className="text-base opacity-75 leading-relaxed mb-10 max-w-[520px]">
                三木在加拿大做殡葬师 16 年。送过 1000+ 个家庭。频道 6 年。
                <br />
                这本手册是他看到家属反复踩的坑、被错误信息坑过的钱、错过的政府福利窗口期，整理成的清单、模板和流程图。
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" href="#get">
                  ✉️ 免费索取手册
                </Button>
                <a
                  href="#contents"
                  className="inline-flex items-center text-base font-medium text-brand-navy hover:opacity-80 transition-opacity px-4 py-3"
                >
                  先看包含什么 ↓
                </a>
              </div>
            </div>

            {/* 右 · 手册封面 (真实 PDF 第一页) */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <Image
                src="/handbook-cover.png"
                alt="《身后事安心手册》v2.7 · 三木有话说频道整理"
                width={1414}
                height={2000}
                priority
                sizes="(min-width: 1024px) 340px, (min-width: 768px) 320px, 280px"
                className="w-[280px] md:w-[320px] lg:w-[340px] h-auto shadow-xl border border-rule"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* 屏 2 · 手册包含什么 · 8 份文档 */}
      <section id="contents" className="border-b border-rule scroll-mt-12">
        <Container width="card" className="py-20 md:py-24">
          <SectionTitle align="center">手册包含什么</SectionTitle>
          <p className="text-center opacity-70 mb-12 max-w-[560px] mx-auto">
            8 份独立文档，按「事发紧急程度」和「使用场景」组织。可以单独打印某一份，也可以整本存档。
          </p>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {DOCUMENTS.map((doc) => (
              <article
                key={doc.num}
                className="border border-rule p-7 md:p-8"
              >
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-2xl md:text-3xl font-extrabold text-brand-navy font-en">
                    {doc.num}
                  </span>
                  <span className="text-xs font-en uppercase tracking-wider opacity-50">
                    {doc.numEn}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl leading-snug mb-3">
                  {doc.title}
                </h3>
                <p className="text-sm opacity-80 leading-relaxed mb-4">
                  {doc.description}
                </p>
                <div className="border-t border-rule pt-3 mt-auto">
                  <div className="text-xs font-en uppercase tracking-wider text-brand-navy/70 mb-1 font-medium">
                    For
                  </div>
                  <p className="text-sm">{doc.forWhom}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA · 看完文档顺势索取 */}
      <section className="border-b border-rule">
        <Container width="reading" className="py-14 md:py-16 text-center">
          <Button variant="primary" href="#get">
            ✉️ 免费索取手册
          </Button>
        </Container>
      </section>

      {/* 屏 3 · 为什么免费 (暖黄淡底, 与首页屏 2 视觉呼应) */}
      <section className="border-b border-rule bg-brand-yellow/[0.05]">
        <Container width="reading" className="py-20 md:py-24 text-center">
          <SectionTitle align="center" className="mb-6">
            为什么免费
          </SectionTitle>
          <div className="space-y-5 text-lg leading-relaxed opacity-90">
            <p>
              这份手册不是营销赠品，也不是付费门槛。
            </p>
            <p>
              是我看到太多家庭在亲人离世后手忙脚乱、被错误信息坑钱坑感情，所以整理出来。
            </p>
            <p className="font-serif text-xl md:text-2xl text-brand-navy mt-8 leading-relaxed">
              我希望你永远用不到它。
              <br />
              但当你需要它的时候，它已经在你抽屉里了。
            </p>
          </div>
        </Container>
      </section>

      {/* 屏 4 · 如何索取(表单) */}
      <section id="get" className="border-b border-rule scroll-mt-12">
        <Container width="reading" className="py-20 md:py-24 text-center">
          <SectionTitle align="center" className="mb-6">
            填一下，手册马上发到你邮箱
          </SectionTitle>
          <p className="text-lg opacity-85 leading-relaxed mb-4">
            留下邮箱和称呼，PDF 会自动发给你。
          </p>
          <p className="text-base text-brand-navy/80 mb-10">
            已有 <span className="font-en font-bold">{count.toLocaleString("en-US")}</span> 个家庭领取了这份手册
          </p>

          <HandbookForm locale={DEFAULT_LOCALE} />

          <p className="text-sm opacity-60 mt-6 max-w-[480px] mx-auto leading-relaxed">
            三木会亲自看每一封回信。如果几分钟内没收到手册，请检查垃圾邮件，或写信到 info@sanmu.ca。
          </p>
        </Container>
      </section>

      {/* 屏 5 · 免责提示 */}
      <section>
        <Container width="reading" className="py-12 md:py-16 text-center">
          <p className="text-sm opacity-70 leading-relaxed max-w-[560px] mx-auto">
            ⚠️ 手册内容来自三木 16 年北美殡葬实务经验整理，<strong>仅供参考</strong>，不构成法律 / 医疗 / 金融建议。具体事务请咨询持牌律师 / 医生 / 金融顾问。详见{" "}
            <a
              href="/disclaimer"
              className="text-brand-navy hover:opacity-80 transition-opacity font-medium"
            >
              免责声明
            </a>
            。
          </p>
        </Container>
      </section>
    </>
  );
}
