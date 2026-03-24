import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getKSTDate } from '@/lib/date-utils';

export interface LeitnerCard {
  id: string;
  subjectSlug: string;
  question: string;
  answer: string;
  box: 1 | 2 | 3 | 4 | 5;
  lastReviewed: string;
  nextReview: string;
  createdAt: string;
}

const BOX_INTERVALS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16,
};

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00+09:00');
  const result = new Date(date.getTime() + days * 86400000);
  return getKSTDate(result);
}

function todayStr(): string {
  return getKSTDate();
}

interface LeitnerStore {
  cards: LeitnerCard[];
  addCard: (card: Omit<LeitnerCard, 'box' | 'lastReviewed' | 'nextReview' | 'createdAt'>) => void;
  answerCard: (cardId: string, correct: boolean, confidence?: 'sure' | 'unsure') => void;
  getDueCards: (subjectSlug?: string) => LeitnerCard[];
  getCardsByBox: (box: number) => LeitnerCard[];
  getStats: () => {
    box1: number;
    box2: number;
    box3: number;
    box4: number;
    box5: number;
    total: number;
    dueToday: number;
  };
  removeCard: (cardId: string) => void;
}

export const useLeitnerStore = create<LeitnerStore>()(
  persist(
    (set, get) => ({
      cards: [],

      addCard: (cardData) => {
        const today = todayStr();
        const newCard: LeitnerCard = {
          ...cardData,
          box: 1,
          lastReviewed: today,
          nextReview: today,
          createdAt: today,
        };
        set((state) => ({ cards: [...state.cards, newCard] }));
      },

      answerCard: (cardId, correct, confidence) => {
        set((state) => ({
          cards: state.cards.map((card) => {
            if (card.id !== cardId) return card;

            const today = todayStr();
            let newBox: 1 | 2 | 3 | 4 | 5;

            if (correct) {
              // unsure + correct → stay in current box (no promotion)
              newBox = confidence === 'unsure'
                ? card.box
                : (Math.min(card.box + 1, 5) as 1 | 2 | 3 | 4 | 5);
            } else {
              newBox = 1;
            }

            const intervalDays = BOX_INTERVALS[newBox];
            const nextReview = addDays(today, intervalDays);

            return {
              ...card,
              box: newBox,
              lastReviewed: today,
              nextReview,
            };
          }),
        }));
      },

      getDueCards: (subjectSlug) => {
        const today = todayStr();
        return get().cards.filter((card) => {
          const isDue = card.nextReview <= today;
          const matchesSubject = subjectSlug ? card.subjectSlug === subjectSlug : true;
          return isDue && matchesSubject;
        });
      },

      getCardsByBox: (box) => {
        return get().cards.filter((card) => card.box === box);
      },

      getStats: () => {
        const cards = get().cards;
        const today = todayStr();
        return {
          box1: cards.filter((c) => c.box === 1).length,
          box2: cards.filter((c) => c.box === 2).length,
          box3: cards.filter((c) => c.box === 3).length,
          box4: cards.filter((c) => c.box === 4).length,
          box5: cards.filter((c) => c.box === 5).length,
          total: cards.length,
          dueToday: cards.filter((c) => c.nextReview <= today).length,
        };
      },

      removeCard: (cardId) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== cardId),
        }));
      },
    }),
    {
      name: 'leitner-cards',
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0 || version === undefined) {
          // v0→v1: 기존 데이터 구조 그대로 보존, 버전 트래킹 시작
          return persistedState as Record<string, unknown>;
        }
        return persistedState as Record<string, unknown>;
      },
    }
  )
);
