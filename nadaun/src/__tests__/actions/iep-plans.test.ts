import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockFrom = vi.fn()

const mockRevalidatePath = vi.fn()
const mockRedirect = vi.fn()

vi.mock('next/cache', () => ({ revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args) }))
vi.mock('next/navigation', () => ({ redirect: (...args: unknown[]) => mockRedirect(...args) }))

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

const { createIepPlan, updateIepPlan, updateIepPlanStatus, deleteIepPlan } =
  await import('@/lib/actions/iep-plans')

const validGoals = [
  {
    achievement_standard_id: '550e8400-e29b-41d4-a716-446655440000',
    achievement_standard_code: 'KOR-01-01',
    description: '듣기 이해력 향상',
    target_level: '기초' as const,
  },
]

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(entries)) fd.append(k, v)
  return fd
}

const validPlanData = {
  title: '국어 IEP 계획',
  subject: '국어',
  period_start: '2026-03-01',
  period_end: '2026-06-30',
}

beforeEach(() => {
  vi.clearAllMocks()

  mockSingle.mockReturnValue({ data: { id: 'p-new' }, error: null })
  mockSelect.mockReturnValue({ single: mockSingle })
  mockInsert.mockReturnValue({ select: mockSelect })
  mockUpdate.mockReturnValue({ eq: mockEq })
  mockDelete.mockReturnValue({ eq: mockEq })
  mockEq.mockReturnValue({ eq: mockEq, error: null })
  mockFrom.mockReturnValue({
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  })
})

describe('createIepPlan', () => {
  it('유효한 데이터로 IEP 계획을 생성한다', async () => {
    await createIepPlan('s1', validGoals, {}, makeFormData(validPlanData))
    expect(mockFrom).toHaveBeenCalledWith('iep_plans')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        student_id: 's1',
        teacher_id: 'teacher-1',
        title: '국어 IEP 계획',
        subject: '국어',
      }),
    )
  })

  it('제목이 비어있으면 에러를 반환한다', async () => {
    const data = { ...validPlanData, title: '' }
    const result = await createIepPlan('s1', validGoals, {}, makeFormData(data))
    expect(result.error).toBeDefined()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('목표가 없으면 에러를 반환한다', async () => {
    const result = await createIepPlan('s1', [], {}, makeFormData(validPlanData))
    expect(result.error).toBeDefined()
  })

  it('종료일이 시작일보다 앞서면 에러를 반환한다', async () => {
    const data = { ...validPlanData, period_start: '2026-06-30', period_end: '2026-03-01' }
    const result = await createIepPlan('s1', validGoals, {}, makeFormData(data))
    expect(result.error).toBeDefined()
  })

  it('잘못된 과목은 에러를 반환한다', async () => {
    const data = { ...validPlanData, subject: '체육' }
    const result = await createIepPlan('s1', validGoals, {}, makeFormData(data))
    expect(result.error).toBeDefined()
  })

  it('Supabase 에러 시 에러 메시지를 반환한다', async () => {
    mockSingle.mockReturnValue({ data: null, error: { message: 'DB 에러' } })
    const result = await createIepPlan('s1', validGoals, {}, makeFormData(validPlanData))
    expect(result.error).toBe('DB 에러')
  })

  it('성공 시 redirect를 호출한다', async () => {
    await createIepPlan('s1', validGoals, {}, makeFormData(validPlanData))
    expect(mockRedirect).toHaveBeenCalledWith('/students/s1/plans/p-new')
  })
})

describe('updateIepPlan', () => {
  it('IEP 계획을 수정한다', async () => {
    await updateIepPlan('p1', 's1', validGoals, {}, makeFormData(validPlanData))
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ title: '국어 IEP 계획' }),
    )
  })

  it('유효하지 않은 데이터는 에러를 반환한다', async () => {
    const data = { ...validPlanData, title: '' }
    const result = await updateIepPlan('p1', 's1', validGoals, {}, makeFormData(data))
    expect(result.error).toBeDefined()
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})

describe('updateIepPlanStatus', () => {
  it('상태를 변경한다', async () => {
    const result = await updateIepPlanStatus('p1', 's1', 'active')
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'active' })
    expect(result).toEqual({})
  })

  it('성공 시 revalidatePath를 호출한다', async () => {
    await updateIepPlanStatus('p1', 's1', 'completed')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/students/s1/plans/p1')
  })

  it('Supabase 에러 시 에러를 반환한다', async () => {
    mockEq.mockReturnValue({ eq: vi.fn().mockReturnValue({ error: { message: '상태 변경 실패' } }) })
    const result = await updateIepPlanStatus('p1', 's1', 'active')
    expect(result.error).toBe('상태 변경 실패')
  })
})

describe('deleteIepPlan', () => {
  it('IEP 계획을 삭제한다', async () => {
    mockEq.mockReturnValue({ eq: vi.fn().mockReturnValue({ error: null }) })
    await deleteIepPlan('p1', 's1')
    expect(mockFrom).toHaveBeenCalledWith('iep_plans')
  })

  it('성공 시 redirect를 호출한다', async () => {
    mockEq.mockReturnValue({ eq: vi.fn().mockReturnValue({ error: null }) })
    await deleteIepPlan('p1', 's1')
    expect(mockRedirect).toHaveBeenCalledWith('/students/s1')
  })
})
