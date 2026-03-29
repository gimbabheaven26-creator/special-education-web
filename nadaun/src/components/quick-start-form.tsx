'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { quickStart, type QuickStartResult } from '@/lib/actions/quick-start'
import { SUBJECTS } from '@/lib/schemas/iep-plan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface StudentOption {
  id: string
  name: string
  grade: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-full"
    >
      {pending ? '준비 중...' : '채비 시작'}
    </Button>
  )
}

export function QuickStartForm({ students }: { students: StudentOption[] }) {
  const [state, formAction] = useFormState(quickStart, {} as QuickStartResult)
  const router = useRouter()

  useEffect(() => {
    if (state.planUrl) {
      router.push(state.planUrl + '?auto=1')
    }
  }, [state.planUrl, router])

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">원클릭 채비</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            먼저 키움이를 등록하면 AI가 한 번에 계획을 만들어드려요
          </p>
          <Link
            href="/students/new"
            className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            첫 키움이 등록하기
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">원클릭 채비</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="qs-student"
              className="block text-sm font-medium"
            >
              키움이
            </label>
            <Select name="studentId" required>
              <SelectTrigger id="qs-student" aria-label="키움이 선택">
                <SelectValue placeholder="키움이 선택" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.grade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="qs-subject"
              className="block text-sm font-medium"
            >
              교과
            </label>
            <Select name="subject" required>
              <SelectTrigger id="qs-subject" aria-label="교과 선택">
                <SelectValue placeholder="교과 선택" />
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

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <SubmitButton />

          <p className="text-xs text-center text-muted-foreground">
            키움이와 교과만 고르면 AI가 나머지를 한 번에
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
