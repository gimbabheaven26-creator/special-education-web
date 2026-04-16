'use client';

import { useState, useCallback } from 'react';

export interface SubQuestionDraft {
  id: string;
  question: string;
  type: 'fill_in' | 'descriptive';
  answer: string;
  explanation?: string;
}

export interface QuizDraft {
  question_text: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  case_context?: string;
  sub_questions?: SubQuestionDraft[];
}

export interface GenerateInput {
  subject: string;
  chapter?: string;
  type: string;
  keyword?: string;
  difficulty?: number;
  count?: number;
}

export function useAIGenerate() {
  const [drafts, setDrafts] = useState<QuizDraft[]>([]);
  const [generating, setGenerating] = useState(false);
  const [approvingIndex, setApprovingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<GenerateInput | null>(null);

  const generate = useCallback(async (input: GenerateInput) => {
    setGenerating(true);
    setError(null);
    setLastInput(input);

    try {
      const res = await fetch('/api/admin/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json() as { drafts?: QuizDraft[]; error?: string };

      if (!res.ok) {
        setError(data.error ?? '생성에 실패했습니다.');
        return;
      }

      setDrafts(data.drafts ?? []);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setGenerating(false);
    }
  }, []);

  const approve = useCallback(async (index: number): Promise<boolean> => {
    const draft = drafts[index];
    if (!draft || !lastInput) return false;

    setApprovingIndex(index);
    try {
      const body: Record<string, unknown> = {
        type: lastInput.type,
        question: draft.question_text,
        answer: draft.correct_answer,
        explanation: draft.explanation,
        subject: lastInput.subject,
        chapter: lastInput.chapter ?? lastInput.subject,
        difficulty: lastInput.difficulty ?? 2,
        ai_status: 'draft',
        ai_generated_at: new Date().toISOString(),
      };

      if (draft.options) {
        body.options = draft.options;
      }
      if (draft.case_context) {
        body.case_context = draft.case_context;
      }
      if (draft.sub_questions) {
        body.sub_questions = draft.sub_questions;
      }

      const res = await fetch('/api/admin/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'DB 저장에 실패했습니다.');
        return false;
      }

      setDrafts((prev) => prev.filter((_, i) => i !== index));
      return true;
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      return false;
    } finally {
      setApprovingIndex(null);
    }
  }, [drafts, lastInput]);

  const remove = useCallback((index: number) => {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return { drafts, generating, approvingIndex, error, lastInput, generate, approve, remove };
}
