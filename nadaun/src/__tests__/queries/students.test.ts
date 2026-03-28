import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Student, IepPlan, WeeklyPlan } from '@/types/students'

const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()
const mockSingle = vi.fn()
const mockLimit = vi.fn()

function createChainMock(data: unknown, error: unknown = null) {
  const result = { data, error }
  mockLimit.mockReturnValue(result)
  mockOrder.mockReturnValue({ limit: mockLimit, ...result })
  mockEq.mockReturnValue({
    eq: mockEq,
    order: mockOrder,
    limit: mockLimit,
    single: mockSingle,
    ...result,
  })
  mockSelect.mockReturnValue({
    eq: mockEq,
    order: mockOrder,
    limit: mockLimit,
    ...result,
  })
  mockSingle.mockReturnValue(result)
  mockFrom.mockReturnValue({ select: mockSelect })
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: (...args: unknown[]) => mockFrom(...args),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'teacher-1' } }, error: null }) },
  }),
}))

const {
  getStudents,
  getStudentById,
  getIepPlansByStudent,
  getIepPlanById,
  getWeeklyPlansByIepPlan,
} = await import('@/lib/queries/students')

const STUDENT_FIXTURES: Partial<Student>[] = [
  { id: 's1', teacher_id: 'teacher-1', name: '김민수', grade: '중1' },
  { id: 's2', teacher_id: 'teacher-1', name: '이영희', grade: '중2' },
]

const PLAN_FIXTURES: Partial<IepPlan>[] = [
  { id: 'p1', student_id: 's1', teacher_id: 'teacher-1', title: '국어 IEP', subject: '국어', status: 'draft' },
]

const WEEKLY_FIXTURES: Partial<WeeklyPlan>[] = [
  { id: 'w1', iep_plan_id: 'p1', week_number: 1, activity: '듣기 연습' },
  { id: 'w2', iep_plan_id: 'p1', week_number: 2, activity: '읽기 연습' },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getStudents', () => {
  it('calls supabase with correct table', async () => {
    createChainMock(STUDENT_FIXTURES)
    await getStudents()
    expect(mockFrom).toHaveBeenCalledWith('students')
  })

  it('returns student list', async () => {
    createChainMock(STUDENT_FIXTURES)
    const result = await getStudents()
    expect(result).toHaveLength(2)
  })

  it('throws on error', async () => {
    createChainMock(null, { message: 'RLS error' })
    await expect(getStudents()).rejects.toThrow('RLS error')
  })
})

describe('getStudentById', () => {
  it('returns single student', async () => {
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ eq: mockEq, single: mockSingle })
    mockSingle.mockReturnValue({ data: STUDENT_FIXTURES[0], error: null })

    const result = await getStudentById('s1')
    expect(result).toEqual(STUDENT_FIXTURES[0])
  })

  it('returns null for non-existent', async () => {
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ eq: mockEq, single: mockSingle })
    mockSingle.mockReturnValue({ data: null, error: null })

    const result = await getStudentById('nonexistent')
    expect(result).toBeNull()
  })
})

describe('getIepPlansByStudent', () => {
  it('returns plans for student', async () => {
    createChainMock(PLAN_FIXTURES)
    const result = await getIepPlansByStudent('s1')
    expect(result).toHaveLength(1)
  })
})

describe('getIepPlanById', () => {
  it('returns single plan', async () => {
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ eq: mockEq, single: mockSingle })
    mockSingle.mockReturnValue({ data: PLAN_FIXTURES[0], error: null })

    const result = await getIepPlanById('p1')
    expect(result).toEqual(PLAN_FIXTURES[0])
  })
})

describe('getWeeklyPlansByIepPlan', () => {
  it('returns weekly plans ordered by week', async () => {
    createChainMock(WEEKLY_FIXTURES)
    const result = await getWeeklyPlansByIepPlan('p1')
    expect(result).toHaveLength(2)
  })
})
