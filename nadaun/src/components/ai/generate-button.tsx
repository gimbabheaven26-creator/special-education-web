'use client'

import { useAiGeneration } from '@/hooks/use-ai-generation'
import { useRouter } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { createClient } from '@/lib/supabase/browser'
import type { GenerationResult } from '@/lib/ai/prompts'

interface GenerateButtonProps {
  planId: string
  studentId: string
  hasWeeklyPlans: boolean
}

export function GenerateButton(props: GenerateButtonProps) {
  const { planId, hasWeeklyPlans } = props
  const { status, streamText, result, remaining, error, generate, reset } =
    useAiGeneration()
  const router = useRouter()
  const [isSaving, startSaving] = useTransition()

  const handleGenerate = useCallback(() => {
    generate(planId)
  }, [generate, planId])

  const handleSave = useCallback(
    (data: GenerationResult) => {
      startSaving(async () => {
        const supabase = createClient()
        const rows = data.weekly_plans.map((wp) => ({
          iep_plan_id: planId,
          week_number: wp.week_number,
          achievement_standard_id: wp.achievement_standard_id || null,
          activity: wp.activity,
          materials: wp.materials || null,
          evaluation_method: wp.evaluation_method || null,
          notes: wp.notes || null,
        }))

        const { error: insertError } = await supabase
          .from('weekly_plans')
          .insert(rows)

        if (insertError) {
          // eslint-disable-next-line no-alert
          alert(`저장 실패: ${insertError.message}`)
          return
        }

        reset()
        router.refresh()
      })
    },
    [planId, reset, router]
  )

  if (status === 'idle') {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleGenerate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="AI로 주차별 수업 계획 자동 생성"
        >
          <span aria-hidden="true">✨</span>
          {hasWeeklyPlans ? '채비 다시 생성' : '채비 시작'}
        </button>
        {remaining !== null && (
          <p className="text-xs text-muted-foreground">
            오늘 남은 생성 횟수: {remaining}회
          </p>
        )}
      </div>
    )
  }

  if (status === 'generating') {
    return (
      <div
        className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium">
            AI가 주차별 계획을 생성하고 있어요...
          </p>
        </div>
        {streamText && (
          <pre className="max-h-40 overflow-auto rounded bg-muted/50 p-2 text-xs">
            {streamText.slice(-500)}
          </pre>
        )}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">{error}</p>
        <button
          type="button"
          onClick={handleGenerate}
          className="rounded-md border border-destructive/30 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
          aria-label="AI 생성 다시 시도"
        >
          다시 시도
        </button>
      </div>
    )
  }

  // status === 'complete'
  return (
    <div className="space-y-3 rounded-lg border border-green-500/20 bg-green-50 p-4 dark:bg-green-950/20">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-green-700 dark:text-green-400">
          {result?.weekly_plans.length}주차 계획이 생성되었어요!
        </p>
        {remaining !== null && (
          <span className="text-xs text-muted-foreground">
            남은 횟수: {remaining}회
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => result && handleSave(result)}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 disabled:opacity-50"
          aria-label="생성된 주차 계획 저장"
        >
          {isSaving ? '저장 중...' : '저장하기'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="생성 결과 취소"
        >
          취소
        </button>
      </div>
    </div>
  )
}
