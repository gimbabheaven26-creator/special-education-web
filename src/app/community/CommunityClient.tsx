'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ThumbsUp, Plus, CheckCircle2 } from 'lucide-react';
import type { CommunityQuestion, SortOrder } from '@/types/community';

interface Props {
  initialQuestions: CommunityQuestion[];
  subjects: { slug: string; title: string }[];
}

const TYPE_LABEL: Record<string, string> = {
  multiple: '객관식',
  ox: 'OX',
  fill_in: '빈칸',
  descriptive: '서술형',
};

export default function CommunityClient({ initialQuestions, subjects }: Props) {
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [sort, setSort] = useState<SortOrder>('latest');

  const filtered = useMemo(() => {
    let result = [...initialQuestions];
    if (subjectFilter !== 'all') {
      result = result.filter((q) => q.subject_id === subjectFilter);
    }
    if (sort === 'votes') {
      result.sort((a, b) => b.vote_count - a.vote_count);
    } else {
      result.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }
    return result;
  }, [initialQuestions, subjectFilter, sort]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">커뮤니티 문제</h1>
          <p className="text-sm text-muted-foreground mt-1">
            사용자가 제작한 특수교육 문제를 풀어보세요.
          </p>
        </div>
        <Link
          href="/community/create"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          문제 만들기
        </Link>
      </div>

      {/* 필터/정렬 바 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1 rounded-lg border p-1">
          {(['latest', 'votes'] as SortOrder[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                sort === s ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              {s === 'latest' ? '최신순' : '인기순'}
            </button>
          ))}
        </div>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border bg-background text-sm"
        >
          <option value="all">전체 과목</option>
          {subjects.map((s) => (
            <option key={s.slug} value={s.slug}>{s.title}</option>
          ))}
        </select>
      </div>

      {/* 문제 목록 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">아직 문제가 없습니다.</p>
          <p className="text-sm mt-1">첫 번째 문제를 만들어보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <Link
              key={q.id}
              href={`/community/${q.id}`}
              className="block rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
                      {TYPE_LABEL[q.question_type] ?? q.question_type}
                    </span>
                    {q.status === 'official' && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        공식 채택
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{q.question_text}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {q.author_display_name || '익명'} ·{' '}
                    {subjects.find((s) => s.slug === q.subject_id)?.title ?? q.subject_id}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{q.vote_count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
