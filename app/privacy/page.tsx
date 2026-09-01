import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "隐私政策",
  description:
    "sanmu.ca 网站隐私政策 · 收集什么数据 / 如何使用 / 你的权利.",
  path: "/privacy",
  locale: DEFAULT_LOCALE,
});

export default function PrivacyPage() {
  return (
    <>
      <section className="border-b border-rule">
        <Container width="card" className="py-16 md:py-20">
          <SectionTitle eyebrow="PRIVACY">隐私政策</SectionTitle>
          <p className="text-lg opacity-80 leading-relaxed">
            我们收集什么、用来做什么、你能怎么管。
          </p>
        </Container>
      </section>

      <section>
        <Container width="reading" className="py-12 md:py-16">
          <div className="space-y-8 text-base leading-[1.85]">
            <p>
              sanmu.ca（以下简称「本网站」）由 Sanmu Media Inc. 运营，致力于以最少的方式收集你最少的数据。本页告诉你具体我们收集什么、为什么、你能怎么处理。
            </p>

            <h2 className="text-2xl mt-12 mb-3">一、本网站收集的数据</h2>

            <h3 className="text-xl mt-8 mb-2">1.1 自动收集（页面访问数据）</h3>
            <p>
              你访问 sanmu.ca 任何页面时，会自动记录以下数据，用于了解哪些内容被读得多、网站性能是否健康：
            </p>

            <p className="mt-6">
              <strong>· Vercel Analytics</strong>（部署平台 Vercel 提供）—— 记录：
            </p>
            <ul className="space-y-2 list-disc pl-6">
              <li>访问的页面路径（如 /blog/xxx）</li>
              <li>来源（你是从哪个网站点过来的，比如 YouTube）</li>
              <li>所在国家（仅大致地理位置，不精确到城市）</li>
              <li>设备类型（手机 / 桌面 / 平板）和浏览器</li>
            </ul>
            <p>
              <strong className="text-brand-navy">不使用 cookie</strong>，不识别你是谁，不构建用户画像。原始数据 30 天后自动删除。
            </p>

            <p className="mt-6">
              <strong>· Vercel Speed Insights</strong> —— 记录页面加载性能（Core Web Vitals），匿名汇总。
            </p>

            <p className="mt-6">
              <strong>· Google Analytics 4 (GA4)</strong> —— 衡量 ID <code className="font-en text-sm bg-rule px-1 rounded">G-V4MB01ZJ32</code>，记录：
            </p>
            <ul className="space-y-2 list-disc pl-6">
              <li>页面浏览量、滚动深度、出站点击、视频互动等「增强型衡量」事件</li>
              <li>会话时长、用户路径、流量来源（自然搜索 / 直接访问 / YouTube 等）</li>
              <li>大致地理位置、设备 / 浏览器 / 操作系统</li>
            </ul>
            <p>
              <strong className="text-brand-navy">GA4 使用 cookie</strong>（`_ga`、`_ga_*` 等）来识别同一用户的多次访问。Google 可能将这些数据与你访问过的其他网站数据关联（如果你登录了 Google 账号），用于改进 Google 自身服务。详见{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-navy hover:opacity-80 transition-opacity"
              >
                Google 隐私政策
              </a>
              。如果你想完全屏蔽 GA4，可以装{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-navy hover:opacity-80 transition-opacity"
              >
                Google Analytics Opt-out 浏览器插件
              </a>
              。
            </p>

            <h3 className="text-xl mt-8 mb-2">1.2 你主动提交的数据</h3>
            <p>
              如果你在网站上做以下操作，会主动提供数据：
            </p>
            <ul className="space-y-2 list-disc pl-6">
              <li>
                <strong>线下活动报名</strong>：你在活动页填写的称呼、邮箱、电话、参加人数、获知渠道、留言。这些信息用于给你发确认邮件（经 Resend 发送），并存入我们的 Notion 后台。提交前你需要勾选两条同意条款，其中一条涉及现场影像采集（见下文 §1.3）
              </li>
              <li>
                <strong>来信</strong>：通过{" "}
                <a
                  href="mailto:info@sanmu.ca"
                  className="text-brand-navy hover:opacity-80 transition-opacity"
                >
                  info@sanmu.ca
                </a>
                {" "}给三木写信，邮件内容由我们的邮件服务商保存（这是邮件本身的工作机制）
              </li>
            </ul>

            <h3 className="text-xl mt-8 mb-2">1.3 线下活动现场影像</h3>
            <p>
              线下讲座现场我们会拍摄照片和视频，可能拍到参加者的影像。报名时必须勾选同意才能提交。
            </p>
            <ul className="space-y-2 list-disc pl-6">
              <li>
                <strong>用途</strong>：仅用于活动记录，以及本网站的活动回顾图文。
                <strong className="text-brand-navy">不会用于 YouTube 视频，也不会用于商业广告。</strong>
              </li>
              <li>
                <strong>存放</strong>：照片托管在 Cloudinary（见下文第四节）
              </li>
              <li>
                <strong>保留与删除</strong>：作为活动记录长期保留。你可以随时来信要求删除涉及你本人的影像，我们在 30 天内处理
              </li>
            </ul>

            <h2 className="text-2xl mt-12 mb-3">二、这些数据用来做什么</h2>
            <ul className="space-y-2 list-disc pl-6">
              <li>看哪些文章 / 视频被读得多，决定写什么类型的下一篇</li>
              <li>看从哪个 YouTube 视频来的人最多，优化引导路径</li>
              <li>看手机 / 桌面访问比例，决定移动端优化优先级</li>
              <li>给线下活动报名的人发活动通知 / 提醒</li>
              <li>回复你给三木的来信</li>
            </ul>
            <p>
              <strong className="text-brand-navy">不卖给任何人。</strong>不用于广告定向。不与第三方共享（除非法律强制要求）。
            </p>

            <h2 className="text-2xl mt-12 mb-3">三、你的权利</h2>
            <p>
              不管你在哪个国家，都有以下权利：
            </p>
            <ul className="space-y-2 list-disc pl-6">
              <li>
                <strong>知道我们存了你哪些数据</strong> —— 给{" "}
                <a
                  href="mailto:info@sanmu.ca"
                  className="text-brand-navy hover:opacity-80 transition-opacity"
                >
                  info@sanmu.ca
                </a>
                {" "}发邮件问即可
              </li>
              <li>
                <strong>要求删除你的数据</strong> —— 同上，30 天内处理
              </li>
              <li>
                <strong>退订活动通知</strong> —— 来信即可退订。报名信息存在我们的 Notion 后台，活动结束半年后清理
              </li>
              <li>
                <strong>反对处理</strong> —— 同样邮件即可
              </li>
            </ul>

            <h2 className="text-2xl mt-12 mb-3">四、第三方服务清单</h2>
            <p>本网站使用以下第三方服务：</p>
            <ul className="space-y-2 list-disc pl-6">
              <li><strong>Vercel</strong>（美国）—— 网站部署 / 流量分析 / 性能监控</li>
              <li><strong>Google Analytics 4</strong>（美国）—— 详细流量分析（使用 cookie，见上文 §1.1）</li>
              <li><strong>Resend</strong>（美国）—— 发送活动确认邮件、手册邮件</li>
              <li><strong>YouTube</strong>（Google 美国）—— 视频嵌入</li>
              <li><strong>Cloudinary</strong>（以色列）—— 活动照片托管</li>
              <li><strong>Notion</strong>（美国）—— 内容管理后台（你看到的网站内容来源），同时存放活动报名记录</li>
            </ul>

            <h2 className="text-2xl mt-12 mb-3">五、未成年人</h2>
            <p>
              本网站内容面向成年人，特别是 35 岁以上的海外华人。我们不主动收集未成年人数据。如果你是未成年人的监护人，发现孩子在我们这里留了数据，请来信我会立刻删除。
            </p>

            <h2 className="text-2xl mt-12 mb-3">六、政策更新</h2>
            <p>
              本政策可能在以下情况更新：增加新的第三方服务、变更数据保留期、应法律要求。更新时本页底部「最后更新」日期会变。重大变更会在网站显眼位置提醒，并通过邮件通知已经报名活动的用户。
            </p>

            <h2 className="text-2xl mt-12 mb-3">七、联系方式</h2>
            <p>
              任何关于本政策的问题、数据请求、投诉，请来信：{" "}
              <a
                href="mailto:info@sanmu.ca"
                className="text-brand-navy font-medium hover:opacity-80 transition-opacity"
              >
                info@sanmu.ca
              </a>
              。我会亲自处理，48 小时内回复。
            </p>

            <div className="border-t border-rule pt-6 mt-12 text-sm opacity-60">
              最后更新: 2026-08-26 · 适用范围: sanmu.ca 全部子域名
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
