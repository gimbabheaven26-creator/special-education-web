import { createClient } from '@/lib/supabase/server'
import { getTeacherId } from '@/lib/supabase/auth'
import type { Student, StudentWithIepCount, IepPlan, WeeklyPlan, WeeklyPlanStatus } from '@/types/students'

/** Fetch teacher's students */
export async function getStudents(): Promise<StudentWithIepCount[]> {
  const teacherId = await getTeacherId()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('name')
    .limit(10000)

  if (error) throw new Error(error.message)

  // IEP count는 별도 쿼리 (Supabase JS에서 집계가 제한적)
  const students = (data ?? []) as Student[]
  if (students.length === 0) return []

  const { data: plans } = await supabase
    .from('iep_plans')
    .select('student_id')
    .eq('teacher_id', teacherId)
    .limit(10000)

  const countMap = new Map<string, number>()
  for (const plan of plans ?? []) {
    const sid = (plan as { student_id: string }).student_id
    countMap.set(sid, (countMap.get(sid) ?? 0) + 1)
  }

  return students.map((s) => ({
    ...s,
    iep_count: countMap.get(s.id) ?? 0,
  }))
}

/** Fetch single student by ID */
export async function getStudentById(id: string): Promise<Student | null> {
  const teacherId = await getTeacherId()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .eq('teacher_id', teacherId)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return (data as Student) ?? null
}

/** Fetch IEP plans for a student */
export async function getIepPlansByStudent(studentId: string): Promise<IepPlan[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('iep_plans')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(10000)

  if (error) throw new Error(error.message)
  return (data ?? []) as IepPlan[]
}

/** Fetch single IEP plan by ID */
export async function getIepPlanById(planId: string): Promise<IepPlan | null> {
  const teacherId = await getTeacherId()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('iep_plans')
    .select('*')
    .eq('id', planId)
    .eq('teacher_id', teacherId)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return (data as IepPlan) ?? null
}

/** Fetch weekly plans for an IEP plan */
export async function getWeeklyPlansByIepPlan(iepPlanId: string): Promise<WeeklyPlan[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('iep_plan_id', iepPlanId)
    .order('week_number')
    .limit(10000)

  if (error) throw new Error(error.message)
  return (data ?? []) as WeeklyPlan[]
}

/** Fetch weekly plan counts per IEP plan for a student (efficient single query) */
export async function getWeeklyPlanCountsByStudent(
  studentId: string
): Promise<Map<string, number>> {
  const supabase = await createClient()

  // Join through iep_plans to get weekly_plans belonging to this student
  const { data, error } = await supabase
    .from('weekly_plans')
    .select('iep_plan_id, iep_plans!inner(student_id)')
    .eq('iep_plans.student_id', studentId)
    .limit(10000)

  if (error) throw new Error(error.message)

  const countMap = new Map<string, number>()
  for (const row of data ?? []) {
    const planId = (row as { iep_plan_id: string }).iep_plan_id
    countMap.set(planId, (countMap.get(planId) ?? 0) + 1)
  }
  return countMap
}

/** Fetch considerations for given achievement_standard IDs */
export async function getConsiderationsByStandardIds(
  ids: string[],
): Promise<Map<string, string[]>> {
  if (ids.length === 0) return new Map()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('achievement_standards')
    .select('id, considerations')
    .in('id', ids)
    .limit(10000)

  if (error) throw new Error(error.message)

  const map = new Map<string, string[]>()
  for (const row of data ?? []) {
    const r = row as { id: string; considerations: string[] }
    if (r.considerations && r.considerations.length > 0) {
      map.set(r.id, r.considerations)
    }
  }
  return map
}

/** Progress stats for weekly plans of an IEP plan */
export interface WeeklyPlanProgress {
  total: number
  planned: number
  inProgress: number
  completed: number
  completedPct: number
}

/** Fetch weekly plan progress for a single IEP plan */
export async function getWeeklyPlanProgress(
  iepPlanId: string,
): Promise<WeeklyPlanProgress> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_plans')
    .select('status')
    .eq('iep_plan_id', iepPlanId)
    .limit(10000)

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as Array<{ status: WeeklyPlanStatus }>
  const total = rows.length
  const planned = rows.filter((r) => r.status === 'planned').length
  const inProgress = rows.filter((r) => r.status === 'in_progress').length
  const completed = rows.filter((r) => r.status === 'completed').length

  return {
    total,
    planned,
    inProgress,
    completed,
    completedPct: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

/** Fetch weekly plan progress for all IEP plans of a student */
export async function getWeeklyPlanProgressByStudent(
  studentId: string,
): Promise<Map<string, WeeklyPlanProgress>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekly_plans')
    .select('iep_plan_id, status, iep_plans!inner(student_id)')
    .eq('iep_plans.student_id', studentId)
    .limit(10000)

  if (error) throw new Error(error.message)

  const byPlan = new Map<string, Array<{ status: WeeklyPlanStatus }>>()
  for (const row of data ?? []) {
    const r = row as { iep_plan_id: string; status: WeeklyPlanStatus }
    const arr = byPlan.get(r.iep_plan_id) ?? []
    arr.push({ status: r.status })
    byPlan.set(r.iep_plan_id, arr)
  }

  const result = new Map<string, WeeklyPlanProgress>()
  for (const [planId, rows] of byPlan) {
    const total = rows.length
    const planned = rows.filter((r) => r.status === 'planned').length
    const inProgress = rows.filter((r) => r.status === 'in_progress').length
    const completed = rows.filter((r) => r.status === 'completed').length
    result.set(planId, {
      total,
      planned,
      inProgress,
      completed,
      completedPct: total > 0 ? Math.round((completed / total) * 100) : 0,
    })
  }
  return result
}

/** Get current week's incomplete plans for dashboard */
export async function getThisWeekTodos(
  teacherId: string,
): Promise<Array<{ studentName: string; planTitle: string; activity: string; weekNumber: number; weeklyPlanId: string; iepPlanId: string; studentId: string }>> {
  const supabase = await createClient()

  // Get all plans for this teacher
  const { data: plans } = await supabase
    .from('iep_plans')
    .select('id, title, student_id, period_start')
    .eq('teacher_id', teacherId)
    .eq('status', 'active')
    .limit(10000)

  if (!plans || plans.length === 0) return []

  // Calculate current week number for each plan
  const now = new Date()
  const planIds = plans.map((p) => p.id)

  const { data: weeklyData } = await supabase
    .from('weekly_plans')
    .select('*')
    .in('iep_plan_id', planIds)
    .neq('status', 'completed')
    .order('week_number')
    .limit(10000)

  if (!weeklyData || weeklyData.length === 0) return []

  // Get student names
  const studentIds = [...new Set(plans.map((p) => p.student_id))]
  const { data: students } = await supabase
    .from('students')
    .select('id, name')
    .in('id', studentIds)
    .limit(10000)

  const studentMap = new Map<string, string>()
  for (const s of students ?? []) {
    studentMap.set(s.id, s.name)
  }

  const planMap = new Map(plans.map((p) => [p.id, p]))

  // Find the current week for each plan and return incomplete items
  const todos: Array<{ studentName: string; planTitle: string; activity: string; weekNumber: number; weeklyPlanId: string; iepPlanId: string; studentId: string }> = []

  for (const wp of weeklyData as WeeklyPlan[]) {
    const plan = planMap.get(wp.iep_plan_id)
    if (!plan) continue

    const start = new Date(plan.period_start)
    const diffMs = now.getTime() - start.getTime()
    const currentWeek = Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)))

    // Show items for current week and previous incomplete weeks
    if (wp.week_number <= currentWeek) {
      todos.push({
        studentName: studentMap.get(plan.student_id) ?? '',
        planTitle: plan.title,
        activity: wp.activity,
        weekNumber: wp.week_number,
        weeklyPlanId: wp.id,
        iepPlanId: wp.iep_plan_id,
        studentId: plan.student_id,
      })
    }
  }

  return todos.slice(0, 10) // 최대 10건
}
