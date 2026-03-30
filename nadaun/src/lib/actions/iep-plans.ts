'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTeacherId } from '@/lib/supabase/auth'
import { z } from 'zod'
import { iepPlanSchema } from '@/lib/schemas/iep-plan'

const statusSchema = z.enum(['draft', 'active', 'completed'])
import type { IepGoal } from '@/types/students'

export type ActionResult = { error?: string }

export async function createIepPlan(
  studentId: string,
  goals: IepGoal[],
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const teacherId = await getTeacherId()

  const parsed = iepPlanSchema.safeParse({
    title: formData.get('title'),
    subject: formData.get('subject'),
    period_start: formData.get('period_start'),
    period_end: formData.get('period_end'),
    goals,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('iep_plans')
    .insert({
      student_id: studentId,
      teacher_id: teacherId,
      title: parsed.data.title,
      subject: parsed.data.subject,
      period_start: parsed.data.period_start,
      period_end: parsed.data.period_end,
      goals: parsed.data.goals,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/students/${studentId}`)
  redirect(`/students/${studentId}/plans/${data.id}`)
}

export async function updateIepPlan(
  planId: string,
  studentId: string,
  goals: IepGoal[],
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const teacherId = await getTeacherId()

  const parsed = iepPlanSchema.safeParse({
    title: formData.get('title'),
    subject: formData.get('subject'),
    period_start: formData.get('period_start'),
    period_end: formData.get('period_end'),
    goals,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('iep_plans')
    .update({
      title: parsed.data.title,
      subject: parsed.data.subject,
      period_start: parsed.data.period_start,
      period_end: parsed.data.period_end,
      goals: parsed.data.goals,
    })
    .eq('id', planId)
    .eq('teacher_id', teacherId)

  if (error) return { error: error.message }

  revalidatePath(`/students/${studentId}`)
  revalidatePath(`/students/${studentId}/plans/${planId}`)
  redirect(`/students/${studentId}/plans/${planId}`)
}

export async function updateIepPlanStatus(
  planId: string,
  studentId: string,
  newStatus: 'draft' | 'active' | 'completed'
): Promise<ActionResult> {
  const parsed = statusSchema.safeParse(newStatus)
  if (!parsed.success) return { error: '올바르지 않은 상태값입니다.' }

  const teacherId = await getTeacherId()
  const supabase = await createClient()

  const { error } = await supabase
    .from('iep_plans')
    .update({ status: newStatus })
    .eq('id', planId)
    .eq('teacher_id', teacherId)

  if (error) return { error: error.message }

  revalidatePath(`/students/${studentId}/plans/${planId}`)
  return {}
}

export async function deleteIepPlan(
  planId: string,
  studentId: string
): Promise<ActionResult> {
  const teacherId = await getTeacherId()
  const supabase = await createClient()

  const { error } = await supabase
    .from('iep_plans')
    .delete()
    .eq('id', planId)
    .eq('teacher_id', teacherId)

  if (error) return { error: error.message }

  revalidatePath(`/students/${studentId}`)
  redirect(`/students/${studentId}`)
}
