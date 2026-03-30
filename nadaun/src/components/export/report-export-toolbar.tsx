'use client'

import { CopyButton } from './copy-button'
import { formatReportAsText } from '@/lib/utils/export-formatters'
import type {
  Student,
  IepPlan,
  GoalAchievementSummary,
  AchievementRating,
} from '@/types/students'
import type { WeeklyPlanProgress } from '@/lib/queries/students'

interface ReportExportToolbarProps {
  student: Student
  plan: IepPlan
  progress: WeeklyPlanProgress
  goalSummaries: GoalAchievementSummary[]
  observations: Array<{ weekNumber: number; notes: string; rating: AchievementRating }>
}

export function ReportExportToolbar({
  student,
  plan,
  progress,
  goalSummaries,
  observations,
}: ReportExportToolbarProps) {
  const reportText = formatReportAsText(
    student,
    plan,
    progress,
    goalSummaries,
    observations,
  )

  return (
    <div className="flex flex-wrap gap-2">
      <CopyButton
        text={reportText}
        label="보고서 복사"
        ariaLabel="진행 보고서를 클립보드에 복사"
      />
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="보고서 인쇄 또는 PDF 저장"
      >
        인쇄 / PDF
      </button>
    </div>
  )
}
