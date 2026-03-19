import { supabase } from '@/lib/supabase';
import { HomeQuizSectionClient } from './HomeQuizSectionClient';

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

/** LCG 기반 시드 랜덤 (0~1) */
function seededRandom(seed: number, index: number): number {
  const s = (seed * 1664525 + 1013904223 + index * 22695477) & 0x7fffffff;
  return s / 0x7fffffff;
}

function seededSample<T>(arr: T[], n: number, seed: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed, i) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function getKSTDate(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
}

export async function HomeQuizSection() {
  const today = getKSTDate();
  const seed = dateSeed(today);

  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id, type, question, answer, chapter')
    .in('type', ['ox', 'fill_in', 'descriptive']);

  if (error || !data) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">오늘의 문제를 불러오지 못했습니다.</p>
      </div>
    );
  }

  const rows = data as { id: string; type: string; question: string; answer: string; chapter: string }[];

  const oxPool = rows.filter((r) => r.type === 'ox');
  const fillInPool = rows.filter((r) => r.type === 'fill_in');
  const descriptivePool = rows.filter((r) => r.type === 'descriptive');

  const oxSelected = seededSample(oxPool, 10, seed);
  const fillInSelected = seededSample(fillInPool, 5, seed + 1);
  const descriptiveSelected = seededSample(descriptivePool, 3, seed + 2);

  const questions: DailyQuestion[] = [
    ...oxSelected.map((q, i) => ({ ...q, type: 'ox' as const, number: i + 1 })),
    ...fillInSelected.map((q, i) => ({ ...q, type: 'fill_in' as const, number: oxSelected.length + i + 1 })),
    ...descriptiveSelected.map((q, i) => ({
      ...q,
      type: 'descriptive' as const,
      number: oxSelected.length + fillInSelected.length + i + 1,
    })),
  ];

  const dateLabel = new Date(today + 'T00:00:00+09:00').toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return <HomeQuizSectionClient questions={questions} date={dateLabel} />;
}
