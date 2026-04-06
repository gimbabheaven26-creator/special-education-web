'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { QuizQuestion, QuizType, SubQuestion } from '@/types/quiz';

// ── 유틸 ──────────────────────────────────────────

function generateSubQuestionId(): string {
  return `sq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── 타입 ──────────────────────────────────────────

interface SubjectItem {
  slug: string;
  title: string;
}

interface ChapterItem {
  slug: string;
  title: string;
}

export interface UseQuizFormOptions {
  mode: 'create' | 'edit';
  initialData?: QuizQuestion;
  subjects: SubjectItem[];
  initialChapters?: ChapterItem[];
}

export interface QuizFormState {
  subject: string;
  chapter: string;
  type: QuizType;
  question: string;
  caseContext: string;
  answer: string;
  explanation: string;
  difficulty: 1 | 2 | 3;
  source: string;
  imageUrl: string;
  options: string[];
  wrongExplanations: Record<string, string>;
  tagDisability: string;
  tagYear: string;
  tagRound: string;
  subQuestions: SubQuestion[];
  multiSubjects: string[];
  chapters: ChapterItem[];
  saving: boolean;
  deleting: boolean;
  toast: { message: string; type: 'success' | 'error'; visible: boolean };
}

export interface QuizFormActions {
  setSubject: (v: string) => void;
  setChapter: (v: string) => void;
  setType: (v: QuizType) => void;
  setQuestion: (v: string) => void;
  setCaseContext: (v: string) => void;
  setAnswer: (v: string) => void;
  setExplanation: (v: string) => void;
  setDifficulty: (v: 1 | 2 | 3) => void;
  setSource: (v: string) => void;
  setImageUrl: (v: string) => void;
  setTagDisability: (v: string) => void;
  setTagYear: (v: string) => void;
  setTagRound: (v: string) => void;
  updateOption: (index: number, value: string) => void;
  addOption: () => void;
  removeOption: (index: number) => void;
  moveOption: (index: number, direction: 'up' | 'down') => void;
  setWrongExplanations: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setMultiSubjects: React.Dispatch<React.SetStateAction<string[]>>;
  addSubQuestion: () => void;
  updateSubQuestion: (index: number, field: keyof SubQuestion, value: string) => void;
  removeSubQuestion: (index: number) => void;
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
}

// ── 훅 ──────────────────────────────────────────

export function useQuizForm({ mode, initialData, initialChapters }: UseQuizFormOptions): QuizFormState & QuizFormActions {
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

  // 복합영역 태그
  const [multiSubjects, setMultiSubjects] = useState<string[]>(initialData?.subjects ?? []);

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

  const showToast = useCallback((message: string, toastType: 'success' | 'error') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type: toastType, visible: true });
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

    if (multiSubjects.length > 0) {
      payload.subjects = multiSubjects;
    }

    return payload as Partial<QuizQuestion>;
  };

  const handleSave = async () => {
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

  return {
    // state
    subject, chapter, type, question, caseContext, answer, explanation,
    difficulty, source, imageUrl, options, wrongExplanations,
    tagDisability, tagYear, tagRound, subQuestions, multiSubjects, chapters,
    saving, deleting, toast,
    // actions
    setSubject, setChapter, setType, setQuestion, setCaseContext,
    setAnswer, setExplanation, setDifficulty, setSource, setImageUrl,
    setTagDisability, setTagYear, setTagRound, setWrongExplanations, setMultiSubjects,
    updateOption, addOption, removeOption, moveOption,
    addSubQuestion, updateSubQuestion, removeSubQuestion,
    handleSave, handleDelete,
  };
}
