'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import {
  updateIepPlanStatus,
  deleteIepPlan,
} from '@/lib/actions/iep-plans'

interface PlanStatusActionsProps {
  planId: string
  studentId: string
  currentStatus: 'draft' | 'active' | 'completed'
}

const STATUS_TRANSITIONS: Record<
  string,
  { label: string; next: 'draft' | 'active' | 'completed' }[]
> = {
  draft: [{ label: '시작하기', next: 'active' }],
  active: [
    { label: '완료 처리', next: 'completed' },
    { label: '초안으로 되돌리기', next: 'draft' },
  ],
  completed: [{ label: '다시 진행', next: 'active' }],
}

export function PlanStatusActions({
  planId,
  studentId,
  currentStatus,
}: PlanStatusActionsProps) {
  const [isPending, setIsPending] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleStatusChange(newStatus: 'draft' | 'active' | 'completed') {
    setIsPending(true)
    await updateIepPlanStatus(planId, studentId, newStatus)
    setIsPending(false)
  }

  async function handleDelete() {
    setIsDeleting(true)
    await deleteIepPlan(planId, studentId)
  }

  const transitions = STATUS_TRANSITIONS[currentStatus] ?? []

  return (
    <div className="flex items-center gap-2">
      {transitions.map((t) => (
        <Button
          key={t.next}
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => handleStatusChange(t.next)}
          aria-label={t.label}
        >
          {isPending ? '처리 중...' : t.label}
        </Button>
      ))}

      <AlertDialog>
        <AlertDialogTrigger
          render={<Button variant="destructive" size="sm" />}
          aria-label="IEP 계획 삭제"
        >
          삭제
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>IEP 계획 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 IEP 계획과 모든 주차별 계획이 삭제됩니다. 이 작업은 되돌릴 수
              없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
