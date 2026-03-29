'use client'

import { useAiGeneration } from '@/hooks/use-ai-generation'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { bulkInsertWeeklyPlans } from '@/lib/actions/weekly-plans'
import { Button } from '@/components/ui/button'
import type { GenerationResult } from '@/lib/ai/prompts'

interface GenerateButtonProps {
  planId: string
  studentId: string
  hasWeeklyPlans: boolean
}

export function GenerateButton(props: GenerateButtonProps) {
  const { planId, studentId, hasWeeklyPlans } = props
  const { status, streamText, result, remaining, error, generate, reset } =
    useAiGeneration()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleGenerate = useCallback(() => {
    generate(planId)
  }, [generate, planId])

  const handleSave = useCallback(
    async (data: GenerationResult) => {
      setIsSaving(true)
      setSaveError(null)
      try {
        const result = await bulkInsertWeeklyPlans(
          planId,
          studentId,
          data.weekly_plans,
        )
        if (result.error) {
          setSaveError(result.error)
          return
        }
        reset()
        router.refresh()
      } catch {
        setSaveError('저장 중 오류가 발생했습니다.')
      } finally {
        setIsSaving(false)
      }
    },
    [planId, studentId, reset, router],
  )

  if (status === 'idle') {
    return (
      <div className="space-y-2">
        <Button
          type="button"
          onClick={handleGenerate}
          aria-label="AI로 주차별 수업 계획 자동 생성"
        >
          <span aria-hidden="true">✨</span>
          {hasWeeklyPlans ? '채비 다시 생성' : '채비 시작'}
        </Button>
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          aria-label="AI 생성 다시 시도"
          className="border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          다시 시도
        </Button>
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
      {saveError && (
        <p className="text-sm text-destructive" role="alert">{saveError}</p>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => result && handleSave(result)}
          disabled={isSaving}
          aria-label="생성된 주차 계획 저장"
          className="bg-green-600 text-white hover:bg-green-700"
        >
          {isSaving ? '저장 중...' : '저장하기'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={reset}
          aria-label="생성 결과 취소"
        >
          취소
        </Button>
      </div>
    </div>
  )
}
