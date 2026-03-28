'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { SUBJECTS } from '@/lib/schemas/iep-plan'
import { useGoalList } from '@/hooks/use-goal-list'
import { GoalFormItem } from './goal-form-item'
import {
  StandardSelectorDialog,
  type StandardForSelector,
} from './standard-selector-dialog'
import type { IepGoal, IepPlan } from '@/types/students'
import type { ActionResult } from '@/lib/actions/iep-plans'

interface IepPlanFormProps {
  action: (
    goals: IepGoal[],
    prev: ActionResult,
    formData: FormData
  ) => Promise<ActionResult>
  standards: StandardForSelector[]
  plan?: IepPlan
  submitLabel: string
}

export function IepPlanForm({ action, standards, plan, submitLabel }: IepPlanFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [subject, setSubject] = useState(plan?.subject ?? '')
  const gl = useGoalList(plan?.goals)
  const filteredStandards = standards.filter((s) => s.subject === subject)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await action(gl.goals, {}, formData)
    if (result.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">제목 *</Label>
          <Input
            id="title" name="title" required maxLength={100}
            defaultValue={plan?.title} placeholder="IEP 계획 제목" aria-label="IEP 계획 제목"
          />
        </div>

        <div className="space-y-2">
          <Label>과목 *</Label>
          <Select name="subject" value={subject} onValueChange={(v) => setSubject(v ?? '')} required>
            <SelectTrigger aria-label="과목 선택">
              <SelectValue placeholder="과목 선택" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="period_start">시작일 *</Label>
            <Input
              id="period_start" name="period_start" type="date" required
              defaultValue={plan?.period_start} aria-label="시작일"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="period_end">종료일 *</Label>
            <Input
              id="period_end" name="period_end" type="date" required
              defaultValue={plan?.period_end} aria-label="종료일"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>목표 *</Label>
            <Button
              type="button" variant="outline" size="sm"
              onClick={gl.addGoal} disabled={!subject} aria-label="목표 추가"
            >
              목표 추가
            </Button>
          </div>
          {!subject && gl.goals.length === 0 && (
            <p className="text-sm text-muted-foreground">과목을 먼저 선택하세요.</p>
          )}
          {gl.goals.map((goal, i) => (
            <GoalFormItem
              key={i} goal={goal} index={i}
              onChange={(updated) => gl.updateGoal(i, updated)}
              onRemove={() => gl.removeGoal(i)}
              onSelectStandard={() => gl.setSelectorOpenForIndex(i)}
            />
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={isPending || gl.goals.length === 0}>
          {isPending ? '저장 중...' : submitLabel}
        </Button>
      </form>

      <StandardSelectorDialog
        open={gl.selectorOpenForIndex !== null}
        onOpenChange={(open) => { if (!open) gl.setSelectorOpenForIndex(null) }}
        standards={filteredStandards}
        selectedIds={gl.selectedIds}
        onSelect={gl.handleSelectStandard}
      />
    </>
  )
}
