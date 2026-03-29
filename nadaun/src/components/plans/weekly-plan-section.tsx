'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WeeklyPlanItem } from './weekly-plan-item'
import { AddWeeklyPlanForm } from './add-weekly-plan-form'
import type { WeeklyPlan, IepGoal } from '@/types/students'

interface WeeklyPlanSectionProps {
  iepPlanId: string
  studentId: string
  weeklyPlans: WeeklyPlan[]
  planGoals: IepGoal[]
}

export function WeeklyPlanSection({
  iepPlanId,
  studentId,
  weeklyPlans,
  planGoals,
}: WeeklyPlanSectionProps) {
  const [showForm, setShowForm] = useState(false)

  const nextWeekNumber =
    weeklyPlans.length > 0
      ? Math.max(...weeklyPlans.map((w) => w.week_number)) + 1
      : 1

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          주차별 계획 ({weeklyPlans.length}개)
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          aria-label={showForm ? '주차 추가 취소' : '주차 추가'}
        >
          {showForm ? '취소' : '+ 주차 추가'}
        </Button>
      </div>

      {showForm && (
        <AddWeeklyPlanForm
          iepPlanId={iepPlanId}
          studentId={studentId}
          planGoals={planGoals}
          nextWeekNumber={nextWeekNumber}
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {weeklyPlans.length === 0 && !showForm && (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            아직 주차별 계획이 없습니다.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {weeklyPlans.map((wp) => (
          <WeeklyPlanItem
            key={wp.id}
            weeklyPlan={wp}
            allWeeklyPlans={weeklyPlans}
            iepPlanId={iepPlanId}
            studentId={studentId}
            planGoals={planGoals}
          />
        ))}
      </div>
    </div>
  )
}
