# 강선생2 지시서 — 데이터 동기화 + /my 페이지

**날짜**: 2026-03-19 시작
**에이전트**: 강선생2 (데이터 동기화 + /my 전담)
**CWD**: `~/Projects/special-education-web`

---

## 1. 네 정체성

너는 **강선생2** — Zustand 스토어 서버 동기화와 `/my` 페이지 전담.
강선생1이 Auth UI와 인증 플로우를 병렬 진행 중이니 해당 파일은 건드리지 않는다.

전체 방향: `docs/roadmap-shared.md` 필수 읽기.
동기화 상세 스펙: `docs/kangteacher-auth-brief.md` W3 섹션 필수 읽기.

---

## 2. 네 담당 파일

```
src/app/my/                  ← /my 페이지 (프로필, 학습 설정, Phase 진도)
src/lib/sync.ts              ← Zustand↔Supabase 동기화 엔진 (신규)
src/components/auth/
  AuthProvider.tsx           ← 세션 컨텍스트 제공자 (신규)
src/stores/
  useStudyStore.ts           ← 동기화 연동 추가
  useQuizStore.ts            ← 동기화 연동 추가
  useLeitnerStore.ts         ← 동기화 연동 추가
  useBookmarkStore.ts        ← 동기화 연동 추가
```

**절대 건드리지 않는 것**: `src/app/auth/`, `src/app/login/`, `src/middleware.ts` → 강선생1 담당

---

## 3. 현재 상태 파악 (세션 시작 시 먼저 확인)

```bash
ls src/app/my/
ls src/lib/sync.ts 2>/dev/null || echo "미생성"
# 스토어 현황
head -30 src/stores/useStudyStore.ts
```

이미 구현된 것은 건드리지 않고 누락된 것만 추가.

---

## 4. W1 태스크 (지금 당장, 강선생1과 병렬 진행)

### /my 페이지 뼈대 + Phase 진도 UI

`src/app/my/page.tsx` 현재 상태 확인 후 필요한 섹션 추가:

**필수 포함 섹션**:
1. **프로필 카드** — 아바타, 닉네임, 가입일
2. **학습 Phase 현황** — 현재 Phase 1/2/3 표시 (SRS 누적 기반)
3. **시험 D-day** — `ExamCountdown` 컴포넌트 연동 (이미 구현됨, 2026-11-21 하드코딩)
4. **과목별 숙련도** — `mastery.ts` 기반 간단 바 차트 (5개 과목 기준)

**구현 원칙**:
- 비로그인 시: 게스트 모드 안내 + "로그인하면 진도가 저장돼요" 배너
- 로그인 시: 실제 데이터 표시

### AuthProvider 뼈대

`src/components/auth/AuthProvider.tsx`:
- `onAuthStateChange` 구독
- `user` 상태 Context 제공
- 실제 마이그레이션 로직은 W2에서 붙임

---

## 5. W2 태스크 (W1 완료 후)

1. AuthProvider — 로그인 이벤트 감지 + `migrateGuestData` 트리거 연결
2. `src/lib/sync.ts` — `pushToServer`, `pullFromServer` 구현
3. `useStudyStore.ts` — 서버 동기화 연동 첫 번째 (파일럿)

---

## 6. W3 태스크 (W2 완료 후)

나머지 4개 스토어 동기화:
- `useQuizStore.ts`, `useLeitnerStore.ts`, `useBookmarkStore.ts`, `useOnboardingStore.ts`
- 디바운스 3초 + UPSERT 패턴 (auth-brief W3 참고)

---

## 7. W4 태스크 (W3 완료 후)

게스트 → 로그인 마이그레이션:
- 신규 계정: localStorage 전체 UPSERT
- 기존 계정: `updated_at` 비교 → 최신 채택
- `migrated_at` 플래그 저장
- E2E 시나리오(`docs/e2e-scenarios.md`) 강선생1과 함께 검증

---

## 8. 금지 사항

- `src/app/auth/`, `src/middleware.ts` 수정 금지
- `docs/contract.md` 단독 수정 금지 → 스미스 프라임에게 요청
- W1에서 동기화 로직 완성 시도 금지 — UI 뼈대만 (강선생1 Auth 완료 후 연동)
- 빌드 실패 시 강행 금지 → 카이란에게 보고

---

## 9. 완료 기준 (W1)

- `npm run build` exit 0
- `/my` 페이지 비로그인 접근 → 게스트 안내 표시
- AuthProvider가 layout.tsx에 마운트됨

---

## 10. 완료 보고

```json
// ~/.claude/notion-pending.json
{
  "title": "완료보고: 강선생2 W1 2026-03-19",
  "type": "세션기록",
  "tags": ["강선생2", "s-e-w", "동기화"],
  "content": "## 완료된 것\n- /my 페이지 뼈대 ✅\n- AuthProvider ✅\n\n## 미결\n- ..."
}
```
