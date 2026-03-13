export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSubjectBySlug } from '@/lib/db';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import LearningTimeline from '@/components/subjects/LearningTimeline';

export default async function SubjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const subject = await getSubjectBySlug(slug);

  if (!subject) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      {/* 브레드크럼 */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>홈</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/subjects" />}>과목</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{subject.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 과목 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{subject.title}</h1>
        <p className="text-lg text-muted-foreground">{subject.description}</p>
      </div>

      {/* 학습 경로 타임라인 */}
      <LearningTimeline
        subjectSlug={subject.slug}
        chapters={subject.chapters}
      />
    </div>
  );
}
