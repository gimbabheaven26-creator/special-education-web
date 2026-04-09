'use client';

import { useEffect, useState } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { QuizForm } from '../QuizForm';

interface SubjectItem { slug: string; title: string }

interface AIPrefilledFormProps {
  readonly subjects: SubjectItem[];
}

interface DraftData {
  question_text: string;
  correct_answer: string;
  explanation: string;
  options?: string[] | null;
}

interface DraftMeta {
  subject: string;
  chapter: string;
  type: string;
  difficulty: number;
}

export function AIPrefilledForm({ subjects }: AIPrefilledFormProps) {
  const [initialData, setInitialData] = useState<QuizQuestion | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const draftRaw = sessionStorage.getItem('ai-draft');
      const metaRaw = sessionStorage.getItem('ai-draft-meta');
      if (draftRaw && metaRaw) {
        const draft = JSON.parse(draftRaw) as DraftData;
        const meta = JSON.parse(metaRaw) as DraftMeta;

        const prefilled: QuizQuestion = {
          id: '',
          subject: meta.subject,
          chapter: meta.chapter || meta.subject,
          type: meta.type as QuizQuestion['type'],
          question: draft.question_text,
          answer: draft.correct_answer,
          explanation: draft.explanation,
          difficulty: (meta.difficulty as 1 | 2 | 3) ?? 2,
          options: draft.options ?? undefined,
        };
        setInitialData(prefilled);

        // Clean up sessionStorage
        sessionStorage.removeItem('ai-draft');
        sessionStorage.removeItem('ai-draft-meta');
      }
    } catch {
      // Ignore parse errors
    }
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <div className="h-32 animate-pulse bg-gray-100 rounded-lg" />;
  }

  return (
    <QuizForm
      mode="create"
      subjects={subjects}
      initialData={initialData}
    />
  );
}
