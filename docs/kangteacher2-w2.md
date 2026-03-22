# 강선생2 지시서 — 동기화 + /my W2

**날짜**: 2026-03-24 시작 (W1 완료 후)
**에이전트**: 강선생2 (데이터 동기화 + /my 전담)
**CWD**: `~/Projects/special-education-web`

---

## 1. 네 정체성

너는 **강선생2** — Zustand 스토어 서버 동기화와 `/my` 페이지 전담.
W1에서 `/my` 뼈대 + AuthProvider 기초를 완성했다. W2는 실제 동기화 엔진 구현 + /my 실데이터 연결.

전체 방향: `docs/roadmap-shared.md` 필수 읽기.
동기화 상세 스펙: `docs/kangteacher-auth-brief.md` W3 섹션 필수 읽기.

---

## 2. 현재 상태 파악 (세션 시작 시)

```bash
git pull    # 강선생1 W2 결과 반영 필수
ls src/components/auth/AuthProvider.tsx 2>/dev/null || echo "미생성"
ls src/lib/sync.ts 2>/dev/null || echo "미생성"
ls src/app/my/
head -30 src/stores/useStudyStore.ts
```

---

## 3. W2 태스크

### Day1

**Step1**: `src/components/auth/AuthProvider.tsx` W2 업그레이드
- `onAuthStateChange` 로그인 이벤트 감지
- 로그인 시 `migrateGuestData(userId)` stub 트리거 (W4에서 구현, 지금은 console.log)
- `user` / `session` Context 제공 (기존 user에 session 추가)

**Step2**: `src/app/layout.tsx`
- AuthProvider 최상위 래핑 확인 (이미 돼있으면 스킵)
- 기존 `SrsCleanup`, `StudySessionTracker` 보존

**Step3**: `src/lib/sync.ts` 신규 생성
```typescript
type StoreKey = 'study' | 'leitner' | 'quiz' | 'bookmark'

// 로컬 → 서버
export async function pushToServer(userId: string, storeKey: StoreKey, data: unknown): Promise<void>

// 서버 → 로컬
export async function pullFromServer(userId: string, storeKey: StoreKey): Promise<unknown | null>
```
- `user_data` 테이블 UPSERT / SELECT 사용
- `server.ts` createClient 사용 (Route Handler 컨텍스트)
- auth-brief W3 섹션 패턴 참고

### Day2

**Step4**: `src/stores/useStudyStore.ts` 동기화 파일럿
- 앱 마운트 + 로그인 시 `pullFromServer` 호출
- 상태 변경 시 debounce 3초 후 `pushToServer` (lodash debounce or setTimeout)
- 나머지 4개 스토어는 W3에서 처리 (지금은 study만)

**Step5**: `src/app/my/page.tsx` 업그레이드
- **비로그인**: 게스트 배너 "로그인하면 진도가 저장돼요" + "로그인하기" CTA
- **로그인**:
  - 프로필 카드 (아바타 + 닉네임 + 가입일)
  - 학습 Phase 현황 (SRS 누적 기반 1/2/3)
  - 과목별 숙련도 — `mastery.ts` 기반 top 5 과목 바 차트
  - `ExamCountdown` 컴포넌트 연동

**Step6**: `src/app/my/progress/page.tsx` 신규
- Phase 1/2/3 상세 진도
- 11과목 × 3 Phase 그리드 (완료/진행중/미시작)

**Step7**: `npm run build` → exit 0 확인

---

## 4. 금지 사항

- `src/app/auth/`, `src/app/login/`, `src/middleware.ts` 수정 금지 → 강선생1 담당
- W2에서 나머지 4개 스토어(leitner/quiz/bookmark/onboarding) 동기화 시도 금지 → W3에서
- `docs/contract.md` 단독 수정 금지 → 스미스 프라임에게 요청

---

## 5. 완료 기준 (W2)

- `npm run build` exit 0
- `/my` 비로그인 → 게스트 배너 표시
- `/my` 로그인 → 실제 학습 데이터 표시
- `useStudyStore` 상태 변경 → 3초 후 Supabase `user_data` 업데이트 확인

---

## 6. 완료 보고

```json
// ~/.claude/notion-pending.json
{
  "title": "완료보고: 강선생2 W2 2026-03-24",
  "type": "세션기록",
  "tags": ["강선생2", "s-e-w", "동기화"],
  "content": "## 완료된 것\n- AuthProvider W2 ✅\n- sync.ts ✅\n- useStudyStore 동기화 ✅\n- /my 실데이터 연결 ✅\n\n## 미결\n- ..."
}
```
