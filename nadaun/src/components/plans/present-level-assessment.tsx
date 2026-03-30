'use client'

import { useState, useCallback, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import type { CurriculumLevel } from '@/types/achievement-standards'
import type { PresentLevel, PresentLevelAxis } from '@/types/students'
import type { TargetLevel } from '@/lib/schemas/iep-plan'
import {
  getAxisLabel,
  getAxisOptions,
  recommendTargetLevel,
  getRecommendationReason,
} from '@/lib/utils/present-level'

const AXES = [
  'knowledge_understanding',
  'process_skills',
  'values_attitudes',
] as const

interface PresentLevelAssessmentProps {
  curriculumLevels: CurriculumLevel[]
  standardCode: string
  initialValue?: PresentLevel
  onChange: (presentLevel: PresentLevel, recommendedTarget: TargetLevel) => void
}

export function PresentLevelAssessment({
  curriculumLevels,
  standardCode,
  initialValue,
  onChange,
}: PresentLevelAssessmentProps) {
  const totalRows = curriculumLevels.length

  const [selectedIndices, setSelectedIndices] = useState<
    Record<string, number>
  >(() => {
    if (initialValue?.levels) {
      const map: Record<string, number> = {}
      for (const lv of initialValue.levels) {
        map[lv.axis] = lv.selected_index
      }
      return map
    }
    // 기본값: 모든 축 중간
    const mid = Math.floor(totalRows / 2)
    const map: Record<string, number> = {}
    for (const axis of AXES) {
      map[axis] = mid
    }
    return map
  })

  const [notes, setNotes] = useState(initialValue?.notes || '')

  const buildPresentLevel = useCallback((): {
    presentLevel: PresentLevel
    target: TargetLevel
  } => {
    const indices = AXES.map((axis) => selectedIndices[axis] ?? 0)
    const target = recommendTargetLevel(indices, totalRows)

    const levels: PresentLevelAxis[] = AXES.map((axis) => {
      const options = getAxisOptions(curriculumLevels, axis)
      const idx = selectedIndices[axis] ?? 0
      return {
        axis,
        axis_label: getAxisLabel(axis),
        selected_index: idx,
        selected_text: options[idx] || '',
      }
    })

    return {
      presentLevel: { levels, notes, recommended_target: target },
      target,
    }
  }, [selectedIndices, notes, curriculumLevels, totalRows])

  useEffect(() => {
    const { presentLevel, target } = buildPresentLevel()
    onChange(presentLevel, target)
  }, [buildPresentLevel, onChange])

  if (totalRows === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        이 성취기준에는 교육과정 성취수준 데이터가 없습니다.
        <br />
        도달 수준을 직접 선택해주세요.
      </div>
    )
  }

  const indices = AXES.map((axis) => selectedIndices[axis] ?? 0)
  const recommended = recommendTargetLevel(indices, totalRows)
  const reason = getRecommendationReason(indices, totalRows, recommended)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold">현행수준 평가</h4>
        <Badge variant="secondary" className="text-xs">
          {standardCode}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        각 축에서 이 학생의 현재 수준에 가장 가까운 항목을 선택하세요.
        <br />
        위쪽이 높은 수준, 아래쪽이 기초 수준입니다.
      </p>

      <div className="space-y-3">
        {AXES.map((axis) => {
          const options = getAxisOptions(curriculumLevels, axis)
          if (options.length === 0) return null
          const selected = selectedIndices[axis] ?? 0

          return (
            <div key={axis} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                {getAxisLabel(axis)}
              </label>
              <div className="flex flex-col gap-1">
                {options.map((text, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setSelectedIndices((prev) => ({
                        ...prev,
                        [axis]: idx,
                      }))
                    }
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      selected === idx
                        ? 'border-primary bg-primary/10 font-medium text-primary'
                        : 'border-border bg-background hover:bg-muted'
                    }`}
                    aria-label={`${getAxisLabel(axis)} ${idx + 1}단계: ${text}`}
                    aria-pressed={selected === idx}
                  >
                    <span className="mr-2 text-xs text-muted-foreground">
                      {idx + 1}
                    </span>
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-1">
        <label
          htmlFor={`notes-${standardCode}`}
          className="text-xs font-medium text-muted-foreground"
        >
          현재 할 수 있는 것 (자유 입력)
        </label>
        <textarea
          id={`notes-${standardCode}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="이 학생이 현재 할 수 있는 것을 간단히 적어주세요..."
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          rows={2}
          maxLength={1000}
        />
      </div>

      <div className="rounded-lg bg-muted/50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">추천 도달 수준</span>
          <Badge
            variant={
              recommended === '우수'
                ? 'default'
                : recommended === '보통'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {recommended}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{reason}</p>
      </div>
    </div>
  )
}
