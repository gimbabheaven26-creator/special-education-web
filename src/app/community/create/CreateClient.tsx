'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import type { CreateQuestionInput, QuestionType } from '@/types/community';

interface SubjectOption {
  slug: string;
  title: string;
  chapters: { slug: string; title: string }[];
}

interface Props {
  subjects: SubjectOption[];
}

interface WizardState {
  step: 1 | 2 | 3 | 4;
  subjectId: string;
  chapterId: string | null;
  questionType: QuestionType;
  questionText: string;
  options: [string, string, string, string];
  correctAnswer: string;
  explanation: string;
}

const INITIAL: WizardState = {
  step: 1,
  subjectId: '',
  chapterId: null,
  questionType: 'multiple',
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: '',
};

const STEP_LABELS = ['과목 선택', '문제 입력', '정답 작성', '미리보기'];

const TYPE_LABEL: Record<QuestionType, string> = {
  multiple: '객관식',
  ox: 'OX 퀴즈',
  fill_in: '빈칸 채우기',
  descriptive: '서술형',
};

export default function CreateClient({ subjects }: Props) {
  const router = useRouter();
  const [state, setState] = useState<WizardState>(INITIAL);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login?redirect=/community/create');
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">인증 확인 중...</p>
      </div>
    );
  }

  const selectedSubject = subjects.find((s) => s.slug === state.subjectId);

  async function handleAiAssist() {
    setAiLoading(true);
    setAiSuggestion('');
    try {
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_type: state.questionType,
          question_text: state.questionText,
          correct_answer: state.correctAnswer,
          explanation: state.explanation,
        }),
      });
      const json = await res.json();
      setAiSuggestion(json.suggestion ?? '');
    } catch {
      setAiSuggestion('AI 검증 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setSubmitError('');
    try {
      const input: CreateQuestionInput = {
        question_type: state.questionType,
        question_text: state.questionText,
        options: state.questionType === 'multiple' ? [...state.options] : null,
        correct_answer: state.correctAnswer,
        explanation: state.explanation,
        subject_id: state.subjectId,
        chapter_id: state.chapterId,
      };
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? '제출 실패');
      }
      const { id } = await res.json();
      router.push(`/community/${id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '제출 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Step 1: 과목/챕터 선택 ───
  function Step1() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">과목 *</label>
          <select
            value={state.subjectId}
            onChange={(e) =>
              setState((s) => ({ ...s, subjectId: e.target.value, chapterId: null }))
            }
            className="w-full px-3 py-2 rounded-lg border bg-background"
          >
            <option value="">과목을 선택하세요</option>
            {subjects.map((s) => (
              <option key={s.slug} value={s.slug}>{s.title}</option>
            ))}
          </select>
        </div>
        {selectedSubject && (
          <div>
            <label className="block text-sm font-medium mb-1.5">챕터 (선택)</label>
            <select
              value={state.chapterId ?? ''}
              onChange={(e) =>
                setState((s) => ({ ...s, chapterId: e.target.value || null }))
              }
              className="w-full px-3 py-2 rounded-lg border bg-background"
            >
              <option value="">챕터 선택 안 함</option>
              {selectedSubject.chapters.map((c) => (
                <option key={c.slug} value={c.slug}>{c.title}</option>
              ))}
            </select>
          </div>
        )}
        <button
          onClick={() => setState((s) => ({ ...s, step: 2 }))}
          disabled={!state.subjectId}
          className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    );
  }

  // ─── Step 2: 문제 유형 + 본문 ───
  function Step2() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">문제 유형 *</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(TYPE_LABEL) as QuestionType[]).map((type) => (
              <button
                key={type}
                onClick={() => setState((s) => ({ ...s, questionType: type }))}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  state.questionType === type
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                }`}
              >
                {TYPE_LABEL[type]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">문제 본문 *</label>
          <textarea
            value={state.questionText}
            onChange={(e) => setState((s) => ({ ...s, questionText: e.target.value }))}
            placeholder="문제를 입력하세요..."
            rows={4}
            className="w-full px-3 py-2 rounded-lg border bg-background resize-none text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setState((s) => ({ ...s, step: 1 }))}
            className="flex-1 py-2 rounded-lg border font-medium text-sm"
          >
            이전
          </button>
          <button
            onClick={() => setState((s) => ({ ...s, step: 3 }))}
            disabled={!state.questionText.trim()}
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      </div>
    );
  }

  // ─── Step 3: 보기/정답/해설 ───
  function Step3() {
    return (
      <div className="space-y-4">
        {state.questionType === 'multiple' && (
          <div>
            <label className="block text-sm font-medium mb-1.5">선택지 (4개) *</label>
            {state.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <input
                  value={opt}
                  onChange={(e) => {
                    const next = [...state.options] as [string, string, string, string];
                    next[i] = e.target.value;
                    setState((s) => ({ ...s, options: next }));
                  }}
                  placeholder={`선택지 ${i + 1}`}
                  className="flex-1 px-3 py-1.5 rounded-lg border bg-background text-sm"
                />
              </div>
            ))}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1.5">정답 *</label>
          {state.questionType === 'ox' ? (
            <div className="flex gap-2">
              {['O', 'X'].map((v) => (
                <button
                  key={v}
                  onClick={() => setState((s) => ({ ...s, correctAnswer: v }))}
                  className={`flex-1 py-3 rounded-lg border font-bold text-xl transition-colors ${
                    state.correctAnswer === v
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          ) : state.questionType === 'multiple' ? (
            <div className="flex gap-2">
              {['1', '2', '3', '4'].map((v) => (
                <button
                  key={v}
                  onClick={() => setState((s) => ({ ...s, correctAnswer: v }))}
                  className={`flex-1 py-2 rounded-lg border font-medium transition-colors ${
                    state.correctAnswer === v
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  {v}번
                </button>
              ))}
            </div>
          ) : (
            <input
              value={state.correctAnswer}
              onChange={(e) => setState((s) => ({ ...s, correctAnswer: e.target.value }))}
              placeholder="정답을 입력하세요"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">해설 (선택)</label>
          <textarea
            value={state.explanation}
            onChange={(e) => setState((s) => ({ ...s, explanation: e.target.value }))}
            placeholder="해설을 입력하세요..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border bg-background resize-none text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setState((s) => ({ ...s, step: 2 }))}
            className="flex-1 py-2 rounded-lg border font-medium text-sm"
          >
            이전
          </button>
          <button
            onClick={() => setState((s) => ({ ...s, step: 4 }))}
            disabled={!state.correctAnswer}
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            미리보기
          </button>
        </div>
      </div>
    );
  }

  // ─── Step 4: 미리보기 + AI 검증 + 제출 ───
  function Step4() {
    return (
      <div className="space-y-4">
        {/* 미리보기 카드 */}
        <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
              {TYPE_LABEL[state.questionType]}
            </span>
            <span className="text-xs text-muted-foreground">
              {subjects.find((s) => s.slug === state.subjectId)?.title}
            </span>
          </div>
          <p className="text-sm font-medium whitespace-pre-wrap">{state.questionText}</p>
          {state.questionType === 'multiple' && (
            <ol className="space-y-1">
              {state.options.map((opt, i) => (
                <li
                  key={i}
                  className={`text-sm px-3 py-1.5 rounded-lg ${
                    state.correctAnswer === String(i + 1)
                      ? 'bg-green-100 dark:bg-green-900/30 font-medium'
                      : ''
                  }`}
                >
                  {i + 1}. {opt}
                </li>
              ))}
            </ol>
          )}
          <p className="text-sm">
            <span className="font-medium">정답: </span>
            {state.questionType === 'multiple' ? `${state.correctAnswer}번` : state.correctAnswer}
          </p>
          {state.explanation && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">해설: </span>
              {state.explanation}
            </p>
          )}
        </div>

        {/* AI 검증 */}
        <div className="rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">AI 검증 (선택)</p>
            <button
              onClick={handleAiAssist}
              disabled={aiLoading}
              className="text-xs px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50"
            >
              {aiLoading ? '검증 중...' : 'AI로 검증하기'}
            </button>
          </div>
          {aiSuggestion && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiSuggestion}</p>
          )}
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <div className="flex gap-2">
          <button
            onClick={() => setState((s) => ({ ...s, step: 3 }))}
            className="flex-1 py-2 rounded-lg border font-medium text-sm"
          >
            이전
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50"
          >
            {loading ? '제출 중...' : '문제 제출'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">문제 만들기</h1>
      <p className="text-sm text-muted-foreground mb-6">
        특수교육 문제를 제작하고 커뮤니티와 공유하세요.
      </p>

      {/* 진행 표시 */}
      <div className="flex gap-1 mb-8">
        {STEP_LABELS.map((label, i) => {
          const stepNum = (i + 1) as 1 | 2 | 3 | 4;
          const active = state.step === stepNum;
          const done = state.step > stepNum;
          return (
            <div key={i} className="flex-1 text-center">
              <div
                className={`h-1.5 rounded-full mb-1 ${
                  done ? 'bg-primary' : active ? 'bg-primary/60' : 'bg-muted'
                }`}
              />
              <span
                className={`text-xs ${
                  active || done ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {state.step === 1 && <Step1 />}
      {state.step === 2 && <Step2 />}
      {state.step === 3 && <Step3 />}
      {state.step === 4 && <Step4 />}
    </div>
  );
}
