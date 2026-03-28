import { describe, it, expect } from 'vitest'
import { studentSchema } from '@/lib/schemas/student'

describe('studentSchema', () => {
  it('accepts valid student data', () => {
    const result = studentSchema.safeParse({
      name: '김민수',
      grade: '중1',
    })
    expect(result.success).toBe(true)
  })

  it('accepts full student data', () => {
    const result = studentSchema.safeParse({
      name: '이영희',
      grade: '중3',
      disability_type: '지적장애',
      notes: '수학에 관심이 많음',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = studentSchema.safeParse({
      name: '',
      grade: '중1',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing name', () => {
    const result = studentSchema.safeParse({
      grade: '중1',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid grade', () => {
    const result = studentSchema.safeParse({
      name: '홍길동',
      grade: '고1',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid grades', () => {
    for (const grade of ['중1', '중2', '중3']) {
      const result = studentSchema.safeParse({ name: '테스트', grade })
      expect(result.success).toBe(true)
    }
  })

  it('name max 50 characters', () => {
    const result = studentSchema.safeParse({
      name: 'a'.repeat(51),
      grade: '중1',
    })
    expect(result.success).toBe(false)
  })

  it('allows optional fields to be undefined', () => {
    const result = studentSchema.safeParse({
      name: '박수진',
      grade: '중2',
      disability_type: undefined,
      notes: undefined,
    })
    expect(result.success).toBe(true)
  })
})
