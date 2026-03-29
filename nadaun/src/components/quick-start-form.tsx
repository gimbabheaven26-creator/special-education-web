'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { quickStart, type QuickStartResult } from '@/lib/actions/quick-start'
import { SUBJECTS } from '@/lib/schemas/iep-plan'
import { GRADES } from '@/lib/schemas/student'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

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

export function QuickStartForm() {
  const [state, formAction] = useFormState(quickStart, {} as QuickStartResult)
  const router = useRouter()

  useEffect(() => {
    if (state.planUrl) {
      router.push(state.planUrl + '?auto=1')
    }
  }, [state.planUrl, router])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">원클릭 채비</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qs-name">이름 (별명도 OK)</Label>
            <Input
              id="qs-name"
              name="name"
              required
              maxLength={50}
              placeholder="예: 김하늘"
              aria-label="학생 이름"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qs-subject">교과</Label>
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

          <div className="space-y-2">
            <Label htmlFor="qs-grade">학년</Label>
            <Select name="grade" required>
              <SelectTrigger id="qs-grade" aria-label="학년 선택">
                <SelectValue placeholder="학년 선택" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
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
            이름·교과·학년만 알려주면 AI가 성취기준부터 주차별 계획까지 한 번에
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
