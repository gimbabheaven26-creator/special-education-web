import { createClient } from '@/lib/supabase/server';
import { HomeQuizSectionClient } from './HomeQuizSectionClient';
import { getKSTDate } from '@/lib/date-utils';

type DailyQuestion = {
  id: string;
  number: number;
  type: 'ox' | 'fill_in' | 'descriptive';
  question: string;
  answer: string;
  chapter: string;
};

/** 날짜 문자열을 숫자 seed로 변환 */
function dateSeed(dateStr: string): number {
  return dateStr.split('-').reduce((acc, part) => acc * 100 + Number(part), 0);
}

/** seed 기반 offset 계산 — 타입별 bucket size 내에서 순환 */
function seededOffset(seed: number, multiplier: number, addend: number, bucketSize: number): number {
  return (seed * multiplier + addend) % bucketSize;
}

export async function HomeQuizSection() {
  const today = getKSTDate();
  const seed = dateSeed(today);
  const supabase = await createClient();

  // 날짜 seed 기반 offset으로 타입별 10행 이내 fetch (전체 행 scan 없음)
  const oxFrom = seededOffset(seed, 1, 0, 200);
  const fillInFrom = seededOffset(seed, 7, 31, 100);
  const descFrom = seededOffset(seed, 13, 17, 50);

  const [oxResult, fillInResult, descResult] = await Promise.all([
    supabase
      .from('quiz_questions')
      .select('id, type, question, answer, chapter')
      .eq('type', 'ox')
      .order('id')
      .range(oxFrom, oxFrom + 9),
    supabase
      .from('quiz_questions')
      .select('id, type, question, answer, chapter')
      .eq('type', 'fill_in')
      .order('id')
      .range(fillInFrom, fillInFrom + 4),
    supabase
      .from('quiz_questions')
      .select('id, type, question, answer, chapter')
      .eq('type', 'descriptive')
      .order('id')
      .range(descFrom, descFrom + 2),
  ]);

  if (oxResult.error || fillInResult.error || descResult.error) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">오늘의 문제를 불러오지 못했습니다.</p>
      </div>
    );
  }

  const oxRows = oxResult.data ?? [];
  const fillInRows = fillInResult.data ?? [];
  const descRows = descResult.data ?? [];

  const questions: DailyQuestion[] = [
    ...oxRows.map((q, i) => ({ ...q, type: 'ox' as const, number: i + 1 })),
    ...fillInRows.map((q, i) => ({ ...q, type: 'fill_in' as const, number: oxRows.length + i + 1 })),
    ...descRows.map((q, i) => ({
      ...q,
      type: 'descriptive' as const,
      number: oxRows.length + fillInRows.length + i + 1,
    })),
  ];

  const dateLabel = new Date(today + 'T00:00:00+09:00').toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return <HomeQuizSectionClient questions={questions} date={dateLabel} dateRaw={today} />;
}
