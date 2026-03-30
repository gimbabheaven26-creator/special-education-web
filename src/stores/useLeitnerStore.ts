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
  source?: 'manual' | 'term' | 'kice-recommend';
}

export interface ReviewLog {
  cardId: string;
  grade: AnswerGrade;
  fromBox: number;
  toBox: number;
  timestamp: number;
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

/** 자가 평가 결과: 힌트 없이 맞춤 / 힌트 보고 맞춤 / 모름 */
export type AnswerGrade = 'knew' | 'hint' | 'forgot';

interface LeitnerStore {
  cards: LeitnerCard[];
  reviewLogs: ReviewLog[];
  addCard: (card: Omit<LeitnerCard, 'box' | 'lastReviewed' | 'nextReview' | 'createdAt'>) => void;
  answerCard: (cardId: string, grade: AnswerGrade) => void;
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
  getReviewLogs: (cardId?: string) => ReviewLog[];
  removeCard: (cardId: string) => void;
}

export const useLeitnerStore = create<LeitnerStore>()(
  persist(
    (set, get) => ({
      cards: [],
      reviewLogs: [],

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

      answerCard: (cardId, grade) => {
        set((state) => {
          const newLogs: ReviewLog[] = [];
          const cards = state.cards.map((card) => {
            if (card.id !== cardId) return card;

            const today = todayStr();
            let newBox: 1 | 2 | 3 | 4 | 5;

            if (grade === 'knew') {
              newBox = Math.min(card.box + 1, 5) as 1 | 2 | 3 | 4 | 5;
            } else if (grade === 'hint') {
              newBox = card.box;
            } else {
              newBox = 1;
            }

            newLogs.push({
              cardId: card.id,
              grade,
              fromBox: card.box,
              toBox: newBox,
              timestamp: Date.now(),
            });

            const intervalDays = BOX_INTERVALS[newBox];
            const nextReview = addDays(today, intervalDays);

            return {
              ...card,
              box: newBox,
              lastReviewed: today,
              nextReview,
            };
          });

          const MAX_REVIEW_LOGS = 500;
          const allLogs = [...state.reviewLogs, ...newLogs];
          const cappedLogs = allLogs.length > MAX_REVIEW_LOGS
            ? allLogs.slice(allLogs.length - MAX_REVIEW_LOGS)
            : allLogs;

          return { cards, reviewLogs: cappedLogs };
        });
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

      getReviewLogs: (cardId) => {
        const logs = get().reviewLogs;
        return cardId ? logs.filter((l) => l.cardId === cardId) : logs;
      },

      removeCard: (cardId) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== cardId),
        }));
      },
    }),
    {
      name: 'leitner-cards',
      version: 2,
      migrate: (persistedState, version) => {
        const state = persistedState as Record<string, unknown>;
        if (version < 2) {
          return { ...state, reviewLogs: [] };
        }
        return state;
      },
    }
  )
);
