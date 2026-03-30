'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function NewStudentError({
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
      <h2 className="text-xl font-semibold">학생 등록 페이지를 불러올 수 없습니다</h2>
      <p className="text-muted-foreground">
        페이지를 여는 중 문제가 발생했습니다. 다시 시도해 주세요.
      </p>
      <Button onClick={reset} variant="outline">
        다시 시도
      </Button>
    </div>
  )
}
