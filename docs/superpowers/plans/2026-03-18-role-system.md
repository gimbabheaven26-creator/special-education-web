# 권한 시스템 + 닉네임 온보딩 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supabase `profiles` 테이블에 `role` + `nickname` 컬럼을 추가하고, 첫 로그인 사용자에게 닉네임 입력 온보딩을 보여주며, admin 전용 페이지(`/structure`)를 보호한다.

**Architecture:**
- `profiles` 테이블에 `role TEXT DEFAULT 'user'`, `nickname TEXT DEFAULT ''` 추가 (SQL 마이그레이션)
- `src/lib/profile.ts` — getProfile, upsertNickname 서버 유틸리티
- 닉네임 미설정 사용자: `/my` 페이지에서 모달/배너로 안내
- admin 페이지 가드: Server Component에서 createClient()로 user 확인 후 profile 조회 → role !== 'admin'이면 redirect
- 최초 admin 설정: Supabase 대시보드에서 수동으로 role='admin' 업데이트 (자동화 불필요 — 단일 admin)

**Tech Stack:** Next.js 14 App Router, Supabase SSR, TypeScript, Tailwind CSS v4

---

## 사전 요건 (카이란 실행 필요)

아래 SQL을 **Supabase 대시보드 → SQL Editor** 에서 실행:

```sql
-- 1. profiles 테이블에 컬럼 추가
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role     TEXT NOT NULL DEFAULT 'user'
                                    CHECK (role IN ('admin', 'user')),
  ADD COLUMN IF NOT EXISTS nickname TEXT NOT NULL DEFAULT '';

-- 2. profiles 테이블이 아직 없다면 전체 생성
-- (v2.3에서 이미 생성됨 → ALTER만 적용, 이 블록 건너뜀)
-- (삭제 후 재생성 시: 새 스키마로 생성됨 — 단일 admin 환경에서 저위험)
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT        NOT NULL DEFAULT '',
  nickname     TEXT        NOT NULL DEFAULT '',
  role         TEXT        NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. RLS 정책 (이미 있으면 에러 무시)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- 4. 신규 가입 시 profiles 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, nickname, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    '',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. 기존 사용자 profiles 생성 (없는 경우)
INSERT INTO public.profiles (id, display_name)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', '')
FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

> **카이란 확인 필요**: 위 SQL 실행 후 강선생에게 완료 알림. 완료 전까지 아래 Task 진행 불가.

---

## Chunk 1: contract.md + profile.ts

### Task 1: contract.md 업데이트

**Files:**
- Modify: `docs/contract.md` — profiles 테이블 스펙에 role + nickname 추가

- [ ] **Step 1: contract.md profiles 섹션 수정**

```markdown
### profiles (v2.3 신규 — v2.5 role/nickname 추가)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | **PK**, FK → auth.users.id ON DELETE CASCADE | Supabase Auth 사용자 ID |
| display_name | text | NOT NULL DEFAULT '' | 표시 이름 (OAuth meta에서 자동) |
| nickname | text | NOT NULL DEFAULT '' | 사용자 입력 닉네임 (첫 로그인 수집) |
| role | text | NOT NULL DEFAULT 'user' CHECK(role IN ('admin','user')) | 권한 |
| created_at | timestamptz | DEFAULT now() | 가입 시간 |
| updated_at | timestamptz | DEFAULT now() | 수정 시간 |
```

- [ ] **Step 2: 버전 헤더 업데이트**

```markdown
> 최종 수정: 2026-03-18 | 버전: 2.5
> v2.5: profiles 테이블에 role(admin/user) + nickname 컬럼 추가
```

- [ ] **Step 3: commit (contract.md만)**

```bash
git add docs/contract.md
git commit -m "docs: contract.md v2.5 — profiles role + nickname 추가"
```

---

### Task 2: src/lib/profile.ts 생성

**Files:**
- Create: `src/lib/profile.ts`

이 파일은 Server Component + Route Handler에서 profiles 테이블을 읽고 쓰는 유틸리티.
브라우저에서 직접 호출하면 안 됨 (서버 전용).

- [ ] **Step 1: profile.ts 작성**

```typescript
// src/lib/profile.ts
// Server-only. Do NOT import in 'use client' files.

import { createClient } from '@/lib/supabase/server';

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  display_name: string;
  nickname: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * 현재 로그인 사용자의 profile을 가져온다.
 * 미로그인이면 null 반환.
 */
export async function getMyProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, nickname, role, created_at, updated_at')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

/**
 * 닉네임을 업데이트한다. 현재 로그인 사용자에게만 적용.
 */
export async function upsertNickname(nickname: string): Promise<{ error: string | null }> {
  if (!nickname.trim()) return { error: '닉네임을 입력해주세요.' };
  if (nickname.length > 20) return { error: '닉네임은 20자 이하여야 합니다.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다.' };

  const { error } = await supabase
    .from('profiles')
    .update({ nickname: nickname.trim(), updated_at: new Date().toISOString() })
    .eq('id', user.id);

  return { error: error?.message ?? null };
}

/**
 * 현재 사용자가 admin인지 확인한다.
 */
export async function isAdmin(): Promise<boolean> {
  const profile = await getMyProfile();
  return profile?.role === 'admin';
}
```

- [ ] **Step 2: TypeScript 컴파일 확인**

```bash
cd /Users/gihoonkim/Projects/special-education-web && npx tsc --noEmit 2>&1 | head -20
```

Expected: 에러 없음

- [ ] **Step 3: commit**

```bash
git add src/lib/profile.ts
git commit -m "feat(auth): profile.ts — getMyProfile, upsertNickname, isAdmin 서버 유틸리티"
```

---

## Chunk 2: 닉네임 온보딩 모달 (/my 페이지)

### Task 3: /my 페이지에 닉네임 입력 배너 추가

**Files:**
- Create: `src/components/NicknamePrompt.tsx` — 닉네임 미설정 시 배너/카드
- Modify: `src/app/my/page.tsx` — 닉네임 상태 표시

`/my` 페이지는 클라이언트 컴포넌트다 (`'use client'`).
닉네임 조회는 API Route를 통해 가져온다.

- [ ] **Step 1: API Route 생성 (GET + PATCH 한 파일)**

`src/app/api/profile/route.ts` — 전체 파일:

```typescript
import { NextResponse } from 'next/server';
import { getMyProfile, upsertNickname } from '@/lib/profile';

export async function GET() {
  const profile = await getMyProfile();
  if (!profile) {
    return NextResponse.json({ profile: null }, { status: 401 });
  }
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const nickname = typeof body.nickname === 'string' ? body.nickname : '';
  const { error } = await upsertNickname(nickname);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: NicknamePrompt 컴포넌트 생성**

`src/components/NicknamePrompt.tsx` — 전체 파일:

```tsx
'use client';

import { useState } from 'react';

interface NicknamePromptProps {
  onComplete: (nickname: string) => void;
}

export function NicknamePrompt({ onComplete }: NicknamePromptProps) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: value.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? '저장 실패');
      } else {
        onComplete(value.trim());
      }
    } catch {
      setError('네트워크 오류');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-5 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
      <div>
        <p className="text-sm font-semibold text-foreground">닉네임을 설정해주세요</p>
        <p className="text-xs text-muted-foreground mt-0.5">다른 사용자에게 표시될 이름입니다 (20자 이하)</p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="예: 예비교사김영희"
          maxLength={20}
          required
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
        >
          {loading ? '저장...' : '저장'}
        </button>
      </form>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 4: /my/page.tsx에 닉네임 프롬프트 연동**

아래 3곳을 수정한다.

**(a) imports 상단에 추가:**
```tsx
import { NicknamePrompt } from '@/components/NicknamePrompt';
```

**(b) state 선언 블록 (`const { currentStreak, ... }` 아래)에 추가:**
```tsx
const [nickname, setNickname] = useState<string | null>(null);
const [nicknameLoaded, setNicknameLoaded] = useState(false);
const [role, setRole] = useState<'admin' | 'user'>('user');
```

**(c) 기존 useEffect 전체를 교체 (새 profile fetch 포함):**

기존:
```tsx
useEffect(() => {
  const supabase = createClient();
  supabase.auth.getUser().then(({ data }) => {
    if (!data.user) {
      router.replace('/login');
    } else {
      setUser(data.user);
    }
    setLoading(false);
  });
}, [router]);
```

교체:
```tsx
useEffect(() => {
  const supabase = createClient();
  supabase.auth.getUser().then(async ({ data }) => {
    if (!data.user) {
      router.replace('/login');
    } else {
      setUser(data.user);
      // 프로필(닉네임, role) 조회
      const res = await fetch('/api/profile');
      if (res.ok) {
        const { profile } = await res.json();
        setNickname(profile?.nickname ?? '');
        setRole(profile?.role ?? 'user');
      } else {
        setNickname('');
      }
      setNicknameLoaded(true);
    }
    setLoading(false);
  });
}, [router]);
```

프로필 헤더 아래에 닉네임 프롬프트 조건부 렌더링:

```tsx
{/* 닉네임 프롬프트 — 닉네임 미설정 시 */}
{nicknameLoaded && nickname === '' && (
  <NicknamePrompt onComplete={(n) => setNickname(n)} />
)}

{/* 닉네임 표시 — 설정 완료 시 */}
{nicknameLoaded && nickname && nickname !== '' && (
  <div className="flex items-center gap-2 px-1">
    <span className="text-xs text-muted-foreground">닉네임</span>
    <span className="text-sm font-medium text-foreground">{nickname}</span>
  </div>
)}
```

- [ ] **Step 5: build + 확인**

```bash
cd /Users/gihoonkim/Projects/special-education-web && npm run build 2>&1 | tail -20
```

Expected: exit 0

- [ ] **Step 6: commit**

```bash
git add src/app/api/profile/route.ts src/components/NicknamePrompt.tsx src/app/my/page.tsx
git commit -m "feat(auth): 닉네임 온보딩 — /my 미설정 시 입력 프롬프트 + /api/profile 라우트"
```

---

## Chunk 3: Admin Guard + /structure 보호

### Task 4: /structure 페이지 admin 전용으로 보호

**Files:**
- Modify: `src/app/structure/page.tsx` — admin 체크 추가
- Create: `src/components/AdminOnly.tsx` — admin guard 서버 컴포넌트

- [ ] **Step 1: AdminOnly Server Component 생성**

`src/components/AdminOnly.tsx`:

```tsx
// Server Component — 'use client' 없음
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/profile';

interface AdminOnlyProps {
  children: React.ReactNode;
}

export async function AdminOnly({ children }: AdminOnlyProps) {
  const admin = await isAdmin();
  if (!admin) {
    redirect('/');
  }
  return <>{children}</>;
}
```

- [ ] **Step 2: /structure/page.tsx에 AdminOnly 적용**

```tsx
import { getSubjects, getQuizCount } from '@/lib/db';
import { getKiceCounts } from '@/lib/structure-utils';
import StructureClient from './StructureClient';
import { AdminOnly } from '@/components/AdminOnly';

export default async function StructurePage() {
  const [subjects, quizCounts, kiceCounts] = await Promise.all([
    getSubjects(),
    getQuizCount(),
    Promise.resolve(getKiceCounts()),
  ]);

  return (
    <AdminOnly>
      <StructureClient
        subjects={subjects}
        quizCounts={quizCounts}
        kiceCounts={kiceCounts}
      />
    </AdminOnly>
  );
}
```

- [ ] **Step 3: build 확인**

```bash
cd /Users/gihoonkim/Projects/special-education-web && npm run build 2>&1 | tail -20
```

Expected: exit 0

- [ ] **Step 4: 초기 admin 설정 (카이란 실행)**

Supabase 대시보드 → Table Editor → profiles 테이블에서 카이란의 행 선택 → role 컬럼을 `'admin'`으로 수동 업데이트.

또는 SQL:
```sql
UPDATE profiles SET role = 'admin' WHERE id = '<카이란_user_id>';
```

- [ ] **Step 5: commit**

```bash
git add src/components/AdminOnly.tsx src/app/structure/page.tsx
git commit -m "feat(auth): AdminOnly 서버 가드 — /structure admin 전용 보호"
```

---

## Chunk 4: /my 페이지에 admin 메뉴 노출

### Task 5: admin 사용자에게 관리 메뉴 표시

**Files:**
- Modify: `src/app/my/page.tsx` — role 조회 후 admin 기능 카드 추가

- [ ] **Step 1: /api/profile GET에 role 포함 확인**

Task 3에서 이미 전체 profile을 반환하므로 role도 포함됨.

- [ ] **Step 2: /my/page.tsx에 role state + admin 카드**

```tsx
const [role, setRole] = useState<'admin' | 'user' | null>(null);

// 기존 profile 조회 시 role 저장
const { profile } = await res.json();
setNickname(profile?.nickname ?? '');
setRole(profile?.role ?? 'user');
```

features 배열 아래에 admin 전용 섹션 추가:

```tsx
{role === 'admin' && (
  <div>
    <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">관리자</h2>
    <div className="space-y-2">
      <Link
        href="/structure"
        className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 bg-slate-50 dark:bg-slate-950/30">
          <Map className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">사이트 구조도</p>
          <p className="text-xs text-muted-foreground">과목·챕터·문제 현황</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </Link>
    </div>
  </div>
)}
```

import 추가: `import { Map } from 'lucide-react';`

- [ ] **Step 3: build + 확인**

```bash
cd /Users/gihoonkim/Projects/special-education-web && npm run build 2>&1 | tail -20
```

Expected: exit 0

- [ ] **Step 4: commit**

```bash
git add src/app/my/page.tsx
git commit -m "feat(auth): /my 페이지 admin 메뉴 — role 기반 관리자 섹션 노출"
```

---

## 검증 체크리스트

- [ ] Supabase SQL 마이그레이션 실행 완료 (카이란)
- [ ] `npm run build` — exit 0
- [ ] 비로그인 → /structure 접근 시 `/` 리다이렉트
- [ ] 일반 user → /structure 접근 시 `/` 리다이렉트
- [ ] admin user → /structure 접근 시 정상 표시
- [ ] 닉네임 미설정 로그인 사용자 → /my에서 입력 프롬프트 노출
- [ ] 닉네임 입력 후 저장 → 프롬프트 사라지고 닉네임 표시
- [ ] admin 사용자 → /my에서 "관리자" 섹션 보임
- [ ] 일반 user → /my에서 "관리자" 섹션 안 보임

---

## 주의사항

- `profiles` 테이블이 없으면 `getMyProfile()`이 에러를 던진다. Supabase SQL 마이그레이션 먼저 실행 필수.
- `AdminOnly` 컴포넌트는 Server Component. Client Component 내부에서 직접 사용 불가.
- `isAdmin()` 호출은 매 요청마다 DB 쿼리 1회 발생. 캐싱이 필요하면 Next.js `cache()` 래핑 고려 (현재 범위 밖).
- admin role 부여는 수동 (SQL). 자동 승격 로직 없음.
