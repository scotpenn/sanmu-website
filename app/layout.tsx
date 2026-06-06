import type { Metadata } from "next";
import { Noto_Serif_SC, Noto_Sans_SC, Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-V4MB01ZJ32";

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  variable: "--font-noto-serif-sc",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sanmu.ca"),
  title: {
    default: "三木有话说 · 温哥华殡葬师陪你看清生死与人生",
    template: "%s · 三木有话说",
  },
  description:
    "16 年北美殡葬经验，1000+ 真实告别。葬礼避坑、遗嘱填坑、政府福利申请、终局思维 —— 海外华人最该看的频道。免费领取《身后事安心手册》。",
  applicationName: "三木有话说",
  authors: [{ name: "三木", url: "https://www.sanmu.ca/about" }],
  generator: "Next.js",
  keywords: [
    "三木有话说",
    "三木殡葬师",
    "温哥华殡葬师",
    "加拿大殡葬",
    "海外华人",
    "身后事",
    "遗嘱",
    "葬礼",
    "终局思维",
    "中年危机",
    "原生家庭",
  ],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://www.sanmu.ca/",
    siteName: "三木有话说",
    title: "三木有话说 · 温哥华殡葬师陪你看清生死与人生",
    description:
      "16 年北美殡葬经验，1000+ 真实告别。免费领取《身后事安心手册》。",
    images: [
      {
        url: "/portrait.jpg",
        width: 1279,
        height: 1347,
        alt: "三木 · 温哥华殡葬师",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "三木有话说 · 温哥华殡葬师陪你看清生死与人生",
    description:
      "16 年北美殡葬经验，1000+ 真实告别。免费领取《身后事安心手册》。",
    images: ["/portrait.jpg"],
  },
  // Google Search Console verification token (待 Scot 提供后补)
  // verification: { google: "xxx" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh"
      className={`${notoSerifSC.variable} ${notoSansSC.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>
      </body>
    </html>
  );
}
