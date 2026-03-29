'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { updateWeeklyPlan, deleteWeeklyPlan } from '@/lib/actions/weekly-plans'
import type { WeeklyPlan, IepGoal } from '@/types/students'

interface WeeklyPlanItemProps {
  weeklyPlan: WeeklyPlan
  allWeeklyPlans: WeeklyPlan[]
  iepPlanId: string
  studentId: string
  planGoals: IepGoal[]
}

export function WeeklyPlanItem({
  weeklyPlan: wp,
  allWeeklyPlans,
  iepPlanId,
  studentId,
  planGoals,
}: WeeklyPlanItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const linkedGoal = planGoals.find(
    (g) => g.achievement_standard_id === wp.achievement_standard_id,
  )

  async function handleDelete() {
    setDeletingId(wp.id)
    try {
      await deleteWeeklyPlan(wp.id, iepPlanId, studentId)
    } catch {
      // revalidation redirect handles update
    } finally {
      setDeletingId(null)
    }
  }

  function handleEdit(formData: FormData) {
    const weekNum = Number(formData.get('week_number'))
    const duplicate = allWeeklyPlans.find(
      (w) => w.week_number === weekNum && w.id !== wp.id,
    )
    if (duplicate) {
      setEditError(`${weekNum}주차가 이미 존재합니다.`)
      return
    }
    startTransition(async () => {
      try {
        const result = await updateWeeklyPlan(
          wp.id,
          iepPlanId,
          studentId,
          {},
          formData,
        )
        if (result?.error) {
          setEditError(result.error)
        } else {
          setIsEditing(false)
          setEditError(null)
        }
      } catch {
        // revalidation
      }
    })
  }

  if (isEditing) {
    return (
      <Card>
        <CardContent className="pt-4">
          <form action={handleEdit} className="space-y-3">
            {editError && (
              <div
                role="alert"
                className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {editError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`edit-week-${wp.id}`}>주차</Label>
                <Input
                  id={`edit-week-${wp.id}`}
                  name="week_number"
                  type="number"
                  min={1}
                  max={52}
                  defaultValue={wp.week_number}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`edit-standard-${wp.id}`}>성취기준</Label>
                <select
                  id={`edit-standard-${wp.id}`}
                  name="achievement_standard_id"
                  defaultValue={wp.achievement_standard_id ?? ''}
                  className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value="">선택 안 함</option>
                  {planGoals.map((g) => (
                    <option
                      key={g.achievement_standard_id}
                      value={g.achievement_standard_id}
                    >
                      {g.achievement_standard_code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor={`edit-activity-${wp.id}`}>활동 내용</Label>
              <Textarea
                id={`edit-activity-${wp.id}`}
                name="activity"
                required
                rows={2}
                defaultValue={wp.activity}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`edit-materials-${wp.id}`}>교재</Label>
                <Input
                  id={`edit-materials-${wp.id}`}
                  name="materials"
                  defaultValue={wp.materials ?? ''}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`edit-eval-${wp.id}`}>평가</Label>
                <Input
                  id={`edit-eval-${wp.id}`}
                  name="evaluation_method"
                  defaultValue={wp.evaluation_method ?? ''}
                />
              </div>
            </div>
            <Input
              name="notes"
              defaultValue={wp.notes ?? ''}
              placeholder="비고"
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                aria-busy={isPending}
              >
                {isPending ? '저장 중...' : '저장'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  setEditError(null)
                }}
              >
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
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
              <p className="text-xs text-muted-foreground">비고: {wp.notes}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                setIsEditing(true)
                setEditError(null)
              }}
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
                    onClick={handleDelete}
                    disabled={deletingId === wp.id}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deletingId === wp.id ? '삭제 중...' : '삭제'}
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
