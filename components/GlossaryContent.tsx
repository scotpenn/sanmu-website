import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { GLOSSARY_SECTIONS } from "@/lib/glossary";
import { TRADITIONAL_LOCALE, withLocalePrefix, type Locale } from "@/lib/i18n";

/**
 * 术语对照表页面主体 (简繁共用).
 * 简繁词条名称与释义在 lib/glossary.ts 里是两套独立文案, 按 locale 取用.
 * 每条 = 权威定义编译(正文) + 三木白话提示(浅色小字) + 可选相关阅读内链.
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
              ? "跟殯儀館、律師、政府部門打交道時最常遇到的術語，按場景分成四組。每條先給權威定義的中文編譯，再配一句三木的白話提示。建議收藏，需要時直接查。"
              : "跟殡仪馆、律师、政府部门打交道时最常遇到的术语，按场景分成四组。每条先给权威定义的中文编译，再配一句三木的白话提示。建议收藏，需要时直接查。"}
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
                  {/* 中英并排 · 同字号 */}
                  <dt className="md:col-span-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 content-start">
                    <span className="text-base md:text-lg font-medium leading-snug">
                      {isHant ? term.hant : term.hans}
                    </span>
                    <span className="text-base md:text-lg font-en leading-snug opacity-70">
                      {term.en}
                    </span>
                  </dt>
                  <dd className="md:col-span-8">
                    <p className="text-sm md:text-base opacity-85 leading-relaxed">
                      {isHant ? term.defHant : term.defHans}
                    </p>
                    {(isHant ? term.noteHant : term.noteHans) && (
                      <p className="text-sm opacity-60 leading-relaxed mt-1.5">
                        {isHant ? term.noteHant : term.noteHans}
                      </p>
                    )}
                    {term.related && (
                      <p className="text-sm mt-1.5">
                        <Link
                          href={withLocalePrefix(term.related.href, locale)}
                          className="text-brand-navy/70 hover:text-brand-navy transition-colors underline underline-offset-4 decoration-brand-navy/20"
                        >
                          {isHant ? "延伸閱讀：" : "延伸阅读："}
                          {isHant ? term.related.hant : term.related.hans}
                        </Link>
                      </p>
                    )}
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

      {/* 定义来源说明 + 免责提示 */}
      <section>
        <Container width="reading" className="py-10 md:py-12 text-center">
          <p className="text-sm opacity-70 leading-relaxed max-w-[620px] mx-auto mb-4">
            {isHant
              ? "本表定義主要編譯自加拿大聯邦政府官方說明（canada.ca）、安大略省殯葬監管局（BAO）官方術語表、BC 省《遺囑、遺產與繼承法》（WESA）框架下的司法定義，以及世界衛生組織（WHO）等權威來源；白話提示為三木 16 年北美殯葬實務經驗補充。"
              : "本表定义主要编译自加拿大联邦政府官方说明（canada.ca）、安大略省殡葬监管局（BAO）官方术语表、BC 省《遗嘱、遗产与继承法》（WESA）框架下的司法定义，以及世界卫生组织（WHO）等权威来源；白话提示为三木 16 年北美殡葬实务经验补充。"}
          </p>
          <p className="text-sm opacity-70 leading-relaxed max-w-[560px] mx-auto">
            {isHant ? (
              <>
                ⚠️ 內容<strong>僅供參考</strong>
                ，具體法律、稅務與醫療事項請以官方最新規定為準並諮詢持牌專業人士。詳見{" "}
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
                ⚠️ 内容<strong>仅供参考</strong>
                ，具体法律、税务与医疗事项请以官方最新规定为准并咨询持牌专业人士。详见{" "}
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
