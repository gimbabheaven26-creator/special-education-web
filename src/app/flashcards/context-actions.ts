import type { LeitnerCard } from '@/stores/useLeitnerStore';
import { getConceptUrl } from '@/lib/content/concept-urls';
import { getChapterDisplayName } from '@/lib/study/display-labels';

export type FlashcardContextActionKind = 'concept' | 'quiz' | 'wrong-note' | 'term';

export interface FlashcardContextAction {
  kind: FlashcardContextActionKind;
  label: string;
  href: string;
}

export function buildFlashcardContextActions(card: LeitnerCard): FlashcardContextAction[] {
  const actions: FlashcardContextAction[] = [];

  if (card.source === 'term') {
    const termQuery = card.id.startsWith('term-')
      ? card.id.slice('term-'.length)
      : card.question.replace(/\s+\(.+\)$/, '');

    actions.push({
      kind: 'term',
      label: '용어사전에서 다시 보기',
      href: `/terms?q=${encodeURIComponent(termQuery)}`,
    });
  }

  if (card.chapterSlug) {
    const chapterLabel = getChapterDisplayName(card.chapterSlug);
    actions.push({
      kind: 'concept',
      label: `${chapterLabel} 개념 보기`,
      href: getConceptUrl(card.subjectSlug),
    });
    actions.push({
      kind: 'quiz',
      label: '같은 영역 다시 풀기',
      href: `/quiz/${card.subjectSlug}?chapter=${encodeURIComponent(card.chapterSlug)}`,
    });
  }

  if (card.quizId || card.id.startsWith('wrong-')) {
    actions.push({
      kind: 'wrong-note',
      label: '오답노트 보기',
      href: '/wrong-notes',
    });
  }

  return actions;
}
