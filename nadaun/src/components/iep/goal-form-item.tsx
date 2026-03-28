'use client'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TARGET_LEVELS } from '@/lib/schemas/iep-plan'
import type { IepGoal } from '@/types/students'

interface GoalFormItemProps {
  goal: IepGoal
  index: number
  onChange: (updated: IepGoal) => void
  onRemove: () => void
  onSelectStandard: () => void
}

export function GoalFormItem({
  goal,
  index,
  onChange,
  onRemove,
  onSelectStandard,
}: GoalFormItemProps) {
  const label = `목표 ${index + 1}`

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{label}</h4>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onRemove}
          aria-label={`${label} 삭제`}
        >
          삭제
        </Button>
      </div>

      <div className="space-y-2">
        <Label>성취기준 *</Label>
        {goal.achievement_standard_code ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">
              {goal.achievement_standard_code}
            </span>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={onSelectStandard}
              aria-label={`${label} 성취기준 변경`}
            >
              변경
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSelectStandard}
            aria-label={`${label} 성취기준 선택`}
          >
            성취기준 선택
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`goal-desc-${index}`}>목표 설명 *</Label>
        <Textarea
          id={`goal-desc-${index}`}
          value={goal.description}
          onChange={(e) =>
            onChange({ ...goal, description: e.target.value })
          }
          placeholder="이 목표의 구체적인 설명"
          maxLength={500}
          aria-label={`${label} 설명`}
        />
      </div>

      <div className="space-y-2">
        <Label>도달 수준 *</Label>
        <Select
          value={goal.target_level}
          onValueChange={(v) =>
            onChange({
              ...goal,
              target_level: (v ?? '보통') as IepGoal['target_level'],
            })
          }
        >
          <SelectTrigger aria-label={`${label} 도달 수준 선택`}>
            <SelectValue placeholder="수준 선택" />
          </SelectTrigger>
          <SelectContent>
            {TARGET_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
