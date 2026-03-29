'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { SUBJECTS } from '@/lib/schemas/iep-plan'

const quickStartSchema = z.object({
  studentId: z.string().uuid('학생을 선택하세요.'),
  subjects: z
    .array(z.enum(SUBJECTS))
    .min(1, '과목을 1개 이상 선택하세요.'),
})

export type QuickStartResult = { error?: string }

function getSemesterDates(): {
  periodStart: string
  periodEnd: string
  semesterLabel: string
} {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  if (month >= 3 && month <= 7) {
    return {
      periodStart: `${year}-03-02`,
      periodEnd: `${year}-07-19`,
      semesterLabel: '1학기',
    }
  }
  return {
    periodStart: `${year}-09-01`,
    periodEnd: `${year}-12-31`,
    semesterLabel: '2학기',
  }
}

export async function quickStart(
  _prev: QuickStartResult,
  formData: FormData,
): Promise<QuickStartResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: '로그인이 필요합니다.' }
  }

  const subjects = formData.getAll('subjects') as string[]

  const parsed = quickStartSchema.safeParse({
    studentId: formData.get('studentId'),
    subjects,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { studentId } = parsed.data
  const validSubjects = parsed.data.subjects

  // 1. 학생 확인 (RLS 검증)
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('id, name')
    .eq('id', studentId)
    .single()

  if (studentError || !student) {
    return { error: '학생을 찾을 수 없습니다.' }
  }

  const { periodStart, periodEnd, semesterLabel } = getSemesterDates()
  const year = new Date().getFullYear()

  // 2. 과목별 IEP 계획 일괄 생성
  for (const subject of validSubjects) {
    // 성취기준 조회 → 영역별 1개씩, 최대 3개
    const { data: standards } = await supabase
      .from('achievement_standards')
      .select('id, code, content, domain_code')
      .eq('subject', subject)
      .order('domain_code')
      .order('code')
      .limit(10000)

    if (!standards || standards.length === 0) continue

    const domainMap = new Map<string, (typeof standards)[0]>()
    for (const s of standards) {
      if (!domainMap.has(s.domain_code)) {
        domainMap.set(s.domain_code, s)
      }
      if (domainMap.size >= 3) break
    }

    const goals = Array.from(domainMap.values()).map((s) => ({
      achievement_standard_id: s.id,
      achievement_standard_code: s.code,
      description:
        s.content.length > 200
          ? s.content.slice(0, 197) + '...'
          : s.content,
      target_level: '기초' as const,
    }))

    const title = `${year} ${semesterLabel} ${subject}`

    await supabase.from('iep_plans').insert({
      student_id: student.id,
      teacher_id: user.id,
      title,
      subject,
      period_start: periodStart,
      period_end: periodEnd,
      goals,
    })
  }

  revalidatePath(`/students/${studentId}`)
  redirect(`/students/${studentId}`)
}
