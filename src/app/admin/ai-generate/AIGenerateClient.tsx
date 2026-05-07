'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Check, Pencil, Trash2, Loader2, AlertCircle, ClipboardList, X as XIcon, CheckCircle } from 'lucide-react';
import { useAIGenerate } from './useAIGenerate';
import type { GenerateInput, QuizDraft } from './useAIGenerate';

const TYPE_OPTIONS = [
  { value: 'multiple', label: '객관식' },
  { value: 'ox', label: 'OX' },
  { value: 'fill_in', label: '빈칸 채우기' },
  { value: 'descriptive', label: '서술형' },
  { value: 'scenario_composite', label: '시나리오/기출형' },
];

const DIFFICULTY_OPTIONS = [
  { value: 1, label: '기초' },
  { value: 2, label: '중급' },
  { value: 3, label: '심화' },
];

interface SubjectRow { slug: string; title: string }
interface ChapterRow { slug: string; title: string; subject_slug: string }

interface AIGenerateClientProps {
  readonly subjects: readonly SubjectRow[];
  readonly chapters: readonly ChapterRow[];
}

export default function AIGenerateClient({ subjects, chapters }: AIGenerateClientProps) {
  const { drafts, generating, approvingIndex, error, generate, approve, remove } = useAIGenerate();

  const [tab, setTab] = useState<'generate' | 'review'>('generate');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [type, setType] = useState('ox');
  const [difficulty, setDifficulty] = useState(2);
  const [keyword, setKeyword] = useState('');
  const [count, setCount] = useState(1);
  const [savedCount, setSavedCount] = useState(0);
  const [subjectTouched, setSubjectTouched] = useState(false);

  const filteredChapters = useMemo(
    () => chapters.filter((c) => c.subject_slug === subject),
    [chapters, subject],
  );

  function handleSubjectChange(slug: string) {
    setSubject(slug);
    setChapter('');
  }

  async function handleGenerate() {
    setSubjectTouched(true);
    if (!subject) return;
    const actualCount = type === 'scenario_composite' ? 1 : count;
    const input: GenerateInput = { subject, type, difficulty, count: actualCount };
    if (chapter) input.chapter = chapter;
    if (keyword.trim()) input.keyword = keyword.trim();
    await generate(input);
  }

  async function handleSaveDraft(index: number) {
    const ok = await approve(index);
    if (ok) {
      setSavedCount((prev) => prev + 1);
      setTimeout(() => setSavedCount(0), 4000);
    }
  }

  function handleEditAndSave(draft: QuizDraft) {
    sessionStorage.setItem('ai-draft', JSON.stringify(draft));
    sessionStorage.setItem('ai-draft-meta', JSON.stringify({ subject, chapter, type, difficulty }));
  }

  const subjectTitle = subjects.find((s) => s.slug === subject)?.title ?? subject;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setTab('generate')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${tab === 'generate' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          aria-label="AI 생성 탭"
        >
          <Sparkles className="h-4 w-4 inline mr-1.5" />
          AI 생성
        </button>
        <button
          type="button"
          onClick={() => setTab('review')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${tab === 'review' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          aria-label="검수 대기 탭"
        >
          <ClipboardList className="h-4 w-4 inline mr-1.5" />
          검수 대기
        </button>
      </div>

      {tab === 'review' && <ReviewQueue />}

      {tab === 'generate' && <>
      <div>
        <h2 className="text-lg font-bold">AI 문제 생성</h2>
        <p className="text-sm text-gray-500 mt-1">
          AI가 초안을 생성하면, 직접 검토 후 승인하세요.
        </p>
      </div>

      {/* Generation Form */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="ai-subject" className="block text-sm font-medium text-gray-700 mb-1">과목 *</label>
            <select
              id="ai-subject"
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 text-sm ${subjectTouched && !subject ? 'border-red-400 ring-1 ring-red-400' : ''}`}
              required
              aria-label="과목 선택"
              aria-invalid={subjectTouched && !subject}
            >
              <option value="">선택하세요</option>
              {subjects.map((s) => (
                <option key={s.slug} value={s.slug}>{s.title}</option>
              ))}
            </select>
            {subjectTouched && !subject && (
              <p className="text-xs text-red-500 mt-1">과목을 선택해주세요.</p>
            )}
          </div>

          <div>
            <label htmlFor="ai-chapter" className="block text-sm font-medium text-gray-700 mb-1">챕터</label>
            <select
              id="ai-chapter"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
              disabled={!subject}
              aria-label="챕터 선택"
            >
              <option value="">전체</option>
              {filteredChapters.map((c) => (
                <option key={c.slug} value={c.slug}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="ai-type" className="block text-sm font-medium text-gray-700 mb-1">유형 *</label>
            <select
              id="ai-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
              aria-label="문제 유형 선택"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ai-difficulty" className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
            <select
              id="ai-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="w-full border rounded-md px-3 py-2 text-sm"
              aria-label="난이도 선택"
            >
              {DIFFICULTY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ai-count" className="block text-sm font-medium text-gray-700 mb-1">생성 수</label>
            <select
              id="ai-count"
              value={type === 'scenario_composite' ? 1 : count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full border rounded-md px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
              disabled={type === 'scenario_composite'}
              aria-label="생성 수량 선택"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}개</option>
              ))}
            </select>
            {type === 'scenario_composite' && (
              <p className="text-xs text-amber-600 mt-1">시나리오형은 1개씩 생성됩니다.</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="ai-keyword" className="block text-sm font-medium text-gray-700 mb-1">핵심 키워드 (선택)</label>
          <input
            id="ai-keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="예: 통합교육, IEP, 긍정적 행동지원"
            className="w-full border rounded-md px-3 py-2 text-sm"
            maxLength={200}
            aria-label="핵심 키워드 입력"
          />
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || !subject}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="AI 초안 생성"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {generating ? '생성 중...' : 'AI 초안 생성'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {savedCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <ClipboardList className="h-4 w-4" />
          {savedCount}개 초안이 검수 대기 목록에 저장되었습니다.
        </div>
      )}

      {/* Draft Cards */}
      {drafts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              AI 초안 ({drafts.length}개) — {subjectTitle}
            </h3>
          </div>

          {drafts.map((draft, index) => (
            <DraftCard
              key={`draft-${index}`}
              draft={draft}
              index={index}
              approving={approvingIndex === index}
              onApprove={() => handleSaveDraft(index)}
              onEdit={() => handleEditAndSave(draft)}
              onRemove={() => remove(index)}
            />
          ))}
        </div>
      )}
      </>}
    </div>
  );
}

// ── Review Queue Component ──────────────────────────────────────────────

interface ReviewItem {
  id: string;
  question: string;
  answer: string;
  explanation: string | null;
  type: string;
  subject: string;
  chapter: string;
  case_context: string | null;
  sub_questions: Array<{ id: string; question: string; type: string; answer: string; explanation?: string }> | null;
  ai_generated_at: string | null;
}

function ReviewQueue() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = useCallback((msg: { type: 'success' | 'error'; text: string }) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3500);
  }, []);

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch('/api/admin/quiz?ai_status=draft&limit=100');
      const json = await res.json() as { data?: ReviewItem[]; total?: number };
      setItems(json.data ?? []);
      setTotal(json.total ?? json.data?.length ?? 0);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDrafts(); }, [fetchDrafts]);

  async function handleReview(id: string, status: 'approved' | 'rejected') {
    setActionId(id);
    try {
      const res = await fetch('/api/admin/quiz', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ai_status: status }),
      });
      if (!res.ok) {
        showMessage({ type: 'error', text: '상태 변경에 실패했습니다.' });
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      showMessage({
        type: 'success',
        text: status === 'approved' ? '승인 완료 — 학생에게 노출됩니다.' : '거절 완료 — 학생에게 노출되지 않습니다.',
      });
    } catch {
      showMessage({ type: 'error', text: '네트워크 오류가 발생했습니다.' });
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-1/4 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-gray-500">검수 대기 목록을 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={fetchDrafts}
          className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-md hover:bg-indigo-50"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">검수 대기 ({total}개)</h2>
        <button
          type="button"
          onClick={fetchDrafts}
          className="text-xs text-gray-500 hover:text-indigo-600"
          aria-label="목록 새로고침"
        >
          새로고침
        </button>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm transition-opacity ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {items.length === 0 && (
        <p className="text-sm text-gray-500 py-8 text-center">검수 대기 중인 문제가 없습니다.</p>
      )}

      {items.map((item) => (
        <div key={item.id} className="bg-white border rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded font-medium text-gray-500">{item.type}</span>
                <span className="text-[10px] text-gray-400">{item.subject} / {item.chapter}</span>
                {item.ai_generated_at && (
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.ai_generated_at).toLocaleDateString('ko-KR')}
                  </span>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{item.question}</p>
            </div>
          </div>

          {item.case_context && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-[10px] font-semibold text-amber-700 mb-1">사례 지문</p>
              <p className="text-xs text-amber-900 whitespace-pre-wrap leading-relaxed">{item.case_context}</p>
            </div>
          )}

          {item.sub_questions && item.sub_questions.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-gray-500">하위 질문 ({item.sub_questions.length}개)</p>
              {item.sub_questions.map((sq) => (
                <div key={sq.id} className="pl-3 border-l-2 border-indigo-200 space-y-0.5">
                  <p className="text-xs font-medium">{sq.id}. {sq.question}</p>
                  <p className="text-xs text-emerald-700">정답: {sq.answer}</p>
                  {sq.explanation && <p className="text-[10px] text-gray-500">{sq.explanation}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="bg-gray-50 rounded-md p-3 space-y-1">
            <p className="text-xs">
              <span className="font-medium text-gray-500">정답:</span>{' '}
              <span className="font-bold text-emerald-700">{item.answer}</span>
            </p>
            {item.explanation && <p className="text-xs text-gray-600">{item.explanation}</p>}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleReview(item.id, 'approved')}
              disabled={actionId === item.id}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
              aria-label={`문제 ${item.id} 승인`}
            >
              {actionId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
              승인
            </button>
            <button
              type="button"
              onClick={() => handleReview(item.id, 'rejected')}
              disabled={actionId === item.id}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 disabled:opacity-50"
              aria-label={`문제 ${item.id} 거절`}
            >
              <XIcon className="h-3 w-3" />
              거절
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Draft Card Component ─────────────────────────────────────────────────

interface DraftCardProps {
  readonly draft: QuizDraft;
  readonly index: number;
  readonly approving: boolean;
  readonly onApprove: () => void;
  readonly onEdit: () => void;
  readonly onRemove: () => void;
}

function DraftCard({ draft, index, approving, onApprove, onEdit, onRemove }: DraftCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
          <p className="text-sm mt-1 whitespace-pre-wrap">{draft.question_text}</p>
        </div>
      </div>

      {draft.case_context && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <p className="text-[10px] font-semibold text-amber-700 mb-1">사례 지문</p>
          <p className="text-xs text-amber-900 whitespace-pre-wrap leading-relaxed">{draft.case_context}</p>
        </div>
      )}

      {draft.options && (
        <div className="pl-4 space-y-1">
          {draft.options.map((opt, i) => (
            <p
              key={`opt-${i}`}
              className={`text-xs ${showAnswer && String(i + 1) === draft.correct_answer ? 'font-bold text-emerald-700' : 'text-gray-600'}`}
            >
              {i + 1}. {opt}
            </p>
          ))}
        </div>
      )}

      {draft.sub_questions && draft.sub_questions.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-gray-500">하위 질문 ({draft.sub_questions.length}개)</p>
          {draft.sub_questions.map((sq) => (
            <div key={sq.id} className="pl-3 border-l-2 border-indigo-200 space-y-0.5">
              <p className="text-xs font-medium">{sq.id}. {sq.question}</p>
              <p className="text-[10px] text-gray-400">유형: {sq.type === 'descriptive' ? '서술형' : '빈칸'}</p>
              {showAnswer && <p className="text-xs text-emerald-700">정답: {sq.answer}</p>}
              {showAnswer && sq.explanation && <p className="text-[10px] text-gray-500">{sq.explanation}</p>}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAnswer(!showAnswer)}
        className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
      >
        {showAnswer ? '정답 숨기기 ▲' : '정답 보기 ▼'}
      </button>

      {showAnswer && (
        <div className="bg-gray-50 rounded-md p-3 space-y-1">
          <p className="text-xs">
            <span className="font-medium text-gray-500">정답:</span>{' '}
            <span className="font-bold text-emerald-700">{draft.correct_answer}</span>
          </p>
          <p className="text-xs text-gray-600">{draft.explanation}</p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onApprove}
          disabled={approving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
          aria-label={`문제 ${index + 1} 초안 저장`}
        >
          {approving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          초안 저장
        </button>

        <Link
          href="/admin/editor/new?from=ai"
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
          aria-label={`문제 ${index + 1} 편집 후 등록`}
        >
          <Pencil className="h-3 w-3" />
          편집 후 등록
        </Link>

        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-xs"
          aria-label={`문제 ${index + 1} 삭제`}
        >
          <Trash2 className="h-3 w-3" />
          삭제
        </button>
      </div>
    </div>
  );
}
