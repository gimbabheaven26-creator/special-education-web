import { Trophy, Medal, Crown } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

interface RankEntry {
  user_id: string;
  nickname: string;
  total_xp: number;
  current_streak: number;
}

async function getWeeklyRanking(): Promise<RankEntry[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_weekly_ranking', {
      limit_count: 20,
    });
    if (error || !data) return [];
    return data as RankEntry[];
  } catch {
    return [];
  }
}

const RANK_ICONS = [
  <Crown key="1" className="h-4 w-4 text-amber-500" aria-hidden="true" />,
  <Medal key="2" className="h-4 w-4 text-gray-400" aria-hidden="true" />,
  <Medal key="3" className="h-4 w-4 text-amber-700" aria-hidden="true" />,
];

export async function WeeklyRanking() {
  const ranking = await getWeeklyRanking();

  if (ranking.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" aria-hidden="true" />
          <h2 className="text-sm font-bold">주간 학습 랭킹</h2>
        </div>
        <p className="text-xs text-muted-foreground text-center py-4">
          아직 랭킹 참여자가 없어요. 내 기록 페이지에서 참여할 수 있어요!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-amber-500" aria-hidden="true" />
        <h2 className="text-sm font-bold">주간 학습 랭킹</h2>
        <span className="text-[10px] text-muted-foreground ml-auto">XP 기준</span>
      </div>

      <div className="space-y-1.5">
        {ranking.map((entry, i) => (
          <div
            key={entry.user_id}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${
              i === 0
                ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50'
                : 'hover:bg-muted/50'
            }`}
          >
            <span className="w-6 text-center shrink-0">
              {i < 3 ? RANK_ICONS[i] : (
                <span className="text-xs text-muted-foreground tabular-nums">{i + 1}</span>
              )}
            </span>
            <span className="flex-1 truncate font-medium">
              {entry.nickname}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums shrink-0">
              {entry.total_xp.toLocaleString()} XP
            </span>
            {entry.current_streak > 0 && (
              <span className="text-[10px] text-orange-500 shrink-0" aria-label={`${entry.current_streak}일 연속 학습`}>
                🔥{entry.current_streak}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
