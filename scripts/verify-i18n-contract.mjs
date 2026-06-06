import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const checks = [
  {
    name: "locale helper exists",
    file: "lib/i18n.ts",
    includes: ["zh-Hans", "zh-Hant", "withLocalePrefix"],
  },
  {
    name: "seo helper exists",
    file: "lib/seo.ts",
    includes: ["alternates", "canonical", "languages"],
  },
  {
    name: "traditional home route exists",
    file: "app/zh-Hant/page.tsx",
    includes: ["TRADITIONAL_LOCALE"],
  },
  {
    name: "traditional blog route exists",
    file: "app/zh-Hant/blog/page.tsx",
    includes: ["TRADITIONAL_LOCALE"],
  },
  {
    name: "traditional blog detail route exists",
    file: "app/zh-Hant/blog/[slug]/page.tsx",
    includes: ["TRADITIONAL_LOCALE"],
  },
  {
    name: "traditional events route exists",
    file: "app/zh-Hant/events/page.tsx",
    includes: ["TRADITIONAL_LOCALE"],
  },
  {
    name: "notion queries filter locale",
    file: "lib/notion.ts",
    includes: ['property: "语言版本"', 'select: { equals: locale }'],
  },
  {
    name: "sitemap emits alternates",
    file: "app/sitemap.ts",
    includes: ["alternates", "zh-Hans", "zh-Hant", "x-default"],
  },
  {
    name: "root canonical no longer forces homepage",
    file: "app/layout.tsx",
    excludes: ['canonical: "/"'],
  },
];

let failed = 0;

for (const check of checks) {
  const path = join(root, check.file);
  if (!existsSync(path)) {
    console.error(`FAIL ${check.name}: missing ${check.file}`);
    failed++;
    continue;
  }
  const content = readFileSync(path, "utf8");
  for (const needle of check.includes ?? []) {
    if (!content.includes(needle)) {
      console.error(`FAIL ${check.name}: ${check.file} lacks ${needle}`);
      failed++;
    }
  }
  for (const needle of check.excludes ?? []) {
    if (content.includes(needle)) {
      console.error(`FAIL ${check.name}: ${check.file} still contains ${needle}`);
      failed++;
    }
  }
}

if (failed > 0) {
  process.exit(1);
}

console.log("i18n contract checks passed");
