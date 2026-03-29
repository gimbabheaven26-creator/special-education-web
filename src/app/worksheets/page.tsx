export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { FileText } from 'lucide-react';
import { getSubjects, getAllWorksheetTopics } from '@/lib/db';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata = {
  title: '워크시트 | 특수교육 공부방',
  description: '과목별 핵심 개념 확인 문제지',
};

export default async function WorksheetsPage() {
  const [subjects, topics] = await Promise.all([getSubjects(), getAllWorksheetTopics()]);

  const topicsBySubject = subjects
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      topics: topics.filter((t) => t.subject === s.slug),
    }))
    .filter((s) => s.topics.length > 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">워크시트</h1>
        <p className="text-sm text-muted-foreground mt-1">과목별 핵심 개념 확인 문제지</p>
      </div>

      {topicsBySubject.length === 0 && (
        <EmptyState
          icon="📝"
          title="워크시트가 준비 중이에요"
          description="곧 과목별 핵심 개념 확인 문제지가 추가됩니다."
          action={{ label: '문제풀기로 이동', href: '/practice', ariaLabel: '문제풀기 페이지로 이동' }}
        />
      )}

      {topicsBySubject.map(({ slug, title, topics: subjectTopics }) => (
        <section key={slug}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            {title}
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted font-normal normal-case">
              {subjectTopics.length}개 토픽
            </span>
          </h2>
          <ul className="space-y-2">
            {subjectTopics.map((topic) => (
              <li key={topic.id}>
                <Link
                  href={`/worksheets/${topic.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
                >
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground">{topic.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
