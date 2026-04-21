'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, Check, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';
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

  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [type, setType] = useState('ox');
  const [difficulty, setDifficulty] = useState(2);
  const [keyword, setKeyword] = useState('');
  const [count, setCount] = useState(1);
  const [approvedCount, setApprovedCount] = useState(0);

  const filteredChapters = useMemo(
    () => chapters.filter((c) => c.subject_slug === subject),
    [chapters, subject],
  );

  function handleSubjectChange(slug: string) {
    setSubject(slug);
    setChapter('');
  }

  async function handleGenerate() {
    if (!subject) return;
    const actualCount = type === 'scenario_composite' ? 1 : count;
    const input: GenerateInput = { subject, type, difficulty, count: actualCount };
    if (chapter) input.chapter = chapter;
    if (keyword.trim()) input.keyword = keyword.trim();
    await generate(input);
  }

  async function handleApprove(index: number) {
    const ok = await approve(index);
    if (ok) setApprovedCount((prev) => prev + 1);
  }

  function handleEditAndSave(draft: QuizDraft) {
    sessionStorage.setItem('ai-draft', JSON.stringify(draft));
    sessionStorage.setItem('ai-draft-meta', JSON.stringify({ subject, chapter, type, difficulty }));
  }

  const subjectTitle = subjects.find((s) => s.slug === subject)?.title ?? subject;

  return (
    <div className="space-y-8">
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
              className="w-full border rounded-md px-3 py-2 text-sm"
              aria-label="과목 선택"
            >
              <option value="">선택하세요</option>
              {subjects.map((s) => (
                <option key={s.slug} value={s.slug}>{s.title}</option>
              ))}
            </select>
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
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full border rounded-md px-3 py-2 text-sm"
              aria-label="생성 수량 선택"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}개</option>
              ))}
            </select>
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

      {/* Approved count */}
      {approvedCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
          <Check className="h-4 w-4" />
          {approvedCount}개 문제가 DB에 저장되었습니다.
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
              key={`${draft.question_text.slice(0, 20)}-${index}`}
              draft={draft}
              index={index}
              approving={approvingIndex === index}
              onApprove={() => handleApprove(index)}
              onEdit={() => handleEditAndSave(draft)}
              onRemove={() => remove(index)}
            />
          ))}
        </div>
      )}
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
              className={`text-xs ${String(i + 1) === draft.correct_answer ? 'font-bold text-emerald-700' : 'text-gray-600'}`}
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
              <p className="text-xs text-emerald-700">정답: {sq.answer}</p>
              {sq.explanation && <p className="text-[10px] text-gray-500">{sq.explanation}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-50 rounded-md p-3 space-y-1">
        <p className="text-xs">
          <span className="font-medium text-gray-500">정답:</span>{' '}
          <span className="font-bold text-emerald-700">{draft.correct_answer}</span>
        </p>
        <p className="text-xs text-gray-600">{draft.explanation}</p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onApprove}
          disabled={approving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
          aria-label={`문제 ${index + 1} 바로 승인`}
        >
          {approving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          바로 승인
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
