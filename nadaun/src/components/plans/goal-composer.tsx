'use client'

import { useState, useCallback, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import type { AchievementPool } from '@/types/achievement-standards'

interface GoalComposerProps {
  pool: AchievementPool
  standardCode: string
  initialDescription?: string
  onChange: (description: string) => void
}

/**
 * 성취수준 풀에서 행동기술어를 선택하여 목표 문장을 조합하는 컴포넌트.
 *
 * pool.columns = 성취기준 문장 분할 (2~3개)
 * pool.items[i] = columns[i]에 해당하는 행동기술어 배열
 *
 * 사용자가 각 열에서 1개씩 선택 → 조합하여 description 생성
 */
export function GoalComposer({
  pool,
  standardCode,
  initialDescription,
  onChange,
}: GoalComposerProps) {
  const { columns, items } = pool

  const [selectedItems, setSelectedItems] = useState<(number | null)[]>(() =>
    columns.map(() => null)
  )

  const [manualMode, setManualMode] = useState(false)
  const [manualText, setManualText] = useState(initialDescription || '')

  const composeDescription = useCallback((): string => {
    const parts = selectedItems.map((idx, colIdx) => {
      if (idx === null || !items[colIdx]) return null
      return items[colIdx][idx]
    })
    return parts.filter(Boolean).join(' ')
  }, [selectedItems, items])

  useEffect(() => {
    if (manualMode) {
      onChange(manualText)
    } else {
      const composed = composeDescription()
      if (composed) onChange(composed)
    }
  }, [manualMode, manualText, composeDescription, onChange])

  if (!columns.length || !items.length) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          성취수준 풀 데이터가 없습니다. 직접 입력해주세요.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold">목표 구성</h4>
          <Badge variant="secondary" className="text-xs">
            {standardCode}
          </Badge>
        </div>
        <button
          type="button"
          onClick={() => setManualMode(!manualMode)}
          className="text-xs text-primary underline-offset-4 hover:underline"
        >
          {manualMode ? '풀에서 선택' : '직접 입력'}
        </button>
      </div>

      {manualMode ? (
        <textarea
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder="목표를 직접 입력하세요..."
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          rows={3}
          maxLength={500}
        />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            각 열에서 행동기술어를 하나씩 선택하면 목표 문장이 자동으로
            구성됩니다.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {columns.map((header, colIdx) => {
              const colItems = items[colIdx] || []
              const selected = selectedItems[colIdx]

              return (
                <div key={colIdx} className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    {header}
                  </label>
                  <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                    {colItems.map((text, itemIdx) => (
                      <button
                        key={itemIdx}
                        type="button"
                        onClick={() =>
                          setSelectedItems((prev) => {
                            const next = [...prev]
                            next[colIdx] =
                              prev[colIdx] === itemIdx ? null : itemIdx
                            return next
                          })
                        }
                        className={`rounded-md border px-3 py-1.5 text-left text-xs transition-colors ${
                          selected === itemIdx
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background hover:bg-muted'
                        }`}
                        aria-pressed={selected === itemIdx}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {composeDescription() && (
            <div className="rounded-lg bg-muted/50 p-3">
              <span className="text-xs font-medium text-muted-foreground">
                조합된 목표:
              </span>
              <p className="mt-1 text-sm">{composeDescription()}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
