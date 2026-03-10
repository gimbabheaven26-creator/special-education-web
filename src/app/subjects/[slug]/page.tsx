import Link from 'next/link';
import { notFound } from 'next/navigation';
import { subjects } from '@/data/subjects';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function generateStaticParams() {
  return subjects.map((subject) => ({
    slug: subject.slug,
  }));
}

export default function SubjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const subject = subjects.find((s) => s.slug === slug);

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

      {/* 챕터 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subject.chapters.map((chapter) => (
          <Link
            key={chapter.slug}
            href={`/subjects/${subject.slug}/${chapter.slug}`}
            className="block"
          >
            <Card className="h-full transition-shadow duration-200 hover:shadow-md cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">{chapter.title}</CardTitle>
                <CardDescription>{chapter.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {chapter.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
