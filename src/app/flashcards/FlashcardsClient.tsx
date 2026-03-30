'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLeitnerStore, type LeitnerCard } from '@/stores/useLeitnerStore';
import { useMounted } from '@/hooks/useMounted';
import type { Subject } from '@/types/content';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Trash2, Plus, Play, ChevronDown, ChevronUp } from 'lucide-react';

const BOX_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: '박스 1 · 매일', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' },
  2: { label: '박스 2 · 2일', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' },
  3: { label: '박스 3 · 4일', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' },
  4: { label: '박스 4 · 8일', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' },
  5: { label: '박스 5 · 16일', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' },
};

function BoxDistribution({ stats }: { stats: ReturnType<typeof useLeitnerStore.getState>['getStats'] extends () => infer R ? R : never }) {
  const total = stats.total;
  if (total === 0) return null;

  const boxes = [
    { box: 1, count: stats.box1, color: 'bg-red-500' },
    { box: 2, count: stats.box2, color: 'bg-orange-500' },
    { box: 3, count: stats.box3, color: 'bg-amber-500' },
    { box: 4, count: stats.box4, color: 'bg-emerald-500' },
    { box: 5, count: stats.box5, color: 'bg-blue-500' },
  ];

  return (
    <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted" role="img" aria-label={`박스 분포: ${boxes.map(b => `박스${b.box} ${b.count}장`).join(', ')}`}>
      {boxes.map((b) =>
        b.count > 0 ? (
          <div
            key={b.box}
            className={`${b.color} transition-all`}
            style={{ width: `${(b.count / total) * 100}%` }}
          />
        ) : null
      )}
    </div>
  );
}

function CardItem({
  card,
  subjectTitle,
  onDelete,
}: {
  card: LeitnerCard;
  subjectTitle: string;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border p-3 space-y-1.5 group">
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 text-left text-sm font-medium leading-relaxed hover:text-primary transition-colors"
          aria-expanded={expanded}
          aria-label={expanded ? '답 접기' : '답 보기'}
        >
          {card.question}
        </button>
        <button
          onClick={() => onDelete(card.id)}
          className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label={`"${card.question}" 카드 삭제`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>{subjectTitle}</span>
        <span>·</span>
        <span>다음 복습: {card.nextReview}</span>
      </div>
      {expanded && (
        <div className="mt-2 pt-2 border-t border-border text-sm text-muted-foreground leading-relaxed">
          {card.answer}
        </div>
      )}
    </div>
  );
}

export default function FlashcardsClient({ subjects }: { subjects: Subject[] }) {
  const mounted = useMounted();
  const cards = useLeitnerStore((s) => s.cards);
  const getStats = useLeitnerStore((s) => s.getStats);
  const removeCard = useLeitnerStore((s) => s.removeCard);
  const [expandedBoxes, setExpandedBoxes] = useState<Set<number>>(new Set([1]));

  const subjectMap = new Map(subjects.map((s) => [s.slug, s.title]));

  if (!mounted) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="h-7 w-40 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4 space-y-2">
              <div className="h-5 w-32 rounded bg-muted animate-pulse" />
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (cards.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          icon="🃏"
          title="플래시카드가 아직 없어요"
          description="나만의 플래시카드를 만들어 간격반복으로 효율적으로 암기하세요. 용어, 법령, 핵심 개념 등 시험에 자주 나오는 내용을 카드로 정리해보세요."
          action={{ label: '첫 카드 만들기', href: '/flashcards/add', ariaLabel: '플래시카드 추가 페이지로 이동' }}
        />
      </main>
    );
  }

  const stats = getStats();

  const toggleBox = (box: number) => {
    setExpandedBoxes((prev) => {
      const next = new Set(prev);
      if (next.has(box)) next.delete(box);
      else next.add(box);
      return next;
    });
  };

  const cardsByBox = new Map<number, LeitnerCard[]>();
  for (const card of cards) {
    const list = cardsByBox.get(card.box) ?? [];
    list.push(card);
    cardsByBox.set(card.box, list);
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">플래시카드</h1>
          <p className="text-sm text-muted-foreground mt-1">
            총 {stats.total}장 · 오늘 복습 대상 {stats.dueToday}장
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] gap-1.5"
            render={<Link href="/flashcards/add" />}
            aria-label="카드 추가"
          >
            <Plus className="h-4 w-4" />
            추가
          </Button>
          {stats.dueToday > 0 && (
            <Button
              size="sm"
              className="min-h-[44px] gap-1.5"
              render={<Link href="/flashcards/review" />}
              aria-label={`오늘 복습 시작 (${stats.dueToday}장)`}
            >
              <Play className="h-4 w-4" />
              복습 ({stats.dueToday})
            </Button>
          )}
        </div>
      </div>

      {/* Box distribution bar */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <BoxDistribution stats={stats} />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            {[1, 2, 3, 4, 5].map((box) => {
              const count = [stats.box1, stats.box2, stats.box3, stats.box4, stats.box5][box - 1];
              return (
                <span key={box} className={count > 0 ? BOX_LABELS[box].color : ''}>
                  박스{box}: {count}
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Box groups */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((box) => {
          const boxCards = cardsByBox.get(box) ?? [];
          if (boxCards.length === 0) return null;

          const meta = BOX_LABELS[box];
          const isExpanded = expandedBoxes.has(box);

          return (
            <div key={box} className={`rounded-xl border ${meta.bg} overflow-hidden`}>
              <button
                onClick={() => toggleBox(box)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                aria-expanded={isExpanded}
                aria-label={`${meta.label} (${boxCards.length}장) ${isExpanded ? '접기' : '펼치기'}`}
              >
                <span className={`text-sm font-semibold ${meta.color}`}>
                  {meta.label}
                  <span className="ml-2 font-normal text-muted-foreground">{boxCards.length}장</span>
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  {boxCards.map((card) => (
                    <CardItem
                      key={card.id}
                      card={card}
                      subjectTitle={subjectMap.get(card.subjectSlug) ?? card.subjectSlug}
                      onDelete={removeCard}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA when no cards are due */}
      {stats.dueToday === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">
            오늘 복습할 카드가 없어요. 새 카드를 추가하면 바로 학습할 수 있어요.
          </p>
          <Button
            variant="outline"
            className="min-h-[44px] gap-1.5"
            render={<Link href="/flashcards/add" />}
          >
            <Plus className="h-4 w-4" />
            카드 추가하기
          </Button>
        </div>
      )}
    </main>
  );
}
