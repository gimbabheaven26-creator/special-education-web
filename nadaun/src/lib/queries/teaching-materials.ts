import { createClient } from '@/lib/supabase/server'
import type { TeachingMaterial } from '@/types/students'

export async function getTeachingMaterialsByWeeklyPlan(
  weeklyPlanId: string,
): Promise<TeachingMaterial[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teaching_materials')
    .select('*')
    .eq('weekly_plan_id', weeklyPlanId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as TeachingMaterial[]
}

export async function getTeachingMaterialsByIepPlan(
  iepPlanId: string,
): Promise<TeachingMaterial[]> {
  const supabase = await createClient()

  // 먼저 주간계획 ID 목록 가져오기
  const { data: weeklyPlans } = await supabase
    .from('weekly_plans')
    .select('id')
    .eq('iep_plan_id', iepPlanId)

  if (!weeklyPlans || weeklyPlans.length === 0) return []

  const wpIds = weeklyPlans.map((wp) => wp.id)
  const { data, error } = await supabase
    .from('teaching_materials')
    .select('*')
    .in('weekly_plan_id', wpIds)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as TeachingMaterial[]
}
