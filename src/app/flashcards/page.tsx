'use client';

import Link from 'next/link';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const BOX_LABELS: Record<number, string> = {
  1: '박스 1 (매일)',
  2: '박스 2 (2일)',
  3: '박스 3 (4일)',
  4: '박스 4 (8일)',
  5: '박스 5 (16일)',
};

const BOX_COLORS: Record<number, string> = {
  1: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
  2: 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-300',
  3: 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300',
  4: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300',
  5: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300',
};

export default function FlashcardsPage() {
  const getStats = useLeitnerStore((s) => s.getStats);
  const stats = getStats();

  const boxes = [1, 2, 3, 4, 5] as const;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">플래시카드</h1>
        <p className="text-muted-foreground text-sm">
          라이트너 5단계 간격반복으로 효율적으로 암기하세요.
        </p>
      </div>

      {/* Empty state */}
      {stats.total === 0 && (
        <Card className="border-dashed border-2 border-primary/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
                <span className="text-2xl">📇</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">아직 플래시카드가 없어요</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  플래시카드를 추가하면 라이트너 간격반복 시스템으로 효율적으로 암기할 수 있어요.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">카드를 추가하는 방법</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Link
                    href="/flashcards/add"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    직접 카드 만들기
                  </Link>
                  <Link
                    href="/wrong-notes"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted/50 transition-colors"
                  >
                    오답 노트에서 추가하기
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats summary (only when cards exist) */}
      {stats.total > 0 && (
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">전체 카드</span>
            <Badge variant="secondary">{stats.total}장</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">오늘 복습 대상</span>
            <Badge variant={stats.dueToday > 0 ? 'default' : 'outline'}>
              {stats.dueToday}장
            </Badge>
          </div>
        </div>
      )}

      {/* 5 Boxes (only when cards exist) */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {boxes.map((box) => {
            const count = stats[`box${box}` as keyof typeof stats] as number;
            return (
              <div
                key={box}
                className={`rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-colors ${BOX_COLORS[box]}`}
              >
                <span className="text-2xl font-bold">{count}</span>
                <span className="text-xs font-medium text-center leading-tight">
                  {BOX_LABELS[box]}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Leitner rules explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">라이트너 시스템 규칙</CardTitle>
          <CardDescription>맞으면 다음 박스로, 틀리면 박스 1로 돌아갑니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>박스 1 — 매일 복습 (새 카드 / 오답)</li>
            <li>박스 2 — 2일마다 복습</li>
            <li>박스 3 — 4일마다 복습</li>
            <li>박스 4 — 8일마다 복습</li>
            <li>박스 5 — 16일마다 복습 (완전 암기)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {stats.total > 0 && stats.dueToday > 0 ? (
          <Button
            size="lg"
            className="flex-1"
            render={<Link href="/flashcards/review" />}
          >
            오늘의 복습 시작 ({stats.dueToday}장)
          </Button>
        ) : stats.total > 0 ? (
          <Button size="lg" className="flex-1" disabled>
            오늘 복습할 카드가 없어요
          </Button>
        ) : null}
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          render={<Link href="/flashcards/add" />}
        >
          + 카드 추가하기
        </Button>
      </div>
    </main>
  );
}
