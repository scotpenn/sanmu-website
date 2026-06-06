import {
  BlogPostPage,
  generatePostMetadata,
} from "@/app/blog/[slug]/page";
import { getAllSlugs } from "@/lib/notion";
import { TRADITIONAL_LOCALE } from "@/lib/i18n";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllSlugs(TRADITIONAL_LOCALE);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return generatePostMetadata(slug, TRADITIONAL_LOCALE);
}

export default async function TraditionalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostPage slug={slug} locale={TRADITIONAL_LOCALE} />;
}
