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

## 지시 파일
- `docs/kangteacher-0322-diagnosis-fix.md`

---

## 이전 계획

# 클루디1 통합 스프린트 계획 — 03/20~21

> 작성: 2026-03-20 | 근거: 클루디1 계획 + 클루디2 계획 통합 (KICE 가중치 × 핸드오프 교차)
> 확정: 카이란 승인

---

## 우선순위 근거 (KICE 가중치 × 핸드오프 교차)

| 순위 | 과목 | KICE 가중치 | ID 시작점 | 긴급도 |
|------|------|------------|----------|--------|
| 1 | 점자 (vi) | 0.6694 (2위) | vi-q109~ | 🔴 |
| 2 | AAC / 의사소통 (cd) | 0.6428 (4위) | cd-q89~ | 🔴 |
| 3 | 수어 / 청력도 (hi) | 0.3504 (18위) | hi-q87~ | 🔴 |
| 4 | 뇌성마비 / GMFCS (pd) | 0.2598 (27위) | pd-q75~ | 🟡 |
| 5 | EBD 심화 (bs) | — (핸드오프 1순위) | bs-q178~ | 🟡 |
| 6 | 전환교육 갭 (trans) | — (핸드오프 3순위) | trans-q132~ | 🟡 |
| + | **지적장애 MDX 5개** | — (유일 누락 과목) | 신규 생성 | 🔴 |

---

## Day 1 (오늘 03/20) — MDX 완성 + 장애유형 심화

### 블록 A: 지적장애 MDX 5개 생성 (선행 처리)

> 66개 중 유일 누락 과목. 소스 863줄 준비됨. 빌드 확인까지 선처리.

| 파일 | 핵심 내용 |
|------|----------|
| 01-정의와개념.mdx | AAIDD 11차, 5가지 전제, 용어 변화 |
| 02-분류와원인.mdx | 지원 강도 4단계(간헐/제한/확장/전반), 생물·사회·행동적 원인 |
| 03-인지와적응행동.mdx | 인지 특성, 적응행동 3영역, 증후군별 특성 |
| 04-교수전략.mdx | CBI, 과제분석, 직접교수, 또래교수 |
| 05-지원모델과자기결정.mdx | SIS, 자기결정 4요소, PCP, 전환 연계 |

### 블록 B: 점자 심화 (vi-q109~128, 20문항) — KICE 가중치 1위

- 한국 점자 규정 (초성·중성·종성 규칙, 약자 일람)
- 저시력기기 분류 (광학/비광학/전자 보조기구)
- 점자정보단말기 기능 + 화면낭독SW
- **2026 전공A-8 구조 기반 시나리오 2문항**

### 블록 C: 수어·청력도 심화 (hi-q87~106, 20문항) — B와 병렬 실행

- 수어 문법 (시제 표현, 공간 활용, NMM)
- 지문자 자음·모음 체계 (**2026 전공A-9 직접 연계**)
- 순음청력검사 청력도 해석 (6분법, 기도/골도 차)
- 인공와우 심화 (외부/내부 구성, 맵핑, 청각훈련)

**Day 1 목표: MDX 5개 + 문항 40개 추가 → DB 2,735**

---

## Day 2 (내일 03/21) — 뇌성마비·AAC·EBD·전환 + 품질 감사

### 블록 D: 뇌성마비 (pd-q75~92, 18문항) + AAC 심화 (cd-q89~108, 20문항) — 병렬 2 Agent

**Agent 1: 뇌성마비·보조공학**
- 뇌성마비 유형 (경직형/불수의운동형/협조운동장애형)
- GMFCS 5단계 기능 기준
- 원시반사 종류 (ATNR, STNR, 모로반사) + 지속 영향
- **2026 전공A-12 기반 시나리오 (보치아 + 자세지지)**

**Agent 2: AAC 심화**
- 4구성요소 (도구/상징/전략/기법)
- PECS 6단계 심화 (단계별 목표·절차 구분)
- Bliss·PCS·Makaton 상징체계 비교
- FCT 절차

### 블록 E: EBD 심화 (bs-q178~192, 15문항) + 전환교육 (trans-q132~144, 13문항) — 병렬 2 Agent

**Agent 3: EBD 심화**
- 불안장애 유형별 DSM-5 진단 기준 (숫자 포함)
- ADHD 교수전략 (자기조절, 학습환경 수정, 행동계약)
- 정서행동장애 내재화/외현화 분류

**Agent 4: 전환교육 갭**
- 자기옹호(self-advocacy) vs 자기결정 개념 구분
- 개인중심계획(PCP) — 핵심 원칙 + MAPS/PATH
- 지원고용 모델 (배치-훈련형 vs 개인지원형)

### 블록 F: 방향B 품질 감사 + data-validator 전체 검증

```sql
-- 부실 문항 탐지 (방향B)
SELECT id, subject_id, LENGTH(explanation) as len
FROM quiz_questions WHERE LENGTH(explanation) < 30
ORDER BY len ASC;

SELECT id FROM quiz_questions
WHERE type = 'multiple' AND wrong_explanations IS NULL;

SELECT subject_id, COUNT(*) FROM quiz_questions
WHERE tags = '[]' OR tags IS NULL
GROUP BY subject_id;
```

→ data-validator 에이전트 전체 실행으로 마무리

**Day 2 목표: 문항 66개 추가 + 품질 감사 → DB ~2,801, validator 그린**

---

## 전체 요약

| 항목 | 시작 | 완료 후 |
|------|------|--------|
| MDX 파일 | 66개 | **71개** (+지적장애 5개) |
| 퀴즈 DB | 2,695문항 | **~2,801문항** (+106문항) |
| KICE 고가중치 커버 | 부분 | 점자·수어·AAC·뇌성마비 완비 |
| 방향B 품질 감사 | 미실행 | SQL 탐지 완료 |
| data-validator | 미실행 | 전체 그린 상태 |

---

## 리스크 관리

| 리스크 | 대응 |
|--------|------|
| 세션당 50문항 상한 | 블록 B·C·D·E 각각 독립 세션으로 분리 |
| 점자 규정 세부 숫자 오류 | KICE 기출 원본 직접 인용 + NISE 용어사전 교차 확인 |
| laws fill_in 복합정답 UI 채점 | 강선생에게 별도 알림 (이번 범위 외) |

---

## 주의사항 (data 생성 규칙)

- explanation NOT NULL (모든 type)
- multiple answer: "0"~"3" 인덱스만
- wrong_explanations: 정답 키 포함 금지, "4" 키 금지
- fill_in/ox의 wrong_explanations: null, options: null ([] 아닌 null)
- wrong_explanations에 "이 설명이 옳다", "맞다", "정확하다" 문구 금지
- ID 시작점: vi-q109 / hi-q87 / pd-q75 / cd-q89 / bs-q178 / trans-q132

---

## 이전 계획 (아카이브)

> 원본: 종합 로드맵 (2026-03-15) — 강선생 Phase 1~7 완료 기준 계획
> 내용은 git history 참조
