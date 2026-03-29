'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { IepGoal } from '@/types/students'

interface WeeklyPlanFormProps {
  planGoals: IepGoal[]
  onSubmit: (formData: FormData) => void
  onCancel: () => void
  error: string | null
  isPending: boolean
  submitLabel: string
  pendingLabel: string
  defaultValues?: {
    week_number: number
    achievement_standard_id?: string | null
    activity: string
    materials?: string | null
    evaluation_method?: string | null
    notes?: string | null
  }
  idPrefix?: string
}

export function WeeklyPlanForm({
  planGoals,
  onSubmit,
  onCancel,
  error,
  isPending,
  submitLabel,
  pendingLabel,
  defaultValues,
  idPrefix = '',
}: WeeklyPlanFormProps) {
  const prefix = idPrefix ? `${idPrefix}-` : ''

  return (
    <Card>
      <CardContent className="pt-4">
        <form action={onSubmit} className="space-y-4">
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
              <Label htmlFor={`${prefix}week_number`}>주차 *</Label>
              <Input
                id={`${prefix}week_number`}
                name="week_number"
                type="number"
                min={1}
                max={52}
                defaultValue={defaultValues?.week_number}
                required
                aria-label="주차"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${prefix}achievement_standard_id`}>관련 성취기준</Label>
              <select
                id={`${prefix}achievement_standard_id`}
                name="achievement_standard_id"
                defaultValue={defaultValues?.achievement_standard_id ?? ''}
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
            <Label htmlFor={`${prefix}activity`}>활동 내용 *</Label>
            <Textarea
              id={`${prefix}activity`}
              name="activity"
              required
              rows={2}
              placeholder="이번 주차의 학습 활동"
              defaultValue={defaultValues?.activity}
              aria-label="활동 내용"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${prefix}materials`}>교재 / 자료</Label>
              <Input
                id={`${prefix}materials`}
                name="materials"
                placeholder="사용 교재 및 자료"
                defaultValue={defaultValues?.materials ?? ''}
                aria-label="교재 및 자료"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${prefix}evaluation_method`}>평가 방법</Label>
              <Input
                id={`${prefix}evaluation_method`}
                name="evaluation_method"
                placeholder="관찰, 포트폴리오 등"
                defaultValue={defaultValues?.evaluation_method ?? ''}
                aria-label="평가 방법"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${prefix}notes`}>비고</Label>
            <Input
              id={`${prefix}notes`}
              name="notes"
              placeholder="추가 메모"
              defaultValue={defaultValues?.notes ?? ''}
              aria-label="비고"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} aria-busy={isPending} className="flex-1">
              {isPending ? pendingLabel : submitLabel}
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
