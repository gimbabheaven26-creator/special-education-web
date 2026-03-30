'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { duplicateIepPlan } from '@/lib/actions/weekly-plans'

interface DuplicatePlanButtonProps {
  planId: string
  studentId: string
  planTitle: string
}

export function DuplicatePlanButton({
  planId,
  studentId,
  planTitle,
}: DuplicatePlanButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // 기본값: 오늘부터 6개월
  const today = new Date()
  const sixMonthsLater = new Date(today)
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6)

  const [periodStart, setPeriodStart] = useState(
    today.toISOString().slice(0, 10),
  )
  const [periodEnd, setPeriodEnd] = useState(
    sixMonthsLater.toISOString().slice(0, 10),
  )

  function handleDuplicate() {
    setError(null)
    startTransition(async () => {
      const result = await duplicateIepPlan(
        planId,
        studentId,
        periodStart,
        periodEnd,
      )
      if (result.error) {
        setError(result.error)
      } else if (result.planId) {
        router.push(`/students/${studentId}/plans/${result.planId}`)
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm" aria-label={`"${planTitle}" 복제`} />
        }
      >
        복제
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>계획 복제</AlertDialogTitle>
          <AlertDialogDescription>
            &quot;{planTitle}&quot;을 기반으로 새 학기 계획을 생성합니다.
            목표와 주차 구조가 복사되고, 날짜만 변경됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label htmlFor="dup-start">시작일</Label>
            <Input
              id="dup-start"
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dup-end">종료일</Label>
            <Input
              id="dup-end"
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDuplicate}
            disabled={isPending}
          >
            {isPending ? '복제 중...' : '복제하기'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
