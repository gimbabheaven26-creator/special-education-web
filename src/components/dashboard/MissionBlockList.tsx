'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Layers, Brain, BookOpen, Check } from 'lucide-react';
import { useFocusStore, isMissionStale } from '@/stores/useFocusStore';
import { useStudyStore } from '@/stores/useStudyStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { useMounted } from '@/hooks/useMounted';
import { generateDailyMission } from '@/lib/study/focus-utils';
import type { MissionBlock, MissionBlockType } from '@/types/study';

const BLOCK_CONFIG: Record<
  MissionBlockType,
  { icon: typeof Brain; color: string; bg: string }
> = {
  'wrong-review': {
    icon: RotateCcw,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
  flashcard: {
    icon: Layers,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
  },
  quiz: {
    icon: Brain,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  term: {
    icon: BookOpen,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
};

function MissionBlockCard({ block }: { block: MissionBlock }) {
  const completeMissionBlock = useFocusStore((s) => s.completeMissionBlock);
  const config = BLOCK_CONFIG[block.type];
  const Icon = config.icon;

  if (block.completed) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 opacity-60">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-green-100 dark:bg-green-950/30">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground line-through">
            {block.label}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={block.href}
      onClick={() => completeMissionBlock(block.id)}
      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors group"
    >
      <div className={'flex items-center justify-center h-9 w-9 rounded-lg ' + config.bg}>
        <Icon className={'h-4 w-4 ' + config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{block.label}</p>
        <p className="text-xs text-muted-foreground">{block.description}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        ~{block.estimatedMinutes}분
      </span>
    </Link>
  );
}

export function MissionBlockList() {
  const mounted = useMounted();
  const todayMission = useFocusStore((s) => s.todayMission);
  const focusSubject = useFocusStore((s) => s.focusSubject);
  const setTodayMission = useFocusStore((s) => s.setTodayMission);
  const wrongNotes = useStudyStore((s) => {
    const entries = s.dailyHistory;
    const total = entries.reduce(
      (sum, e) => sum + (e.questionsAttempted - e.questionsCorrect),
      0
    );
    return Math.max(total, 0);
  });
  const dueFlashcardCount = useLeitnerStore((s) => s.getDueCards().length);
  const todayQuizCount = useStudyStore((s) => s.dailyProgress.quizzesCompleted);

  useEffect(() => {
    if (!mounted) return;
    if (isMissionStale(todayMission)) {
      const mission = generateDailyMission({
        focusSubject,
        wrongNoteCount: wrongNotes,
        dueFlashcardCount,
        todayQuizCount,
      });
      setTodayMission(mission);
    }
  }, [mounted, todayMission, focusSubject, wrongNotes, dueFlashcardCount, todayQuizCount, setTodayMission]);

  if (!mounted || !todayMission) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  const completedCount = todayMission.blocks.filter((b) => b.completed).length;
  const totalCount = todayMission.blocks.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">오늘의 미션</h2>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{totalCount} 완료
        </span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: progressPercent + '%' }}
        />
      </div>

      <div className="space-y-2">
        {todayMission.blocks.map((block) => (
          <MissionBlockCard key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}
