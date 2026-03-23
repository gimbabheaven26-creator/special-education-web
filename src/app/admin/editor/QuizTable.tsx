'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCallback, useState, useTransition } from 'react';

const TYPE_LABELS: Record<string, string> = {
  multiple: '객관식',
  ox: 'OX',
  fill_in: '빈칸채우기',
  descriptive: '서술형',
  scenario_composite: '시나리오',
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: '기본',
  2: '심화',
  3: '고난도',
};

interface QuizRow {
  id: string;
  subject: string;
  chapter: string;
  type: string;
  difficulty: number;
  question: string;
}

interface Filters {
  page: number;
  subject: string;
  chapter: string;
  type: string;
  difficulty: string;
  search: string;
}

interface QuizTableProps {
  rows: QuizRow[];
  subjects: { slug: string; title: string }[];
  chapters: { slug: string; title: string }[];
  filters: Filters;
  totalPages: number;
  total: number;
}

export function QuizTable({ rows, subjects, chapters, filters, totalPages, total }: QuizTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const subjectTitleMap = new Map(subjects.map((s) => [s.slug, s.title]));

  const buildUrl = useCallback((overrides: Partial<Filters>) => {
    const merged = { ...filters, ...overrides };
    // 페이지 외 필터 변경 시 1페이지로 리셋
    if ('subject' in overrides || 'chapter' in overrides || 'type' in overrides || 'difficulty' in overrides || 'search' in overrides) {
      merged.page = 1;
    }
    const params = new URLSearchParams();
    if (merged.page > 1) params.set('page', String(merged.page));
    if (merged.subject) params.set('subject', merged.subject);
    if (merged.chapter) params.set('chapter', merged.chapter);
    if (merged.type) params.set('type', merged.type);
    if (merged.difficulty) params.set('difficulty', merged.difficulty);
    if (merged.search) params.set('search', merged.search);
    const qs = params.toString();
    return `/admin/editor${qs ? `?${qs}` : ''}`;
  }, [filters]);

  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    const overrides: Partial<Filters> = { [key]: value };
    // 과목 변경 시 챕터 초기화
    if (key === 'subject') {
      overrides.chapter = '';
    }
    startTransition(() => {
      router.push(buildUrl(overrides));
    });
  }, [buildUrl, router]);

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = (formData.get('search') as string) || '';
    startTransition(() => {
      router.push(buildUrl({ search: searchValue }));
    });
  }, [buildUrl, router]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('이 문항을 삭제하시겠습니까?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/quiz/${id}`, { method: 'DELETE' });
      if (res.ok) {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch {
      // 삭제 실패 시 상태 복원
    } finally {
      setDeletingId(null);
    }
  }, [router]);

  const handlePageChange = useCallback((newPage: number) => {
    startTransition(() => {
      router.push(buildUrl({ page: newPage }));
    });
  }, [buildUrl, router]);

  function truncate(text: string, maxLen: number) {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '...';
  }

  return (
    <div className={isPending ? 'opacity-60 pointer-events-none' : ''}>
      {/* 필터 영역 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {/* 과목 */}
          <select
            value={filters.subject}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">전체 과목</option>
            {subjects.map((s) => (
              <option key={s.slug} value={s.slug}>{s.title}</option>
            ))}
          </select>

          {/* 챕터 */}
          <select
            value={filters.chapter}
            onChange={(e) => handleFilterChange('chapter', e.target.value)}
            disabled={!filters.subject}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">전체 챕터</option>
            {chapters.map((c) => (
              <option key={c.slug} value={c.slug}>{c.title}</option>
            ))}
          </select>

          {/* 유형 */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">전체 유형</option>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* 난이도 */}
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">전체 난이도</option>
            {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* 검색 */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            name="search"
            type="text"
            defaultValue={filters.search}
            placeholder="문제 내용 검색..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-900"
          >
            검색
          </button>
        </form>
      </div>

      {/* 결과 요약 */}
      <p className="text-sm text-gray-500 mb-3">
        총 {total.toLocaleString()}건
        {totalPages > 1 && ` (${filters.page} / ${totalPages} 페이지)`}
      </p>

      {rows.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-400">
          조건에 맞는 문항이 없습니다.
        </div>
      ) : (
        <>
          {/* 데스크톱 테이블 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full bg-white rounded-lg border border-gray-200 text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-3 py-2.5 font-medium text-gray-600 w-20">ID</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-600">과목</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-600">챕터</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-600 w-24">유형</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-600 w-20">난이도</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-600">문제</th>
                  <th className="text-right px-3 py-2.5 font-medium text-gray-600 w-24">작업</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-gray-400 font-mono text-xs">
                      {row.id.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2.5">
                      {subjectTitleMap.get(row.subject) ?? row.subject}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">{row.chapter}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                        {TYPE_LABELS[row.type] ?? row.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        row.difficulty === 1 ? 'bg-green-50 text-green-700' :
                        row.difficulty === 2 ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {DIFFICULTY_LABELS[row.difficulty] ?? row.difficulty}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 max-w-xs">
                      {truncate(row.question, 60)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/editor/${row.id}`}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          수정
                        </Link>
                        <button
                          onClick={() => handleDelete(row.id)}
                          disabled={deletingId === row.id}
                          className="text-red-500 hover:text-red-700 text-xs disabled:opacity-50"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 레이아웃 */}
          <div className="md:hidden space-y-3">
            {rows.map((row) => (
              <div key={row.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                      {TYPE_LABELS[row.type] ?? row.type}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                      row.difficulty === 1 ? 'bg-green-50 text-green-700' :
                      row.difficulty === 2 ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {DIFFICULTY_LABELS[row.difficulty] ?? row.difficulty}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{row.id.slice(0, 8)}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">{row.question}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {subjectTitleMap.get(row.subject) ?? row.subject} &middot; {row.chapter}
                  </p>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/editor/${row.id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(row.id)}
                      disabled={deletingId === row.id}
                      className="text-red-500 hover:text-red-700 text-xs disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page <= 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <span className="text-sm text-gray-600 px-3">
            {filters.page} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page >= totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
