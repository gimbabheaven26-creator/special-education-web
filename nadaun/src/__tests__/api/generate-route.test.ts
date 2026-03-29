import { describe, it, expect, vi, beforeEach } from 'vitest'

// API route의 인증/유효성/rate-limit 로직을 단위 테스트한다.
// 실제 HTTP 서버 없이 route handler 함수를 직접 호출.

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockIn = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: (...args: unknown[]) => mockGetUser(...args) },
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}))

const mockCheckRateLimit = vi.fn()
vi.mock('@/lib/ai/rate-limiter', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}))

vi.mock('@/lib/ai/client', () => ({
  getAnthropicClient: vi.fn(),
}))

vi.mock('@/lib/ai/pii-filter', () => ({
  stripPii: (text: string) => text,
}))

vi.mock('@/lib/ai/prompts', () => ({
  buildSystemPrompt: vi.fn().mockReturnValue('system'),
  buildUserPrompt: vi.fn().mockReturnValue('user'),
  calculateWeeks: vi.fn().mockReturnValue(8),
}))

const { POST } = await import('@/app/api/generate/route')

function makeRequest(body: unknown): Request {
  return new Request('http://localhost:3001/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 29, resetAt: Date.now() + 86400000 })
})

describe('POST /api/generate', () => {
  it('미인증 시 401을 반환한다', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const res = await POST(makeRequest({ planId: '550e8400-e29b-41d4-a716-446655440000' }) as never)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toContain('인증')
  })

  it('rate limit 초과 시 429를 반환한다', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0, resetAt: Date.now() + 3600000 })
    const res = await POST(makeRequest({ planId: '550e8400-e29b-41d4-a716-446655440000' }) as never)
    expect(res.status).toBe(429)
  })

  it('잘못된 JSON body 시 400을 반환한다', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    const req = new Request('http://localhost:3001/api/generate', {
      method: 'POST',
      body: 'not json',
    })
    const res = await POST(req as never)
    expect(res.status).toBe(400)
  })

  it('planId가 UUID가 아니면 400을 반환한다', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    const res = await POST(makeRequest({ planId: 'not-a-uuid' }) as never)
    expect(res.status).toBe(400)
  })

  it('planId가 없으면 400을 반환한다', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    const res = await POST(makeRequest({}) as never)
    expect(res.status).toBe(400)
  })

  it('계획이 존재하지 않으면 404를 반환한다', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })

    mockSingle.mockReturnValue({ data: null, error: null })
    mockEq.mockReturnValue({ eq: mockEq, single: mockSingle })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect })

    const res = await POST(
      makeRequest({ planId: '550e8400-e29b-41d4-a716-446655440000' }) as never,
    )
    expect(res.status).toBe(404)
  })
})

describe('export Excel route — sanitizeFilename 로직', () => {
  function sanitizeFilename(name: string): string {
    return name.replace(/[^\w가-힣\s-]/g, '').slice(0, 100)
  }

  it('한글과 영문은 유지한다', () => {
    expect(sanitizeFilename('국어 IEP 계획')).toBe('국어 IEP 계획')
  })

  it('특수문자를 제거한다', () => {
    expect(sanitizeFilename('IEP<script>alert</script>')).toBe('IEPscriptalertscript')
  })

  it('100자를 초과하면 잘린다', () => {
    const long = '가'.repeat(150)
    expect(sanitizeFilename(long)).toHaveLength(100)
  })

  it('빈 문자열을 처리한다', () => {
    expect(sanitizeFilename('')).toBe('')
  })

  it('슬래시와 따옴표를 제거한다', () => {
    expect(sanitizeFilename('file/name"test')).toBe('filenametest')
  })
})

describe('export route — UUID 검증 로직', () => {
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  it('유효한 UUID v4를 통과시킨다', () => {
    expect(UUID_RE.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('잘못된 UUID를 거부한다', () => {
    expect(UUID_RE.test('not-a-uuid')).toBe(false)
  })

  it('빈 문자열을 거부한다', () => {
    expect(UUID_RE.test('')).toBe(false)
  })

  it('UUID v1을 거부한다 (4번째 그룹 첫 자리가 4가 아님)', () => {
    expect(UUID_RE.test('550e8400-e29b-11d4-a716-446655440000')).toBe(false)
  })
})
