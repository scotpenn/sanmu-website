import { BlogIndexPage, generateBlogIndexMetadata } from "@/app/blog/page";
import { TRADITIONAL_LOCALE } from "@/lib/i18n";

export const revalidate = 3600;

export const metadata = generateBlogIndexMetadata(TRADITIONAL_LOCALE);

export default function TraditionalBlogPage() {
  return <BlogIndexPage locale={TRADITIONAL_LOCALE} />;
}
