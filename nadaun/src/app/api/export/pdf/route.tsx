export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { IepPdfDocument } from '@/lib/utils/pdf-document'
import type { IepPlan, WeeklyPlan } from '@/types/students'

export async function GET(request: NextRequest) {
  const planId = request.nextUrl.searchParams.get('planId')
  if (!planId) {
    return NextResponse.json(
      { error: '계획 ID가 필요합니다.' },
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

  /* ── Fetch IEP plan ── */
  const { data: plan, error: planError } = await supabase
    .from('iep_plans')
    .select('*')
    .eq('id', planId)
    .eq('teacher_id', user.id)
    .single()

  if (planError || !plan) {
    return NextResponse.json(
      { error: '계획을 찾을 수 없습니다.' },
      { status: 404 },
    )
  }

  /* ── Fetch student name ── */
  const { data: student } = await supabase
    .from('students')
    .select('name')
    .eq('id', plan.student_id)
    .single()

  /* ── Fetch weekly plans ── */
  const { data: weeklyData } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('iep_plan_id', planId)
    .order('week_number')
    .limit(10000)

  /* ── Render PDF ── */
  try {
    const buffer = await renderToBuffer(
      <IepPdfDocument
        plan={plan as IepPlan}
        studentName={student?.name ?? ''}
        weeklyPlans={(weeklyData ?? []) as WeeklyPlan[]}
      />,
    )

    return new Response(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="IEP_${plan.title}.pdf"`,
      },
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'PDF 생성 중 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
