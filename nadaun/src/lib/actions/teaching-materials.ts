'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { TeachingMaterialType } from '@/types/students'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
]

export async function addTeachingMaterial(
  weeklyPlanId: string,
  iepPlanId: string,
  studentId: string,
  type: TeachingMaterialType,
  title: string,
  content: string | null,
) {
  const supabase = await createClient()

  const { error } = await supabase.from('teaching_materials').insert({
    weekly_plan_id: weeklyPlanId,
    type,
    title: title.trim(),
    content: content?.trim() || null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/students/${studentId}/plans/${iepPlanId}`)
  return { error: null }
}

export async function uploadTeachingMaterialFile(
  weeklyPlanId: string,
  iepPlanId: string,
  studentId: string,
  formData: FormData,
) {
  const file = formData.get('file') as File | null
  const title = (formData.get('title') as string)?.trim()

  if (!file) return { error: '파일을 선택해 주세요.' }
  if (!title) return { error: '제목을 입력해 주세요.' }
  if (file.size > MAX_FILE_SIZE) return { error: '파일 크기는 5MB 이하만 가능합니다.' }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { error: '허용되지 않는 파일 형식입니다. (PDF, 이미지만 가능)' }
  }

  const supabase = await createClient()

  // Storage 업로드
  const fileExt = file.name.split('.').pop() ?? 'bin'
  const filePath = `${weeklyPlanId}/${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('nadaun-files')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) return { error: '파일 업로드 실패: ' + uploadError.message }

  // Public URL
  const { data: urlData } = supabase.storage
    .from('nadaun-files')
    .getPublicUrl(filePath)

  const { error: dbError } = await supabase.from('teaching_materials').insert({
    weekly_plan_id: weeklyPlanId,
    type: 'file' as const,
    title,
    file_url: urlData.publicUrl,
    mime_type: file.type,
    file_size: file.size,
  })

  if (dbError) return { error: dbError.message }

  revalidatePath(`/students/${studentId}/plans/${iepPlanId}`)
  return { error: null }
}

export async function deleteTeachingMaterial(
  materialId: string,
  iepPlanId: string,
  studentId: string,
) {
  const supabase = await createClient()

  // 파일이면 Storage에서도 삭제
  const { data: material } = await supabase
    .from('teaching_materials')
    .select('file_url')
    .eq('id', materialId)
    .single()

  if (material?.file_url) {
    const urlPath = new URL(material.file_url).pathname
    const storagePath = urlPath.split('/nadaun-files/').pop()
    if (storagePath) {
      await supabase.storage.from('nadaun-files').remove([storagePath])
    }
  }

  const { error } = await supabase
    .from('teaching_materials')
    .delete()
    .eq('id', materialId)

  if (error) return { error: error.message }

  revalidatePath(`/students/${studentId}/plans/${iepPlanId}`)
  return { error: null }
}
