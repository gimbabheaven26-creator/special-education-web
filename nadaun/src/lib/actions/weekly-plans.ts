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
