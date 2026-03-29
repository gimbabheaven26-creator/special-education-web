'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { weeklyPlanSchema } from '@/lib/schemas/iep-plan'

export type ActionResult = { error?: string }

export async function createWeeklyPlan(
  iepPlanId: string,
  studentId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = weeklyPlanSchema.safeParse({
    week_number: Number(formData.get('week_number')),
    achievement_standard_id: formData.get('achievement_standard_id') || undefined,
    activity: formData.get('activity'),
    materials: formData.get('materials') || undefined,
    evaluation_method: formData.get('evaluation_method') || undefined,
    notes: formData.get('notes') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('weekly_plans')
    .insert({ ...parsed.data, iep_plan_id: iepPlanId })

  if (error) return { error: error.message }

  revalidatePath(`/students/${studentId}/plans/${iepPlanId}`)
  return {}
}

export async function updateWeeklyPlan(
  weeklyPlanId: string,
  iepPlanId: string,
  studentId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = weeklyPlanSchema.safeParse({
    week_number: Number(formData.get('week_number')),
    achievement_standard_id: formData.get('achievement_standard_id') || undefined,
    activity: formData.get('activity'),
    materials: formData.get('materials') || undefined,
    evaluation_method: formData.get('evaluation_method') || undefined,
    notes: formData.get('notes') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('weekly_plans')
    .update(parsed.data)
    .eq('id', weeklyPlanId)

  if (error) return { error: error.message }

  revalidatePath(`/students/${studentId}/plans/${iepPlanId}`)
  return {}
}

export async function bulkInsertWeeklyPlans(
  iepPlanId: string,
  studentId: string,
  plans: Array<{
    week_number: number
    achievement_standard_id: string | null
    activity: string
    materials: string | null
    evaluation_method: string | null
    notes: string | null
  }>
): Promise<ActionResult> {
  const supabase = await createClient()
  const rows = plans.map((wp) => ({
    iep_plan_id: iepPlanId,
    week_number: wp.week_number,
    achievement_standard_id: wp.achievement_standard_id || null,
    activity: wp.activity,
    materials: wp.materials || null,
    evaluation_method: wp.evaluation_method || null,
    notes: wp.notes || null,
  }))

  const { error } = await supabase.from('weekly_plans').insert(rows)
  if (error) return { error: error.message }

  revalidatePath(`/students/${studentId}/plans/${iepPlanId}`)
  return {}
}

export async function deleteWeeklyPlan(
  weeklyPlanId: string,
  iepPlanId: string,
  studentId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('weekly_plans')
    .delete()
    .eq('id', weeklyPlanId)

  if (error) return { error: error.message }

  revalidatePath(`/students/${studentId}/plans/${iepPlanId}`)
  return {}
}
