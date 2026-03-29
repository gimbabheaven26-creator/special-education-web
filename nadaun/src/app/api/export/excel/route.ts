import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRateLimiter } from '@/lib/rate-limit'
import { generateIepExcel } from '@/lib/utils/excel-generator'
import type { IepPlan, WeeklyPlan } from '@/types/students'

/** 교사당 분당 10회 */
const exportLimiter = createRateLimiter({ windowMs: 60_000, max: 10 })

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w가-힣\s-]/g, '').slice(0, 100)
}

export async function GET(request: NextRequest) {
  const planId = request.nextUrl.searchParams.get('planId')
  if (!planId || !UUID_RE.test(planId)) {
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
    .limit(10000)

  try {
    const buffer = await generateIepExcel(
      plan,
      studentName,
      (weeklyPlans ?? []) as WeeklyPlan[],
    )

    const safeName = sanitizeFilename(studentName)
    const safeSubject = sanitizeFilename(plan.subject)
    const safeTitle = sanitizeFilename(plan.title) || 'IEP'
    const filename = `IEP_${safeName}_${safeSubject}_${safeTitle}.xlsx`
    const encoded = encodeURIComponent(filename)
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`,
      },
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Excel 생성 중 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
