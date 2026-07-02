import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { GLOSSARY_SECTIONS } from "@/lib/glossary";
import { TRADITIONAL_LOCALE, withLocalePrefix, type Locale } from "@/lib/i18n";

/**
 * 术语对照表页面主体 (简繁共用).
 * 简繁词条名称与释义在 lib/glossary.ts 里是两套独立文案, 按 locale 取用.
 */
export function GlossaryContent({ locale }: { locale: Locale }) {
  const isHant = locale === TRADITIONAL_LOCALE;

  return (
    <>
      {/* 页头 */}
      <section className="border-b border-rule">
        <Container width="reading" className="py-16 md:py-20">
          <div className="text-xs font-en uppercase tracking-widest text-brand-navy/70 mb-4 font-medium">
            Glossary · {GLOSSARY_SECTIONS.reduce((n, s) => n + s.terms.length, 0)}{" "}
            Terms
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
            {isHant ? "加拿大身後事中英術語對照表" : "加拿大身后事中英术语对照表"}
          </h1>
          <p className="text-lg md:text-xl opacity-85 leading-relaxed mb-4">
            {isHant
              ? "葬禮、遺囑、骨灰、政府福利……這些事的英文到底怎麼說？"
              : "葬礼、遗嘱、骨灰、政府福利……这些事的英文到底怎么说？"}
          </p>
          <p className="text-base opacity-75 leading-relaxed">
            {isHant
              ? "跟殯儀館、律師、政府部門打交道時最常遇到的術語，三木按場景整理成四組，每條配一句白話解釋。建議收藏，需要時直接查。"
              : "跟殡仪馆、律师、政府部门打交道时最常遇到的术语，三木按场景整理成四组，每条配一句白话解释。建议收藏，需要时直接查。"}
          </p>

          {/* 分组快捷导航 */}
          <nav className="flex flex-wrap gap-x-5 gap-y-2 mt-8 text-sm">
            {GLOSSARY_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-brand-navy font-medium hover:opacity-80 transition-opacity underline underline-offset-4 decoration-brand-navy/30"
              >
                {isHant ? s.titleHant : s.titleHans}
              </a>
            ))}
          </nav>
        </Container>
      </section>

      {/* 词条分组 */}
      {GLOSSARY_SECTIONS.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="border-b border-rule scroll-mt-12"
        >
          <Container width="card" className="py-14 md:py-16">
            <div className="mb-8">
              <div className="text-xs font-en uppercase tracking-widest text-brand-navy/60 mb-2 font-medium">
                {section.titleEn}
              </div>
              <h2 className="text-2xl md:text-3xl">
                {isHant ? section.titleHant : section.titleHans}
              </h2>
            </div>

            <dl className="divide-y divide-rule border-y border-rule">
              {section.terms.map((term) => (
                <div
                  key={term.en}
                  className="grid md:grid-cols-12 gap-2 md:gap-8 py-5"
                >
                  <dt className="md:col-span-4">
                    <div className="text-base md:text-lg font-medium leading-snug">
                      {isHant ? term.hant : term.hans}
                    </div>
                    <div className="text-sm font-en opacity-60 mt-0.5">
                      {term.en}
                    </div>
                  </dt>
                  <dd className="md:col-span-8 text-sm md:text-base opacity-80 leading-relaxed">
                    {isHant ? term.defHant : term.defHans}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      ))}

      {/* CTA · 接手册 */}
      <section className="border-b border-rule bg-brand-yellow/[0.05]">
        <Container width="reading" className="py-16 md:py-20 text-center">
          <h2 className="text-2xl md:text-3xl mb-5">
            {isHant ? "術語看懂了，事情還得一步步辦" : "术语看懂了，事情还得一步步办"}
          </h2>
          <p className="text-base md:text-lg opacity-80 leading-relaxed mb-8 max-w-[560px] mx-auto">
            {isHant
              ? "《身後事安心手冊》把這些術語背後的實際流程整理成 8 份文件：遺囑模板、福利申請指南、87 件事清單。免費領取。"
              : "《身后事安心手册》把这些术语背后的实际流程整理成 8 份文档：遗嘱模板、福利申请指南、87 件事清单。免费领取。"}
          </p>
          <Button
            variant="primary"
            href={withLocalePrefix("/resources/handbook", locale)}
          >
            {isHant ? "✉️ 免費索取手冊" : "✉️ 免费索取手册"}
          </Button>
        </Container>
      </section>

      {/* 免责提示 */}
      <section>
        <Container width="reading" className="py-10 md:py-12 text-center">
          <p className="text-sm opacity-70 leading-relaxed max-w-[560px] mx-auto">
            {isHant ? (
              <>
                ⚠️ 術語解釋基於三木 16 年北美殯葬實務經驗整理，
                <strong>僅供參考</strong>
                ，具體法律、稅務與醫療事項請以官方規定為準並諮詢持牌專業人士。詳見{" "}
                <Link
                  href={withLocalePrefix("/disclaimer", locale)}
                  className="text-brand-navy hover:opacity-80 transition-opacity font-medium"
                >
                  免責聲明
                </Link>
                。
              </>
            ) : (
              <>
                ⚠️ 术语解释基于三木 16 年北美殡葬实务经验整理，
                <strong>仅供参考</strong>
                ，具体法律、税务与医疗事项请以官方规定为准并咨询持牌专业人士。详见{" "}
                <Link
                  href={withLocalePrefix("/disclaimer", locale)}
                  className="text-brand-navy hover:opacity-80 transition-opacity font-medium"
                >
                  免责声明
                </Link>
                。
              </>
            )}
          </p>
        </Container>
      </section>
    </>
  );
}
