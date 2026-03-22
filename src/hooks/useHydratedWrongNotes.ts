'use client';

import { useState, useEffect } from 'react';
import { getQuizzesByIds } from '@/lib/db';
import type { WrongNote } from '@/types/study';
import type { QuizQuestion } from '@/types/quiz';

export interface HydratedWrongNote extends WrongNote {
  question: QuizQuestion | null;
}

export function useHydratedWrongNotes(notes: WrongNote[]): {
  hydrated: HydratedWrongNote[];
  loading: boolean;
} {
  const [hydrated, setHydrated] = useState<HydratedWrongNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (notes.length === 0) {
      setHydrated([]);
      setLoading(false);
      return;
    }
    const ids = notes.map((n) => n.questionId);
    getQuizzesByIds(ids).then((questions) => {
      const map = new Map(questions.map((q) => [q.id, q]));
      setHydrated(notes.map((n) => ({ ...n, question: map.get(n.questionId) ?? null })));
      setLoading(false);
    });
  }, [notes]);

  return { hydrated, loading };
}
