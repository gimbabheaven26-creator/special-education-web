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

const { createStudent, updateStudent, deleteStudent } = await import(
  '@/lib/actions/students'
)

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(entries)) fd.append(k, v)
  return fd
}

beforeEach(() => {
  vi.clearAllMocks()

  mockSingle.mockReturnValue({ data: { id: 's-new' }, error: null })
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

describe('createStudent', () => {
  const validData = { name: '김민수', grade: '중1' }

  it('유효한 데이터로 학생을 생성한다', async () => {
    await createStudent({}, makeFormData(validData))
    expect(mockFrom).toHaveBeenCalledWith('students')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ name: '김민수', grade: '중1', teacher_id: 'teacher-1' }),
    )
  })

  it('이름이 비어있으면 에러를 반환한다', async () => {
    const result = await createStudent({}, makeFormData({ name: '', grade: '중1' }))
    expect(result.error).toBeDefined()
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('잘못된 학년은 에러를 반환한다', async () => {
    const result = await createStudent({}, makeFormData({ name: '김민수', grade: '고1' }))
    expect(result.error).toBeDefined()
  })

  it('Supabase 에러 시 에러 메시지를 반환한다', async () => {
    mockSingle.mockReturnValue({ data: null, error: { message: 'RLS 위반' } })
    const result = await createStudent({}, makeFormData(validData))
    expect(result.error).toBe('RLS 위반')
  })

  it('성공 시 revalidatePath와 redirect를 호출한다', async () => {
    await createStudent({}, makeFormData(validData))
    expect(mockRevalidatePath).toHaveBeenCalledWith('/students')
    expect(mockRedirect).toHaveBeenCalledWith('/students/s-new')
  })
})

describe('updateStudent', () => {
  const validData = { name: '이영희', grade: '중2' }

  it('학생 정보를 수정한다', async () => {
    mockEq.mockReturnValue({ eq: vi.fn().mockReturnValue({ error: null }) })
    await updateStudent('s1', {}, makeFormData(validData))
    expect(mockFrom).toHaveBeenCalledWith('students')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ name: '이영희', grade: '중2' }),
    )
  })

  it('유효하지 않은 데이터는 에러를 반환한다', async () => {
    const result = await updateStudent('s1', {}, makeFormData({ name: '', grade: '중1' }))
    expect(result.error).toBeDefined()
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})

describe('deleteStudent', () => {
  it('학생을 삭제한다', async () => {
    mockEq.mockReturnValue({ eq: vi.fn().mockReturnValue({ error: null }) })
    await deleteStudent('s1')
    expect(mockFrom).toHaveBeenCalledWith('students')
    expect(mockDelete).toHaveBeenCalled()
  })

  it('Supabase 에러 시 에러를 반환한다', async () => {
    mockEq.mockReturnValue({
      eq: vi.fn().mockReturnValue({ error: { message: '삭제 실패' } }),
    })
    const result = await deleteStudent('s1')
    expect(result.error).toBe('삭제 실패')
  })

  it('성공 시 redirect를 호출한다', async () => {
    mockEq.mockReturnValue({ eq: vi.fn().mockReturnValue({ error: null }) })
    await deleteStudent('s1')
    expect(mockRedirect).toHaveBeenCalledWith('/students')
  })
})
