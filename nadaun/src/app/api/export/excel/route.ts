import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateIepExcel } from '@/lib/utils/excel-generator'
import type { IepPlan, WeeklyPlan } from '@/types/students'

export async function GET(request: NextRequest) {
  const planId = request.nextUrl.searchParams.get('planId')
  if (!planId) {
    return NextResponse.json(
      { error: 'planId 파라미터가 필요합니다' },
      { status: 400 },
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: '인증이 필요합니다' },
      { status: 401 },
    )
  }

  const { data: plan, error: planError } = await supabase
    .from('iep_plans')
    .select('*')
    .eq('id', planId)
    .eq('teacher_id', user.id)
    .single<IepPlan>()

  if (planError || !plan) {
    return NextResponse.json(
      { error: 'IEP 계획을 찾을 수 없습니다' },
      { status: 404 },
    )
  }

  const { data: student } = await supabase
    .from('students')
    .select('name')
    .eq('id', plan.student_id)
    .single<{ name: string }>()

  const studentName = student?.name ?? '이름 없음'

  const { data: weeklyPlans } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('iep_plan_id', planId)
    .order('week_number')

  const buffer = await generateIepExcel(
    plan,
    studentName,
    (weeklyPlans as WeeklyPlan[]) ?? [],
  )

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="IEP_${plan.title}.xlsx"`,
    },
  })
}
