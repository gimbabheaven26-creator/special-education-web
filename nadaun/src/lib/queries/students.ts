import { createClient } from '@/lib/supabase/server'
import { getTeacherId } from '@/lib/supabase/auth'
import type { Student, StudentWithIepCount, IepPlan, WeeklyPlan } from '@/types/students'

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
