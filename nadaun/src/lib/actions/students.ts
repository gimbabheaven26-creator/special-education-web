'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { studentSchema } from '@/lib/schemas/student'

export type ActionResult = { error?: string }

async function getTeacherId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('인증이 필요합니다.')
  return user.id
}

export async function createStudent(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const teacherId = await getTeacherId()

  const parsed = studentSchema.safeParse({
    name: formData.get('name'),
    grade: formData.get('grade'),
    disability_type: formData.get('disability_type') || undefined,
    notes: formData.get('notes') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('students')
    .insert({ ...parsed.data, teacher_id: teacherId })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/students')
  redirect(`/students/${data.id}`)
}

export async function updateStudent(
  studentId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const teacherId = await getTeacherId()

  const parsed = studentSchema.safeParse({
    name: formData.get('name'),
    grade: formData.get('grade'),
    disability_type: formData.get('disability_type') || undefined,
    notes: formData.get('notes') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('students')
    .update(parsed.data)
    .eq('id', studentId)
    .eq('teacher_id', teacherId)

  if (error) return { error: error.message }

  revalidatePath('/students')
  revalidatePath(`/students/${studentId}`)
  redirect(`/students/${studentId}`)
}

export async function deleteStudent(studentId: string): Promise<ActionResult> {
  const teacherId = await getTeacherId()
  const supabase = await createClient()

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentId)
    .eq('teacher_id', teacherId)

  if (error) return { error: error.message }

  revalidatePath('/students')
  redirect('/students')
}
