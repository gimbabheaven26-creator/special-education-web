'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { WeeklyPlan, WeeklyPlanStatus } from '@/types/students'

const STATUS_BG: Record<WeeklyPlanStatus, string> = {
  planned: 'bg-muted',
  in_progress: 'bg-blue-100 dark:bg-blue-900/30',
  completed: 'bg-green-100 dark:bg-green-900/30',
}
const STATUS_TEXT: Record<WeeklyPlanStatus, string> = {
  planned: 'text-muted-foreground',
  in_progress: 'text-blue-800 dark:text-blue-300',
  completed: 'text-green-800 dark:text-green-300',
}

interface CalendarViewProps {
  weeklyPlans: WeeklyPlan[]
  periodStart: string
}

export function CalendarView({ weeklyPlans, periodStart }: CalendarViewProps) {
  const now = new Date()
  const start = new Date(periodStart)
  const diffMs = now.getTime() - start.getTime()
  const currentWeek = Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)))

  const maxWeek = weeklyPlans.length > 0
    ? Math.max(...weeklyPlans.map((wp) => wp.week_number))
    : currentWeek

  const planMap = new Map<number, WeeklyPlan>()
  for (const wp of weeklyPlans) {
    planMap.set(wp.week_number, wp)
  }

  const weeks = Array.from({ length: maxWeek }, (_, i) => i + 1)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-muted" /> 예정
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-blue-100 dark:bg-blue-900/30" /> 진행 중
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-green-100 dark:bg-green-900/30" /> 완료
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8">
        {weeks.map((weekNum) => {
          const wp = planMap.get(weekNum)
          const status: WeeklyPlanStatus = wp?.status ?? 'planned'
          const isCurrent = weekNum === currentWeek
          const hasRating = wp?.achievement_rating != null

          return (
            <Card
              key={weekNum}
              size="sm"
              className={`relative ${isCurrent ? 'ring-2 ring-primary' : ''}`}
            >
              <CardContent className={`p-2 ${STATUS_BG[status]}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${STATUS_TEXT[status]}`}>
                    {weekNum}주
                  </span>
                  {hasRating && (
                    <span className="text-xs">
                      {wp?.achievement_rating === 'exceeded'
                        ? '◎'
                        : wp?.achievement_rating === 'met'
                          ? '○'
                          : '△'}
                    </span>
                  )}
                </div>
                {wp && (
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {wp.activity}
                  </p>
                )}
                {isCurrent && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
