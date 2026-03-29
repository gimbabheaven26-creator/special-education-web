'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { quickStart } from '@/lib/actions/quick-start'
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
      {pending ? '생성 중...' : '채비 시작'}
    </Button>
  )
}

export function QuickStartForm({ students }: { students: StudentOption[] }) {
  const [state, formAction] = useFormState(quickStart, {})

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
            <label className="block text-sm font-medium">키움이</label>
            <Select name="studentId" required>
              <SelectTrigger aria-label="키움이 선택">
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

          <fieldset className="space-y-2">
            <legend className="block text-sm font-medium">교과</legend>
            <div className="grid grid-cols-2 gap-2">
              {SUBJECTS.map((subject) => (
                <label
                  key={subject}
                  className="flex items-center gap-2 rounded-lg border border-input px-3 py-2.5 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 hover:bg-muted cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="subjects"
                    value={subject}
                    className="accent-primary"
                  />
                  {subject}
                </label>
              ))}
            </div>
          </fieldset>

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <SubmitButton />

          <p className="text-xs text-center text-muted-foreground">
            키움이 선택 + 교과 체크 → 전체 계획 한 번에 생성
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
