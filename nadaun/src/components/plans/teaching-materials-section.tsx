'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  addTeachingMaterial,
  uploadTeachingMaterialFile,
  deleteTeachingMaterial,
} from '@/lib/actions/teaching-materials'
import { showSuccess, showError } from '@/lib/utils/toast'
import type { TeachingMaterial, TeachingMaterialType } from '@/types/students'

const TYPE_LABELS: Record<TeachingMaterialType, string> = {
  link: '링크',
  file: '파일',
  note: '메모',
}

const TYPE_ICONS: Record<TeachingMaterialType, string> = {
  link: '🔗',
  file: '📎',
  note: '📝',
}

interface TeachingMaterialsSectionProps {
  weeklyPlanId: string
  iepPlanId: string
  studentId: string
  materials: TeachingMaterial[]
  weekNumber: number
}

export function TeachingMaterialsSection({
  weeklyPlanId,
  iepPlanId,
  studentId,
  materials,
  weekNumber,
}: TeachingMaterialsSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<TeachingMaterialType>('link')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()

  function resetForm() {
    setShowForm(false)
    setTitle('')
    setContent('')
    setFormType('link')
  }

  function handleAddMaterial() {
    if (!title.trim()) return
    startTransition(async () => {
      const result = await addTeachingMaterial(
        weeklyPlanId,
        iepPlanId,
        studentId,
        formType,
        title,
        content || null,
      )
      if (result.error) {
        showError(result.error)
      } else {
        showSuccess('자료 추가됨')
        resetForm()
      }
    })
  }

  function handleFileUpload(formData: FormData) {
    startTransition(async () => {
      const result = await uploadTeachingMaterialFile(
        weeklyPlanId,
        iepPlanId,
        studentId,
        formData,
      )
      if (result.error) {
        showError(result.error)
      } else {
        showSuccess('파일 업로드 완료')
        resetForm()
      }
    })
  }

  function handleDelete(materialId: string) {
    startTransition(async () => {
      const result = await deleteTeachingMaterial(materialId, iepPlanId, studentId)
      if (result.error) {
        showError(result.error)
      } else {
        showSuccess('자료 삭제됨')
      }
    })
  }

  return (
    <div className="mt-2 space-y-2">
      {/* 자료 목록 */}
      {materials.length > 0 && (
        <div className="space-y-1">
          {materials.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs"
            >
              <span aria-hidden="true">{TYPE_ICONS[m.type]}</span>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {TYPE_LABELS[m.type]}
              </Badge>
              {m.type === 'link' && m.content ? (
                <a
                  href={m.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-primary hover:underline"
                  aria-label={`${m.title} 링크 열기`}
                >
                  {m.title}
                </a>
              ) : m.type === 'file' && m.file_url ? (
                <a
                  href={m.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-primary hover:underline"
                  aria-label={`${m.title} 파일 열기`}
                >
                  {m.title}
                  {m.file_size && (
                    <span className="ml-1 text-muted-foreground">
                      ({(m.file_size / 1024).toFixed(0)}KB)
                    </span>
                  )}
                </a>
              ) : (
                <span className="truncate">{m.title}</span>
              )}
              {m.type === 'note' && m.content && (
                <span className="truncate text-muted-foreground">
                  — {m.content}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(m.id)}
                disabled={isPending}
                className="ml-auto shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`${m.title} 삭제`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 추가 버튼 / 폼 */}
      {showForm ? (
        <Card>
          <CardContent className="pt-3 space-y-3">
            <div className="flex gap-1">
              {(['link', 'note', 'file'] as TeachingMaterialType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormType(t)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    formType === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  aria-label={`자료 유형: ${TYPE_LABELS[t]}`}
                >
                  {TYPE_ICONS[t]} {TYPE_LABELS[t]}
                </button>
              ))}
            </div>

            {formType === 'file' ? (
              <form action={handleFileUpload} className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor={`mat-title-${weeklyPlanId}`}>제목</Label>
                  <Input
                    id={`mat-title-${weeklyPlanId}`}
                    name="title"
                    placeholder="자료 제목"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`mat-file-${weeklyPlanId}`}>파일 (5MB 이하, PDF/이미지)</Label>
                  <Input
                    id={`mat-file-${weeklyPlanId}`}
                    name="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? '업로드 중...' : '업로드'}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                    취소
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor={`mat-title-${weeklyPlanId}`}>제목</Label>
                  <Input
                    id={`mat-title-${weeklyPlanId}`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={formType === 'link' ? '자료 제목' : '메모 제목'}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`mat-content-${weeklyPlanId}`}>
                    {formType === 'link' ? 'URL' : '내용'}
                  </Label>
                  {formType === 'link' ? (
                    <Input
                      id={`mat-content-${weeklyPlanId}`}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="https://..."
                      type="url"
                      className="h-8 text-sm"
                    />
                  ) : (
                    <Textarea
                      id={`mat-content-${weeklyPlanId}`}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="메모 내용"
                      className="min-h-[60px] text-sm"
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddMaterial}
                    disabled={isPending || !title.trim()}
                  >
                    {isPending ? '저장 중...' : '추가'}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                    취소
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`${weekNumber}주차 교수학습 자료 추가`}
        >
          + 교수학습 자료
          {materials.length > 0 && ` (${materials.length})`}
        </button>
      )}
    </div>
  )
}
