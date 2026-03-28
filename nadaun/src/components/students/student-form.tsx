'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GRADES } from '@/lib/schemas/student'
import type { Student } from '@/types/students'
import type { ActionResult } from '@/lib/actions/students'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? '저장 중...' : label}
    </Button>
  )
}

interface StudentFormProps {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>
  student?: Student
  submitLabel: string
}

export function StudentForm({ action, student, submitLabel }: StudentFormProps) {
  const [state, formAction] = useFormState(action, {})

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">이름 *</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={50}
          defaultValue={student?.name}
          placeholder="학생 이름"
          aria-label="학생 이름"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="grade">학년 *</Label>
        <Select name="grade" defaultValue={student?.grade || ''} required>
          <SelectTrigger id="grade" aria-label="학년 선택">
            <SelectValue placeholder="학년 선택" />
          </SelectTrigger>
          <SelectContent>
            {GRADES.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="disability_type">장애유형</Label>
        <Input
          id="disability_type"
          name="disability_type"
          defaultValue={student?.disability_type ?? ''}
          placeholder="예: 지적장애, 자폐성장애"
          aria-label="장애유형"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">메모</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={student?.notes ?? ''}
          placeholder="학생에 대한 메모"
          rows={3}
          aria-label="메모"
        />
      </div>

      <SubmitButton label={submitLabel} />
    </form>
  )
}
