# 플래시카드 전면 재설계 + Supabase 동기화 수복

> 작성: 2026-03-31 | 담당: X | 상태: Phase 0 진행 중
> 배경: 6개 Zustand 스토어 localStorage 단일 의존 → 기기 변경 시 데이터 전부 소실.
> SyncManager 인프라는 존재하나 migrateGuestData 키 4/5 불일치로 동기화 실질 미작동.
> 플래시카드는 수동 입력만 가능, DB 퀴즈에서 자동 생성 경로 없음.

## 카이란 확정 결정 (2026-03-31)

1. **콘텐츠 범위**: OX + 단답형만. 서답형/객관식/시나리오 제외. OX 150자(~3줄) 초과 폐기
2. **법/교육과정 특별 취급**: 두 과목의 OX+단답형 전체를 플래시카드로 (법 163개, 교육과정 62개)
3. **법이 테스트베드**: 법 과목으로 먼저 구현·검증, 다른 과목도 카드는 존재해야 함
4. **OX 카드 답변**: O/X 버튼 2개로 답변 — 기존 자가 평가(알고 있었어요/모르겠어요) **삭제**
5. **타이머 바**: OXChoice 패턴 (정답→빠른 이동, 오답→느린 이동, 탭→즉시 이동)
6. **힌트**: 현재 구조 유지 (초성 + 맥락) — 승인됨
7. **Supabase CHECK ALTER**: X가 SQL 생성, 필요시 카이란 실행

## 데이터 기반

| 과목 | OX | 단답형 | 합계 | 비고 |
|------|-----|--------|------|------|
| **법** | 69 | 94 | **163** | 전체 카드화, 테스트베드 |
| **교육과정** | 28 | 34 | **62** | 전체 카드화 |
| 기타 9과목 | 337 | 356 | 693 | 선택 추가 |
| **합계** | 434 | 484 | **918** | |

OX 96%가 150자 이하 → 3줄 필터 후 ~417개 잔존.

## Phase 0: Sync 버그 수복 (기반 공사)

**변경 파일**: `src/lib/db/sync.ts`, `src/components/SyncManager.tsx`, `docs/contract.md`

| 버그 | 수정 |
|------|------|
| `migrateGuestData` 키 4/5 불일치 | 실제 persist name으로 교정: `special-edu-study`, `leitner-cards`, `quiz-data`, `bookmarks` |
| `user_data` CHECK에 'onboarding' 누락 | contract.md 수정 + Supabase ALTER TABLE |
| `useFocusStore` 동기화 누락 | SyncManager 구독 추가 + StoreKey 확장 + CHECK에 'focus' 추가 |

## Phase 1: LeitnerCard 모델 확장

**변경 파일**: `src/stores/useLeitnerStore.ts`

추가 필드:
- `chapterSlug?: string` — 챕터 태깅 (약점 분석 연계)
- `quizId?: string` — 원본 퀴즈 ID (중복 추가 방지)
- `quizType?: 'ox' | 'fill_in'` — 원본 퀴즈 유형 (표시 분기)

source 값 확장: `'manual' | 'quiz-ox' | 'quiz-fill_in'`
마이그레이션: version 2→3, 기존 카드에 기본값 채움.

## Phase 2: 퀴즈→플래시카드 변환 엔진

**신규 파일**: `src/lib/quiz/flashcard-converter.ts`

- `convertQuizToCard(quiz)`: type !== ox/fill_in → null, OX 150자 초과 → null
- OX: front = question, back = "O"/"X" + explanation
- fill_in: front = question(빈칸), back = answer
- `generateFlashcardsForSubject(slug)`: DB fetch → convert → 중복 제외

## Phase 3: 카드 추가 UI 재설계

**변경 파일**: `src/app/flashcards/add/AddFlashcardClient.tsx`

- 탭 1: 수동 입력 (기존 유지)
- 탭 2: 퀴즈에서 가져오기 — 과목 선택, 법/교육과정 "전체 추가", 개별 체크, quizId 중복 회색 처리

## Phase 4: 복습 UX — 타이머 바 + OX 버튼

**변경 파일**: `src/components/flashcard/FlashcardScene.tsx`, `src/app/flashcards/review/page.tsx`

- OX 소스 카드: O/X 버튼 → 정답/오답 판정 → 타이머 바 → 자동 이동
- fill_in 소스 카드: 3단계 힌트(question→hint→answer) 유지 → 타이머 바 → 자동 이동
- 수동 카드: 3단계 힌트 유지 → 타이머 바 → 자동 이동
- **"알고 있었어요/모르겠어요" 자가 평가 삭제** — OX는 정답 판정, 나머지는 힌트 사용 여부로 등급 결정
- 카드 편집 (question/answer 수정)

## Phase 5: 대시보드 통합

**변경 파일**: `src/app/flashcards/FlashcardsClient.tsx`, 위젯 2개

- 과목별 카드 현황 (법 163장 중 추가됨 N장)
- "아직 추가하지 않은 카드 N장" 알림

## Completion Contract

V(평가자)가 이 기준으로 PASS/FAIL을 판정한다. 80% 이상 통과해야 PASS.

### 동기화 기준 (Phase 0)
- [ ] `migrateGuestData`가 실제 localStorage 키(`special-edu-study`, `leitner-cards`, `quiz-data`, `bookmarks`)로 데이터를 읽는다
- [ ] `useFocusStore`가 SyncManager 구독 목록에 포함된다
- [ ] 'onboarding'과 'focus' store_key가 DB에 push 가능하다

### 모델 기준 (Phase 1)
- [ ] LeitnerCard에 chapterSlug, quizId, quizType 필드가 있다
- [ ] 기존 카드가 마이그레이션 후에도 정상 동작한다
- [ ] quizId 기반 중복 추가가 방지된다

### 변환 기준 (Phase 2)
- [ ] OX 퀴즈 150자 초과 시 변환하지 않는다
- [ ] fill_in 퀴즈가 front(빈칸)/back(정답) 형태로 변환된다
- [ ] 법 과목 OX+단답형 163개 중 필터 통과한 것이 전부 변환 가능하다

### UI 기준 (Phase 3~4)
- [ ] 카드 추가 화면에 "수동 입력"과 "퀴즈에서 가져오기" 2탭이 있다
- [ ] 법/교육과정에 "전체 추가" 버튼이 있다
- [ ] 이미 추가된 퀴즈는 회색 처리된다
- [ ] OX 소스 카드는 O/X 버튼으로 답변한다
- [ ] 복습 시 타이머 바가 표시되고, 탭하면 즉시 이동한다
- [ ] 카드 편집(question/answer 수정)이 가능하다
- [ ] "알고 있었어요/모르겠어요" 자가 평가 버튼이 없다

### 접근성 기준
- [ ] 새 버튼에 aria-label이 있다
- [ ] 타이머 바에 키보드 조작이 가능하다
- [ ] 탭 전환이 키보드로 작동한다

### 빌드 기준
- [ ] `npm run build` exit 0
- [ ] `npm run lint` 경고 0건

---

## 이전 계획

### M3: 만족도 갭 해소 (2026-03-30)
> 담당: X | 상태: B1~B7 전체 완료, 만족도 재평가 대기
> B1 concepts 버그, B2 허브 통합, B3 플래시카드 UX, B4 AI 문제, B5 출제경향, B6 북마크, B7 localStorage 안내

### M2: 사용자 체감 개선 (2026-03-29)
> 담당: X | 상태: M2 FAIL (8/12 = 66.7%) — 기능+UX 8/8 PASS, 만족도 0/4 FAIL

### 나다운 MVP (2026-03-27~29)
> 담당: X | 상태: Phase 0~5 + AI 전체 완료 (MVP 100%)
