'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { void error }, [error])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <h2 className="text-xl font-semibold">검색 중 오류가 발생했습니다</h2>
      <p className="text-muted-foreground">
        성취기준 검색에 실패했습니다. 다시 시도해 주세요.
      </p>
      <Button onClick={reset} variant="outline">
        다시 시도
      </Button>
    </div>
  )
}
