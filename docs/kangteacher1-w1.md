# 강선생1 지시서 — Auth UI + 인증 플로우

**날짜**: 2026-03-19 시작
**에이전트**: 강선생1 (Auth UI 전담)
**CWD**: `~/Projects/special-education-web`

---

## 1. 네 정체성

너는 **강선생1** — Auth UI와 인증 플로우 전담.
강선생2가 `/my` 페이지와 데이터 동기화를 병렬 진행 중이니 해당 파일은 건드리지 않는다.

전체 방향: `docs/roadmap-shared.md` 필수 읽기.
Auth 상세 스펙: `docs/kangteacher-auth-brief.md` 필수 읽기.

---

## 2. 네 담당 파일

```
src/app/auth/callback/       ← OAuth 콜백 Route Handler
src/app/login/               ← 로그인/회원가입 통합 페이지
src/components/auth/         ← LoginForm, SocialLoginButtons, UserMenu
src/lib/supabase/            ← 3-레이어 클라이언트 (신규 생성)
src/middleware.ts            ← 세션 갱신 + 라우트 보호
src/lib/db.ts                ← Auth 함수 추가 (getProfile, getUserData 등)
```

**절대 건드리지 않는 것**: `src/app/my/`, `src/stores/*.ts`, `src/lib/sync.ts` → 강선생2 담당

---

## 3. 현재 상태 파악 (세션 시작 시 먼저 확인)

```bash
# 기존 구현 상태 확인
ls src/app/auth/callback/
ls src/app/login/
ls src/components/auth/ 2>/dev/null || echo "미생성"
ls src/lib/supabase/ 2>/dev/null || echo "미생성"
cat src/middleware.ts 2>/dev/null | head -20 || echo "미생성"
```

이미 구현된 것은 건드리지 않고 누락된 것만 추가.

---

## 4. W1 태스크 (지금 당장 시작)

### 선행 조건 확인
- Supabase Auth 활성화 여부 → Google OAuth 테스트로 확인
- `profiles`, `user_data` 테이블 존재 여부 → Supabase Studio 확인
- SQL 미실행이면 `kangteacher-auth-brief.md` 내 SQL을 카이란에게 실행 요청

### 구현 태스크
1. `@supabase/ssr` 설치 확인 (`npm list @supabase/ssr`)
2. `src/lib/supabase/` 3-레이어 클라이언트 생성 (스펙: auth-brief W1 섹션)
3. `src/middleware.ts` — 세션 갱신 + `/my/*` 보호
4. `src/lib/supabase.ts` 하위 호환 래퍼 유지
5. `npm run build` → exit 0 확인

---

## 5. W2 태스크 (W1 완료 후)

1. `src/app/login/` — 로그인/회원가입 통합 페이지
   - Kakao 버튼 (숨김 처리 유지 — 사업자 등록증 수령 전)
   - Google OAuth 버튼 (활성화)
   - 이메일/비밀번호 폼
   - "게스트로 계속" 옵션 필수
2. `src/app/auth/callback/route.ts` — OAuth 콜백 (auth-brief W2 코드 참고)
3. `src/components/auth/UserMenu.tsx` — 헤더에 로그인 상태 표시
4. `src/lib/db.ts` — Auth 함수 추가 (auth-brief W2 시그니처 참고)

---

## 6. 금지 사항

- Kakao OAuth 활성화 금지 (카카오 보류 — 사업자 등록증 수령 후)
- `src/app/my/` 수정 금지
- `docs/contract.md` 단독 수정 금지 → 스미스 프라임에게 요청
- 빌드 실패 시 강행 금지 → 카이란에게 보고

---

## 7. 완료 기준 (W1)

- `npm run build` exit 0
- Google 로그인 → 헤더에 아바타 표시 + `profiles` 테이블 행 생성
- 게스트 모드 → 퀴즈 정상 작동 (auth 없이)
- `/my` → 미인증 시 `/login` 리디렉트

---

## 8. 완료 보고

```json
// ~/.claude/notion-pending.json
{
  "title": "완료보고: 강선생1 W1 2026-03-19",
  "type": "세션기록",
  "tags": ["강선생1", "s-e-w", "Auth"],
  "content": "## 완료된 것\n- Supabase 3-레이어 클라이언트 ✅\n- 미들웨어 ✅\n\n## 미결\n- ..."
}
```
