'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createWeeklyPlan } from '@/lib/actions/weekly-plans'
import type { IepGoal } from '@/types/students'

interface AddWeeklyPlanFormProps {
  iepPlanId: string
  studentId: string
  planGoals: IepGoal[]
  nextWeekNumber: number
  onSuccess: () => void
  onCancel: () => void
}

export function AddWeeklyPlanForm({
  iepPlanId,
  studentId,
  planGoals,
  nextWeekNumber,
  onSuccess,
  onCancel,
}: AddWeeklyPlanFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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
          setError(null)
          onSuccess()
        }
      } catch {
        // revalidation
      }
    })
  }

  return (
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

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className="flex-1"
            >
              {isPending ? '추가 중...' : '주차 추가'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
