'use client'

import { Button } from '@/components/ui/button'

export default function EditPlanError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <h2 className="text-xl font-semibold">계획 편집을 시작할 수 없습니다</h2>
      <p className="text-muted-foreground">
        계획 데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.
      </p>
      <Button onClick={reset} variant="outline">
        다시 시도
      </Button>
    </div>
  )
}
