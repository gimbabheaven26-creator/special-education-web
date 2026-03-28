import { useState } from 'react'
import type { IepGoal } from '@/types/students'

const EMPTY_GOAL: IepGoal = {
  achievement_standard_id: '',
  achievement_standard_code: '',
  description: '',
  target_level: '보통',
}

export function useGoalList(initial: IepGoal[] = []) {
  const [goals, setGoals] = useState<IepGoal[]>(initial)
  const [selectorOpenForIndex, setSelectorOpenForIndex] = useState<
    number | null
  >(null)

  function addGoal() {
    setGoals((prev) => [...prev, { ...EMPTY_GOAL }])
  }

  function updateGoal(index: number, updated: IepGoal) {
    setGoals((prev) => prev.map((g, i) => (i === index ? updated : g)))
  }

  function removeGoal(index: number) {
    setGoals((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSelectStandard(standard: {
    id: string
    code: string
    content: string
  }) {
    if (selectorOpenForIndex === null) return
    setGoals((prev) =>
      prev.map((g, i) => {
        if (i !== selectorOpenForIndex) return g
        return {
          ...g,
          achievement_standard_id: standard.id,
          achievement_standard_code: standard.code,
          description: g.description || standard.content,
        }
      })
    )
    setSelectorOpenForIndex(null)
  }

  const selectedIds = goals.map((g) => g.achievement_standard_id)

  return {
    goals,
    selectedIds,
    selectorOpenForIndex,
    setSelectorOpenForIndex,
    addGoal,
    updateGoal,
    removeGoal,
    handleSelectStandard,
  }
}
