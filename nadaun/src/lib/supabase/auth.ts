import { createClient } from './server'

/** E2E 테스트용 더미 교사 ID */
const E2E_TEACHER_ID = '00000000-0000-0000-0000-e2e000000001'

/**
 * 인증된 교사 ID를 반환한다.
 * E2E_AUTH_BYPASS=true 환경에서는 더미 ID를 반환하여 인증 없이 테스트 가능.
 */
export async function getTeacherId(): Promise<string> {
  if (
    process.env.E2E_AUTH_BYPASS === 'true' &&
    process.env.NODE_ENV !== 'production'
  ) {
    return E2E_TEACHER_ID
  }

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('인증이 필요합니다.')
  return user.id
}
