'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { WeeklyPlanEditForm } from '@/components/plans/weekly-plan-edit-form'
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
  updateWeeklyPlan,
  deleteWeeklyPlan,
  updateWeeklyPlanStatus,
  updateWeeklyPlanProgressNotes,
  updateWeeklyPlanAchievement,
} from '@/lib/actions/weekly-plans'
import type { WeeklyPlan, IepGoal, WeeklyPlanStatus, AchievementRating } from '@/types/students'

const RATING_LABELS: Record<AchievementRating, string> = {
  not_met: '미달',
  met: '달성',
  exceeded: '초과',
}
const RATING_COLORS: Record<AchievementRating, string> = {
  not_met: 'text-red-600 dark:text-red-400',
  met: 'text-green-600 dark:text-green-400',
  exceeded: 'text-blue-600 dark:text-blue-400',
}
const RATING_BG: Record<AchievementRating, string> = {
  not_met: 'bg-red-100 hover:bg-red-200 dark:bg-red-900/30',
  met: 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30',
  exceeded: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30',
}
const RATING_ICONS: Record<AchievementRating, string> = {
  not_met: '△',
  met: '○',
  exceeded: '◎',
}

const STATUS_CYCLE: WeeklyPlanStatus[] = ['planned', 'in_progress', 'completed']
const STATUS_LABELS: Record<WeeklyPlanStatus, string> = {
  planned: '예정',
  in_progress: '진행 중',
  completed: '완료',
}
const STATUS_COLORS: Record<WeeklyPlanStatus, string> = {
  planned: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}

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
  const [isEditingMemo, setIsEditingMemo] = useState(false)
  const [memoValue, setMemoValue] = useState(wp.progress_notes ?? '')
  const [isEditingRating, setIsEditingRating] = useState(false)
  const [ratingValue, setRatingValue] = useState<AchievementRating | null>(wp.achievement_rating ?? null)
  const [observationValue, setObservationValue] = useState(wp.observation_notes ?? '')

  const linkedGoal = planGoals.find(
    (g) => g.achievement_standard_id === wp.achievement_standard_id,
  )

  const currentStatus: WeeklyPlanStatus = wp.status ?? 'planned'

  function handleStatusToggle() {
    const currentIdx = STATUS_CYCLE.indexOf(currentStatus)
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length]
    startTransition(async () => {
      await updateWeeklyPlanStatus(wp.id, iepPlanId, studentId, nextStatus)
    })
  }

  function handleMemoSave() {
    startTransition(async () => {
      await updateWeeklyPlanProgressNotes(wp.id, iepPlanId, studentId, memoValue)
      setIsEditingMemo(false)
    })
  }

  function handleRatingSave(rating: AchievementRating | null) {
    setRatingValue(rating)
    startTransition(async () => {
      await updateWeeklyPlanAchievement(wp.id, iepPlanId, studentId, rating, observationValue)
      setIsEditingRating(false)
    })
  }

  function handleObservationSave() {
    startTransition(async () => {
      await updateWeeklyPlanAchievement(wp.id, iepPlanId, studentId, ratingValue, observationValue)
      setIsEditingRating(false)
    })
  }

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
      <WeeklyPlanEditForm
        weeklyPlan={wp}
        planGoals={planGoals}
        error={editError}
        isPending={isPending}
        onSubmit={handleEdit}
        onCancel={() => {
          setIsEditing(false)
          setEditError(null)
        }}
      />
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
              {/* Task 8: 상태별 색상 뱃지 */}
              <button
                type="button"
                onClick={handleStatusToggle}
                disabled={isPending}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${STATUS_COLORS[currentStatus]}`}
                aria-label={`${wp.week_number}주차 상태: ${STATUS_LABELS[currentStatus]}. 클릭하여 변경`}
              >
                {STATUS_LABELS[currentStatus]}
              </button>
              {wp.achievement_rating && (
                <span
                  className={`text-sm font-bold ${RATING_COLORS[wp.achievement_rating]}`}
                  title={RATING_LABELS[wp.achievement_rating]}
                >
                  {RATING_ICONS[wp.achievement_rating]}
                </span>
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

            {/* Task 6: 진도 메모 인라인 편집 */}
            {isEditingMemo ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={memoValue}
                  onChange={(e) => setMemoValue(e.target.value)}
                  placeholder="진도 메모"
                  className="h-7 text-xs"
                  aria-label="진도 메모 입력"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  className="h-7 text-xs"
                  onClick={handleMemoSave}
                  disabled={isPending}
                >
                  {isPending ? '...' : '저장'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    setIsEditingMemo(false)
                    setMemoValue(wp.progress_notes ?? '')
                  }}
                >
                  취소
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingMemo(true)}
                className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`${wp.week_number}주차 진도 메모 ${wp.progress_notes ? '수정' : '추가'}`}
              >
                {wp.progress_notes
                  ? `메모: ${wp.progress_notes}`
                  : '+ 진도 메모 추가'}
              </button>
            )}

            {/* Task 2 & 4: 달성도 입력 + 관찰 기록 */}
            {currentStatus === 'completed' && (
              isEditingRating ? (
                <div className="mt-2 space-y-2 rounded-lg border border-dashed p-3">
                  <p className="text-xs font-semibold text-muted-foreground">달성도 평가</p>
                  <div className="flex flex-wrap gap-1">
                    {(['not_met', 'met', 'exceeded'] as AchievementRating[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRatingSave(r)}
                        disabled={isPending}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          ratingValue === r
                            ? `${RATING_BG[r]} ring-2 ring-offset-1`
                            : 'bg-muted hover:bg-muted/80'
                        } ${RATING_COLORS[r]}`}
                        aria-label={`${wp.week_number}주차 달성도: ${RATING_LABELS[r]}`}
                      >
                        {RATING_ICONS[r]} {RATING_LABELS[r]}
                      </button>
                    ))}
                    {ratingValue && (
                      <button
                        type="button"
                        onClick={() => handleRatingSave(null)}
                        disabled={isPending}
                        className="rounded-full px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                        aria-label="달성도 초기화"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={observationValue}
                      onChange={(e) => setObservationValue(e.target.value)}
                      placeholder="관찰 기록 (선택)"
                      className="h-7 text-xs"
                      aria-label="관찰 기록 입력"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={handleObservationSave}
                      disabled={isPending}
                    >
                      {isPending ? '...' : '저장'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => {
                        setIsEditingRating(false)
                        setRatingValue(wp.achievement_rating ?? null)
                        setObservationValue(wp.observation_notes ?? '')
                      }}
                    >
                      닫기
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingRating(true)}
                  className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`${wp.week_number}주차 달성도 ${wp.achievement_rating ? '수정' : '입력'}`}
                >
                  {wp.achievement_rating
                    ? `${RATING_ICONS[wp.achievement_rating]} ${RATING_LABELS[wp.achievement_rating]}${wp.observation_notes ? ` — ${wp.observation_notes}` : ''}`
                    : '+ 달성도 입력'}
                </button>
              )
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
