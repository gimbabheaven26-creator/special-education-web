'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ExternalLink, Filter } from 'lucide-react';

type ReviewStatus = 'pending' | 'discussing' | 'accepted' | 'rejected';

interface Review {
  id: number;
  path: string;
  content: string;
  reviewer_name: string;
  status: ReviewStatus;
  updated_at: string;
}

const STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: '대기', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/40' },
  discussing: { label: '논의 중', color: 'text-blue-700 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/40' },
  accepted: { label: '반영', color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/40' },
  rejected: { label: '보류', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/40' },
};

const ALL_STATUSES: ReviewStatus[] = ['pending', 'discussing', 'accepted', 'rejected'];

function formatPath(path: string): string {
  if (path === '/') return '홈';
  return path.replace(/^\//, '').replace(/\//g, ' > ').replace(/-/g, ' ');
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${mins}`;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReadonlyArray<Review>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReviewStatus | 'all'>('all');
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews');
      if (!res.ok) return;
      const data = await res.json();
      setReviews(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const updateStatus = async (id: number, status: ReviewStatus) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r)),
        );
      }
    } catch {
      // silent
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'all'
    ? reviews
    : reviews.filter((r) => r.status === filter);

  const statusCounts = reviews.reduce<Record<string, number>>(
    (acc, r) => {
      const s = r.status || 'pending';
      return { ...acc, [s]: (acc[s] || 0) + 1 };
    },
    {},
  );

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
        <MessageSquare className="h-7 w-7" />
        리뷰 대시보드
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        클로즈드 베타 피드백을 관리합니다.
      </p>

      {/* 필터 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
            filter === 'all'
              ? 'border-primary bg-primary/10 text-primary font-medium'
              : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Filter className="h-3 w-3" />
          전체 ({reviews.length})
        </button>
        {ALL_STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s];
          const count = statusCounts[s] || 0;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === s
                  ? `border-current ${cfg.color} ${cfg.bgColor} font-medium`
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* 리뷰 목록 */}
      {loading && (
        <div className="py-20 text-center text-muted-foreground">
          불러오는 중...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {filter === 'all' ? '리뷰가 없습니다' : `${STATUS_CONFIG[filter].label} 상태 리뷰가 없습니다`}
          </h2>
          <p className="text-muted-foreground">
            각 페이지의 리뷰 패널에서 피드백을 작성해주세요.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((review) => {
          const cfg = STATUS_CONFIG[review.status || 'pending'];
          return (
            <Card key={review.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Link
                        href={review.path}
                        className="hover:text-primary transition-colors truncate flex items-center gap-1"
                      >
                        {formatPath(review.path)}
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                      </Link>
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {review.reviewer_name && (
                        <Badge variant="outline" className="text-[10px]">
                          {review.reviewer_name}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(review.updated_at)}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.color} ${cfg.bgColor}`}>
                    {cfg.label}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-wrap mb-3">
                  {review.content}
                </p>
                <div className="flex gap-1.5">
                  {ALL_STATUSES.map((s) => {
                    const sCfg = STATUS_CONFIG[s];
                    const isActive = (review.status || 'pending') === s;
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(review.id, s)}
                        disabled={isActive || updating === review.id}
                        className={`text-[10px] px-2 py-1 rounded-md border transition-colors min-h-[28px] ${
                          isActive
                            ? `${sCfg.color} ${sCfg.bgColor} border-current font-medium`
                            : 'border-border text-muted-foreground hover:text-foreground disabled:opacity-50'
                        }`}
                      >
                        {sCfg.label}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
