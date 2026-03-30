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

## Supabase 설정

1. [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → URL Configuration
2. **Site URL**에 Vercel 배포 도메인 입력: `https://<your-domain>`
3. **Redirect URLs**에 콜백 경로 추가: `https://<your-domain>/auth/callback`

## 배포 후 체크리스트

### 인증
- [ ] 미인증 → `/students` 접근 시 `/login`으로 리다이렉트
- [ ] Google 로그인 → 콜백 → 리다이렉트 정상 동작
- [ ] E2E_AUTH_BYPASS가 프로덕션에서 무시 확인

### 핵심 기능
- [ ] 홈페이지 (`/`) 접속 + 대시보드 확인
- [ ] 키움이 등록 (`/students/new`)
- [ ] IEP 계획 생성 → 목표 추가 → 현행수준 평가
- [ ] AI 주차별 계획 생성 (ANTHROPIC_API_KEY 확인)
- [ ] 주간계획 상태 토글 (예정→진행→완료) + 달성도 입력
- [ ] 학기말 보고서 페이지 확인 + 인쇄 레이아웃
- [ ] Excel / PDF 내보내기 정상 동작

### PWA + 모바일
- [ ] 모바일에서 하단 네비게이션 표시
- [ ] 홈화면 추가(A2HS) 동작 확인
- [ ] 오프라인 페이지 (`/offline`) 표시 확인
