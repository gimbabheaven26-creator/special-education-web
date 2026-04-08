'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ThumbsUp, Plus, CheckCircle2, Sparkles, Users, Brain, Award } from 'lucide-react';
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
    <div>
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
        <div className="space-y-6 py-4">
          {/* 소개 배너 */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">함께 만드는 문제은행</h2>
                <p className="text-sm text-muted-foreground">AI가 초안을 만들고, 내가 다듬고, 다 함께 풀어요</p>
              </div>
            </div>
          </div>

          {/* 3단계 안내 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 shrink-0">
                <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">1. AI 초안 생성</p>
                <p className="text-xs text-muted-foreground mt-0.5">과목·유형만 선택하면 AI가 문제를 만들어요</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 shrink-0">
                <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">2. 내 관점으로 수정</p>
                <p className="text-xs text-muted-foreground mt-0.5">AI 초안을 내 경험으로 다듬어요</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0">
                <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">3. 함께 풀고 투표</p>
                <p className="text-xs text-muted-foreground mt-0.5">좋은 문제는 공식 채택돼요</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/community/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors min-h-[48px]"
            >
              <Sparkles className="h-5 w-5" />
              첫 번째 문제 만들기
            </Link>
            <p className="text-xs text-muted-foreground mt-3">로그인 후 이용할 수 있어요</p>
          </div>
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
