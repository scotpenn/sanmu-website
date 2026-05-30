const COLORS = [
  { cls: "bg-brand-navy", hex: "#1E3A8A", name: "brand-navy", desc: "Logo / 标题 / 主按钮", textOnDark: true },
  { cls: "bg-brand-yellow", hex: "#F2C12E", name: "brand-yellow", desc: "引文背景 / 高亮", textOnDark: false },
  { cls: "bg-paper", hex: "#FAF7F2", name: "paper", desc: "页面主底色", textOnDark: false },
  { cls: "bg-ink", hex: "#3F3D3A", name: "ink", desc: "正文", textOnDark: true },
  { cls: "bg-rule", hex: "#E5E0D8", name: "rule", desc: "分割线 / 边框", textOnDark: false },
];

export default function TestStylePage() {
  return (
    <main className="bg-paper text-ink min-h-screen">
      <div className="mx-auto max-w-[1080px] px-6 py-16">
        {/* 页头 */}
        <header className="border-b border-rule pb-6 mb-12">
          <h1 className="font-serif text-brand-navy text-4xl mb-2">视觉系统验收页</h1>
          <p className="text-base">
            Phase 1 · Task 4 · 这页用来核对颜色、字体、字号是否符合 PRD v0.3 第五章。
            <br />
            <span className="text-sm">不会出现在最终网站上 — 仅供本地预览。</span>
          </p>
        </header>

        {/* 1. 5 个品牌色 */}
        <section className="mb-16">
          <h2 className="font-serif text-brand-navy text-2xl mb-6">1 · 五个品牌色</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {COLORS.map((c) => (
              <div key={c.name} className="border border-rule rounded overflow-hidden">
                <div className={`${c.cls} h-28 flex items-end p-3`}>
                  <span
                    className={`font-en text-sm ${
                      c.textOnDark ? "text-paper" : "text-ink"
                    }`}
                  >
                    {c.hex}
                  </span>
                </div>
                <div className="p-3 text-sm">
                  <div className="font-en font-bold">{c.name}</div>
                  <div className="text-xs opacity-70">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm opacity-70">
            比例参考：暖米白 70% / 暖灰文字 20% / 藏蓝 7% / 明黄 3%
          </p>
        </section>

        {/* 2. 字体对照 */}
        <section className="mb-16">
          <h2 className="font-serif text-brand-navy text-2xl mb-6">2 · 中文字体对照</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-rule rounded p-6">
              <div className="text-sm opacity-60 mb-2 font-en">思源宋体 · 标题专用</div>
              <p className="font-serif text-2xl text-brand-navy leading-tight">
                我送过一千多个人最后一程
              </p>
              <p className="font-serif text-base mt-3">
                Noto Serif SC · font-serif
              </p>
            </div>
            <div className="border border-rule rounded p-6">
              <div className="text-sm opacity-60 mb-2 font-en">思源黑体 · 正文专用</div>
              <p className="font-sans text-2xl">我送过一千多个人最后一程</p>
              <p className="font-sans text-base mt-3">Noto Sans SC · font-sans（默认）</p>
            </div>
          </div>
        </section>

        {/* 3. 字号梯度 */}
        <section className="mb-16">
          <h2 className="font-serif text-brand-navy text-2xl mb-6">3 · 字号梯度（基准 18px）</h2>
          <div className="space-y-3">
            {[
              { cls: "text-4xl", px: "56px", note: "H1 主标题" },
              { cls: "text-3xl", px: "40px", note: "屏内大标题" },
              { cls: "text-2xl", px: "32px", note: "H2 区块标题" },
              { cls: "text-xl", px: "24px", note: "H3 小节标题" },
              { cls: "text-lg", px: "20px", note: "强调正文" },
              { cls: "text-base", px: "18px", note: "正文基准" },
            ].map((s) => (
              <div key={s.cls} className="flex items-baseline gap-6">
                <span className="font-en text-xs opacity-50 w-32 shrink-0">
                  {s.cls} · {s.px}
                </span>
                <span className={`${s.cls} font-serif text-brand-navy`}>
                  人生末了，重要的事就那几件。
                </span>
                <span className="text-sm opacity-60 ml-auto">{s.note}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 正文阅读样本 */}
        <section className="mb-16">
          <h2 className="font-serif text-brand-navy text-2xl mb-6">
            4 · 正文阅读样本（720px 宽 · 行高 1.8）
          </h2>
          <div className="max-w-[720px]">
            <h3 className="font-serif text-3xl text-brand-navy mb-6">
              我每年要送走两百多个人
            </h3>
            <p className="mb-6">
              摸过太多冰冷的手，听过太多来不及的话。
              我做这个频道，不是为了让你看见死亡，
              是为了让你重新看见，自己还有多少时间。
            </p>
            <p className="mb-6">
              这一行我做了 16 年。送过老人也送过孩子，见过体面的告别，
              也见过来不及的遗憾。三年前我开始在 YouTube 上拍视频，
              把这些经历讲出来。不是为了让你害怕死亡，是为了让你早一点看见 ——
              时间永远比你以为的少。
            </p>
            <p>这个频道叫《三木有话说》。你怕的事，我都聊。</p>
          </div>
        </section>

        {/* 5. 引文样式 */}
        <section className="mb-16">
          <h2 className="font-serif text-brand-navy text-2xl mb-6">5 · 引文（明黄高亮）</h2>
          <blockquote className="max-w-[720px] border-l-4 border-brand-yellow bg-brand-yellow/15 px-6 py-5">
            <p className="text-lg italic">
              「我每年要送走两百多个人。摸过太多冰冷的手，听过太多来不及的话。」
            </p>
            <footer className="mt-3 text-sm opacity-70 not-italic font-en">
              — 三木
            </footer>
          </blockquote>
        </section>

        {/* 6. 按钮样式 */}
        <section className="mb-16">
          <h2 className="font-serif text-brand-navy text-2xl mb-6">6 · 按钮（主 / 次）</h2>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              className="bg-brand-navy text-paper px-7 py-3 text-base hover:opacity-90 transition"
            >
              索取《身后事安心手册》
            </button>
            <button
              type="button"
              className="border-2 border-brand-navy text-brand-navy px-7 py-3 text-base hover:bg-brand-navy hover:text-paper transition"
            >
              观看最新视频
            </button>
          </div>
          <p className="mt-4 text-sm opacity-60">
            交互原则：「被察觉但不被注意」— hover 仅做透明度 / 反色微变。
          </p>
        </section>

        {/* 页脚 */}
        <footer className="border-t border-rule pt-6 text-sm opacity-60">
          视觉系统出处：PRD v0.3 第五章 · 实现：Tailwind v4 @theme · 路径：app/globals.css
        </footer>
      </div>
    </main>
  );
}
