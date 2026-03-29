'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  createWeeklyPlan,
  updateWeeklyPlan,
  deleteWeeklyPlan,
} from '@/lib/actions/weekly-plans'
import { WeeklyPlanForm } from './weekly-plan-form'
import { WeeklyPlanItem } from './weekly-plan-item'
import type { WeeklyPlan, IepGoal } from '@/types/students'

interface WeeklyPlanSectionProps {
  iepPlanId: string
  studentId: string
  weeklyPlans: WeeklyPlan[]
  planGoals: IepGoal[]
}

export function WeeklyPlanSection({
  iepPlanId,
  studentId,
  weeklyPlans,
  planGoals,
}: WeeklyPlanSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await createWeeklyPlan(
          iepPlanId,
          studentId,
          {},
          formData,
        )
        if (result?.error) {
          setError(result.error)
        } else {
          setShowForm(false)
          setError(null)
        }
      } catch {
        // revalidation
      }
    })
  }

  async function handleDelete(weeklyPlanId: string) {
    setDeletingId(weeklyPlanId)
    try {
      await deleteWeeklyPlan(weeklyPlanId, iepPlanId, studentId)
    } catch {
      // revalidation redirect
    } finally {
      setDeletingId(null)
    }
  }

  function handleEdit(formData: FormData) {
    if (!editingId) return
    const weekNum = Number(formData.get('week_number'))
    const duplicate = weeklyPlans.find(
      (w) => w.week_number === weekNum && w.id !== editingId,
    )
    if (duplicate) {
      setEditError(`${weekNum}주차가 이미 존재합니다.`)
      return
    }
    startTransition(async () => {
      try {
        const result = await updateWeeklyPlan(
          editingId,
          iepPlanId,
          studentId,
          {},
          formData,
        )
        if (result?.error) {
          setEditError(result.error)
        } else {
          setEditingId(null)
          setEditError(null)
        }
      } catch {
        // revalidation
      }
    })
  }

  const nextWeekNumber =
    weeklyPlans.length > 0
      ? Math.max(...weeklyPlans.map((w) => w.week_number)) + 1
      : 1

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          주차별 계획 ({weeklyPlans.length}개)
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          aria-label={showForm ? '주차 추가 취소' : '주차 추가'}
        >
          {showForm ? '취소' : '+ 주차 추가'}
        </Button>
      </div>

      {showForm && (
        <WeeklyPlanForm
          planGoals={planGoals}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          error={error}
          isPending={isPending}
          submitLabel="주차 추가"
          pendingLabel="추가 중..."
          defaultValues={{ week_number: nextWeekNumber, activity: '' }}
        />
      )}

      {weeklyPlans.length === 0 && !showForm && (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            아직 주차별 계획이 없습니다.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {weeklyPlans.map((wp) => (
          <WeeklyPlanItem
            key={wp.id}
            weeklyPlan={wp}
            planGoals={planGoals}
            isEditing={editingId === wp.id}
            isDeletingThis={deletingId === wp.id}
            isPending={isPending}
            editError={editError}
            onEdit={(id) => { setEditingId(id); setEditError(null) }}
            onCancelEdit={() => { setEditingId(null); setEditError(null) }}
            onSubmitEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}
