import type { MissionBlock, MissionBlockType, DailyMission } from '@/types/study';
import { getKSTDate } from '@/lib/date-utils';

interface SubjectStat {
  slug: string;
  attempted: number;
  correct: number;
  totalQuestions: number;
}

/** 정답률 x 커버리지가 가장 낮은 과목 선택 */
export function pickWeakestSubject(
  stats: SubjectStat[],
  allSlugs: string[]
): string | null {
  if (allSlugs.length === 0) return null;

  const untouched = allSlugs.filter(
    (s) => !stats.find((st) => st.slug === s && st.attempted > 0)
  );
  if (untouched.length > 0) return untouched[0];

  let weakest: string | null = null;
  let lowestScore = Infinity;

  for (const stat of stats) {
    if (stat.attempted === 0) continue;
    const accuracy = stat.correct / stat.attempted;
    const coverage =
      stat.totalQuestions > 0 ? stat.attempted / stat.totalQuestions : 0;
    const score = accuracy * 0.6 + coverage * 0.4;
    if (score < lowestScore) {
      lowestScore = score;
      weakest = stat.slug;
    }
  }

  return weakest ?? allSlugs[0];
}

interface MissionParams {
  focusSubject: string | null;
  wrongNoteCount: number;
  dueFlashcardCount: number;
  todayQuizCount: number;
}

function makeBlock(
  type: MissionBlockType,
  label: string,
  description: string,
  count: number,
  minutes: number,
  href: string
): MissionBlock {
  return {
    id: type + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    type,
    label,
    description,
    count,
    estimatedMinutes: minutes,
    href,
    completed: false,
  };
}

/** 오늘의 미션 블록 2~4개 생성 */
export function generateDailyMission(params: MissionParams): DailyMission {
  const { focusSubject, wrongNoteCount, dueFlashcardCount, todayQuizCount } =
    params;
  const blocks: MissionBlock[] = [];

  if (wrongNoteCount > 0) {
    const count = Math.min(wrongNoteCount, 5);
    blocks.push(
      makeBlock('wrong-review', '오답 복습', '틀렸던 ' + count + '문제 다시 풀기', count, Math.ceil(count * 1.5), '/wrong-notes')
    );
  }

  if (dueFlashcardCount > 0) {
    const count = Math.min(dueFlashcardCount, 5);
    blocks.push(
      makeBlock('flashcard', '플래시카드', '복습 카드 ' + count + '장', count, Math.ceil(count * 0.8), '/flashcards/review')
    );
  }

  const quizCount = todayQuizCount < 5 ? 10 : 5;
  const quizSubjectParam = focusSubject ? '?subject=' + focusSubject : '';
  blocks.push(
    makeBlock(
      'quiz',
      '퀴즈 풀기',
      focusSubject ? '집중 과목 ' + quizCount + '문제' : '오늘의 퀴즈 ' + quizCount + '문제',
      quizCount,
      Math.ceil(quizCount * 1.2),
      '/quiz/ox' + quizSubjectParam
    )
  );

  if (blocks.length < 3) {
    blocks.push(
      makeBlock('term', '용어 학습', '핵심 용어 5개 확인', 5, 3, '/terms')
    );
  }

  return { date: getKSTDate(), focusSubject, blocks };
}
