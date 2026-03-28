'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  StandardSelector,
  type SelectedStandard,
} from '@/components/plans/standard-selector'
import { SUBJECTS, TARGET_LEVELS } from '@/lib/schemas/iep-plan'
import { createIepPlan, updateIepPlan } from '@/lib/actions/iep-plans'
import type { IepGoal, IepPlan } from '@/types/students'

interface GoalDraft {
  standard: SelectedStandard
  description: string
  target_level: (typeof TARGET_LEVELS)[number]
}

interface IepPlanFormProps {
  studentId: string
  plan?: IepPlan
}

export function IepPlanForm({ studentId, plan }: IepPlanFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState(plan?.subject ?? '')
  const [goals, setGoals] = useState<GoalDraft[]>(
    plan?.goals.map((g) => ({
      standard: {
        id: g.achievement_standard_id,
        code: g.achievement_standard_code,
        content: '',
      },
      description: g.description,
      target_level: g.target_level,
    })) ?? [],
  )

  function handleAddGoal(standard: SelectedStandard) {
    setGoals((prev) => [
      ...prev,
      { standard, description: '', target_level: '보통' },
    ])
  }

  function handleRemoveGoal(index: number) {
    setGoals((prev) => prev.filter((_, i) => i !== index))
  }

  function handleGoalDescChange(index: number, value: string) {
    setGoals((prev) =>
      prev.map((g, i) => (i === index ? { ...g, description: value } : g)),
    )
  }

  function handleGoalLevelChange(index: number, value: string) {
    setGoals((prev) =>
      prev.map((g, i) =>
        i === index
          ? { ...g, target_level: value as (typeof TARGET_LEVELS)[number] }
          : g,
      ),
    )
  }

  function handleSubjectChange(value: unknown) {
    const v = value as string
    if (v !== selectedSubject && goals.length > 0) {
      setGoals([])
    }
    setSelectedSubject(v)
  }

  function handleSubmit(formData: FormData) {
    const iepGoals: IepGoal[] = goals.map((g) => ({
      achievement_standard_id: g.standard.id,
      achievement_standard_code: g.standard.code,
      description: g.description,
      target_level: g.target_level,
    }))

    startTransition(async () => {
      try {
        const result = plan
          ? await updateIepPlan(plan.id, studentId, iepGoals, {}, formData)
          : await createIepPlan(studentId, iepGoals, {}, formData)
        if (result?.error) {
          setError(result.error)
        }
      } catch {
        // redirect throws NEXT_REDIRECT — Next.js handles it
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">제목 *</Label>
          <Input
            id="title"
            name="title"
            required
            maxLength={100}
            defaultValue={plan?.title}
            placeholder="예: 2026학년도 1학기 국어 IEP"
            aria-label="IEP 계획 제목"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">과목 *</Label>
          <Select
            name="subject"
            defaultValue={plan?.subject ?? ''}
            required
            onValueChange={handleSubjectChange}
          >
            <SelectTrigger id="subject" aria-label="과목 선택">
              <SelectValue placeholder="과목 선택" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="period_start">시작일 *</Label>
            <Input
              id="period_start"
              name="period_start"
              type="date"
              required
              defaultValue={plan?.period_start}
              aria-label="시작일"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="period_end">종료일 *</Label>
            <Input
              id="period_end"
              name="period_end"
              type="date"
              required
              defaultValue={plan?.period_end}
              aria-label="종료일"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">목표</h3>
          {selectedSubject && (
            <StandardSelector
              subject={selectedSubject}
              onSelect={handleAddGoal}
              excludeIds={goals.map((g) => g.standard.id)}
            />
          )}
        </div>

        {!selectedSubject && (
          <p className="text-sm text-muted-foreground">
            과목을 먼저 선택하세요.
          </p>
        )}

        {goals.length === 0 && selectedSubject && (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              성취기준을 선택하여 목표를 추가하세요.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {goals.map((goal, i) => (
            <div
              key={goal.standard.id}
              className="rounded-lg border p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <Badge variant="outline" className="mt-0.5 shrink-0">
                    {goal.standard.code}
                  </Badge>
                  {goal.standard.content && (
                    <span className="text-sm text-muted-foreground">
                      {goal.standard.content}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleRemoveGoal(i)}
                  aria-label={`목표 ${i + 1} 삭제`}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`goal-desc-${i}`}>목표 설명 *</Label>
                <Input
                  id={`goal-desc-${i}`}
                  value={goal.description}
                  onChange={(e) => handleGoalDescChange(i, e.target.value)}
                  placeholder="이 성취기준에 대한 구체적 목표"
                  required
                  maxLength={500}
                  aria-label={`목표 ${i + 1} 설명`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`goal-level-${i}`}>도달 수준</Label>
                <Select
                  value={goal.target_level}
                  onValueChange={(v) =>
                    handleGoalLevelChange(i, v as string)
                  }
                >
                  <SelectTrigger
                    id={`goal-level-${i}`}
                    aria-label={`목표 ${i + 1} 도달 수준`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending || goals.length === 0}
        className="w-full"
        size="lg"
      >
        {isPending ? '저장 중...' : plan ? '수정 완료' : '계획 작성'}
      </Button>
    </form>
  )
}
