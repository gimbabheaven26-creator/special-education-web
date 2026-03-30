'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { WeeklyPlan, IepGoal } from '@/types/students'

interface WeeklyPlanEditFormProps {
  weeklyPlan: WeeklyPlan
  planGoals: IepGoal[]
  error: string | null
  isPending: boolean
  onSubmit: (formData: FormData) => void
  onCancel: () => void
}

export function WeeklyPlanEditForm({
  weeklyPlan: wp,
  planGoals,
  error,
  isPending,
  onSubmit,
  onCancel,
}: WeeklyPlanEditFormProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <form action={onSubmit} className="space-y-3">
          {error && (
            <div
              role="alert"
              className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
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
              onClick={onCancel}
            >
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
