'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DailyQuestion, Step } from '@/types/daily';
import { OX_COUNT, FILL_IN_COUNT, DESCRIPTIVE_COUNT } from '@/types/daily';
import { seededSample, selectWithWrongPriority } from '@/lib/quiz/seeded-sample';

export function useDailyQuiz() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [oxQuestions, setOxQuestions] = useState<DailyQuestion[]>([]);
  const [fillInQuestions, setFillInQuestions] = useState<DailyQuestion[]>([]);
  const [descriptiveQuestions, setDescriptiveQuestions] = useState<DailyQuestion[]>([]);

  const [oxAnswers, setOxAnswers] = useState<Record<string, 'O' | 'X'>>({});
  const [revealed, setRevealed] = useState(false);

  const [wrongChaptersStep1, setWrongChaptersStep1] = useState<string[]>([]);
  const [wrongChaptersStep2] = useState<string[]>([]);

  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/daily-questions');
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json() as {
        ox: DailyQuestion[];
        fillIn: DailyQuestion[];
        descriptive: DailyQuestion[];
      };
      setOxQuestions(json.ox);
      setFillInQuestions(json.fillIn);
      setDescriptiveQuestions(json.descriptive);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const finishStep1 = () => {
    const wrong = oxQuestions
      .filter((q) => {
        const ans = oxAnswers[q.id];
        return ans && ans !== q.answer.toUpperCase();
      })
      .map((q) => q.chapter);
    setWrongChaptersStep1(wrong);
    setStep1Done(true);
    setRevealed(true);
  };

  const proceedToStep2 = useCallback((useWrongOnly: boolean) => {
    const seed = Date.now();
    if (useWrongOnly && wrongChaptersStep1.length > 0) {
      const wrongSet = oxQuestions.filter((q) => wrongChaptersStep1.includes(q.chapter));
      const extra = seededSample(wrongSet, OX_COUNT, seed + 500);
      setOxQuestions(extra.length > 0 ? extra : oxQuestions);
      setOxAnswers({});
      setRevealed(false);
      setStep1Done(false);
    } else {
      const allFill = fillInQuestions.length > 0 ? fillInQuestions : [];
      const selected = selectWithWrongPriority(allFill, wrongChaptersStep1, FILL_IN_COUNT, seed + 200);
      setFillInQuestions(selected);
      setStep(2);
      setRevealed(false);
    }
  }, [wrongChaptersStep1, oxQuestions, fillInQuestions]);

  const finishStep2 = () => {
    setStep2Done(true);
    setRevealed(true);
  };

  const proceedToStep3 = useCallback((retry: boolean) => {
    const seed = Date.now();
    if (retry) {
      setRevealed(false);
      setStep2Done(false);
    } else {
      const selected = selectWithWrongPriority(
        descriptiveQuestions,
        [...wrongChaptersStep1, ...wrongChaptersStep2],
        DESCRIPTIVE_COUNT,
        seed + 300,
      );
      setDescriptiveQuestions(selected);
      setStep(3);
      setRevealed(false);
    }
  }, [wrongChaptersStep1, wrongChaptersStep2, descriptiveQuestions]);

  const finishStep3 = () => {
    setStep3Done(true);
    setRevealed(true);
  };

  const answerOx = (id: string, answer: 'O' | 'X') => {
    setOxAnswers((prev) => ({ ...prev, [id]: answer }));
  };

  const allOxAnswered = oxQuestions.length > 0 && oxQuestions.every((q) => oxAnswers[q.id]);

  return {
    step, setStep,
    loading, error, loadQuestions,
    oxQuestions, fillInQuestions, descriptiveQuestions,
    oxAnswers, answerOx, allOxAnswered,
    revealed, setRevealed,
    wrongChaptersStep1,
    step1Done, step2Done, step3Done,
    finishStep1, proceedToStep2,
    finishStep2, proceedToStep3,
    finishStep3,
  };
}
