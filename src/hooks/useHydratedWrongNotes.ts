'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/browser';
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
    const supabase = createClient();
    supabase
      .from('quiz_questions')
      .select('*')
      .in('id', ids)
      .limit(500)
      .then(({ data }) => {
        const map = new Map((data ?? []).map((row) => [
          row.id as string,
          {
            id: row.id as string,
            subject: row.subject as string,
            chapter: row.chapter as string,
            type: row.type as QuizQuestion['type'],
            question: row.question as string,
            caseContext: (row.case_context as string) || undefined,
            options: (row.options as string[]) || undefined,
            answer: row.answer as string,
            explanation: row.explanation as string,
            wrongExplanations: (row.wrong_explanations as Record<string, string>) || undefined,
            difficulty: row.difficulty as 1 | 2 | 3,
            source: (row.source as string) || undefined,
            tags: (row.tags as QuizQuestion['tags']) || undefined,
            subQuestions: (row.sub_questions as QuizQuestion['subQuestions']) || undefined,
            imageUrl: (row.image_url as string) || undefined,
          } as QuizQuestion,
        ]));
        setHydrated(notes.map((n) => ({ ...n, question: map.get(n.questionId) ?? null })));
        setLoading(false);
      });
  }, [notes]);

  return { hydrated, loading };
}
