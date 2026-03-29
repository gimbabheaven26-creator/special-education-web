# 나다운 (nadaun) MVP — 구현 계획

> 작성: 2026-03-27 | 갱신: 2026-03-29 | 담당: X | 상태: Phase 0~5 전체 완료 (MVP)
> 설계 문서: docs/superpowers/specs/2026-03-26-nadaun-design.md

## 요구사항

기본교육과정 기반 IEP 계획 보조도구. 특수교사가 학생 현행수준을 입력하면 AI가 교과별 연간/주차 계획 초안을 생성하고, 교사가 수정한 뒤 텍스트/Excel/PDF로 내보낸다.

- 브랜드: 나다운 (nadaun)
- 대상: 일반학교 특수학급 특수교사
- 교육과정: 기본교육과정 (공통교육과정은 v2)
- 별도 웹앱 (SEW와 분리, 나중에 통합 가능)

## Phase 0: 선행 작업 (인프라 + 데이터)

### 0-1. nadaun 레포 + 프로젝트 셋업
- 별도 디렉토리 `nadaun/`
- `npx create-next-app@14` + TypeScript + Tailwind + App Router
- shadcn/ui, ESLint, Prettier

### 0-2. Supabase 프로젝트 생성
- 별도 인스턴스 (SEW와 분리)
- 구글 OAuth 설정
- 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### 0-3. 성취기준 DB 구축 (최소) ← 병목
- 기본교육과정 국어/수학 중학교 성취기준 수집
- 소스: NCIC, 미래앤 교과서, 교육부 고시문
- JSON 정제 → `src/data/achievement-stds/`
- Supabase `achievement_standards` 삽입

## Phase 1: DB 스키마 + 인증

### 1-1. 마이그레이션
- 5개 테이블: teachers, students, iep_plans, weekly_plans, achievement_standards
- RLS 정책: 교사별 접근 제어, achievement_standards 읽기 공개

### 1-2. 인증
- 구글 로그인 → teachers 자동 생성
- 미인증 → 로그인 리다이렉트

## Phase 2: 키움이들 (학생 관리)

### 2-1. 학생 CRUD
- 등록: 이름, 학년, 반, 장애유형, 현행수준(textarea)
- 목록: 카드 레이아웃
- 수정/삭제

### 2-2. 대시보드
- 키움이들 카드 + 채비 현황 + 주차 정보

## Phase 3: 나다운 채비 (AI 계획 생성) — 핵심

### 3-1. 생성 흐름
- 학생 → 교과 → 학년군 → 현행수준 확인 → "채비 시작"

### 3-2. Claude API
- `src/app/api/generate/route.ts`
- `ANTHROPIC_API_KEY` 서버 전용
- 스트리밍 (SSE), 타임아웃 60초
- **식별정보 제거**: 이름/학교 등 AI에 보내지 않음
- Rate limit: 교사당 1일 30회

### 3-3. 저장
- iep_plans + weekly_plans에 저장, status: draft

## Phase 4: 채비 다듬기 (편집)

### 4-1. 편집 UI
- 연간/단기 목표: 텍스트
- 주차별 계획: 테이블, 셀 클릭 편집
- 교수학습방법/평가계획: 텍스트

### 4-2. 자동 저장
- debounce 300ms → Supabase 업데이트

### 4-3. 상태 전환
- draft ↔ final (교사 버튼 클릭)

## Phase 5: 채비 내보내기

### 5-1. 텍스트 복사 (MVP 핵심)
- 섹션별 "복사" 버튼 → NISE 붙여넣기용

### 5-2. Excel
- exceljs → .xlsx

### 5-3. PDF
- @react-pdf/renderer + 한글 폰트 임베딩

## 리스크

| 리스크 | 심각도 | 대응 |
|--------|--------|------|
| 성취기준 DB 미확보 | HIGH | 카이란 소스 제공 선행. Phase 0-3이 전체 병목 |
| AI 생성 품질 | HIGH | 프롬프트 반복 개선. 카이란 직접 검증 |
| 한글 PDF 폰트 | MEDIUM | 안 되면 v2로 미룸 |
| API 비용 | LOW | 월 $28 수준 (교사 50명) |

## 실행 현황 (2026-03-29)

```
Phase 0 ✅ → Phase 1 ✅ → Phase 2 ✅ → Phase 3 ✅ → Phase 4 ✅ → Phase 5 ✅ → Phase 3-AI ✅
```

- Phase 0: 프로젝트 셋업 + Supabase + 성취기준 JSON (bb36e65, 190cdbc, 729707a)
- Phase 1: DB 5테이블 + RLS + 89개 성취기준 + Google OAuth (18a2f47)
- Phase 2: 성취기준 탐색 UI 5라우트 + 8컴포넌트 + 53테스트 (bc0d9d3)
- Phase 3: 키움이들 학생 CRUD 5페이지 + 6컴포넌트 + loading.tsx (f3785ef)
- Phase 4: IEP 계획 상세/편집/삭제 + IepPlanForm + GoalFormItem (f3785ef)
- Phase 5: 텍스트 복사 + Excel + PDF 내보내기 (08adc6b, e30be69)
- Phase 3-AI: Claude API 연동 주차별 계획 자동 생성 — SSE 스트리밍, PII 필터, Rate limit 30회/일, 27 tests (2026-03-29)

---

## 이전 계획

### 프라임 M1: 노션 구조변경 (2026-03-25)
> 담당: 프라임 | 상태: 실행 완료
> 4개 DB 구조변경 완료 (태그 63→16, M0~M4 마일스톤, 담당자 통일)

### 클루디 작업 7건 (2026-03-25)
> 담당: 클루디 | 상태: 미착수
> FK 제약, 세분화 챕터, 퀴즈 ID 통일, 워크시트 데이터 등

### API 보안 강화 (2026-03-24)
> 담당: X | 상태: 일부 완료
> rate limit, reviews auth 적용. analytics 마이그레이션 미완.
