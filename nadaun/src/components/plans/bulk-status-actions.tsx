'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { bulkUpdateWeeklyPlanStatus } from '@/lib/actions/weekly-plans'
import { showSuccess } from '@/lib/utils/toast'
import type { WeeklyPlan, WeeklyPlanStatus } from '@/types/students'

const STATUS_OPTIONS: Array<{ value: WeeklyPlanStatus; label: string }> = [
  { value: 'planned', label: '예정' },
  { value: 'in_progress', label: '진행 중' },
  { value: 'completed', label: '완료' },
]

interface BulkStatusActionsProps {
  weeklyPlans: WeeklyPlan[]
  iepPlanId: string
  studentId: string
}

export function BulkStatusActions({
  weeklyPlans,
  iepPlanId,
  studentId,
}: BulkStatusActionsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)
  const [isPending, startTransition] = useTransition()

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function selectAll() {
    setSelectedIds(new Set(weeklyPlans.map((wp) => wp.id)))
  }

  function clearSelection() {
    setSelectedIds(new Set())
    setIsSelecting(false)
  }

  function handleBulkUpdate(status: WeeklyPlanStatus) {
    if (selectedIds.size === 0) return
    startTransition(async () => {
      await bulkUpdateWeeklyPlanStatus(
        Array.from(selectedIds),
        iepPlanId,
        studentId,
        status,
      )
      showSuccess(`${selectedIds.size}개 주차 상태 변경 완료`)
      clearSelection()
    })
  }

  if (!isSelecting) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsSelecting(true)}
        aria-label="주차 일괄 선택 모드"
      >
        일괄 변경
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {selectedIds.size}개 선택
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={selectAll}
        >
          전체 선택
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={clearSelection}
        >
          취소
        </Button>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={isPending}
              onClick={() => handleBulkUpdate(opt.value)}
              aria-label={`선택된 주차를 '${opt.label}'로 변경`}
            >
              {isPending ? '...' : `→ ${opt.label}`}
            </Button>
          ))}
        </div>
      )}

      {/* 체크박스 목록 */}
      <div className="space-y-1">
        {weeklyPlans.map((wp) => (
          <label
            key={wp.id}
            className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer hover:bg-accent transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedIds.has(wp.id)}
              onChange={() => toggleSelect(wp.id)}
              className="h-4 w-4 rounded border-input"
              aria-label={`${wp.week_number}주차 선택`}
            />
            <span className="text-xs font-medium">{wp.week_number}주차</span>
            <span className="text-xs text-muted-foreground truncate">
              {wp.activity}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              {wp.status === 'planned' ? '예정' : wp.status === 'in_progress' ? '진행 중' : '완료'}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
