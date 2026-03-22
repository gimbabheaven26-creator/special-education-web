# 강선생 Auth 구현 지시서

> 작성: 스미스 프라임 2026-03-17 | 대상: 강선생 | 시작 시점: 4월 W1

---

## 🚨 스미스 프라임 긴급 푸시 (2026-03-18)

**소프트 런치 준비 — Google OAuth 우선 완성**

카이란 전략 변경: 지인 소수 코호트에게 먼저 배포 → 합격률 추적 → 입소문 확장.
이를 위해 "누가 쓰는지" 추적이 최우선. 4월 W1 계획을 앞당겨 **지금 바로 시작**.

### 이번 세션에서 할 것 (최소 범위)

1. **Google OAuth 연결** — Supabase Studio에서 Google Provider 활성화 (브리핑 Step 3 참고)
2. **`/auth/callback` 정상 작동 확인** — 로그인 후 홈으로 리디렉트
3. **헤더에 로그인 상태 표시** — 로그인 시 아바타/닉네임, 미로그인 시 "로그인" 버튼
4. **`profiles` 테이블 자동 생성** — 로그인 시 `auth.users` → `profiles` 트리거 or 코드 처리

### 이번 세션에서 하지 않는 것
- Kakao OAuth (나중에)
- 이메일/비밀번호 (나중에)
- localStorage → Supabase 전체 동기화 (4월 W3 예정)

> **완료 기준**: Google 계정으로 로그인하면 헤더에 아바타 표시되고 profiles 테이블에 행 생성됨.

---

## 배경 및 목표

s-e-w는 현재 **완전 게스트 모드** (localStorage만 사용). 4월 목표: Supabase Auth 도입 + 학습 데이터 서버 동기화.

**핵심 원칙**: 게스트 모드 유지. Auth 없이도 모든 학습 콘텐츠 접근 가능.

---

## 확정된 의사결정 (스미스 프라임 → 카이란 승인 2026-03-17)

| 항목 | 결정 |
|------|------|
| Auth 프로바이더 | **Kakao OAuth + Google OAuth + 이메일/비밀번호** (3종) |
| 게스트 모드 | 유지 — 비인증 사용자도 퀴즈/워크시트 전부 접근 가능 |
| 동기화 전략 | JSONB blob (user_data 1행/스토어, UPSERT) |
| 라우트 보호 | `/profile/*` 만 인증 필수. 나머지 게스트 허용 |
| DB 스키마 | contract.md v2.3 기준 (profiles, user_data 테이블) — 클루디가 생성 |

---

## 역할 범위 (2026-03-17 변경)

강선생이 Auth 전체 담당 — 코드 + Supabase 설정 모두.
클루디는 콘텐츠 데이터(퀴즈/챕터) 작업에 집중. Auth 관련 클루디 지시 없음.

---

## 선행 작업: Supabase 설정 (W1 시작 전)

### 1. Supabase Auth 활성화

Supabase Studio → Authentication → Settings:
- Site URL: `https://special-education-web.vercel.app`
- Redirect URLs 추가: `https://special-education-web.vercel.app/auth/callback`
- 로컬 개발용: `http://localhost:3000/auth/callback`

### 2. Kakao OAuth 앱 등록

**Kakao Developers** (https://developers.kakao.com):
1. 내 애플리케이션 → 앱 추가 → "특수교육 임용" (또는 원하는 이름)
2. 플랫폼 → Web → 사이트 도메인 추가: `https://special-education-web.vercel.app`
3. 카카오 로그인 → 활성화 ON
4. Redirect URI 추가: `https://ssluhxvbyzqmdkbjwoke.supabase.co/auth/v1/callback`
5. REST API 키 복사

**Supabase Studio** → Authentication → Providers → Kakao:
- Kakao REST API Key 붙여넣기
- 활성화 ON

### 3. Google OAuth 앱 등록

**Google Cloud Console** (https://console.cloud.google.com):
1. 새 프로젝트 생성 (또는 기존 프로젝트)
2. API 및 서비스 → 사용자 인증 정보 → OAuth 2.0 클라이언트 ID 생성
3. 승인된 리디렉션 URI: `https://ssluhxvbyzqmdkbjwoke.supabase.co/auth/v1/callback`
4. 클라이언트 ID + 시크릿 복사

**Supabase Studio** → Authentication → Providers → Google:
- Client ID + Client Secret 붙여넣기
- 활성화 ON

### 4. 마이그레이션 SQL 실행

Supabase Studio → SQL Editor에서 아래 실행:

```sql
-- profiles 테이블 (auth.users 자동 연동)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- user_data 테이블 (Zustand 서버 동기화)
CREATE TABLE IF NOT EXISTS user_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  store_key text NOT NULL CHECK (store_key IN ('study', 'leitner', 'quiz', 'bookmark')),
  data jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, store_key)
);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- profiles RLS 정책
CREATE POLICY "본인만 읽기" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "본인만 수정" ON profiles FOR UPDATE USING (auth.uid() = id);

-- user_data RLS 정책
CREATE POLICY "본인만 읽기" ON user_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "본인만 삽입" ON user_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "본인만 수정" ON user_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "본인만 삭제" ON user_data FOR DELETE USING (auth.uid() = user_id);

-- 신규 사용자 가입 시 profiles 자동 생성 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 참고 패턴: gosari 3-레이어 Supabase 구조

`~/Projects/gosari-namu-path`의 Supabase 클라이언트 구조를 참고하여 동일 패턴으로 구현:

```
src/lib/supabase/
  ├── browser.ts     — createBrowserClient (CSR 컴포넌트)
  ├── server.ts      — createServerClient (RSC, Route Handler)
  └── middleware.ts  — createServerClient (미들웨어 전용)
```

현재 `src/lib/supabase.ts` (단일 browser 클라이언트) → 위 구조로 리팩토링.

---

## W1 (4/1~7): 설계 + 인프라 클라이언트

### 선행 조건

클루디가 W1 동시에 **Supabase Auth 활성화 + 테이블 생성 + OAuth 프로바이더 설정**을 진행.
강선생은 클루디 완료 후 OAuth 테스트 가능. W1 병렬 진행.

### 태스크 목록

**1. 의존성 추가**

```bash
npm install @supabase/ssr
```

**2. Supabase 3-레이어 클라이언트 생성**

`src/lib/supabase/browser.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

`src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
}
```

`src/lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export function createClient(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => { request.cookies.set(name, value); response.cookies.set(name, value, options) }) } }
  )
  return { supabase, response }
}
```

**3. Next.js 미들웨어 생성** (`src/middleware.ts`)

- 세션 갱신 (refresh)
- `/profile/*` → 미인증 시 `/login` 리디렉트
- Auth 콜백 경로 패스스루 (`/auth/callback`)

**4. 기존 supabase.ts 하위 호환 유지**

`src/lib/supabase.ts` → browser 클라이언트 re-export로 대체 (기존 코드 깨지지 않게):
```typescript
// src/lib/supabase.ts — 하위 호환 래퍼
export { createClient } from './supabase/browser'
export const supabase = createClient()  // 기존 named export 유지
```

---

## W2 (4/8~14): Auth UI 구현

### 파일 목록

| 파일 | 역할 |
|------|------|
| `src/app/login/page.tsx` | 로그인/회원가입 통합 페이지 |
| `src/app/auth/callback/route.ts` | OAuth 콜백 처리 |
| `src/components/auth/LoginForm.tsx` | 이메일/비밀번호 폼 |
| `src/components/auth/SocialLoginButtons.tsx` | Kakao + Google OAuth 버튼 |
| `src/components/auth/UserMenu.tsx` | 로그인 시 네비게이션 사용자 메뉴 |

### 로그인 페이지 요구사항

- Kakao 로그인 버튼 (주색상: `#FEE500`, 텍스트: `#000000`)
- Google 로그인 버튼 (표준 Google 버튼 스타일)
- 이메일/비밀번호 폼 (로그인 + 회원가입 탭)
- "게스트로 계속" 옵션 (← 중요: 게스트 모드 접근성 유지)
- 리디렉트: 로그인 성공 → 이전 페이지 or `/`

### OAuth 콜백 (`src/app/auth/callback/route.ts`)

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}
```

### db.ts에 Auth 함수 추가

contract.md v2.3에 정의된 API 시그니처 그대로 구현:
- `getProfile(userId: string): Promise<Profile | null>`
- `updateProfile(userId: string, data: Partial<Profile>): Promise<boolean>`
- `getUserData(userId, storeKey): Promise<...>`
- `upsertUserData(userId, storeKey, data): Promise<boolean>`
- `getAllUserData(userId): Promise<...>`

---

## W3 (4/15~21): Zustand → Supabase 동기화

### 동기화 로직 (`src/lib/sync.ts`)

**핵심 함수 3개:**

```typescript
// 로컬 → 서버 (로그인 후, 또는 중요 상태 변경 후)
export async function pushToServer(userId: string, storeKey: StoreKey, data: unknown): Promise<void>

// 서버 → 로컬 (앱 마운트 시)
export async function pullFromServer(userId: string, storeKey: StoreKey): Promise<unknown | null>

// 게스트 → 로그인 전환 시 마이그레이션 (1회성)
export async function migrateGuestData(userId: string, localData: Record<StoreKey, unknown>): Promise<void>
```

**동기화 타이밍:**
- `pushToServer`: 디바운스 3초 (상태 변경 후 3초 내 무연속 변경 모아서 1회 UPSERT)
- `pullFromServer`: 앱 마운트 시 1회, updated_at 비교 후 최신 데이터 채택

### 스토어 서버 연동 (5개 Zustand 스토어)

각 스토어의 `persist` 미들웨어 옆에 서버 동기화 추가:

```typescript
// 예시: useStudyStore.ts
// 기존: persist(store, { name: 'study-store' })
// 추가: 로그인 사용자 감지 → pullFromServer 호출 → 상태 병합
```

**수정 파일:**
- `src/stores/useStudyStore.ts`
- `src/stores/useQuizStore.ts`
- `src/stores/useLeitnerStore.ts`
- `src/stores/useBookmarkStore.ts`
- (`useOnboardingStore`는 W3에서 판단 — 개인화 데이터라 동기화 가치 있음)

### AuthProvider 컴포넌트

`src/components/auth/AuthProvider.tsx` — 앱 전체에서 사용자 세션 제공:
- Supabase `onAuthStateChange` 구독
- 로그인 이벤트 → `migrateGuestData` 트리거
- Context/Zustand로 `user` 상태 전달

---

## W4 (4/22~30): 마이그레이션 + 검증

### 게스트 → 로그인 마이그레이션

1. 로그인 성공 이벤트 감지
2. 서버 user_data 조회 (기존 계정인지 확인)
3. **신규 계정**: localStorage 데이터 전체 UPSERT
4. **기존 계정**: updated_at 비교 → 최신 데이터 채택 (last-write-wins)
5. 마이그레이션 완료 플래그 localStorage에 저장 (`migrated_at` 타임스탬프)

### 검증 체크리스트

- [ ] 게스트로 퀴즈 10개 → 로그인 → 오답노트 서버에 있는지 확인
- [ ] 로그아웃 후 재로그인 → 학습 데이터 복원 확인
- [ ] 게스트 모드 → 모든 콘텐츠 접근 가능 확인 (auth 없이)
- [ ] `/profile` → 미인증 → `/login` 리디렉트 확인
- [ ] Kakao OAuth flow E2E
- [ ] Google OAuth flow E2E
- [ ] 이메일/비밀번호 회원가입 + 로그인 E2E
- [ ] security-reviewer 에이전트 실행 필수
- [ ] `npm run build` 성공

---

## 리스크 & 주의사항

| 리스크 | 대응 |
|--------|------|
| localStorage 마이그레이션 버그 | 업로드 전 localStorage 백업 (`migrationBackup_*` 키로 저장) |
| RLS 정책 실수로 데이터 노출 | security-reviewer 필수 (W4 시작 전) |
| `@supabase/ssr` + Next.js 14 호환성 | gosari 레퍼런스 패턴 그대로 복사 |
| Zustand persist 버전 충돌 | 스토어 version 번호 신중하게 올리기 |

---

## 의존성 (클루디 완료 후 진행 가능 항목)

- Supabase Auth 활성화 → OAuth 콜백 URL 테스트 가능
- `profiles` + `user_data` 테이블 생성 → db.ts Auth 함수 테스트 가능
- Kakao/Google 앱 설정 → OAuth 플로우 테스트 가능

**클루디 브리핑**: `docs/cloudy-auth-brief.md` 참조

---

## 다음 플랜 (스미스 프라임 전달 — 2026-03-18 03:26)

### 현황 (2026-03-18 03:26 기준)

Plan A (KICE 개선) ✅, Plan B (권한/닉네임) ✅, Plan C (커뮤니티) ✅ 모두 완료.
Auth (Google OAuth + /my + Zustand 동기화) ✅ 완료.

**단, 즉각 블로커:**
- community_questions, question_votes 테이블 Supabase 미생성 → 카이란이 SQL 실행해야 커뮤니티 작동
- GEMINI_API_KEY 미설정 → 커뮤니티 AI 어시스턴트 mock 상태

### Plan D: AI 어시스턴트 + D-day 학습 플래너

**플랜 파일**: `docs/superpowers/plans/2026-03-18-ai-planner.md`

**카이란이 먼저 해야 할 것 (강선생 착수 전):**
1. community SQL 실행 — 파일 내 "사전 요건 A" SQL 복붙 → Supabase Run
2. GEMINI_API_KEY 발급 → `.env.local`에 추가

**강선생 구현 범위 (카이란 완료 후):**
- Chunk 1: @google/generative-ai 설치 + AI route mock → 실제 Gemini 호출
- Chunk 2: ExamCountdown 컴포넌트 + useStudyStore examDate 필드 + /my 통합
- Chunk 3: /api/ai/weakness + WrongNoteAI 컴포넌트 + 오답노트 통합

**예상 커밋 3개:**
```
feat(ai): Gemini 1.5-flash 실제 연결 — 커뮤니티 AI 어시스턴트
feat(planner): D-day 카운트다운 — /my 시험일 설정 + ExamCountdown 컴포넌트
feat(ai): 오답노트 AI 약점 분석 — Gemini 기반 취약 챕터 + 학습 전략
```
