export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { getSubjectBySlug } from '@/lib/db';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ChapterTracker } from '@/components/chapter/ChapterTracker';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';

function getMdxSource(slug: string, chapterSlug: string): string | null {
  const mdxPath = path.join(process.cwd(), 'content', slug, `${chapterSlug}.mdx`);
  if (!fs.existsSync(mdxPath)) return null;
  return fs.readFileSync(mdxPath, 'utf-8');
}

export default async function ChapterPage({
  params,
}: {
  params: { slug: string; chapter: string };
}) {
  const { slug, chapter: chapterSlug } = params;
  const subject = await getSubjectBySlug(slug);

  if (!subject) {
    notFound();
  }

  const chapterIndex = subject.chapters.findIndex((c) => c.slug === chapterSlug);

  if (chapterIndex === -1) {
    notFound();
  }

  const chapter = subject.chapters[chapterIndex];
  const prevChapter = chapterIndex > 0 ? subject.chapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < subject.chapters.length - 1 ? subject.chapters[chapterIndex + 1] : null;
  const mdxSource = getMdxSource(slug, chapterSlug);

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
            <BreadcrumbLink render={<Link href={`/subjects/${subject.slug}`} />}>
              {subject.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{chapter.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 챕터 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{chapter.title}</h1>
        <p className="text-lg text-muted-foreground">{chapter.description}</p>
      </div>

      {/* 본문 영역 */}
      {mdxSource ? (
        <article className="prose prose-neutral dark:prose-invert max-w-none mb-8">
          <MDXRemote
            source={mdxSource}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm, remarkFrontmatter],
              },
            }}
          />
        </article>
      ) : (
        <div className="min-h-64 flex items-center justify-center border border-dashed border-border rounded-xl bg-muted/30 mb-8">
          <p className="text-muted-foreground text-lg">콘텐츠 준비 중입니다.</p>
        </div>
      )}

      {/* 학습 완료 트래커 */}
      <ChapterTracker
        subjectSlug={slug}
        subjectTitle={subject.title}
        chapterSlug={chapterSlug}
        chapterTitle={chapter.title}
      />

      {/* 이전/다음 챕터 이동 */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1">
          {prevChapter && (
            <Link href={`/subjects/${subject.slug}/${prevChapter.slug}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                <span className="text-left">
                  <span className="block text-xs text-muted-foreground">이전 챕터</span>
                  <span className="block text-sm font-medium">{prevChapter.title}</span>
                </span>
              </Button>
            </Link>
          )}
        </div>
        <div className="flex-1 flex justify-end">
          {nextChapter && (
            <Link href={`/subjects/${subject.slug}/${nextChapter.slug}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <span className="text-right">
                  <span className="block text-xs text-muted-foreground">다음 챕터</span>
                  <span className="block text-sm font-medium">{nextChapter.title}</span>
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
