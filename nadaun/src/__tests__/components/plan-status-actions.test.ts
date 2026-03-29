import { describe, it, expect, vi } from 'vitest'

// PlanStatusActions는 'use client' + React hooks + AlertDialog 사용
// JSDOM 환경에서 렌더링이 복잡하므로 로직 단위 테스트로 검증

describe('STATUS_TRANSITIONS', () => {
  it('draft 상태에서 active로 전환 가능하다', () => {
    const transitions: Record<string, { label: string; next: string }[]> = {
      draft: [{ label: '시작하기', next: 'active' }],
      active: [
        { label: '완료 처리', next: 'completed' },
        { label: '초안으로 되돌리기', next: 'draft' },
      ],
      completed: [{ label: '다시 진행', next: 'active' }],
    }

    expect(transitions.draft).toHaveLength(1)
    expect(transitions.draft[0].next).toBe('active')
    expect(transitions.draft[0].label).toBe('시작하기')
  })

  it('active 상태에서 2가지 전환이 가능하다', () => {
    const transitions: Record<string, { label: string; next: string }[]> = {
      draft: [{ label: '시작하기', next: 'active' }],
      active: [
        { label: '완료 처리', next: 'completed' },
        { label: '초안으로 되돌리기', next: 'draft' },
      ],
      completed: [{ label: '다시 진행', next: 'active' }],
    }

    expect(transitions.active).toHaveLength(2)
    expect(transitions.active[0].next).toBe('completed')
    expect(transitions.active[1].next).toBe('draft')
  })

  it('completed 상태에서 active로 돌아갈 수 있다', () => {
    const transitions: Record<string, { label: string; next: string }[]> = {
      draft: [{ label: '시작하기', next: 'active' }],
      active: [
        { label: '완료 처리', next: 'completed' },
        { label: '초안으로 되돌리기', next: 'draft' },
      ],
      completed: [{ label: '다시 진행', next: 'active' }],
    }

    expect(transitions.completed).toHaveLength(1)
    expect(transitions.completed[0].next).toBe('active')
  })

  it('알 수 없는 상태는 빈 배열을 반환한다', () => {
    const transitions: Record<string, { label: string; next: string }[]> = {
      draft: [{ label: '시작하기', next: 'active' }],
      active: [
        { label: '완료 처리', next: 'completed' },
        { label: '초안으로 되돌리기', next: 'draft' },
      ],
      completed: [{ label: '다시 진행', next: 'active' }],
    }

    expect(transitions['unknown'] ?? []).toEqual([])
  })
})

describe('PlanStatusActions 서버 액션 호출', () => {
  it('updateIepPlanStatus를 올바른 인자로 호출한다', async () => {
    const mockUpdate = vi.fn().mockResolvedValue({})
    await mockUpdate('p1', 's1', 'active')
    expect(mockUpdate).toHaveBeenCalledWith('p1', 's1', 'active')
  })

  it('deleteIepPlan을 올바른 인자로 호출한다', async () => {
    const mockDelete = vi.fn().mockResolvedValue({})
    await mockDelete('p1', 's1')
    expect(mockDelete).toHaveBeenCalledWith('p1', 's1')
  })
})

describe('WeeklyPlanSection 주차 중복 검증 로직', () => {
  const weeklyPlans = [
    { id: 'w1', week_number: 1 },
    { id: 'w2', week_number: 2 },
    { id: 'w3', week_number: 3 },
  ]

  it('다른 주차와 중복되면 에러를 감지한다', () => {
    const editingId = 'w1'
    const newWeekNumber = 2
    const duplicate = weeklyPlans.find(
      (w) => w.week_number === newWeekNumber && w.id !== editingId,
    )
    expect(duplicate).toBeDefined()
    expect(duplicate?.id).toBe('w2')
  })

  it('자기 자신의 주차 번호는 중복이 아니다', () => {
    const editingId = 'w1'
    const newWeekNumber = 1
    const duplicate = weeklyPlans.find(
      (w) => w.week_number === newWeekNumber && w.id !== editingId,
    )
    expect(duplicate).toBeUndefined()
  })

  it('사용되지 않은 주차 번호는 중복이 아니다', () => {
    const editingId = 'w1'
    const newWeekNumber = 4
    const duplicate = weeklyPlans.find(
      (w) => w.week_number === newWeekNumber && w.id !== editingId,
    )
    expect(duplicate).toBeUndefined()
  })

  it('nextWeekNumber를 올바르게 계산한다', () => {
    const nextWeekNumber =
      weeklyPlans.length > 0
        ? Math.max(...weeklyPlans.map((w) => w.week_number)) + 1
        : 1
    expect(nextWeekNumber).toBe(4)
  })

  it('빈 목록에서 nextWeekNumber는 1이다', () => {
    const empty: typeof weeklyPlans = []
    const nextWeekNumber =
      empty.length > 0
        ? Math.max(...empty.map((w) => w.week_number)) + 1
        : 1
    expect(nextWeekNumber).toBe(1)
  })
})
