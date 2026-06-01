# SEW Next Product Blueprint

> 작성: 2026-05-19  
> 작성자: 루멘(Codex)  
> 목적: 기존 SEW Classic을 제품 원형으로 삼지 않고, 성공한 고위험 시험 학습 서비스 모델을 기준으로 SEW Next를 제로베이스 설계한다.

---

## 0. 한 줄 정의

**SEW Next는 특수교육 임용판 AMBOSS/UWorld다.**

더 구체적으로는:

> KICE 기출 blueprint에 맞춰 구성된 전문 Qbank, 근거 기반 개념 라이브러리, 적응형 약점 세션, 실전 모의고사, AI-Human 서술형 코칭을 하나로 묶은 특수교육 임용 학습 플랫폼.

Classic의 홈, 라우트, 컴포넌트, 현재 UX는 참고하지 않는다.  
SEW Next는 “기능을 모아둔 앱”이 아니라 “시험 준비를 조종하는 cockpit”으로 시작한다.

---

## 1. 채택할 성공 모델

### Primary Model: AMBOSS

AMBOSS에서 가져올 핵심은 **Qbank + Knowledge Library + Study Plan + Analysis + Adaptive Session** 구조다.

공식 자료 기준 AMBOSS는 다음 특징을 갖는다.

- Qbank 세션을 사용자가 목표에 맞게 생성한다.
- Study mode와 Exam mode를 구분한다.
- 개인 성과 데이터를 기반으로 adaptive question session을 만든다.
- Study Summary, Performance, Session Analysis로 학습 추천을 제공한다.
- Score predictor와 분석을 통해 어떤 영역에 집중해야 하는지 보여준다.

SEW Next 적용:

- `KICE Blueprint`를 중심에 둔다.
- “오늘 풀 문제”는 개인 약점과 기출 가중치에서 자동 생성한다.
- 모든 문제는 해설에서 관련 개념/기출/용어/법령으로 연결된다.
- 사용자는 “과목 메뉴”가 아니라 “시험 대비 상태”를 본다.

참고:
- [AMBOSS Platform Overview](https://support.amboss.com/hc/en-us/articles/360034825692-Platform-overview)
- [AMBOSS Adaptive Question Sessions](https://support.amboss.com/hc/en-us/articles/45511273700369-Adaptive-Question-Sessions)
- [AMBOSS Creating a Qbank Session](https://support.amboss.com/hc/en-us/articles/360032477132-Creating-a-Qbank-session)
- [AMBOSS Session Analysis](https://support.amboss.com/hc/en-us/articles/4852337184148-Session-Analysis)

### Secondary Model: UWorld

UWorld에서 가져올 핵심은 **실전과 유사한 문제, 깊은 해설, 시각적/단계적 설명, 성과 추적**이다.

공식 자료 기준 UWorld는 다음 특징을 강조한다.

- 시험 blueprint에 맞춘 Qbank
- 실제 시험과 유사한 UI/문항 스타일
- 상세 해설과 오답 선택지별 rationales
- performance tracking과 약점 보정
- study planner, mobile app, spaced repetition flashcards

SEW Next 적용:

- KICE 전공A/B 실제 시험 화면과 유사한 Mock Exam을 만든다.
- 기입형/서술형 중심으로 실전 문항을 구성한다.
- 해설은 “정답 설명”이 아니라 “왜 틀렸는지, 어떤 개념으로 돌아가야 하는지”를 설명한다.
- 모든 오답 선택/답안은 다음 복습 큐로 연결된다.

참고:
- [UWorld MCAT Question Bank](https://gradschool.uworld.com/mcat/question-bank/)
- [UWorld USMLE Features](https://medical.uworld.com/usmle/features/)
- [UWorld Study Planner](https://medical.uworld.com/usmle/features/study-planner/)

### Tertiary Model: Brilliant

Brilliant에서 가져올 핵심은 **수동 읽기보다 능동 문제 해결로 개념을 익히는 방식**이다.

SEW Next 적용:

- 개념 라이브러리는 긴 글 목록이 아니라 “문제 → 생각 → 개념 → 다시 문제” 구조로 만든다.
- 첫 설명 전에 짧은 진단 질문을 던진다.
- 사용자는 개념을 읽고 나서 퀴즈를 푸는 게 아니라, 퀴즈를 통해 개념으로 들어간다.

참고:
- [Brilliant](https://brilliant.org/)

### Borrow Carefully: Duolingo / Quizlet

Duolingo와 Quizlet은 주 모델이 아니다.

다만 다음 요소만 가져온다.

- 짧은 세션
- 스트릭과 습관 형성
- 자료를 플래시카드/퀴즈로 변환하는 AI 보조
- 모바일에서 끊김 없는 재방문 루프

가져오지 않을 것:

- 지나친 게임화
- 시험 전문성을 흐리는 캐릭터 중심 UX
- 출처 없는 AI 요약/해설

---

## 2. SEW Next의 제품 철학

### 2.1 사용자가 사고 싶은 것은 “기능”이 아니다

특수교육 임용 수험생이 원하는 것은 다음 네 가지다.

1. **내가 지금 합격권에서 얼마나 떨어져 있는가**
2. **오늘 뭘 해야 점수가 오르는가**
3. **이 문제가 왜 중요한가**
4. **내 약점이 실제로 줄고 있는가**

SEW Next는 이 네 질문에 매일 답해야 한다.

### 2.2 제품은 공부량보다 준비도를 보여줘야 한다

Classic식 지표:

- 오늘 푼 문제 수
- XP
- 스트릭
- 정답률

SEW Next식 지표:

- KICE blueprint coverage
- 고위험 주제 readiness
- 기억 안정성
- 서술형 루브릭 점수
- 실전 회차 예상 점수
- 약점 감소율

### 2.3 기본 경험은 “오늘의 20분”이 아니라 “오늘의 시험 대비 세션”

기존 표현인 “오늘의 20분”은 좋지만, SEW Next에서는 더 시험 중심으로 바꾼다.

**오늘의 시험 대비 세션**

- 3문제: 어제 틀린 핵심
- 4문제: KICE 고빈출 약점
- 2문제: 동형 기출
- 1문제: 서술형 답안 뼈대
- 1개념: 해설에서 연결된 핵심 개념

사용자는 세션이 끝나면 “문제를 풀었다”가 아니라 “합격 준비도가 얼마 올랐다”를 본다.

---

## 3. 정보구조

SEW Next는 메뉴를 기능별로 나누지 않는다. 시험 준비 흐름별로 나눈다.

```text
/
├─ Readiness
├─ Practice
│  ├─ Adaptive Session
│  ├─ Custom Qbank
│  ├─ Wrong Answers
│  └─ Spaced Review
├─ Mock Exam
│  ├─ KICE Year Mode
│  ├─ Simulated Exam
│  └─ Exam Review
├─ Library
│  ├─ KICE Blueprint
│  ├─ Concepts
│  ├─ Terms
│  ├─ Laws
│  └─ HLP / Practice
├─ Analytics
│  ├─ Readiness Score
│  ├─ Weak Topics
│  ├─ Retention
│  └─ Writing Rubric
└─ AI Lab
   ├─ Answer Coach
   ├─ Isomorphic Generator
   └─ Content Auditor
```

### Navigation Principle

상단 네비는 5개만 둔다.

1. **Readiness**
2. **Practice**
3. **Mock**
4. **Library**
5. **Analytics**

AI는 별도 메인 탭이 아니라 상황 안에 녹인다. 운영자/관리자만 `AI Lab`을 본다.

---

## 4. 첫 화면

첫 화면은 대시보드가 아니다.  
**시험 대비 cockpit**이다.

### Above the Fold

```text
┌────────────────────────────────────────────┐
│ 2027 특수교육 임용 Readiness               │
│  D-184                                     │
│                                            │
│  준비도 62%                                │
│  위험: 법령 IEP · 점자 · 통합학급          │
│                                            │
│  [오늘의 시험 대비 세션 시작]              │
└────────────────────────────────────────────┘
```

### First Screen Blocks

1. **Readiness Score**
   - 전체 준비도
   - KICE coverage
   - retention stability
   - mock exam trend

2. **Next Best Session**
   - 자동 생성된 10~12문제
   - 왜 이 세션인지 근거 표시

3. **Weak Topics**
   - 위험도 높은 3개 주제
   - 각 주제마다 “근거: 최근 오답, KICE 가중치, 복습 지연”

4. **Mock Exam Status**
   - 마지막 실전 점수
   - 다음 실전 추천일

5. **Library Entry**
   - “개념 보러가기”가 아니라 “오늘 세션에서 틀린 개념 복습”

---

## 5. 핵심 화면 설계

### 5.1 Readiness

목적: 지금 합격 준비 상태를 한 눈에 보여준다.

구성:

- Overall Readiness
- KICE Blueprint Coverage
- High-Risk Topics
- Retention Stability
- Writing Readiness
- Recent Mock Trend
- Next Recommended Action

Readiness는 단순 평균이 아니다.

```text
Readiness =
  KICE coverage 25%
  Recent accuracy 20%
  Retention stability 20%
  Weak-topic recovery 15%
  Mock exam score 15%
  Writing rubric 5%
```

초기에는 mock/writing 데이터가 없으므로 비어 있는 축은 제외하고 계산한다.

### 5.2 Practice

목적: 문제풀이의 중심.

모드:

1. **Adaptive Session**
   - AMBOSS식 개인 성과 기반 추천 세션
   - 기본 진입점

2. **Custom Qbank**
   - 과목, 챕터, KICE 키워드, 난이도, 문항 유형, 상태 필터
   - 고급 사용자용

3. **Wrong Answers**
   - 단순 목록이 아니라 오답 유형별 remediations

4. **Spaced Review**
   - FSRS 기반 복습 큐
   - 용어, 오답, 동형문제, 서술형 키포인트 포함

### 5.3 Mock Exam

목적: 실제 임용 시험 전이.

모드:

- KICE Year Mode: 2016~2026 회차별 풀이
- Simulated Exam: KICE 가중치 기반 새 모의고사
- Exam Review: 풀이 후 문항별/주제별/루브릭 리뷰

Mock Exam은 UWorld처럼 실제 시험 느낌을 우선한다.

- 제한 시간
- 답안 입력
- flag
- review screen
- 제출 전 미응답 확인
- 제출 후 해설/개념 연결

### 5.4 Library

목적: 문제풀이 중 막혔을 때 돌아갈 근거 자료.

Library는 위키가 아니다. Qbank와 붙은 reference다.

각 개념 페이지:

- 정의
- KICE 출제 이력
- 관련 용어
- 관련 법령/교육과정
- HLP/현장 실천 연결
- 대표 문항
- 오답 포인트
- 3분 체크 문제

### 5.5 Analytics

목적: 사용자가 노력 방향을 바꿀 수 있게 한다.

화면:

- Subject Performance
- Topic Performance
- Retention Forecast
- Error Type Breakdown
- Mock Trend
- Writing Rubric
- Time-on-Task

Analytics는 예쁘게 보여주는 곳이 아니라, 다음 행동으로 이어져야 한다.

모든 분석 카드에는 CTA가 있다.

- “이 주제 8문제 풀기”
- “관련 개념 5분 복습”
- “복습 지연 카드 처리”
- “서술형 답안 다시 작성”

---

## 6. 문제 풀이 UX

### Study Mode

문제마다 즉시 피드백을 준다.

구성:

- 문제
- 답안 입력
- 제출
- 정답/오답
- 핵심 해설
- 왜 틀렸는가
- 관련 개념
- 다음 복습 예약

### Exam Mode

시험 중에는 피드백을 숨긴다.

구성:

- 시간 제한
- flag
- 미응답 확인
- 제출 후 전체 리뷰

### Answer Review

UWorld식 해설 구조를 따른다.

1. 정답
2. 핵심 개념
3. 오답/오개념 설명
4. KICE 출제 포인트
5. 관련 개념 링크
6. 복습 예약

서술형은 별도 구조를 가진다.

1. 모범 답안
2. 핵심 키워드
3. 4점 루브릭
4. 내 답안 누락 요소
5. 다시 쓰기

---

## 7. AI의 위치

AI는 화면의 주인공이 아니다.  
AI는 학습 엔진 내부의 작업자다.

### Student-Facing AI

1. **Answer Coach**
   - 서술형 답안을 루브릭으로 피드백
   - “정답입니다/오답입니다”보다 “빠진 요소” 중심

2. **Socratic Hint**
   - 막혔을 때 바로 답을 주지 않고 단서를 제공

3. **Weekly Briefing**
   - 이번 주 약점, 회복, 다음 주 계획을 요약

### Operator-Facing AI

1. **Isomorphic Generator**
   - KICE 원문 → 동형문제 초안

2. **Content Auditor**
   - 정답-해설 불일치
   - sourceRef 누락
   - 법령 표현 위험
   - 중복/유사 문항

3. **Coverage Planner**
   - KICE 가중치 대비 부족한 개념/문항 자동 제안

### AI Safety Rule

- AI 생성 문항은 기본 `draft`
- sourceRef 없는 문항은 공개 불가
- 법령/교육과정 관련 답변은 고정 DB/RAG 출처 없으면 단정 금지
- AI는 최종 채점자가 아니라 코치다

---

## 8. 데이터 모델 방향

제로베이스라면 아래 객체를 먼저 설계한다.

### ExamBlueprint

```ts
type ExamBlueprint = {
  id: string;
  exam: 'special-education-secondary';
  yearRange: string;
  domains: BlueprintDomain[];
  updatedAt: string;
};
```

### BlueprintDomain

```ts
type BlueprintDomain = {
  id: string;
  title: string;
  weight: number;
  kiceKeywords: string[];
  concepts: string[];
  questionTypes: Array<'fill_in' | 'descriptive' | 'scenario_composite'>;
};
```

### Question

```ts
type Question = {
  id: string;
  type: 'fill_in' | 'descriptive' | 'scenario_composite' | 'ox' | 'multiple';
  blueprintDomain: string;
  conceptIds: string[];
  kiceRefs: string[];
  sourceRefs: string[];
  prompt: string;
  answer: string;
  explanation: Explanation;
  difficulty: 1 | 2 | 3;
  status: 'draft' | 'verified' | 'needs-review' | 'retired';
};
```

### Attempt

```ts
type Attempt = {
  id: string;
  userId: string;
  questionId: string;
  mode: 'study' | 'exam' | 'review';
  answer: string;
  isCorrect: boolean | null;
  confidence: 1 | 2 | 3 | 4 | 5;
  errorType?: 'concept_gap' | 'term_confusion' | 'law_confusion' | 'misread' | 'writing_structure';
  timeMs: number;
  createdAt: string;
};
```

### ReviewItem

```ts
type ReviewItem = {
  id: string;
  userId: string;
  targetType: 'question' | 'concept' | 'term' | 'writing_point';
  targetId: string;
  scheduler: 'fsrs';
  dueAt: string;
  stability: number;
  difficulty: number;
  lapses: number;
};
```

---

## 9. 디자인 방향

### Tone

- 조용함
- 전문적
- 시험 대비
- 데이터 기반
- 과장 없는 자신감

### Avoid

- 랜딩 페이지식 hero
- 장식적 카드 남발
- 귀여운 게임 UI
- 기능 설명 문구 과다
- 대시보드 카드만 많은 화면

### Visual Language

- 흰색/회색 기반
- 강조색은 emerald 또는 blue 계열 1개
- 위험 주제는 red가 아니라 amber로 표현
- 숫자보다 “다음 행동”이 크게 보여야 함
- 시험 화면은 최대한 실제 답안 작성 환경처럼 절제

---

## 10. 제로베이스 구현 마일스톤

### N0: Prototype Shell

목표: Classic 없이 SEW Next의 첫인상을 만든다.

범위:

- `/next` 또는 별도 branch/worktree
- Readiness cockpit
- Next Best Session 카드
- Weak Topics 카드
- Mock Exam entry
- Library entry

완료 기준:

- 첫 화면만 봐도 AMBOSS/UWorld 계열 시험 준비 서비스로 느껴진다.
- 사용자가 다음 행동을 3초 안에 이해한다.

### N1: Qbank Core

목표: SEW Next의 중심인 Practice를 만든다.

범위:

- Adaptive Session
- Custom Qbank filters
- Study Mode
- UWorld식 explanation panel
- Attempt 기록

완료 기준:

- 사용자가 10문제 세션을 시작하고 끝낼 수 있다.
- 세션 리뷰에서 약점과 관련 개념을 볼 수 있다.

### N2: Readiness Analytics

목표: 문제풀이가 준비도 지표로 반영된다.

범위:

- Readiness Score
- Blueprint Coverage
- Weak Topic Risk
- Session Analysis
- Next Recommendation

완료 기준:

- 한 번의 세션 결과가 Readiness 화면에 반영된다.
- 추천 세션 이유가 설명된다.

### N3: Spaced Review

목표: 망각 곡선 기반 복습을 제품 핵심으로 넣는다.

범위:

- FSRS scheduler
- Review queue
- Confidence rating
- Lapse tracking
- Retention forecast

완료 기준:

- 틀린 문제/낮은 확신도 문제가 자동으로 due queue에 들어간다.
- 복습 후 다음 due date가 바뀐다.

### N4: Mock Exam

목표: 실전 임용 모드.

범위:

- KICE Year Mode
- Simulated Exam
- Exam UI
- Exam Review
- Writing Rubric

완료 기준:

- 한 회차를 실전처럼 풀고 리뷰할 수 있다.
- 점수가 Analytics에 반영된다.

### N5: AI-Human Layer

목표: AI를 학습과 콘텐츠 운영에 녹인다.

범위:

- Answer Coach
- Isomorphic Generator
- Content Auditor
- Weekly Briefing

완료 기준:

- AI는 draft/feedback만 만들고, 공개 콘텐츠는 승인 절차를 탄다.
- 서술형 답안에 루브릭 기반 피드백을 제공한다.

---

## 11. 첫 구현 권장안

바로 전체 재작성하지 않는다.

**추천 실행 방식: `/next` lab prototype**

이유:

- Classic 운영을 깨지 않는다.
- 새로운 정보구조를 빠르게 검증한다.
- 기존 DB와 콘텐츠를 읽기 전용으로 재사용할 수 있다.
- 성공하면 메인으로 승격한다.

### 첫 스프린트 산출물

1. `/next` route
2. Readiness cockpit
3. Next Best Session mock
4. Weak Topics mock
5. Library/KICE blueprint entry
6. 스타일 토큰 1차

이 단계에서는 실제 알고리즘보다 **제품 감각**이 중요하다.

성공 기준:

- 카이란이 첫 화면을 보고 “이게 내가 만들고 싶던 서비스다”라고 느낀다.
- Classic의 흔적이 없다.
- 다음 구현이 Qbank Core로 자연스럽게 이어진다.

---

## 12. 결론

SEW Next는 Classic의 리팩토링이 아니다.

Classic은 지금까지의 학습과 검증 자산이다.  
SEW Next는 그 자산을 바탕으로, AMBOSS/UWorld식 고위험 시험 준비 플랫폼을 특수교육 임용에 맞게 다시 구현하는 제품이다.

가장 중요한 선택은 이것이다.

> 홈을 만들지 말고, 시험 준비 cockpit을 만든다.  
> 기능을 나열하지 말고, 다음 세션을 제시한다.  
> AI를 보여주지 말고, 학습 루프에 녹인다.  
> 콘텐츠를 늘리지 말고, 검증 가능한 전문성을 쌓는다.

다음 작업은 `N0: Prototype Shell`이다.

