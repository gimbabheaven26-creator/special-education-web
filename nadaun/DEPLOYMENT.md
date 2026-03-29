# 나다운 배포 가이드

## Vercel 프로젝트 설정

1. Vercel에서 **New Project** → GitHub 레포 `gimbabheaven26-creator/special-education-web` 연결
2. **Root Directory**: `nadaun` 입력
3. **Framework Preset**: Next.js (자동 감지)
4. 환경변수 입력 후 **Deploy**

## 환경변수 (필수)

| 변수명 | 용도 | 설정 위치 |
|--------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Vercel Settings → Environment Variables |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 (anon) | Vercel Settings → Environment Variables |
| `ANTHROPIC_API_KEY` | Claude API (AI 주차별 계획 생성) | Vercel Settings → Environment Variables |

> `SUPABASE_SERVICE_ROLE_KEY`는 로컬 스크립트 전용. Vercel에 **절대 설정하지 않는다**.

## Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com) → OAuth 2.0 Client
2. **Authorized redirect URIs**에 프로덕션 URL 추가:
   ```
   https://<your-domain>/auth/callback
   ```
3. [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → Providers → Google
   - Client ID / Secret 입력
   - Redirect URL이 위와 일치하는지 확인

## 배포 후 체크리스트

- [ ] 홈페이지 (`/`) 접속 확인
- [ ] Google 로그인 → 콜백 → 리다이렉트 정상 동작
- [ ] 키움이 등록 (`/students/new`) 정상 동작
- [ ] IEP 계획 생성 → 주차별 계획 추가 확인
- [ ] AI 주차별 계획 생성 버튼 동작 (ANTHROPIC_API_KEY 확인)
- [ ] Excel / PDF 내보내기 정상 동작
- [ ] 미인증 상태에서 `/students` 접근 시 `/login`으로 리다이렉트
- [ ] E2E_AUTH_BYPASS가 프로덕션에서 무시되는지 확인 (NODE_ENV=production 가드)
