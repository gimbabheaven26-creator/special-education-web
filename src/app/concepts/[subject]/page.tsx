import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Tag, BookOpen, Brain } from 'lucide-react';
import { getAllSubjects, getSubjectFiles, getDbSlugForFolder } from '@/lib/content/concepts';
import { CompletionBadge } from '@/components/chapter/CompletionBadge';
import { BookmarkButton } from '@/components/chapter/BookmarkButton';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ subject: string }>;
}

export async function generateStaticParams() {
  return getAllSubjects().map((subject) => ({
    subject: subject,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { subject } = await params;
  const decoded = decodeURIComponent(subject);
  return { title: `${decoded} 개념 | 특수교육 공부방` };
}

export default async function ConceptSubjectPage({ params }: Props) {
  const { subject } = await params;
  const decodedSubject = decodeURIComponent(subject);

  const files = getSubjectFiles(decodedSubject);
  if (files.length === 0) notFound();

  // DB slug → 퀴즈 링크·타임라인용 (Supabase 미호출 — 순수 정적)
  const dbSlug = getDbSlugForFolder(decodedSubject);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link href="/concepts" className="hover:text-foreground transition-colors">
          개념학습
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{decodedSubject}</span>
      </nav>

      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
          <BookOpen className="h-3 w-3" />
          {decodedSubject}
        </span>
        <span className="text-xs text-muted-foreground">{files.length}개 파일</span>
      </div>

      {/* 퀴즈 진입점 (DB slug 매핑 존재 시) */}
      {dbSlug && (
        <div className="mb-6">
          <Link
            href={`/quiz/${dbSlug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Brain className="h-4 w-4" />
            과목 퀴즈 풀기
          </Link>
        </div>
      )}

      {/* 개념 파일 목록 — overlay link 패턴: 카드 전체 클릭 + BookmarkButton 독립 */}
      <div className="flex flex-col gap-3">
        {files.map((file, idx) => (
          <div
            key={file.slug}
            className="relative group p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/30 transition-all"
          >
            <Link
              href={`/concepts/${decodedSubject}/${file.slug}`}
              className="absolute inset-0 z-0 rounded-xl"
              aria-label={`${file.title} 개념 학습하기`}
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {file.title}
                  </p>
                  {dbSlug && <CompletionBadge subjectSlug={dbSlug} chapterSlug={file.slug} />}
                </div>
                {file.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 ml-5">
                    {file.description}
                  </p>
                )}
                {file.kiceKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 ml-5">
                    <Tag className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                    {file.kiceKeywords.slice(0, 3).map((kw) => (
                      <span
                        key={kw}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      >
                        {kw}
                      </span>
                    ))}
                    {file.kiceKeywords.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{file.kiceKeywords.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1.5 relative z-10">
                <BookmarkButton
                  path={`/concepts/${decodedSubject}/${file.slug}`}
                  title={file.title}
                  subject={decodedSubject}
                />
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
