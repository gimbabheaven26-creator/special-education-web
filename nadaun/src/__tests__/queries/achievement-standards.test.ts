import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AchievementStandardRow } from '@/types/achievement-standards'

// Mock Supabase server client
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockIlike = vi.fn()
const mockOr = vi.fn()
const mockOrder = vi.fn()
const mockSingle = vi.fn()
const mockLimit = vi.fn()

function createChainMock(data: unknown[] | unknown, error: unknown = null) {
  const result = { data, error }
  mockLimit.mockReturnValue(result)
  mockOrder.mockReturnValue({ limit: mockLimit, ...result })
  mockOr.mockReturnValue({ order: mockOrder, limit: mockLimit, ...result })
  mockIlike.mockReturnValue({ or: mockOr, order: mockOrder, limit: mockLimit, ...result })
  mockEq.mockReturnValue({
    eq: mockEq,
    order: mockOrder,
    limit: mockLimit,
    ilike: mockIlike,
    or: mockOr,
    ...result,
  })
  mockSelect.mockReturnValue({
    eq: mockEq,
    order: mockOrder,
    limit: mockLimit,
    ilike: mockIlike,
    or: mockOr,
    ...result,
  })
  mockSingle.mockReturnValue(result)
  mockFrom.mockReturnValue({ select: mockSelect })
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}))

// Dynamic import after mock setup
const {
  getSubjectSummaries,
  getDomainsBySubject,
  getStandardsByDomain,
  getStandardByCode,
  searchStandards,
  aggregateSubjectSummaries,
  aggregateDomainSummaries,
} = await import('@/lib/queries/achievement-standards')

const FIXTURES: Partial<AchievementStandardRow>[] = [
  { subject: '국어', domain: '듣기·말하기', domain_code: '01', code: '9국어01-01', sub_domain: null },
  { subject: '국어', domain: '듣기·말하기', domain_code: '01', code: '9국어01-02', sub_domain: null },
  { subject: '국어', domain: '읽기', domain_code: '02', code: '9국어02-01', sub_domain: null },
  { subject: '수학', domain: '수와 연산', domain_code: '01', code: '9수학01-01', sub_domain: '수' },
  { subject: '수학', domain: '수와 연산', domain_code: '01', code: '9수학01-02', sub_domain: '수' },
  { subject: '수학', domain: '수와 연산', domain_code: '01', code: '9수학01-11', sub_domain: '화폐' },
  { subject: '생활영어', domain: '듣기·말하기', domain_code: '01', code: '09생영01-01', sub_domain: null },
  { subject: '진로와 직업', domain: '자기 인식', domain_code: '01', code: '9진로01-01', sub_domain: null },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('aggregateSubjectSummaries', () => {
  it('counts standards per subject', () => {
    const result = aggregateSubjectSummaries(FIXTURES as AchievementStandardRow[])
    expect(result).toHaveLength(4)

    const korean = result.find((s) => s.subject === '국어')
    expect(korean?.count).toBe(3)

    const math = result.find((s) => s.subject === '수학')
    expect(math?.count).toBe(3)
  })

  it('assigns correct slugs', () => {
    const result = aggregateSubjectSummaries(FIXTURES as AchievementStandardRow[])
    const career = result.find((s) => s.subject === '진로와 직업')
    expect(career?.slug).toBe('career')
  })

  it('returns empty array for empty input', () => {
    expect(aggregateSubjectSummaries([])).toEqual([])
  })
})

describe('aggregateDomainSummaries', () => {
  it('counts standards per domain', () => {
    const koreanRows = FIXTURES.filter((r) => r.subject === '국어') as AchievementStandardRow[]
    const result = aggregateDomainSummaries(koreanRows)
    expect(result).toHaveLength(2)

    const listening = result.find((d) => d.domain_code === '01')
    expect(listening?.count).toBe(2)
    expect(listening?.domain).toBe('듣기·말하기')

    const reading = result.find((d) => d.domain_code === '02')
    expect(reading?.count).toBe(1)
  })

  it('extracts sub_domains for math', () => {
    const mathRows = FIXTURES.filter((r) => r.subject === '수학') as AchievementStandardRow[]
    const result = aggregateDomainSummaries(mathRows)
    expect(result).toHaveLength(1)

    const domain = result[0]
    expect(domain.subDomains).toContain('수')
    expect(domain.subDomains).toContain('화폐')
    expect(domain.subDomains).toHaveLength(2)
  })

  it('has empty subDomains for non-math', () => {
    const koreanRows = FIXTURES.filter((r) => r.subject === '국어') as AchievementStandardRow[]
    const result = aggregateDomainSummaries(koreanRows)
    expect(result[0].subDomains).toEqual([])
  })
})

describe('getSubjectSummaries', () => {
  it('calls supabase and returns aggregated data', async () => {
    createChainMock(FIXTURES)
    const result = await getSubjectSummaries()
    expect(mockFrom).toHaveBeenCalledWith('achievement_standards')
    expect(result).toHaveLength(4)
  })

  it('throws on supabase error', async () => {
    createChainMock(null, { message: 'DB error' })
    await expect(getSubjectSummaries()).rejects.toThrow('DB error')
  })
})

describe('getDomainsBySubject', () => {
  it('filters by subject', async () => {
    const koreanRows = FIXTURES.filter((r) => r.subject === '국어')
    createChainMock(koreanRows)
    const result = await getDomainsBySubject('국어')
    expect(mockEq).toHaveBeenCalledWith('subject', '국어')
    expect(result).toHaveLength(2)
  })
})

describe('getStandardsByDomain', () => {
  it('filters by subject and domain_code', async () => {
    const rows = FIXTURES.filter((r) => r.subject === '국어' && r.domain_code === '01')
    createChainMock(rows)
    const result = await getStandardsByDomain('국어', '01')
    expect(result).toHaveLength(2)
  })

  it('filters by sub_domain when provided', async () => {
    const rows = FIXTURES.filter(
      (r) => r.subject === '수학' && r.domain_code === '01' && r.sub_domain === '수'
    )
    createChainMock(rows)
    const result = await getStandardsByDomain('수학', '01', '수')
    expect(result).toHaveLength(2)
  })
})

describe('getStandardByCode', () => {
  it('returns single standard', async () => {
    const row = FIXTURES[0]
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
    mockSingle.mockReturnValue({ data: row, error: null })

    const result = await getStandardByCode('9국어01-01')
    expect(mockEq).toHaveBeenCalledWith('code', '9국어01-01')
    expect(result).toEqual(row)
  })

  it('returns null when not found', async () => {
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
    mockSingle.mockReturnValue({ data: null, error: null })

    const result = await getStandardByCode('nonexistent')
    expect(result).toBeNull()
  })
})

describe('searchStandards', () => {
  it('returns matching rows for query', async () => {
    createChainMock(FIXTURES.slice(0, 2))
    const result = await searchStandards('듣기')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns empty for empty query', async () => {
    const result = await searchStandards('')
    expect(result).toEqual([])
  })
})
