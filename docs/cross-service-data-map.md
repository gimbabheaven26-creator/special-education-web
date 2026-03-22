# 교차 서비스 데이터 맵

> 분석자: 클루디
> 일자: 2026-03-15
> 3개 서비스가 동일 데이터를 어떻게 다르게 활용하는지 매핑

---

## 1. 서비스 개요

| | special-education-web | edumind | gosari-namu-path |
|---|---|---|---|
| 담당 | 강선생 + 클루디 | 안선생 | 스미스 |
| 철학 | 종합 학습 플랫폼 | quiz-first (풀기→읽기) | 인터랙티브 콘텐츠 |
| DB | Supabase (710문항) | 동일 Supabase | 별도 JSON |
| 알고리즘 | XP + 스트릭 | FSRS 간격반복 | 자체 경로 |
| 뷰어 | 퀴즈 + 워크시트 + 플래시카드 + KICE 기출 | 퀴즈 + 로드맵(3뷰) + 포모도로 | 코스 + 레슨 |

---

## 2. 데이터 소스 매핑

### 2.1 Supabase 퀴즈 (710문항)

| 필드 | special-education-web | edumind | gosari |
|------|---|---|---|
| `id` | 퀴즈 식별 | FSRS 카드 키 | - |
| `question` | 퀴즈 UI 표시 | 퀴즈 UI 표시 | short_answer로 변환 |
| `type` | multiple/ox/fill_in/descriptive/scenario_composite | 동일 | fill_in→short_answer |
| `case_context` | 시나리오 표시 | 시나리오 표시 | 레슨 서술에 병합 |
| `answer` | 정답 확인 | 정답 + FSRS 평가 | 정답 확인 |
| `explanation` | 오답 시 설명 | 오답 시 설명 | 해설 |
| `wrong_explanations` | 오답지 설명 | 오답지 설명 | - |
| `difficulty` | 난이도 표시 | FSRS 초기 난이도 | 레슨 배치 기준 |
| `subject` / `chapter` | 과목/챕터 네비게이션 | 로드맵 노드 | 코스/레슨 매핑 |

### 2.2 KICE 기출 (327문항, JSON)

| 필드 | special-education-web | edumind | gosari |
|------|---|---|---|
| questions | 기출 뷰어 페이지 | kice-to-services 변환 (884건) | kice-to-services 변환 |
| blanks | 빈칸 UI 표시 | fill_in으로 분리 | short_answer로 변환 |
| model_answer | 접는 모범답안 UI | descriptive 답안 | 해설 |
| dialogue | DialogueBlock 컴포넌트 | - (변환 시 텍스트 병합) | - |
| keywords | 검색 필터 | - | - |

### 2.3 안선생 마인드맵 ↔ 우리 과목/챕터

| 안선생 로드맵 노드 | 우리 subjects | 일치 |
|---|---|---|
| 루트 → 과목별 노드 | 11 subjects | 동일 DB |
| 과목 → 챕터 노드 | 49 chapters | 동일 DB |
| 챕터 → 숙달도 배지 | useSrsStore | 우리: useStudyStore |

**핵심**: 안선생은 **동일 Supabase DB**를 쓰므로 과목/챕터 구조가 1:1 매핑됨. 클루디가 데이터를 변경하면 안선생에게도 자동 반영.

---

## 3. 데이터 흐름

```
클루디 (데이터 생성)
  ├─→ Supabase DB (710문항)
  │     ├─→ special-education-web (강선생 UI)
  │     └─→ edumind (안선생 UI, 동일 DB 공유)
  │
  └─→ KICE JSON (data/kice-기출/, 327문항)
        ├─→ special-education-web 기출 뷰어 (직접 읽기)
        └─→ kice-to-services.mjs 변환
              ├─→ edumind-questions.json (884건)
              └─→ gosari-data.json (5코스)
```

---

## 4. 갭 및 불일치

### 4.1 edumind와의 데이터 일관성
- **일치**: 동일 Supabase → 자동 동기화
- **갭**: edumind은 `type` 필드를 그대로 쓰지만, FSRS 카드 평가에서 `descriptive` 유형의 자동 채점이 불가능 → 현재는 자기 평가(맞음/틀림 버튼)로 처리

### 4.2 gosari와의 데이터 일관성
- **변환 필요**: `kice-to-services.mjs`로 별도 변환
- **갭**: gosari-data.json이 자동 업데이트되지 않음 → KICE 데이터 변경 시 수동으로 재변환 필요
- **과목 매핑**: 11과목 → 5코스로 축약 (매핑 규칙이 스크립트에 하드코딩)

### 4.3 플래시카드 데이터
- **special-education-web**: `useLeitnerStore` (Zustand, localStorage)
- **edumind**: `useSrsStore` (ts-fsrs, Zustand)
- **갭**: 두 서비스의 플래시카드 데이터가 **별도 관리**됨. 학습 진도가 공유되지 않음.

---

## 5. 권장 사항

1. **KICE 변환 자동화**: kice-to-services.mjs를 CI/pre-commit hook에 연결하여, KICE JSON 변경 시 자동 재변환
2. **gosari 과목 매핑 외부화**: 하드코딩된 5코스 매핑을 설정 파일로 분리
3. **플래시카드 키워드 데이터**: 343개 키워드 사전에서 자동 생성 → 3개 서비스 공통 활용 가능 (7번 작업)
4. **case_context 동기화**: 클루디가 Supabase에 case_context를 추가하면 edumind에 자동 반영되므로, P0 작업이 두 서비스 모두에 즉시 효과
