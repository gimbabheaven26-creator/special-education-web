'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { QuizQuestion, QuizType, SubQuestion } from '@/types/quiz';

// ── 스타일 상수 ──────────────────────────────────────

const INPUT_CLASS =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none';

const BTN_ICON_CLASS =
  'p-1.5 text-sm text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed';

// ── 상수 ──────────────────────────────────────────

const TYPE_OPTIONS: { value: QuizType; label: string }[] = [
  { value: 'multiple', label: '객관식' },
  { value: 'ox', label: 'OX' },
  { value: 'fill_in', label: '빈칸채우기' },
  { value: 'descriptive', label: '서술형' },
  { value: 'scenario_composite', label: '시나리오 복합' },
];

const DIFFICULTY_OPTIONS: { value: 1 | 2 | 3; label: string }[] = [
  { value: 1, label: '하' },
  { value: 2, label: '중' },
  { value: 3, label: '상' },
];

interface SubjectItem {
  slug: string;
  title: string;
}

interface ChapterItem {
  slug: string;
  title: string;
}

interface QuizFormProps {
  mode: 'create' | 'edit';
  initialData?: QuizQuestion;
  subjects: SubjectItem[];
  initialChapters?: ChapterItem[];
}

// ── 토스트 ──────────────────────────────────────────

function Toast({ message, type, visible }: { message: string; type: 'success' | 'error'; visible: boolean }) {
  if (!visible) return null;
  const bg = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-white text-sm shadow-lg ${bg} transition-opacity`}>
      {message}
    </div>
  );
}

// ── 유틸 ──────────────────────────────────────────

function generateSubQuestionId(): string {
  return `sq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── 메인 폼 ──────────────────────────────────────────

export function QuizForm({ mode, initialData, subjects, initialChapters }: QuizFormProps) {
  const router = useRouter();

  // 기본 필드
  const [subject, setSubject] = useState(initialData?.subject ?? '');
  const [chapter, setChapter] = useState(initialData?.chapter ?? '');
  const [type, setType] = useState<QuizType>(initialData?.type ?? 'multiple');
  const [question, setQuestion] = useState(initialData?.question ?? '');
  const [caseContext, setCaseContext] = useState(initialData?.caseContext ?? '');
  const [answer, setAnswer] = useState<string>(String(initialData?.answer ?? ''));
  const [explanation, setExplanation] = useState(initialData?.explanation ?? '');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(initialData?.difficulty ?? 2);
  const [source, setSource] = useState(initialData?.source ?? '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '');

  // 객관식 옵션
  const [options, setOptions] = useState<string[]>(initialData?.options ?? ['', '', '', '', '']);

  // 오답 해설
  const [wrongExplanations, setWrongExplanations] = useState<Record<string, string>>(
    initialData?.wrongExplanations ?? {},
  );

  // 태그
  const [tagDisability, setTagDisability] = useState(initialData?.tags?.disability ?? '');
  const [tagYear, setTagYear] = useState(initialData?.tags?.year?.toString() ?? '');
  const [tagRound, setTagRound] = useState(initialData?.tags?.round?.toString() ?? '');

  // 시나리오 하위 문항
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>(initialData?.subQuestions ?? []);

  // 챕터 목록 (동적 로딩)
  const [chapters, setChapters] = useState<ChapterItem[]>(initialChapters ?? []);

  // UI 상태
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type, visible: true });
    toastTimer.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  // 과목 변경 시 챕터 목록 다시 로딩
  useEffect(() => {
    if (!subject) {
      setChapters([]);
      return;
    }

    let cancelled = false;

    async function loadChapters() {
      try {
        const res = await fetch(`/api/admin/chapters?subject=${encodeURIComponent(subject)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setChapters(data.chapters ?? []);
        }
      } catch {
        // 챕터 로딩 실패 시 빈 배열 유지
      }
    }

    loadChapters();
    return () => { cancelled = true; };
  }, [subject]);

  // ── 옵션 관리 ──

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addOption = () => {
    setOptions((prev) => [...prev, '']);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    // 오답 해설에서도 제거
    setWrongExplanations((prev) => {
      const next = { ...prev };
      delete next[String(index + 1)];
      return next;
    });
  };

  const moveOption = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= options.length) return;
    setOptions((prev) => {
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  // ── 하위 문항 관리 ──

  const addSubQuestion = () => {
    setSubQuestions((prev) => [
      ...prev,
      { id: generateSubQuestionId(), question: '', type: 'fill_in', answer: '' },
    ]);
  };

  const updateSubQuestion = (index: number, field: keyof SubQuestion, value: string) => {
    setSubQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeSubQuestion = (index: number) => {
    setSubQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // ── 저장 ──

  const buildPayload = (): Partial<QuizQuestion> => {
    const tags: QuizQuestion['tags'] = {};
    if (tagDisability) tags.disability = tagDisability;
    if (tagYear) tags.year = Number(tagYear);
    if (tagRound) tags.round = Number(tagRound);

    const payload: Record<string, unknown> = {
      subject,
      chapter,
      type,
      question,
      answer: type === 'multiple' ? Number(answer) : answer,
      explanation,
      difficulty,
    };

    if (caseContext) payload.caseContext = caseContext;
    if (source) payload.source = source;
    if (imageUrl) payload.imageUrl = imageUrl;
    if (Object.keys(tags).length > 0) payload.tags = tags;

    if (type === 'multiple') {
      payload.options = options;
      if (Object.keys(wrongExplanations).length > 0) {
        payload.wrongExplanations = wrongExplanations;
      }
    }

    if (type === 'scenario_composite' && subQuestions.length > 0) {
      payload.subQuestions = subQuestions;
    }

    return payload as Partial<QuizQuestion>;
  };

  const handleSave = async () => {
    // 필수 필드 검증
    if (!subject || !chapter || !question || !answer || !explanation) {
      showToast('필수 항목을 모두 입력해주세요. (과목, 챕터, 문제, 정답, 해설)', 'error');
      return;
    }

    setSaving(true);

    try {
      const payload = buildPayload();
      const url =
        mode === 'edit'
          ? `/api/admin/quiz/${initialData!.id}`
          : '/api/admin/quiz';
      const method = mode === 'edit' ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '저장 실패' }));
        throw new Error(err.error ?? '저장 실패');
      }

      showToast(mode === 'edit' ? '수정 완료' : '등록 완료', 'success');

      if (mode === 'create') {
        setTimeout(() => router.push('/admin/editor'), 1000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── 삭제 ──

  const handleDelete = async () => {
    if (!initialData?.id) return;

    const confirmed = window.confirm('이 문제를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!confirmed) return;

    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/quiz/${initialData.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '삭제 실패' }));
        throw new Error(err.error ?? '삭제 실패');
      }
      showToast('삭제 완료', 'success');
      setTimeout(() => router.push('/admin/editor'), 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.';
      showToast(message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ── 렌더링 ──

  return (
    <div className="max-w-3xl mx-auto">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      {/* 기본 정보 */}
      <Section title="기본 정보">
        {/* 과목 */}
        <Field label="과목" required>
          <select
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setChapter('');
            }}
            className={INPUT_CLASS}
          >
            <option value="">과목 선택</option>
            {subjects.map((s) => (
              <option key={s.slug} value={s.slug}>{s.title}</option>
            ))}
          </select>
        </Field>

        {/* 챕터 */}
        <Field label="챕터" required>
          {chapters.length > 0 ? (
            <select
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">챕터 선택</option>
              {chapters.map((c) => (
                <option key={c.slug} value={c.slug}>{c.title}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="챕터 직접 입력"
              className={INPUT_CLASS}
            />
          )}
        </Field>

        {/* 유형 */}
        <Field label="유형" required>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as QuizType)}
            className={INPUT_CLASS}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>

        {/* 난이도 */}
        <Field label="난이도" required>
          <div className="flex gap-4">
            {DIFFICULTY_OPTIONS.map((d) => (
              <label key={d.value} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="difficulty"
                  value={d.value}
                  checked={difficulty === d.value}
                  onChange={() => setDifficulty(d.value)}
                  className="text-blue-600"
                />
                <span className="text-sm">{d.label}</span>
              </label>
            ))}
          </div>
        </Field>
      </Section>

      {/* 문제 내용 */}
      <Section title="문제 내용">
        {/* 사례 지문 */}
        <Field label="사례 지문 (선택)">
          <textarea
            value={caseContext}
            onChange={(e) => setCaseContext(e.target.value)}
            placeholder="사례 지문이 있는 경우 입력하세요"
            rows={4}
            className={INPUT_CLASS}
          />
        </Field>

        {/* 문제 */}
        <Field label="문제" required>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="문제를 입력하세요"
            rows={4}
            className={INPUT_CLASS}
          />
        </Field>

        {/* 이미지 URL */}
        <Field label="이미지 URL (선택)">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className={INPUT_CLASS}
          />
        </Field>
      </Section>

      {/* 객관식 옵션 */}
      {type === 'multiple' && (
        <Section title="선택지">
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 w-6 shrink-0">{i + 1}.</span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`선택지 ${i + 1}`}
                  className={`${INPUT_CLASS} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => moveOption(i, 'up')}
                  disabled={i === 0}
                  className={BTN_ICON_CLASS}
                  title="위로"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveOption(i, 'down')}
                  disabled={i === options.length - 1}
                  className={BTN_ICON_CLASS}
                  title="아래로"
                >
                  ↓
                </button>
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="p-1.5 text-sm text-red-500 hover:text-red-700"
                    title="삭제"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + 선택지 추가
          </button>
        </Section>
      )}

      {/* 정답 & 해설 */}
      <Section title="정답 & 해설">
        <Field label="정답" required>
          {type === 'multiple' ? (
            <select
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">정답 번호 선택</option>
              {options.map((_, i) => (
                <option key={i + 1} value={String(i + 1)}>{i + 1}번</option>
              ))}
            </select>
          ) : type === 'ox' ? (
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="answer"
                  value="O"
                  checked={answer === 'O'}
                  onChange={() => setAnswer('O')}
                />
                <span className="text-sm">O</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="answer"
                  value="X"
                  checked={answer === 'X'}
                  onChange={() => setAnswer('X')}
                />
                <span className="text-sm">X</span>
              </label>
            </div>
          ) : (
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="정답을 입력하세요"
              rows={2}
              className={INPUT_CLASS}
            />
          )}
        </Field>

        <Field label="해설" required>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="해설을 입력하세요"
            rows={4}
            className={INPUT_CLASS}
          />
        </Field>
      </Section>

      {/* 오답 해설 (객관식만) */}
      {type === 'multiple' && (
        <Section title="오답 해설">
          <p className="text-xs text-gray-500 mb-3">정답이 아닌 선택지에 대한 개별 해설을 입력하세요.</p>
          <div className="space-y-3">
            {options.map((opt, i) => {
              const num = String(i + 1);
              if (num === answer) return null;
              return (
                <Field key={num} label={`${num}번: ${opt || '(비어 있음)'}`}>
                  <textarea
                    value={wrongExplanations[num] ?? ''}
                    onChange={(e) => {
                      setWrongExplanations((prev) => ({
                        ...prev,
                        [num]: e.target.value,
                      }));
                    }}
                    placeholder={`${num}번 선택지에 대한 오답 해설`}
                    rows={2}
                    className={INPUT_CLASS}
                  />
                </Field>
              );
            })}
          </div>
        </Section>
      )}

      {/* 시나리오 하위 문항 */}
      {type === 'scenario_composite' && (
        <Section title="하위 문항">
          <div className="space-y-4">
            {subQuestions.map((sq, i) => (
              <div key={sq.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">하위 문항 {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeSubQuestion(i)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>

                <Field label="유형">
                  <select
                    value={sq.type}
                    onChange={(e) => updateSubQuestion(i, 'type', e.target.value)}
                    className={INPUT_CLASS}
                  >
                    <option value="fill_in">빈칸채우기</option>
                    <option value="descriptive">서술형</option>
                  </select>
                </Field>

                <Field label="문제">
                  <textarea
                    value={sq.question}
                    onChange={(e) => updateSubQuestion(i, 'question', e.target.value)}
                    placeholder="하위 문제를 입력하세요"
                    rows={2}
                    className={INPUT_CLASS}
                  />
                </Field>

                <Field label="정답">
                  <textarea
                    value={sq.answer}
                    onChange={(e) => updateSubQuestion(i, 'answer', e.target.value)}
                    placeholder="하위 문항 정답"
                    rows={2}
                    className={INPUT_CLASS}
                  />
                </Field>

                <Field label="해설 (선택)">
                  <textarea
                    value={sq.explanation ?? ''}
                    onChange={(e) => updateSubQuestion(i, 'explanation', e.target.value)}
                    placeholder="하위 문항 해설"
                    rows={2}
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSubQuestion}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            + 하위 문항 추가
          </button>
        </Section>
      )}

      {/* 부가 정보 */}
      <Section title="부가 정보">
        <Field label="출처 (선택)">
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="예: 2024 임용시험 1교시"
            className={INPUT_CLASS}
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="장애영역">
            <input
              type="text"
              value={tagDisability}
              onChange={(e) => setTagDisability(e.target.value)}
              placeholder="예: 자폐성장애"
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="출제연도">
            <input
              type="number"
              value={tagYear}
              onChange={(e) => setTagYear(e.target.value)}
              placeholder="예: 2024"
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="회차">
            <input
              type="number"
              value={tagRound}
              onChange={(e) => setTagRound(e.target.value)}
              placeholder="예: 1"
              className={INPUT_CLASS}
            />
          </Field>
        </div>
      </Section>

      {/* 버튼 영역 */}
      <div className="flex items-center justify-between mt-8 mb-12">
        <div>
          {mode === 'edit' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/editor')}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '저장 중...' : mode === 'edit' ? '수정' : '등록'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 공통 UI 컴포넌트 ──────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
