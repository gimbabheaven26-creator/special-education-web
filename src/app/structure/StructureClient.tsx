'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  GraduationCap,
  FileText,
  BookOpen,
  Home,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Subject } from '@/types/content';
import type { KiceCounts } from '@/lib/structure-utils';

interface StructureClientProps {
  subjects: Subject[];
  quizCounts: Record<string, number>;
  kiceCounts: KiceCounts;
}

export default function StructureClient({
  subjects,
  quizCounts,
  kiceCounts,
}: StructureClientProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const currentSubject = subjects.find((s) => s.slug === selectedSubject);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          구조도
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          과목 · 챕터 · 기출 · 퀴즈 연결 지도
        </p>
      </div>

      {/* 브레드크럼 */}
      <Breadcrumb
        currentSubject={currentSubject ?? null}
        onReset={() => setSelectedSubject(null)}
      />

      {/* 과목 목록 */}
      {!selectedSubject ? (
        <SubjectTable
          subjects={subjects}
          quizCounts={quizCounts}
          kiceCounts={kiceCounts}
          onSelect={setSelectedSubject}
        />
      ) : (
        <ChapterTable
          subject={currentSubject!}
          kiceCounts={kiceCounts}
        />
      )}
    </div>
  );
}

/* ─── Breadcrumb ─── */

function Breadcrumb({
  currentSubject,
  onReset,
}: {
  currentSubject: Subject | null;
  onReset: () => void;
}) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <button
        onClick={onReset}
        className={`flex items-center gap-1 hover:text-foreground transition-colors ${
          !currentSubject ? 'text-foreground font-semibold' : ''
        }`}
      >
        <Home className="h-3.5 w-3.5" />
        전체 과목
      </button>
      {currentSubject && (
        <>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold flex items-center gap-1">
            <span>{currentSubject.icon}</span>
            {currentSubject.title}
          </span>
        </>
      )}
    </nav>
  );
}

/* ─── Subject Table ─── */

function SubjectTable({
  subjects,
  quizCounts,
  kiceCounts,
  onSelect,
}: {
  subjects: Subject[];
  quizCounts: Record<string, number>;
  kiceCounts: KiceCounts;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="space-y-2">
      {subjects.map((subject) => {
        const qCount = quizCounts[subject.slug] || 0;
        const kCount = kiceCounts.bySubject[subject.slug] || 0;
        const chapterCount = subject.chapters.length;

        return (
          <button
            key={subject.slug}
            onClick={() => onSelect(subject.slug)}
            className="w-full text-left"
          >
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <span className="text-2xl flex-shrink-0">{subject.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {subject.title}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {chapterCount}개 챕터
                    </span>
                    {kCount > 0 && (
                      <span className="text-xs text-primary font-medium">
                        기출 {kCount}건
                      </span>
                    )}
                    {qCount > 0 && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        퀴즈 {qCount}건
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Chapter Table ─── */

function ChapterTable({
  subject,
  kiceCounts,
}: {
  subject: Subject;
  kiceCounts: KiceCounts;
}) {
  return (
    <div className="space-y-2">
      {subject.chapters.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          이 과목에는 아직 챕터가 없습니다.
        </div>
      ) : (
        subject.chapters.map((chapter) => {
          const kCount = kiceCounts.byChapter[chapter.slug] || 0;

          return (
            <Card key={chapter.slug}>
              <CardContent className="py-3 px-4 space-y-2">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{chapter.title}</div>
                    {chapter.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {chapter.description}
                      </p>
                    )}
                    {chapter.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {chapter.keywords.slice(0, 5).map((kw) => (
                          <span
                            key={kw}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                          >
                            {kw}
                          </span>
                        ))}
                        {chapter.keywords.length > 5 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{chapter.keywords.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 하이퍼링크 영역 */}
                <div className="flex items-center gap-3 pl-7">
                  <Link
                    href={`/subjects/${subject.slug}/${chapter.slug}`}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <FileText className="h-3 w-3" />
                    학습하기
                  </Link>
                  <Link
                    href={`/quiz?subject=${subject.slug}&chapter=${chapter.slug}`}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <GraduationCap className="h-3 w-3" />
                    퀴즈 풀기
                  </Link>
                  {kCount > 0 && (
                    <Link
                      href={`/kice?tab=by-area`}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      기출 {kCount}건
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
