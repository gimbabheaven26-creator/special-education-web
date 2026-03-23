# Quiz Editor 시스템 — Google Sheets 동기화 + 앱 어드민

> 작성: 2026-03-23 | 담당: V (v-0322.night) | 승인: 대기

## 요구사항

- quiz_questions (3,334문항) 을 Google Sheets에서 일괄 검토/수정
- 시트 수정 → Supabase 실시간 반영
- 앱 내 어드민 페이지에서 개별 문제 빠른 편집
- 두 채널 모두 같은 DB 테이블에 쓰기

## 아키텍처

```
┌─────────────────┐     webhook      ┌──────────────┐
│  Google Sheets   │ ─────────────→  │  /api/admin/  │
│  (일괄 편집)     │ ←────────────── │  sync         │
└─────────────────┘   Apps Script    └──────┬───────┘
                                           │
                                    Supabase REST
                                           │
┌─────────────────┐                 ┌──────▼───────┐
│  /admin/editor   │ ──────────────→│ quiz_questions│
│  (개별 편집)     │  직접 mutation  │   테이블      │
└─────────────────┘                 └──────────────┘
```

## Phase 1: API 레이어 (필수 선행)

### 1-1. 어드민 인증 미들웨어
- `src/middleware.ts` — `/admin/*` 경로 보호 추가
- 관리자 판별: `profiles.role = 'admin'` 또는 허용 이메일 목록
- 파일: `src/lib/admin-auth.ts`

### 1-2. Quiz CRUD API
- `src/app/api/admin/quiz/route.ts` — GET (페이지네이션 + 필터), POST (생성)
- `src/app/api/admin/quiz/[id]/route.ts` — PATCH (수정), DELETE (삭제)
- `src/app/api/admin/quiz/bulk/route.ts` — POST (일괄 upsert, Google Sheets용)
- `src/app/api/admin/quiz/export/route.ts` — GET (전체 CSV/JSON export)

### 1-3. API 인증
- 모든 `/api/admin/*` — Bearer token 또는 세션 쿠키 필수
- Google Sheets용 — API key 기반 인증 (`ADMIN_API_KEY` 환경변수)

**변경 파일**: 6개 신규

---

## Phase 2: 앱 어드민 페이지 (가벼운 CRUD)

### 2-1. 레이아웃
- `src/app/admin/layout.tsx` — 어드민 전용 레이아웃 (사이드바 없음, 심플)
- `src/app/admin/page.tsx` — 대시보드 (문항 수, 과목별 통계)

### 2-2. 문제 목록/검색
- `src/app/admin/editor/page.tsx` — 서버 컴포넌트 (페이지네이션)
- `src/app/admin/editor/QuizTable.tsx` — 클라이언트 컴포넌트
  - 50건씩 서버사이드 페이지네이션 (앱 부담 최소화)
  - 필터: subject, chapter, type, difficulty
  - 검색: question/explanation ILIKE

### 2-3. 문제 편집
- `src/app/admin/editor/[id]/page.tsx` — 단일 문항 편집 폼
  - 인라인 프리뷰 (학생이 보는 화면과 동일)
  - 저장 시 `/api/admin/quiz/[id]` PATCH

### 2-4. 문제 추가
- `src/app/admin/editor/new/page.tsx` — 신규 문항 생성 폼
  - subject/chapter 선택 → type 선택 → 필드 동적 생성

**변경 파일**: 6개 신규

---

## Phase 3: Google Sheets 양방향 동기화

### 3-1. 초기 시트 생성
- `scripts/export-to-sheets.ts` — Supabase → Google Sheets 전체 내보내기
- Google Sheets API 사용 (서비스 계정)
- 시트 구조: 컬럼 = quiz_questions 필드 (id, subject, chapter, type, question, ...)

### 3-2. Sheets → Supabase (실시간)
- Google Apps Script:
  - `onEdit()` 트리거 → 변경된 행 감지
  - 변경 데이터를 `/api/admin/quiz/bulk` POST
  - API key 인증

### 3-3. Supabase → Sheets (주기적)
- 옵션 A: Apps Script 타이머 (5분 간격) → `/api/admin/quiz/export` GET
- 옵션 B: Supabase webhook → Apps Script 트리거
- 추천: **옵션 A** (단순, 충분한 빈도)

### 3-4. 충돌 해결
- 전략: Last-Write-Wins (마지막 수정 우선)
- `updated_at` 컬럼 추가 → 시트/앱 모두 비교

**변경 파일**: 2개 신규 (스크립트 + Apps Script 템플릿)

---

## Phase 4: DB 스키마 보강

```sql
-- quiz_questions에 추적 컬럼 추가
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS updated_by text;

-- 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quiz_questions_updated_at
  BEFORE UPDATE ON quiz_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 관리자 RLS (선택)
-- profiles 테이블에 role 컬럼이 없으면 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
```

---

## 우선순위 & 의존성

```
Phase 4 (DB) ──→ Phase 1 (API) ──→ Phase 2 (어드민 페이지)
                       │
                       └──→ Phase 3 (Google Sheets)
```

Phase 2와 3은 병렬 가능 (둘 다 Phase 1 API에 의존)

## 복잡도

| Phase | 난이도 | 예상 파일 수 |
|-------|--------|-------------|
| 1. API | MEDIUM | 6 |
| 2. 어드민 | MEDIUM | 6 |
| 3. Google Sheets | LOW | 2 + Apps Script |
| 4. DB 스키마 | LOW | 1 SQL |
| **합계** | | **~15** |

## 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Google API 서비스 계정 설정 복잡 | 3단계 지연 | Apps Script만으로 우회 가능 |
| 관리자 인증 없이 API 노출 | 보안 취약 | Phase 1-1 필수 선행 |
| 시트↔DB 동시 수정 충돌 | 데이터 불일치 | updated_at + Last-Write-Wins |
| 3,334문항 전체 export 성능 | API 타임아웃 | 스트리밍 또는 분할 export |

---

## 이전 계획

# 진단평가 버그 수정 계획 — 2026-03-22

> 작성: 2026-03-22 | 승인: 카이란 | 담당: 강선생

## Phase 1: 워크시트 뷰 플로우 복구 (CRITICAL)
- `src/lib/db.ts`: `getWorksheetTopicById()`, `getWorksheetQuestionsByTopicId()` 추가
- `src/app/worksheets/[id]/WorksheetViewClient.tsx`: 클라이언트 컴포넌트 신규 생성
- `src/app/worksheets/[id]/page.tsx`: 서버 컴포넌트 전환, Supabase 직접 조회로 교체

## Phase 2: 오늘학습 비로그인 허용 (HIGH)
- `src/app/api/daily-questions/route.ts`: `getUser()` + 401 블록 제거

## 검증
- `npx tsc --noEmit` 에러 0건
- `npm run build` exit 0
- /worksheets 토픽 클릭 → 문제지 정상 표시
- 비로그인 /daily → 문제 정상 로드
