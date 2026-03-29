'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
import { WeeklyPlanForm } from './weekly-plan-form'
import type { WeeklyPlan, IepGoal } from '@/types/students'

interface WeeklyPlanItemProps {
  weeklyPlan: WeeklyPlan
  planGoals: IepGoal[]
  isEditing: boolean
  isDeletingThis: boolean
  isPending: boolean
  editError: string | null
  onEdit: (id: string) => void
  onCancelEdit: () => void
  onSubmitEdit: (formData: FormData) => void
  onDelete: (id: string) => void
}

export function WeeklyPlanItem({
  weeklyPlan: wp,
  planGoals,
  isEditing,
  isDeletingThis,
  isPending,
  editError,
  onEdit,
  onCancelEdit,
  onSubmitEdit,
  onDelete,
}: WeeklyPlanItemProps) {
  const linkedGoal = planGoals.find(
    (g) => g.achievement_standard_id === wp.achievement_standard_id,
  )

  if (isEditing) {
    return (
      <WeeklyPlanForm
        planGoals={planGoals}
        onSubmit={onSubmitEdit}
        onCancel={onCancelEdit}
        error={editError}
        isPending={isPending}
        submitLabel="저장"
        pendingLabel="저장 중..."
        idPrefix={`edit-${wp.id}`}
        defaultValues={{
          week_number: wp.week_number,
          achievement_standard_id: wp.achievement_standard_id,
          activity: wp.activity,
          materials: wp.materials,
          evaluation_method: wp.evaluation_method,
          notes: wp.notes,
        }}
      />
    )
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="default">{wp.week_number}주차</Badge>
              {linkedGoal && (
                <Badge variant="outline">
                  {linkedGoal.achievement_standard_code}
                </Badge>
              )}
            </div>
            <p className="text-sm">{wp.activity}</p>
            {wp.materials && (
              <p className="text-xs text-muted-foreground">
                자료: {wp.materials}
              </p>
            )}
            {wp.evaluation_method && (
              <p className="text-xs text-muted-foreground">
                평가: {wp.evaluation_method}
              </p>
            )}
            {wp.notes && (
              <p className="text-xs text-muted-foreground">
                비고: {wp.notes}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(wp.id)}
              aria-label={`${wp.week_number}주차 수정`}
            >
              &#9998;
            </Button>
            <AlertDialog>
              <AlertDialogTrigger
                render={<Button variant="ghost" size="icon-xs" />}
                aria-label={`${wp.week_number}주차 삭제`}
              >
                &times;
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>주차 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    {wp.week_number}주차 계획을 삭제하시겠습니까?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(wp.id)}
                    disabled={isDeletingThis}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeletingThis ? '삭제 중...' : '삭제'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
