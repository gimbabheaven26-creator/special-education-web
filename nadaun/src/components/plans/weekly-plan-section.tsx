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
import {
  createWeeklyPlan,
  updateWeeklyPlan,
  deleteWeeklyPlan,
} from '@/lib/actions/weekly-plans'
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
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await createWeeklyPlan(
          iepPlanId,
          studentId,
          {},
          formData,
        )
        if (result?.error) {
          setError(result.error)
        } else {
          setShowForm(false)
          setError(null)
        }
      } catch {
        // revalidation
      }
    })
  }

  async function handleDelete(weeklyPlanId: string) {
    setDeletingId(weeklyPlanId)
    try {
      await deleteWeeklyPlan(weeklyPlanId, iepPlanId, studentId)
    } catch {
      // revalidation redirect
    } finally {
      setDeletingId(null)
    }
  }

  function handleEdit(formData: FormData) {
    if (!editingId) return
    const weekNum = Number(formData.get('week_number'))
    const duplicate = weeklyPlans.find(
      (w) => w.week_number === weekNum && w.id !== editingId,
    )
    if (duplicate) {
      setEditError(`${weekNum}주차가 이미 존재합니다.`)
      return
    }
    startTransition(async () => {
      try {
        const result = await updateWeeklyPlan(
          editingId,
          iepPlanId,
          studentId,
          {},
          formData,
        )
        if (result?.error) {
          setEditError(result.error)
        } else {
          setEditingId(null)
          setEditError(null)
        }
      } catch {
        // revalidation
      }
    })
  }

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
        <Card>
          <CardContent className="pt-4">
            <form action={handleSubmit} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="week_number">주차 *</Label>
                  <Input
                    id="week_number"
                    name="week_number"
                    type="number"
                    min={1}
                    max={52}
                    defaultValue={nextWeekNumber}
                    required
                    aria-label="주차"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="achievement_standard_id">관련 성취기준</Label>
                  <select
                    id="achievement_standard_id"
                    name="achievement_standard_id"
                    className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    aria-label="관련 성취기준 선택"
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

              <div className="space-y-2">
                <Label htmlFor="activity">활동 내용 *</Label>
                <Textarea
                  id="activity"
                  name="activity"
                  required
                  rows={2}
                  placeholder="이번 주차의 학습 활동"
                  aria-label="활동 내용"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="materials">교재 / 자료</Label>
                  <Input
                    id="materials"
                    name="materials"
                    placeholder="사용 교재 및 자료"
                    aria-label="교재 및 자료"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evaluation_method">평가 방법</Label>
                  <Input
                    id="evaluation_method"
                    name="evaluation_method"
                    placeholder="관찰, 포트폴리오 등"
                    aria-label="평가 방법"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">비고</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="추가 메모"
                  aria-label="비고"
                />
              </div>

              <Button type="submit" disabled={isPending} aria-busy={isPending} className="w-full">
                {isPending ? '추가 중...' : '주차 추가'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {weeklyPlans.length === 0 && !showForm && (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            아직 주차별 계획이 없습니다.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {weeklyPlans.map((wp) => {
          const linkedGoal = planGoals.find(
            (g) => g.achievement_standard_id === wp.achievement_standard_id,
          )
          const isEditing = editingId === wp.id

          if (isEditing) {
            return (
              <Card key={wp.id}>
                <CardContent className="pt-4">
                  <form action={handleEdit} className="space-y-3">
                    {editError && (
                      <div role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
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
                            <option key={g.achievement_standard_id} value={g.achievement_standard_id}>
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
                        <Input id={`edit-materials-${wp.id}`} name="materials" defaultValue={wp.materials ?? ''} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`edit-eval-${wp.id}`}>평가</Label>
                        <Input id={`edit-eval-${wp.id}`} name="evaluation_method" defaultValue={wp.evaluation_method ?? ''} />
                      </div>
                    </div>
                    <Input name="notes" defaultValue={wp.notes ?? ''} placeholder="비고" />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={isPending} aria-busy={isPending}>
                        {isPending ? '저장 중...' : '저장'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditingId(null); setEditError(null) }}
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
            <Card key={wp.id}>
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
                      onClick={() => { setEditingId(wp.id); setEditError(null) }}
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
                            onClick={() => handleDelete(wp.id)}
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
        })}
      </div>
    </div>
  )
}
