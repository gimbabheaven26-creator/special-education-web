import type { DailyQuestion } from '@/types/daily';
import { getConceptUrl } from '@/lib/content/concept-urls';
import { getChapterDisplayName, getSubjectDisplayName } from '@/lib/study/display-labels';

export interface DailyNextStep {
  readonly correct: number;
  readonly total: number;
  readonly rate: number;
  readonly primarySubjectLabel: string | null;
  readonly primaryChapterLabel: string | null;
  readonly conceptHref: string | null;
  readonly message: string;
}

export function buildDailyNextStep(
  questions: readonly DailyQuestion[],
  answers: Readonly<Record<string, 'O' | 'X'>>,
): DailyNextStep {
  const total = questions.length;
  let correct = 0;
  const wrongByChapter = new Map<string, { subject: string; chapter: string; count: number }>();

  for (const question of questions) {
    const userAnswer = answers[question.id]?.toUpperCase();
    const correctAnswer = String(question.answer).toUpperCase();
    if (userAnswer === correctAnswer) {
      correct += 1;
      continue;
    }

    const key = `${question.subject}::${question.chapter}`;
    const current = wrongByChapter.get(key) ?? {
      subject: question.subject,
      chapter: question.chapter,
      count: 0,
    };
    wrongByChapter.set(key, { ...current, count: current.count + 1 });
  }

  const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
  const [primary] = Array.from(wrongByChapter.values()).sort((a, b) => b.count - a.count);

  if (!primary) {
    return {
      correct,
      total,
      rate,
      primarySubjectLabel: null,
      primaryChapterLabel: null,
      conceptHref: null,
      message: `${correct}/${total} 정답. OX는 충분히 안정적이에요. 단답형으로 넘어가도 좋아요.`,
    };
  }

  const subjectLabel = getSubjectDisplayName(primary.subject);
  const chapterLabel = getChapterDisplayName(primary.chapter);

  return {
    correct,
    total,
    rate,
    primarySubjectLabel: subjectLabel,
    primaryChapterLabel: chapterLabel,
    conceptHref: getConceptUrl(primary.subject, primary.chapter),
    message: `${correct}/${total} 정답. ${chapterLabel}을 먼저 확인하면 다음 단계가 더 쉬워져요.`,
  };
}
