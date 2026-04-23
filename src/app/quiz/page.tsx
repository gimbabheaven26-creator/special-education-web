export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getSubjects } from '@/lib/db';
import QuizSubjectGrid from './QuizSubjectGrid';

export const metadata: Metadata = {
  title: '과목별 퀴즈',
  description: '11개 과목별 퀴즈로 특수교육학 핵심 개념을 점검하세요.',
};

export default async function QuizPage() {
  const subjects = await getSubjects();

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">퀴즈</h1>
      <p className="text-muted-foreground mb-8">학습할 과목을 선택하세요</p>
      <QuizSubjectGrid subjects={subjects} />
    </div>
  );
}
