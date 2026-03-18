'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ExternalLink, Trash2, NotebookPen } from 'lucide-react';
import type { ReviewRow } from '@/types/review';

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

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<ReadonlyArray<ReviewRow>>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteValues, setNoteValues] = useState<Record<number, string>>({});
  const [savingNoteId, setSavingNoteId] = useState<number | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews');
      if (!res.ok) return;
      const data: ReviewRow[] = await res.json();
      setReviews(data);
      const notes: Record<number, string> = {};
      for (const r of data) {
        notes[r.id] = r.admin_note ?? '';
      }
      setNoteValues(notes);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const deleteReview = async (id: number) => {
    if (!confirm('이 리뷰를 삭제할까요?')) return;
    setDeletingId(id);
    try {
      const res = await fetch('/api/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  };

  const saveAdminNote = async (id: number) => {
    setSavingNoteId(id);
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, admin_note: noteValues[id] ?? '' }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, admin_note: noteValues[id] ?? '' } : r)),
        );
        setEditingNoteId(null);
      }
    } catch {
      // silent
    } finally {
      setSavingNoteId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
        <MessageSquare className="h-7 w-7" />
        리뷰 대시보드
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        클로즈드 베타 피드백을 관리합니다. ({reviews.length}건)
      </p>

      {loading && (
        <div className="py-20 text-center text-muted-foreground">불러오는 중...</div>
      )}

      {!loading && reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">리뷰가 없습니다</h2>
          <p className="text-muted-foreground">각 페이지의 리뷰 패널에서 피드백을 작성해주세요.</p>
        </div>
      )}

      <div className="space-y-3">
        {reviews.map((review) => (
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
                <button
                  onClick={() => deleteReview(review.id)}
                  disabled={deletingId === review.id}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                  title="삭제"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {review.content}
              </p>

              {/* admin_note */}
              {editingNoteId === review.id ? (
                <div className="space-y-1.5">
                  <textarea
                    value={noteValues[review.id] ?? ''}
                    onChange={(e) =>
                      setNoteValues((prev) => ({ ...prev, [review.id]: e.target.value }))
                    }
                    rows={2}
                    placeholder="관리자 메모..."
                    className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => saveAdminNote(review.id)}
                      disabled={savingNoteId === review.id}
                      className="text-[10px] px-3 py-1 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50"
                    >
                      {savingNoteId === review.id ? '저장...' : '저장'}
                    </button>
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="text-[10px] px-3 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setEditingNoteId(review.id)}
                  className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <NotebookPen className="h-3 w-3" />
                  {review.admin_note
                    ? <span className="text-foreground/70">{review.admin_note}</span>
                    : '메모 추가'}
                </button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
