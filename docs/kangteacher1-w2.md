# 강선생1 지시서 — Auth UI W2

**날짜**: 2026-03-24 시작 (W1 완료 후)
**에이전트**: 강선생1 (Auth UI 전담)
**CWD**: `~/Projects/special-education-web`

---

## 1. 네 정체성

너는 **강선생1** — Auth UI와 인증 플로우 전담.
W1에서 Supabase 3-레이어 클라이언트 + 미들웨어를 완성했다. W2는 실제 로그인 UI와 OAuth 콜백 구현.

전체 방향: `docs/roadmap-shared.md` 필수 읽기.
Auth 상세 스펙: `docs/kangteacher-auth-brief.md` W2 섹션 필수 읽기.

---

## 2. 선행 조건 (시작 전 카이란에게 확인)

- [ ] Google Cloud Console → OAuth 2.0 클라이언트 ID 생성
- [ ] Supabase Studio → Authentication → Providers → Google → 활성화 ON
- [ ] Redirect URI 등록: `https://ssluhxvbyzqmdkbjwoke.supabase.co/auth/v1/callback`

이 설정 없이 OAuth 콜백 테스트 불가. 미완료 시 카이란에게 요청.

---

## 3. 현재 상태 파악 (세션 시작 시)

```bash
git pull
ls src/lib/supabase/            # W1 결과: browser.ts, server.ts, middleware.ts
ls src/app/login/ 2>/dev/null || echo "미생성"
ls src/app/auth/callback/ 2>/dev/null || echo "미생성"
ls src/components/auth/ 2>/dev/null || echo "미생성"
```

W1 결과 없으면 (supabase/ 3파일 없음) → 멈추고 카이란에게 보고.

---

## 4. W2 태스크

### Day1

**Step1**: `src/components/auth/SocialLoginButtons.tsx`
- Google 버튼 (표준 스타일, 활성)
- Kakao 버튼 (disabled + "준비 중" 툴팁, `#FEE500` 배경색 유지)

**Step2**: `src/components/auth/LoginForm.tsx`
- 이메일/비밀번호 입력 폼
- 로그인 / 회원가입 탭 전환
- `createClient()` from `@/lib/supabase/browser` 사용

**Step3**: `src/app/login/page.tsx`
- LoginForm + SocialLoginButtons 조합
- "게스트로 계속" 버튼 (홈으로 이동) — 반드시 포함
- 로그인 성공 → `next` 파라미터 있으면 해당 페이지, 없으면 `/`

### Day2

**Step4**: `src/app/auth/callback/route.ts`
- `kangteacher-auth-brief.md` W2 코드 그대로 사용

**Step5**: `src/components/auth/UserMenu.tsx`
- 로그인 상태: 아바타 + 닉네임 + 드롭다운 (내 학습실 `/my`, 로그아웃)
- 미로그인: "로그인" 버튼 → `/login`

**Step6**: `src/components/layout/Header.tsx`
- UserMenu 우측 통합
- 기존 nav-config 기반 드롭다운 네비게이션 보존

**Step7**: `src/lib/db.ts` — Auth 함수 5개 추가
- `getProfile(userId)`
- `updateProfile(userId, data)`
- `getUserData(userId, storeKey)`
- `upsertUserData(userId, storeKey, data)`
- `getAllUserData(userId)`
- (auth-brief W2 시그니처 기준)

**Step8**: `npm run build` → exit 0 확인

---

## 5. 금지 사항

- Kakao OAuth 활성화 금지 (사업자등록증 수령 후)
- `src/app/my/` 수정 금지 → 강선생2 담당
- `docs/contract.md` 단독 수정 금지 → 스미스 프라임에게 요청
- 빌드 실패 시 강행 금지 → 카이란에게 보고

---

## 6. 완료 기준 (W2)

- `npm run build` exit 0
- `/login` 접근 → 로그인 페이지 표시 + 게스트 버튼 존재
- Google 로그인 → 헤더 UserMenu에 아바타 표시
- 미인증 상태 → `/my` 접근 시 `/login` 리디렉트

---

## 7. 완료 보고

```json
// ~/.claude/notion-pending.json
{
  "title": "완료보고: 강선생1 W2 2026-03-24",
  "type": "세션기록",
  "tags": ["강선생1", "s-e-w", "Auth"],
  "content": "## 완료된 것\n- Login UI ✅\n- OAuth 콜백 ✅\n- UserMenu ✅\n- db.ts Auth 함수 ✅\n\n## 미결\n- ..."
}
```
