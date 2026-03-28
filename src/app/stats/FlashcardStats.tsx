'use client';

import Link from 'next/link';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BOX_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-emerald-400',
  'bg-emerald-600',
];

const BOX_LABELS = ['Box 1', 'Box 2', 'Box 3', 'Box 4', 'Box 5'];

export default function FlashcardStats() {
  const stats = useLeitnerStore((s) => s.getStats());

  if (stats.total === 0) return null;

  const boxes = [stats.box1, stats.box2, stats.box3, stats.box4, stats.box5];
  const maxBox = Math.max(...boxes, 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">플래시카드 진행률</CardTitle>
          <span className="text-xs text-muted-foreground">
            총 {stats.total}장
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Box distribution */}
        <div className="flex items-end gap-2" role="img" aria-label={`플래시카드 Box 분포: ${boxes.map((c, i) => `Box ${i + 1}: ${c}장`).join(', ')}`}>
          {boxes.map((count, i) => {
            const height = Math.max(Math.round((count / maxBox) * 60), count > 0 ? 8 : 2);
            return (
              <div key={i} className="flex flex-col items-center flex-1" aria-hidden="true">
                {count > 0 && (
                  <span className="text-[10px] text-muted-foreground mb-1">{count}</span>
                )}
                <div className="w-full flex flex-col justify-end" style={{ height: '60px' }}>
                  <div
                    className={`w-full rounded-t ${BOX_COLORS[i]}`}
                    style={{ height: `${height}px` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground mt-1">{BOX_LABELS[i]}</span>
              </div>
            );
          })}
        </div>

        {/* Due today */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">오늘 복습할 카드</span>
          <span className="font-medium">
            {stats.dueToday > 0 ? (
              <span className="text-amber-600 dark:text-amber-400">{stats.dueToday}장</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">없음</span>
            )}
          </span>
        </div>

        {/* Action link */}
        <div className="flex gap-3">
          <Link
            href="/flashcards/review"
            className="text-xs text-primary hover:underline"
          >
            플래시카드 복습
          </Link>
          <Link
            href="/flashcards"
            className="text-xs text-muted-foreground hover:text-primary hover:underline"
          >
            카드 관리
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
