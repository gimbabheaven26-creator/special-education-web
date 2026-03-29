import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';

// getKSTDate를 mock하여 "오늘"을 고정하되, Date 인자가 있으면 실제 변환을 수행한다.
// 스토어 내부의 addDays가 getKSTDate(result)를 호출하므로 이 구분이 필수적이다.
let fakeToday = '2026-03-29';

vi.mock('@/lib/date-utils', () => ({
  getKSTDate: vi.fn((date?: Date) => {
    if (date === undefined) return fakeToday;
    // Date 인자가 있으면 실제 KST 변환 수행
    return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
  }),
}));

import { useLeitnerStore } from '../useLeitnerStore';

// 테스트용 카드 팩토리
function makeCardInput(overrides: Partial<{ id: string; subjectSlug: string; question: string; answer: string }> = {}) {
  return {
    id: overrides.id ?? 'card-1',
    subjectSlug: overrides.subjectSlug ?? 'diagnosis',
    question: overrides.question ?? '지능검사의 종류는?',
    answer: overrides.answer ?? 'K-WISC, K-ABC',
  };
}

describe('useLeitnerStore', () => {
  beforeEach(() => {
    // 매 테스트마다 스토어 초기화
    act(() => {
      useLeitnerStore.setState({ cards: [] });
    });
    fakeToday = '2026-03-29';
  });

  // ─── 초기 상태 ───────────────────────────────────────
  describe('초기 상태', () => {
    it('cards 배열이 비어있다', () => {
      const { cards } = useLeitnerStore.getState();
      expect(cards).toEqual([]);
    });

    it('getStats()가 모두 0을 반환한다', () => {
      const stats = useLeitnerStore.getState().getStats();
      expect(stats).toEqual({
        box1: 0, box2: 0, box3: 0, box4: 0, box5: 0,
        total: 0, dueToday: 0,
      });
    });
  });

  // ─── addCard ──────────────────────────────────────────
  describe('addCard', () => {
    it('카드를 추가하면 box=1, 오늘 날짜로 초기화된다', () => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput());
      });

      const cards = useLeitnerStore.getState().cards;
      expect(cards).toHaveLength(1);
      expect(cards[0]).toMatchObject({
        id: 'card-1',
        subjectSlug: 'diagnosis',
        box: 1,
        lastReviewed: '2026-03-29',
        nextReview: '2026-03-29',
        createdAt: '2026-03-29',
      });
    });

    it('여러 카드를 추가해도 기존 카드가 유지된다 (불변성)', () => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'card-1' }));
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'card-2' }));
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'card-3' }));
      });

      expect(useLeitnerStore.getState().cards).toHaveLength(3);
      expect(useLeitnerStore.getState().cards.map(c => c.id)).toEqual(['card-1', 'card-2', 'card-3']);
    });
  });

  // ─── answerCard ───────────────────────────────────────
  describe('answerCard', () => {
    beforeEach(() => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'test-card' }));
      });
    });

    it('정답이면 box가 1 올라간다 (1 -> 2)', () => {
      act(() => {
        useLeitnerStore.getState().answerCard('test-card', true);
      });

      const card = useLeitnerStore.getState().cards[0];
      expect(card.box).toBe(2);
      expect(card.lastReviewed).toBe('2026-03-29');
    });

    it('오답이면 box=1로 돌아간다', () => {
      // 먼저 box 3까지 올린다
      act(() => {
        useLeitnerStore.getState().answerCard('test-card', true); // 1->2
        useLeitnerStore.getState().answerCard('test-card', true); // 2->3
      });
      expect(useLeitnerStore.getState().cards[0].box).toBe(3);

      act(() => {
        useLeitnerStore.getState().answerCard('test-card', false); // 3->1
      });
      expect(useLeitnerStore.getState().cards[0].box).toBe(1);
    });

    it('box 5에서 정답이면 5를 유지한다 (상한)', () => {
      // box 1->2->3->4->5
      act(() => {
        useLeitnerStore.getState().answerCard('test-card', true);
        useLeitnerStore.getState().answerCard('test-card', true);
        useLeitnerStore.getState().answerCard('test-card', true);
        useLeitnerStore.getState().answerCard('test-card', true);
      });
      expect(useLeitnerStore.getState().cards[0].box).toBe(5);

      act(() => {
        useLeitnerStore.getState().answerCard('test-card', true); // 5->5
      });
      expect(useLeitnerStore.getState().cards[0].box).toBe(5);
    });

    it('오답이면 box=1로 떨어진다', () => {
      act(() => {
        useLeitnerStore.getState().answerCard('test-card', true); // 1->2
      });
      act(() => {
        useLeitnerStore.getState().answerCard('test-card', false); // 2->1
      });
      expect(useLeitnerStore.getState().cards[0].box).toBe(1);
    });

    it('nextReview가 BOX_INTERVALS에 맞게 설정된다', () => {
      // box 1->2: interval=2일
      act(() => {
        useLeitnerStore.getState().answerCard('test-card', true);
      });
      const card = useLeitnerStore.getState().cards[0];
      expect(card.box).toBe(2);
      // nextReview = today + BOX_INTERVALS[2] = 2026-03-29 + 2 = 2026-03-31
      expect(card.nextReview).toBe('2026-03-31');
    });

    it('box 3 정답 -> box 4: nextReview = today + 8일', () => {
      act(() => {
        useLeitnerStore.getState().answerCard('test-card', true); // 1->2
        useLeitnerStore.getState().answerCard('test-card', true); // 2->3
        useLeitnerStore.getState().answerCard('test-card', true); // 3->4
      });
      const card = useLeitnerStore.getState().cards[0];
      expect(card.box).toBe(4);
      // nextReview = 2026-03-29 + 8 = 2026-04-06
      expect(card.nextReview).toBe('2026-04-06');
    });

    it('오답 후 box=1: nextReview = today + 1일', () => {
      act(() => {
        useLeitnerStore.getState().answerCard('test-card', true); // 1->2
        useLeitnerStore.getState().answerCard('test-card', false); // 2->1
      });
      const card = useLeitnerStore.getState().cards[0];
      expect(card.box).toBe(1);
      // nextReview = 2026-03-29 + 1 = 2026-03-30
      expect(card.nextReview).toBe('2026-03-30');
    });

    it('존재하지 않는 cardId에 대해서는 아무 변경 없다', () => {
      const before = useLeitnerStore.getState().cards[0];
      act(() => {
        useLeitnerStore.getState().answerCard('non-existent', true);
      });
      const after = useLeitnerStore.getState().cards[0];
      expect(after).toEqual(before);
    });
  });

  // ─── getDueCards ──────────────────────────────────────
  describe('getDueCards', () => {
    it('nextReview <= 오늘인 카드만 반환한다', () => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'due-card' }));
        // due-card: nextReview = 2026-03-29 (오늘) -> due
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'future-card' }));
        // future-card를 정답 처리하여 nextReview를 미래로 보낸다
        useLeitnerStore.getState().answerCard('future-card', true);
        // future-card: box=2, nextReview = 2026-03-31
      });

      const dueCards = useLeitnerStore.getState().getDueCards();
      expect(dueCards).toHaveLength(1);
      expect(dueCards[0].id).toBe('due-card');
    });

    it('subjectSlug 필터가 동작한다', () => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c1', subjectSlug: 'diagnosis' }));
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c2', subjectSlug: 'behavior' }));
      });

      const diagCards = useLeitnerStore.getState().getDueCards('diagnosis');
      expect(diagCards).toHaveLength(1);
      expect(diagCards[0].id).toBe('c1');

      const behaviorCards = useLeitnerStore.getState().getDueCards('behavior');
      expect(behaviorCards).toHaveLength(1);
      expect(behaviorCards[0].id).toBe('c2');
    });

    it('subjectSlug 미지정이면 전체 반환한다', () => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c1', subjectSlug: 'diagnosis' }));
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c2', subjectSlug: 'behavior' }));
      });

      const all = useLeitnerStore.getState().getDueCards();
      expect(all).toHaveLength(2);
    });

    it('과거 날짜의 카드도 due로 반환한다', () => {
      // 어제 날짜로 카드를 만든다
      fakeToday = '2026-03-28';
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'old-card' }));
      });

      // 오늘로 시간 복원
      fakeToday = '2026-03-29';
      const dueCards = useLeitnerStore.getState().getDueCards();
      expect(dueCards).toHaveLength(1);
      expect(dueCards[0].id).toBe('old-card');
    });

    it('카드가 없으면 빈 배열을 반환한다', () => {
      expect(useLeitnerStore.getState().getDueCards()).toEqual([]);
    });
  });

  // ─── getCardsByBox ────────────────────────────────────
  describe('getCardsByBox', () => {
    it('해당 box의 카드만 필터링한다', () => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c1' }));
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c2' }));
        useLeitnerStore.getState().answerCard('c2', true); // c2 -> box 2
      });

      expect(useLeitnerStore.getState().getCardsByBox(1)).toHaveLength(1);
      expect(useLeitnerStore.getState().getCardsByBox(1)[0].id).toBe('c1');
      expect(useLeitnerStore.getState().getCardsByBox(2)).toHaveLength(1);
      expect(useLeitnerStore.getState().getCardsByBox(2)[0].id).toBe('c2');
    });

    it('해당 box에 카드가 없으면 빈 배열을 반환한다', () => {
      expect(useLeitnerStore.getState().getCardsByBox(3)).toEqual([]);
    });
  });

  // ─── getStats ─────────────────────────────────────────
  describe('getStats', () => {
    it('box별 카드 수와 total, dueToday를 정확히 반환한다', () => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c1' })); // box 1
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c2' })); // box 1
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c3' })); // box 1
        useLeitnerStore.getState().answerCard('c2', true); // c2 -> box 2
        useLeitnerStore.getState().answerCard('c3', true); // c3 -> box 2
        useLeitnerStore.getState().answerCard('c3', true); // c3 -> box 3
      });

      const stats = useLeitnerStore.getState().getStats();
      expect(stats.box1).toBe(1);  // c1
      expect(stats.box2).toBe(1);  // c2
      expect(stats.box3).toBe(1);  // c3
      expect(stats.box4).toBe(0);
      expect(stats.box5).toBe(0);
      expect(stats.total).toBe(3);
    });

    it('dueToday는 nextReview <= 오늘인 카드 수다', () => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c1' })); // due today
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c2' })); // due today
        useLeitnerStore.getState().answerCard('c2', true); // c2 nextReview = 2026-03-31 (미래)
      });

      const stats = useLeitnerStore.getState().getStats();
      expect(stats.dueToday).toBe(1); // c1만 due
    });
  });

  // ─── removeCard ───────────────────────────────────────
  describe('removeCard', () => {
    it('지정한 카드를 삭제한다', () => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c1' }));
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c2' }));
      });
      expect(useLeitnerStore.getState().cards).toHaveLength(2);

      act(() => {
        useLeitnerStore.getState().removeCard('c1');
      });

      const cards = useLeitnerStore.getState().cards;
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('c2');
    });

    it('존재하지 않는 cardId 삭제 시 변경 없다', () => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c1' }));
      });

      act(() => {
        useLeitnerStore.getState().removeCard('non-existent');
      });

      expect(useLeitnerStore.getState().cards).toHaveLength(1);
    });

    it('모든 카드를 삭제하면 빈 배열이 된다', () => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c1' }));
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c2' }));
      });

      act(() => {
        useLeitnerStore.getState().removeCard('c1');
        useLeitnerStore.getState().removeCard('c2');
      });

      expect(useLeitnerStore.getState().cards).toEqual([]);
    });
  });

  // ─── 엣지 케이스 ─────────────────────────────────────
  describe('엣지 케이스', () => {
    it('box 5에서 오답 -> box 1, nextReview = today + 1', () => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c1' }));
        // 1->2->3->4->5
        useLeitnerStore.getState().answerCard('c1', true);
        useLeitnerStore.getState().answerCard('c1', true);
        useLeitnerStore.getState().answerCard('c1', true);
        useLeitnerStore.getState().answerCard('c1', true);
      });
      expect(useLeitnerStore.getState().cards[0].box).toBe(5);

      act(() => {
        useLeitnerStore.getState().answerCard('c1', false); // 5->1
      });

      const card = useLeitnerStore.getState().cards[0];
      expect(card.box).toBe(1);
      expect(card.nextReview).toBe('2026-03-30'); // today + 1
    });

    it('날짜가 바뀌면 dueToday가 갱신된다', () => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c1' }));
        useLeitnerStore.getState().answerCard('c1', true); // box 2, nextReview = 03-31
      });

      // 오늘은 3/29 -> c1은 due 아님 (nextReview = 3/31)
      expect(useLeitnerStore.getState().getStats().dueToday).toBe(0);

      // 시간이 흘러 3/31이 됨
      fakeToday = '2026-03-31';
      expect(useLeitnerStore.getState().getStats().dueToday).toBe(1);
    });

    it('같은 ID의 카드를 중복 추가해도 두 개 다 존재한다 (store가 중복 방지 안 함)', () => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'dup' }));
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'dup' }));
      });

      expect(useLeitnerStore.getState().cards).toHaveLength(2);
      // answerCard는 둘 다 영향받는다 (map으로 전체 순회)
      act(() => {
        useLeitnerStore.getState().answerCard('dup', true);
      });
      const cards = useLeitnerStore.getState().cards;
      expect(cards.every(c => c.box === 2)).toBe(true);
    });

    it('addCard 후 즉시 getDueCards에 포함된다 (nextReview = today)', () => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'new' }));
      });

      const due = useLeitnerStore.getState().getDueCards();
      expect(due).toHaveLength(1);
      expect(due[0].id).toBe('new');
    });

    it('정답 반복으로 box가 정상 승급한다', () => {
      act(() => {
        useLeitnerStore.getState().addCard(makeCardInput({ id: 'c1' }));
        useLeitnerStore.getState().answerCard('c1', true);
        useLeitnerStore.getState().answerCard('c1', true);
        useLeitnerStore.getState().answerCard('c1', true);
      });

      expect(useLeitnerStore.getState().cards[0].box).toBe(4);
    });
  });
});
