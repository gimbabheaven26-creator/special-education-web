export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { BookOpen, ChevronRight, FileText } from 'lucide-react';
import { getAllSubjects, getSubjectFiles, getDbSlugForFolder } from '@/lib/content/concepts';
import { SubjectProgress } from '@/components/chapter/SubjectProgress';

export const metadata = {
  title: '개념학습 | 특수교육 공부방',
  description: '과목별 핵심 개념을 체계적으로 학습하세요.',
};

export default function ConceptsPage() {
  const subjects = getAllSubjects();

  const subjectData = subjects.map((subject) => {
    const files = getSubjectFiles(subject);
    const totalKeywords = files.reduce((sum, f) => sum + f.kiceKeywords.length, 0);
    const dbSlug = getDbSlugForFolder(subject);
    return { subject, fileCount: files.length, totalKeywords, dbSlug };
  });

  const totalFiles = subjectData.reduce((sum, s) => sum + s.fileCount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">개념학습</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {subjects.length}개 과목 · {totalFiles}개 개념 파일 · 기출 키워드 수록
        </p>
      </div>

      {/* 과목 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subjectData.map(({ subject, fileCount, totalKeywords, dbSlug }) => (
          <Link
            key={subject}
            href={`/concepts/${subject}`}
            className="group flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/40 transition-all"
          >
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                {subject}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {fileCount}개 파일
                </span>
                {totalKeywords > 0 && (
                  <span className="text-amber-600 dark:text-amber-400">기출 {totalKeywords}건</span>
                )}
                {dbSlug && <SubjectProgress subjectSlug={dbSlug} totalFiles={fileCount} />}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
