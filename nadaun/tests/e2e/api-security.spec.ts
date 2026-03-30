import { test, expect } from '@playwright/test'

/**
 * API 보안 E2E 테스트
 *
 * Playwright request 픽스처는 브라우저 쿠키를 공유하지 않으므로
 * 미인증 상태의 API 호출을 검증할 수 있다.
 *
 * E2E_AUTH_BYPASS=true 환경에서도 API route 자체의
 * supabase.auth.getUser() 가드가 작동하는지 확인한다.
 */

test.describe('API 보안 — 미인증 요청 401 JSON 검증', () => {
  test('/api/generate — 미인증 시 401 JSON 반환', async ({ request }) => {
    const response = await request.post('/api/generate', {
      data: { planId: '550e8400-e29b-41d4-a716-446655440000' },
    })
    expect(response.status()).toBe(401)
    const json = await response.json()
    expect(json.error).toContain('인증')
  })

  test('/api/export/excel — 미인증 시 401 JSON 반환', async ({ request }) => {
    const response = await request.get(
      '/api/export/excel?planId=550e8400-e29b-41d4-a716-446655440000',
    )
    expect(response.status()).toBe(401)
    const json = await response.json()
    expect(json.error).toContain('인증')
  })

  test('/api/export/pdf — 미인증 시 401 JSON 반환', async ({ request }) => {
    const response = await request.get(
      '/api/export/pdf?planId=550e8400-e29b-41d4-a716-446655440000',
    )
    expect(response.status()).toBe(401)
    const json = await response.json()
    expect(json.error).toContain('인증')
  })
})

test.describe('API 보안 — 입력 검증', () => {
  test('/api/generate — 잘못된 UUID 시 400 반환', async ({ request }) => {
    const response = await request.post('/api/generate', {
      data: { planId: 'not-a-uuid' },
    })
    // 401 (미인증) 또는 400 (입력 검증) — 미인증이 먼저 체크됨
    expect([400, 401]).toContain(response.status())
  })

  test('/api/generate — body 없으면 400 반환', async ({ request }) => {
    const response = await request.post('/api/generate', {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    })
    expect([400, 401]).toContain(response.status())
  })

  test('/api/export/excel — planId 없으면 400 반환', async ({ request }) => {
    const response = await request.get('/api/export/excel')
    expect(response.status()).toBe(400)
    const json = await response.json()
    expect(json.error).toBeDefined()
  })

  test('/api/export/excel — 잘못된 UUID 시 400 반환', async ({ request }) => {
    const response = await request.get('/api/export/excel?planId=injection-attempt')
    expect(response.status()).toBe(400)
  })

  test('/api/export/pdf — planId도 studentId도 없으면 400 반환', async ({ request }) => {
    const response = await request.get('/api/export/pdf')
    expect(response.status()).toBe(400)
    const json = await response.json()
    expect(json.error).toBeDefined()
  })

  test('/api/export/pdf — 잘못된 UUID 시 400 반환', async ({ request }) => {
    const response = await request.get('/api/export/pdf?planId=<script>alert(1)</script>')
    expect(response.status()).toBe(400)
  })
})

test.describe('API 보안 — 응답 헤더', () => {
  test('API 에러 응답이 JSON Content-Type을 반환한다', async ({ request }) => {
    const response = await request.get('/api/export/excel')
    const contentType = response.headers()['content-type']
    expect(contentType).toContain('application/json')
  })

  test('API 에러 응답에 내부 정보가 노출되지 않는다', async ({ request }) => {
    const response = await request.get('/api/export/excel?planId=invalid')
    const json = await response.json()
    // 스택 트레이스, 쿼리, 내부 경로 등이 없어야 함
    const errorStr = JSON.stringify(json)
    expect(errorStr).not.toContain('stack')
    expect(errorStr).not.toContain('node_modules')
    expect(errorStr).not.toContain('supabase')
  })
})
