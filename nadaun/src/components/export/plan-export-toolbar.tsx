'use client'

import { CopyButton } from './copy-button'
import {
  formatGoalsAsText,
  formatWeeklyPlansAsText,
  formatFullPlanAsText,
} from '@/lib/utils/export-formatters'
import type { IepPlan, WeeklyPlan } from '@/types/students'

interface PlanExportToolbarProps {
  plan: IepPlan
  weeklyPlans: WeeklyPlan[]
}

export function PlanExportToolbar({ plan, weeklyPlans }: PlanExportToolbarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <CopyButton
        text={formatGoalsAsText(plan.goals)}
        label="목표 복사"
        ariaLabel="IEP 목표를 클립보드에 복사"
      />
      <CopyButton
        text={formatWeeklyPlansAsText(weeklyPlans, plan.goals)}
        label="주차별 계획 복사"
        ariaLabel="주차별 계획을 클립보드에 복사"
      />
      <CopyButton
        text={formatFullPlanAsText(plan, weeklyPlans)}
        label="전체 복사"
        ariaLabel="전체 IEP 계획을 클립보드에 복사"
      />
      <a
        href={'/api/export/excel?planId=' + plan.id}
        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent"
        aria-label="IEP 계획을 Excel 파일로 다운로드"
      >
        Excel 다운로드
      </a>
      <a
        href={'/api/export/pdf?planId=' + plan.id}
        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent"
        aria-label="IEP 계획을 PDF 파일로 다운로드"
      >
        PDF 다운로드
      </a>
    </div>
  )
}
