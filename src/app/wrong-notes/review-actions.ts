import type { QuizQuestion } from '@/types/quiz';
import { getConceptUrl } from '@/lib/content/concept-urls';
import { getChapterDisplayName } from '@/lib/study/display-labels';

export type WrongNoteReviewActionKind = 'concept' | 'quiz';

export interface WrongNoteReviewAction {
  kind: WrongNoteReviewActionKind;
  label: string;
  href: string;
  ariaLabel: string;
}

export function buildWrongNoteReviewActions(
  question: QuizQuestion | null | undefined,
  chapterTitle?: string,
): WrongNoteReviewAction[] {
  if (!question) return [];

  const chapterLabel = getChapterDisplayName(question.chapter, chapterTitle ? { [question.chapter]: chapterTitle } : undefined);
  const encodedChapter = encodeURIComponent(question.chapter);

  return [
    {
      kind: 'concept',
      label: `${chapterLabel} 개념 찾기`,
      href: getConceptUrl(question.subject),
      ariaLabel: `${chapterLabel} 관련 개념 학습으로 이동`,
    },
    {
      kind: 'quiz',
      label: `${chapterLabel} 다시 풀기`,
      href: `/quiz/${question.subject}?chapter=${encodedChapter}`,
      ariaLabel: `${chapterLabel} 오답 영역 다시 풀기`,
    },
  ];
}
