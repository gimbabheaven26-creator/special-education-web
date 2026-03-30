'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import type { CreateQuestionInput, QuestionType } from '@/types/community';
import { Button } from '@/components/ui/button';
import { Sparkles, Pencil, Loader2, ChevronLeft } from 'lucide-react';

interface SubjectOption {
  slug: string;
  title: string;
  chapters: { slug: string; title: string }[];
}

interface Props {
  subjects: SubjectOption[];
}

type Step = 1 | 2 | 3;

interface DraftState {
  subjectId: string;
  chapterId: string | null;
  questionType: QuestionType;
  questionText: string;
  options: [string, string, string, string];
  correctAnswer: string;
  explanation: string;
}

const INITIAL_DRAFT: DraftState = {
  subjectId: '',
  chapterId: null,
  questionType: 'multiple',
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: '',
};

const TYPE_LABEL: Record<QuestionType, string> = {
  multiple: '객관식',
  ox: 'OX 퀴즈',
  fill_in: '빈칸 채우기',
  descriptive: '서술형',
};

const STEP_LABELS = ['과목·유형', 'AI 생성 + 편집', '미리보기'];

export default function CreateClient({ subjects }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<DraftState>(INITIAL_DRAFT);
  const [authChecked, setAuthChecked] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [manualMode, setManualMode] = useState(false);

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
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const selectedSubject = subjects.find((s) => s.slug === draft.subjectId);
  const selectedChapter = selectedSubject?.chapters.find((c) => c.slug === draft.chapterId);

  // ─── AI 문제 생성 ───
  async function handleGenerate() {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/community/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: draft.subjectId,
          subject_title: selectedSubject?.title,
          chapter_title: selectedChapter?.title,
          question_type: draft.questionType,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? 'AI 생성 실패');
      }

      const data = await res.json();
      setDraft((prev) => ({
        ...prev,
        questionText: data.question_text ?? '',
        options: data.options
          ? [data.options[0] ?? '', data.options[1] ?? '', data.options[2] ?? '', data.options[3] ?? ''] as [string, string, string, string]
          : prev.options,
        correctAnswer: data.correct_answer ?? '',
        explanation: data.explanation ?? '',
      }));
      setStep(2);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI 생성 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  }

  // ─── 제출 ───
  async function handleSubmit() {
    setSubmitLoading(true);
    setSubmitError('');
    try {
      const input: CreateQuestionInput = {
        question_type: draft.questionType,
        question_text: draft.questionText,
        options: draft.questionType === 'multiple' ? [...draft.options] : null,
        correct_answer: draft.correctAnswer,
        explanation: draft.explanation,
        subject_id: draft.subjectId,
        chapter_id: draft.chapterId,
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
      setSubmitLoading(false);
    }
  }

  const canGenerate = !!draft.subjectId;
  const canPreview = !!draft.questionText.trim() && !!draft.correctAnswer;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">문제 만들기</h1>
      <p className="text-sm text-muted-foreground mb-6">
        AI가 문제 초안을 만들어드려요. 수정해서 제출하세요.
      </p>

      {/* 진행 표시 */}
      <div className="flex gap-1 mb-8">
        {STEP_LABELS.map((label, i) => {
          const s = (i + 1) as Step;
          return (
            <div key={i} className="flex-1 text-center">
              <div
                className={`h-1.5 rounded-full mb-1 ${
                  step > s ? 'bg-primary' : step === s ? 'bg-primary/60' : 'bg-muted'
                }`}
              />
              <span
                className={`text-xs ${
                  step >= s ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step 1: 과목 + 유형 선택 */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">과목 *</label>
            <select
              value={draft.subjectId}
              onChange={(e) => setDraft((s) => ({ ...s, subjectId: e.target.value, chapterId: null }))}
              className="w-full px-3 py-2 rounded-lg border bg-background min-h-[44px]"
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
                value={draft.chapterId ?? ''}
                onChange={(e) => setDraft((s) => ({ ...s, chapterId: e.target.value || null }))}
                className="w-full px-3 py-2 rounded-lg border bg-background min-h-[44px]"
              >
                <option value="">전체 범위</option>
                {selectedSubject.chapters.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">문제 유형 *</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(TYPE_LABEL) as QuestionType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setDraft((s) => ({ ...s, questionType: type }))}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors min-h-[44px] ${
                    draft.questionType === type
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  {TYPE_LABEL[type]}
                </button>
              ))}
            </div>
          </div>

          {aiError && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{aiError}</p>
          )}

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || aiLoading}
              className="w-full min-h-[48px] text-base"
            >
              {aiLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />AI가 문제를 만들고 있어요...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />AI로 문제 생성</>
              )}
            </Button>
            <button
              onClick={() => { setManualMode(true); setStep(2); }}
              disabled={!canGenerate}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 disabled:opacity-50"
            >
              <Pencil className="h-3 w-3 inline mr-1" />
              직접 작성할게요
            </button>
          </div>
        </div>
      )}

      {/* Step 2: 편집 폼 (AI 결과 프리필 또는 빈 폼) */}
      {step === 2 && (
        <div className="space-y-4">
          {!manualMode && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              AI가 작성한 초안이에요. 자유롭게 수정하세요.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">문제 본문 *</label>
            <textarea
              value={draft.questionText}
              onChange={(e) => setDraft((s) => ({ ...s, questionText: e.target.value }))}
              placeholder="문제를 입력하세요..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border bg-background resize-none text-sm"
            />
          </div>

          {draft.questionType === 'multiple' && (
            <div>
              <label className="block text-sm font-medium mb-1.5">선택지 (4개) *</label>
              {draft.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const next = [...draft.options] as [string, string, string, string];
                      next[i] = e.target.value;
                      setDraft((s) => ({ ...s, options: next }));
                    }}
                    placeholder={`선택지 ${i + 1}`}
                    className="flex-1 px-3 py-1.5 rounded-lg border bg-background text-sm min-h-[44px]"
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">정답 *</label>
            {draft.questionType === 'ox' ? (
              <div className="flex gap-2">
                {['O', 'X'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setDraft((s) => ({ ...s, correctAnswer: v }))}
                    className={`flex-1 py-3 rounded-lg border font-bold text-xl transition-colors min-h-[48px] ${
                      draft.correctAnswer === v
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            ) : draft.questionType === 'multiple' ? (
              <div className="flex gap-2">
                {['1', '2', '3', '4'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setDraft((s) => ({ ...s, correctAnswer: v }))}
                    className={`flex-1 py-2 rounded-lg border font-medium transition-colors min-h-[44px] ${
                      draft.correctAnswer === v
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
                value={draft.correctAnswer}
                onChange={(e) => setDraft((s) => ({ ...s, correctAnswer: e.target.value }))}
                placeholder="정답을 입력하세요"
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm min-h-[44px]"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">해설 (선택)</label>
            <textarea
              value={draft.explanation}
              onChange={(e) => setDraft((s) => ({ ...s, explanation: e.target.value }))}
              placeholder="해설을 입력하세요..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border bg-background resize-none text-sm"
            />
          </div>

          {/* AI 재생성 버튼 */}
          {!manualMode && (
            <button
              onClick={handleGenerate}
              disabled={aiLoading}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              다른 문제 생성
            </button>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1 min-h-[44px]"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />이전
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!canPreview}
              className="flex-1 min-h-[44px]"
            >
              미리보기
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: 미리보기 + 제출 */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
                {TYPE_LABEL[draft.questionType]}
              </span>
              <span className="text-xs text-muted-foreground">
                {selectedSubject?.title}
                {selectedChapter ? ` > ${selectedChapter.title}` : ''}
              </span>
            </div>
            <p className="text-sm font-medium whitespace-pre-wrap">{draft.questionText}</p>
            {draft.questionType === 'multiple' && (
              <ol className="space-y-1">
                {draft.options.map((opt, i) => (
                  <li
                    key={i}
                    className={`text-sm px-3 py-1.5 rounded-lg ${
                      draft.correctAnswer === String(i + 1)
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
              {draft.questionType === 'multiple' ? `${draft.correctAnswer}번` : draft.correctAnswer}
            </p>
            {draft.explanation && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">해설: </span>
                {draft.explanation}
              </p>
            )}
          </div>

          {submitError && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{submitError}</p>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="flex-1 min-h-[44px]"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />수정
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitLoading}
              className="flex-1 min-h-[44px]"
            >
              {submitLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />제출 중...</>
              ) : (
                '문제 제출'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
