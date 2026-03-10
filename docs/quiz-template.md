# 퀴즈 데이터 작성 가이드

> 퀴즈 데이터 위치: `/src/data/quizzes/[subject].ts`
> 타입 정의 위치: `/src/types/quiz.ts`

---

## QuizQuestion 타입 전체 구조

```typescript
interface QuizQuestion {
  id: string;              // 필수: 문항 고유 ID
  subject: string;         // 필수: 과목 slug
  chapter: string;         // 필수: 단원 slug
  type: QuizType;          // 필수: 'multiple' | 'ox' | 'fill_in' | 'descriptive'
  question: string;        // 필수: 문제 본문
  caseContext?: string;    // 선택: 사례 제시문 (서술형에서 사례가 주어질 때)
  options?: string[];      // 선택: 선택지 (multiple 타입일 때만)
  answer: string | number; // 필수: 정답 (multiple: 인덱스 번호, ox: 'O'|'X', fill_in: 정답문자열, descriptive: 모범답안)
  explanation: string;     // 필수: 해설
  wrongExplanations?: Record<string, string>; // 선택: 오답 해설 (multiple 타입)
  difficulty: 1 | 2 | 3;  // 필수: 난이도 (1=기본, 2=응용, 3=고난도)
  source?: string;         // 선택: 출처 (예: '2023년 임용 1차')
  tags?: {
    disability?: string;   // 관련 장애 유형 (예: '자폐성장애')
    year?: number;         // 기출 연도
    round?: number;        // 기출 차수 (1=1차, 2=2차)
  };
}
```

---

## 문항 타입별 작성 예시

### 1. fill_in (기입형) - 임용고시 주요 형식

```typescript
{
  id: 'bs-q6',
  subject: 'behavior-support',
  chapter: 'aba',
  type: 'fill_in',
  question: 'Skinner의 조작적 조건형성에서 행동의 원인을 분석할 때 사용하는 선행자극(A)-행동(B)-후속자극(C)의 연쇄를 ( ) 수반성이라고 한다.',
  answer: '3항',
  explanation: '3항 수반성(three-term contingency)은 선행자극(Antecedent)-행동(Behavior)-후속자극(Consequence)의 관계를 의미하며, ABA에서 행동 분석의 기본 단위입니다.',
  difficulty: 1,
},
```

**fill_in 작성 팁:**
- `answer`는 정확한 정답 문자열로 작성 (띄어쓰기 포함 정확히)
- 빈칸은 문제 본문에 `( )` 형식으로 표시
- 여러 빈칸이 있을 경우 `answer`는 `'답1 / 답2'` 형식 또는 첫 번째 빈칸만 핵심 답으로 지정

---

### 2. descriptive (서술형) - 임용고시 주요 형식

```typescript
{
  id: 'bs-q7',
  subject: 'behavior-support',
  chapter: 'aba',
  type: 'descriptive',
  caseContext: `다음은 중학교 특수학급 담임 김 교사가 작성한 지도 일지이다.

  [학생 A(14세, 지적장애 2급)]
  - 문제행동: 수업 중 갑자기 큰 소리로 웃음
  - 선행사건: 어려운 수학 문제가 제시될 때
  - 후속결과: 교사가 문제를 쉬운 것으로 교체해 줌
  - 행동 빈도: 주 4~5회, 점점 증가 추세`,
  question: '위 사례에서 학생 A의 문제행동을 ABA의 3항 수반성으로 분석하고, 이 행동이 유지되는 강화 원리를 설명하시오.',
  answer: `[모범 답안]

  1. 3항 수반성 분석
  - 선행자극(A): 어려운 수학 문제 제시
  - 행동(B): 큰 소리로 웃음(문제행동)
  - 후속자극(C): 교사가 어려운 문제를 쉬운 문제로 교체

  2. 강화 원리 설명
  학생 A의 문제행동은 부적 강화(negative reinforcement)에 의해 유지되고 있다.
  문제행동(큰 소리로 웃음) 이후 혐오자극(어려운 수학 문제)이 제거되므로,
  이 행동은 혐오자극을 회피하기 위한 기능을 가지며 앞으로도 반복될 가능성이 높다.`,
  explanation: '부적 강화는 행동 후 혐오자극이 제거되어 행동 빈도가 증가하는 것입니다. 이 사례에서 학생은 어려운 문제를 피하기 위해 문제행동을 사용하고 있으며, 교사의 대응이 이를 강화하고 있습니다.',
  difficulty: 3,
  tags: {
    disability: '지적장애',
  },
},
```

**descriptive 작성 팁:**
- `caseContext`에는 사례 제시문을 작성 (선택이지만 서술형 문제에는 거의 항상 사용)
- `answer`에는 모범 답안을 항목 번호를 붙여 구조화하여 작성
- `explanation`에는 핵심 원리를 간결하게 정리

---

### 3. ox (O/X 형식) - 보조 형식

```typescript
{
  id: 'bs-q8',
  subject: 'behavior-support',
  chapter: 'aba',
  type: 'ox',
  question: '부적 강화(negative reinforcement)는 행동의 빈도를 감소시키는 절차이다.',
  answer: 'X',
  explanation: '부적 강화는 행동 후 혐오자극이 제거되어 행동 빈도가 증가하는 절차입니다. \'부적\'은 자극을 제거(-한다)는 의미이며, \'벌\'과 혼동하지 않도록 주의해야 합니다. 벌(punishment)이 행동을 감소시키는 절차입니다.',
  difficulty: 2,
},
```

**ox 작성 팁:**
- `answer`는 반드시 대문자 `'O'` 또는 `'X'`
- 개념의 참/거짓을 명확히 판단할 수 있는 문항에 사용
- 자주 혼동되는 개념(부적강화 vs 벌 등)에 특히 유용

---

### 4. multiple (선택형) - 보조 형식 (임용고시에는 없음)

```typescript
{
  id: 'bs-q9',
  subject: 'behavior-support',
  chapter: 'aba',
  type: 'multiple',
  question: '다음 중 벌(punishment)의 정의로 올바른 것은?',
  options: [
    '행동 후 선호 자극을 제공하여 행동 빈도를 증가시키는 것',
    '행동 후 혐오 자극을 제거하여 행동 빈도를 증가시키는 것',
    '행동 후 자극 변화로 행동 빈도를 감소시키는 것',
    '행동에 대한 강화를 중단하여 행동 빈도를 감소시키는 것',
  ],
  answer: 2,              // 0부터 시작하는 인덱스 (0, 1, 2, 3 중 하나)
  explanation: '벌(punishment)은 행동 후 자극 변화(혐오 자극 제시 또는 선호 자극 제거)로 인해 행동의 빈도가 감소하는 절차입니다.',
  wrongExplanations: {
    '0': '이것은 정적 강화의 정의입니다.',
    '1': '이것은 부적 강화의 정의입니다.',
    '3': '이것은 소거(extinction)의 정의입니다.',
  },
  difficulty: 1,
},
```

**multiple 작성 팁:**
- `options` 배열은 반드시 4개 (선택지 4개)
- `answer`는 정답 선택지의 인덱스 번호 (0~3)
- `wrongExplanations`로 각 오답의 이유를 설명하면 학습 효과 향상

---

## 과목별 파일 위치 및 export 이름

| 과목 slug | 파일 경로 | export 변수명 |
|-----------|-----------|--------------|
| introduction | `/src/data/quizzes/introduction.ts` | `introductionQuizzes` |
| curriculum | `/src/data/quizzes/curriculum.ts` | `curriculumQuizzes` |
| inclusive-education | `/src/data/quizzes/inclusive-education.ts` | `inclusiveEducationQuizzes` |
| assessment | `/src/data/quizzes/assessment.ts` | `assessmentQuizzes` |
| behavior-support | `/src/data/quizzes/behavior-support.ts` | `behaviorSupportQuizzes` |
| transition | `/src/data/quizzes/transition.ts` | `transitionQuizzes` |
| laws | `/src/data/quizzes/laws.ts` | `lawsQuizzes` |

---

## 파일 전체 구조 예시

```typescript
import type { QuizQuestion } from '@/types/quiz';

export const behaviorSupportQuizzes: QuizQuestion[] = [
  // 기존 문항들...

  // 새 문항 추가 시 배열 끝에 추가
  {
    id: 'bs-q6',
    subject: 'behavior-support',
    chapter: 'aba',
    type: 'fill_in',
    // ...
  },
];
```

---

## 문항 ID 중복 방지

새 문항 추가 전 기존 ID를 확인하여 중복이 없도록 하세요.
ID 형식: `[과목약어]-q[번호]` (번호는 이어서 증가)

현재 behavior-support 마지막 ID: `bs-q5` → 다음 추가 시 `bs-q6`부터 시작
