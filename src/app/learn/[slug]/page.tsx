import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_LESSONS, getLesson } from "@/lib/learn/curriculum";
import { LessonReader } from "@/components/learn/LessonReader";

/* One static page per lesson. generateStaticParams is what lets these exist
   under `output: export` — every lesson is prerendered at build time. */
export function generateStaticParams() {
  return ALL_LESSONS.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "Lesson not found — StockSense Learn" };
  return {
    title: `${lesson.title} — StockSense Learn`,
    description: lesson.goal,
  };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  return <LessonReader lesson={lesson} />;
}
