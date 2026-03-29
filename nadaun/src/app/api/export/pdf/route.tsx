export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { createRateLimiter } from '@/lib/rate-limit'
import {
  IepPdfDocument,
  FullIepDocument,
  type SubjectPlanData,
} from '@/lib/utils/pdf-document'
import { sanitizeFilename, isValidUUID } from '@/lib/utils/sanitize'
import type { IepPlan, WeeklyPlan } from '@/types/students'

/** 교사당 분당 10회 */
const exportLimiter = createRateLimiter({ windowMs: 60_000, max: 10 })

export async function GET(request: NextRequest) {
  const planId = request.nextUrl.searchParams.get('planId')
  const studentId = request.nextUrl.searchParams.get('studentId')

  if (!planId && !studentId) {
    return NextResponse.json(
      { error: 'planId 또는 studentId가 필요합니다.' },
      { status: 400 },
    )
  }

  if (planId && !isValidUUID(planId)) {
    return NextResponse.json(
      { error: '유효하지 않은 계획 ID입니다.' },
      { status: 400 },
    )
  }

  if (studentId && !isValidUUID(studentId)) {
    return NextResponse.json(
      { error: '유효하지 않은 학생 ID입니다.' },
      { status: 400 },
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: '인증이 필요합니다.' },
      { status: 401 },
    )
  }

  const rateCheck = exportLimiter.check(user.id)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(
            Math.ceil((rateCheck.resetAt - Date.now()) / 1000),
          ),
          'X-RateLimit-Remaining': '0',
        },
      },
    )
  }

  /* ── studentId: 전체 IEP 문서 (multi-subject) ── */
  if (studentId) {
    return renderFullIep(supabase, user.id, studentId)
  }

  /* ── planId: 단일 계획 (기존 호환) ── */
  return renderSinglePlan(supabase, user.id, planId!)
}

/* ── Full IEP: 학생의 모든 계획을 한 문서로 ── */
async function renderFullIep(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherId: string,
  studentId: string,
) {
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('name, grade')
    .eq('id', studentId)
    .eq('teacher_id', teacherId)
    .single()

  if (studentError || !student) {
    return NextResponse.json(
      { error: '학생을 찾을 수 없습니다.' },
      { status: 404 },
    )
  }

  const { data: plans } = await supabase
    .from('iep_plans')
    .select('*')
    .eq('student_id', studentId)
    .eq('teacher_id', teacherId)
    .order('created_at')
    .limit(10000)

  if (!plans || plans.length === 0) {
    return NextResponse.json(
      { error: 'IEP 계획이 없습니다.' },
      { status: 404 },
    )
  }

  const planIds = plans.map((p) => p.id)
  const { data: allWeekly } = await supabase
    .from('weekly_plans')
    .select('*')
    .in('iep_plan_id', planIds)
    .order('week_number')
    .limit(10000)

  const weeklyByPlan = new Map<string, WeeklyPlan[]>()
  for (const wp of (allWeekly ?? []) as WeeklyPlan[]) {
    const arr = weeklyByPlan.get(wp.iep_plan_id) ?? []
    arr.push(wp)
    weeklyByPlan.set(wp.iep_plan_id, arr)
  }

  const subjectPlans: SubjectPlanData[] = plans.map((p) => ({
    plan: p as IepPlan,
    weeklyPlans: weeklyByPlan.get(p.id) ?? [],
  }))

  const now = new Date()
  const month = now.getMonth() + 1
  const semesterLabel = month >= 3 && month <= 7 ? '1학기' : '2학기'

  try {
    const buffer = await renderToBuffer(
      <FullIepDocument
        studentName={student.name}
        studentGrade={student.grade}
        teacherName=""
        subjectPlans={subjectPlans}
        semesterLabel={semesterLabel}
        year={now.getFullYear()}
      />,
    )

    const safeName = sanitizeFilename(student.name)
    const filename = `IEP_${safeName}_${now.getFullYear()}${semesterLabel}.pdf`
    const encoded = encodeURIComponent(filename)
    return new Response(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`,
      },
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'PDF 생성 중 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/* ── Single plan (기존 호환) ── */
async function renderSinglePlan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherId: string,
  planId: string,
) {
  const { data: plan, error: planError } = await supabase
    .from('iep_plans')
    .select('*')
    .eq('id', planId)
    .eq('teacher_id', teacherId)
    .single()

  if (planError || !plan) {
    return NextResponse.json(
      { error: '계획을 찾을 수 없습니다.' },
      { status: 404 },
    )
  }

  const { data: student } = await supabase
    .from('students')
    .select('name')
    .eq('id', plan.student_id)
    .single()

  const { data: weeklyData } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('iep_plan_id', planId)
    .order('week_number')
    .limit(10000)

  try {
    const buffer = await renderToBuffer(
      <IepPdfDocument
        plan={plan as IepPlan}
        studentName={student?.name ?? ''}
        weeklyPlans={(weeklyData ?? []) as WeeklyPlan[]}
      />,
    )

    const safeName = sanitizeFilename(student?.name ?? '')
    const safeSubject = sanitizeFilename(plan.subject)
    const safeTitle = sanitizeFilename(plan.title) || 'IEP'
    const filename = `IEP_${safeName}_${safeSubject}_${safeTitle}.pdf`
    const encoded = encodeURIComponent(filename)
    return new Response(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`,
      },
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'PDF 생성 중 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
