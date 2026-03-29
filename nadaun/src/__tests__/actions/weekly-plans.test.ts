import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockFrom = vi.fn()

const mockRevalidatePath = vi.fn()

vi.mock('next/cache', () => ({ revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args) }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

vi.mock('@/lib/supabase/auth', () => ({
  getTeacherId: vi.fn().mockResolvedValue('teacher-1'),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'teacher-1' } },
        error: null,
      }),
    },
  }),
}))

const { createWeeklyPlan, updateWeeklyPlan, deleteWeeklyPlan, bulkInsertWeeklyPlans } =
  await import('@/lib/actions/weekly-plans')

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(entries)) fd.append(k, v)
  return fd
}

const validWeeklyData = {
  week_number: '3',
  activity: '듣기 연습',
}

/** 소유권 검증 성공 mock (iep_plans select → plan 존재) */
function setupOwnershipPass() {
  const weeklyChain = {
    eq: mockEq,
    error: null,
  }
  mockEq.mockReturnValue({ eq: mockEq, error: null })
  mockUpdate.mockReturnValue(weeklyChain)
  mockDelete.mockReturnValue(weeklyChain)

  mockFrom.mockImplementation((table: string) => {
    if (table === 'iep_plans') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => ({ data: { id: 'p1' }, error: null }),
            }),
          }),
        }),
      }
    }
    return {
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    }
  })
}

/** 소유권 검증 실패 mock (iep_plans select → null) */
function setupOwnershipFail() {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'iep_plans') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => ({ data: null, error: { code: 'PGRST116', message: 'not found' } }),
            }),
          }),
        }),
      }
    }
    return {
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    }
  })
}

beforeEach(() => {
  vi.clearAllMocks()

  mockInsert.mockReturnValue({ error: null })
  mockUpdate.mockReturnValue({ eq: mockEq })
  mockDelete.mockReturnValue({ eq: mockEq })
  mockEq.mockReturnValue({ eq: mockEq, error: null })
  mockFrom.mockReturnValue({
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  })
})

describe('createWeeklyPlan', () => {
  it('유효한 데이터로 주간계획을 생성한다', async () => {
    const result = await createWeeklyPlan('p1', 's1', {}, makeFormData(validWeeklyData))
    expect(mockFrom).toHaveBeenCalledWith('weekly_plans')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        iep_plan_id: 'p1',
        week_number: 3,
        activity: '듣기 연습',
      }),
    )
    expect(result).toEqual({})
  })

  it('활동 내용이 비어있으면 에러를 반환한다', async () => {
    const result = await createWeeklyPlan(
      'p1',
      's1',
      {},
      makeFormData({ week_number: '1', activity: '' }),
    )
    expect(result.error).toBeDefined()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('주차가 0이면 에러를 반환한다', async () => {
    const result = await createWeeklyPlan(
      'p1',
      's1',
      {},
      makeFormData({ week_number: '0', activity: '활동' }),
    )
    expect(result.error).toBeDefined()
  })

  it('주차가 53이면 에러를 반환한다', async () => {
    const result = await createWeeklyPlan(
      'p1',
      's1',
      {},
      makeFormData({ week_number: '53', activity: '활동' }),
    )
    expect(result.error).toBeDefined()
  })

  it('Supabase 에러 시 에러 메시지를 반환한다', async () => {
    mockInsert.mockReturnValue({ error: { message: '삽입 실패' } })
    const result = await createWeeklyPlan('p1', 's1', {}, makeFormData(validWeeklyData))
    expect(result.error).toBe('삽입 실패')
  })

  it('성공 시 revalidatePath를 호출한다', async () => {
    await createWeeklyPlan('p1', 's1', {}, makeFormData(validWeeklyData))
    expect(mockRevalidatePath).toHaveBeenCalledWith('/students/s1/plans/p1')
  })

  it('선택적 필드가 포함된다', async () => {
    const data = {
      ...validWeeklyData,
      materials: '교과서',
      evaluation_method: '관찰 평가',
      notes: '주의사항',
    }
    await createWeeklyPlan('p1', 's1', {}, makeFormData(data))
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        materials: '교과서',
        evaluation_method: '관찰 평가',
        notes: '주의사항',
      }),
    )
  })
})

describe('updateWeeklyPlan', () => {
  it('소유한 주간계획을 수정한다', async () => {
    setupOwnershipPass()
    const result = await updateWeeklyPlan('w1', 'p1', 's1', {}, makeFormData(validWeeklyData))
    expect(result).toEqual({})
  })

  it('유효하지 않은 데이터는 에러를 반환한다', async () => {
    setupOwnershipPass()
    const result = await updateWeeklyPlan(
      'w1',
      'p1',
      's1',
      {},
      makeFormData({ week_number: '1', activity: '' }),
    )
    expect(result.error).toBeDefined()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('타 교사의 IEP plan 수정 시 권한 에러를 반환한다', async () => {
    setupOwnershipFail()
    const result = await updateWeeklyPlan('w1', 'p1', 's1', {}, makeFormData(validWeeklyData))
    expect(result.error).toBe('권한이 없습니다.')
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})

describe('deleteWeeklyPlan', () => {
  it('소유한 주간계획을 삭제한다', async () => {
    setupOwnershipPass()
    const result = await deleteWeeklyPlan('w1', 'p1', 's1')
    expect(result).toEqual({})
  })

  it('타 교사의 IEP plan 삭제 시 권한 에러를 반환한다', async () => {
    setupOwnershipFail()
    const result = await deleteWeeklyPlan('w1', 'p1', 's1')
    expect(result.error).toBe('권한이 없습니다.')
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('성공 시 revalidatePath를 호출한다', async () => {
    setupOwnershipPass()
    await deleteWeeklyPlan('w1', 'p1', 's1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/students/s1/plans/p1')
  })
})

describe('bulkInsertWeeklyPlans', () => {
  const plans = [
    {
      week_number: 1,
      achievement_standard_id: null,
      activity: '1주차 활동',
      materials: null,
      evaluation_method: null,
      notes: null,
    },
    {
      week_number: 2,
      achievement_standard_id: '550e8400-e29b-41d4-a716-446655440000',
      activity: '2주차 활동',
      materials: '교과서',
      evaluation_method: '관찰',
      notes: '참고',
    },
  ]

  it('여러 주간계획을 일괄 삽입한다', async () => {
    const result = await bulkInsertWeeklyPlans('p1', 's1', plans)
    expect(mockFrom).toHaveBeenCalledWith('weekly_plans')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ iep_plan_id: 'p1', week_number: 1, activity: '1주차 활동' }),
        expect.objectContaining({ iep_plan_id: 'p1', week_number: 2, activity: '2주차 활동' }),
      ]),
    )
    expect(result).toEqual({})
  })

  it('Supabase 에러 시 에러를 반환한다', async () => {
    mockInsert.mockReturnValue({ error: { message: '일괄 삽입 실패' } })
    const result = await bulkInsertWeeklyPlans('p1', 's1', plans)
    expect(result.error).toBe('일괄 삽입 실패')
  })

  it('성공 시 revalidatePath를 호출한다', async () => {
    await bulkInsertWeeklyPlans('p1', 's1', plans)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/students/s1/plans/p1')
  })
})
