import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Tag, BookOpen, Calendar, Brain } from 'lucide-react';
import { getAllSubjects, getSubjectFiles, getDbSlugForFolder } from '@/lib/concepts';
import { getSubjectBySlug } from '@/lib/db';
import LearningTimeline from '@/components/subjects/LearningTimeline';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  // DB subject 조회: 존재하면 LearningTimeline 렌더
  const dbSlug = getDbSlugForFolder(decodedSubject);
  const dbSubject = dbSlug ? await getSubjectBySlug(dbSlug) : null;

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

      {/* 퀴즈 진입점 (DB subject 존재 시) */}
      {dbSubject && (
        <div className="mb-6">
          <Link
            href={`/quiz/${dbSubject.slug}`}
            className={cn(buttonVariants({ variant: 'default' }), 'gap-2')}
          >
            <Brain className="h-4 w-4" />
            과목 퀴즈 풀기
          </Link>
        </div>
      )}

      {/* 학습 타임라인 (DB subject 존재 시) */}
      {dbSubject && (
        <div className="mb-8">
          <LearningTimeline
            subjectSlug={dbSubject.slug}
            chapters={dbSubject.chapters}
            conceptsFolder={decodedSubject}
          />
        </div>
      )}

      {/* 개념 파일 목록 */}
      <div className="flex flex-col gap-3">
        {files.map((file, idx) => (
          <Link
            key={file.slug}
            href={`/concepts/${encodeURIComponent(decodedSubject)}/${encodeURIComponent(file.slug)}`}
            className="group block p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/30 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {file.title}
                  </p>
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
              <div className="shrink-0 flex flex-col items-end gap-1">
                {file.lastUpdated && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {file.lastUpdated}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
