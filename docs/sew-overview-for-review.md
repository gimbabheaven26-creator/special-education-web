# SEW (Special Education Web) — 프로젝트 소개

> 작성: 2026-06-08 | 목적: 외부 개발자 리뷰용 프로젝트 개요

## 한 줄 요약

특수교육 임용시험 준비 웹앱. 1인 개발, AI 바이브 코딩, 3개월.

---

## 1. 무엇을 만들었나

특수교육학 임용시험을 준비하는 수험생을 위한 학습 플랫폼이다.

**핵심 기능:**
- **퀴즈 시스템** — OX, 객관식, 주관식, 서술형, 시나리오형 5종. 과목별/챕터별 출제
- **오답노트** — 틀린 문제 자동 수집, 복습 퀴즈 재생성
- **플래시카드** — 라이트너 5단계 박스 시스템 (SRS 간격 반복)
- **개념 학습** — 11개 과목, 챕터별 MDX 콘텐츠
- **기출문제** — 한국교육과정평가원(KICE) 기출 분석
- **시나리오 학습** — 분기형 사례 기반 학습
- **학습 분석** — 스트릭, XP, 일일/주간 통계, 약점 분석
- **커뮤니티** — 학습 게시판, 투표, AI 보조 글 생성
- **워크시트** — 인쇄 가능한 학습지 자동 생성

**관리자 기능:**
- 퀴즈 CRUD + AI 자동 생성 (Google Gemini)
- 일괄 등록(bulk import) + 품질 검증 파이프라인
- 품질 메트릭 대시보드 (중복 감지 포함)

---

## 2. 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 상태 관리 | Zustand 5 (persist middleware, localStorage) |
| 서버/DB | Supabase (PostgreSQL + Auth + Storage) |
| 스타일 | Tailwind CSS 4 |
| 검증 | Zod 3 |
| 모니터링 | Sentry |
| 배포 | Vercel |
| AI | Google Gemini API (gemini-2.5-flash — 퀴즈 자동 생성, 약점 분석, 커뮤니티 글 보조) |

---

## 3. 규모

| 항목 | 수치 |
|------|------|
| 소스 파일 | 487개 (.ts/.tsx) |
| 총 코드 | ~53,000줄 |
| 페이지 라우트 | 55개 |
| API 라우트 | 23개 |
| Zustand 스토어 | 6개 |
| 테스트 | 1,079개 (78 파일), vitest |
| 커밋 | 679개 |
| 개발 기간 | 2026-03-10 ~ 현재 (약 3개월) |

---

## 4. 아키텍처 개요

```
┌─────────────────────────────────────────────┐
│  Browser (React + Zustand)                  │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │ 6 Stores│←→│SyncManager│←→│ Supabase  │  │
│  │(persist)│  │(debounce) │  │ user_data │  │
│  └─────────┘  └──────────┘  └───────────┘  │
├─────────────────────────────────────────────┤
│  Next.js App Router                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 55 Pages │  │ 23 APIs  │  │ MDX      │  │
│  │(SSR/CSR) │  │(Route    │  │Content   │  │
│  │          │  │ Handlers)│  │(concepts)│  │
│  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────┤
│  Supabase                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │PostgreSQL│  │   Auth   │  │ Storage  │  │
│  │(quiz,    │  │(Google   │  │(images)  │  │
│  │ user_data│  │ OAuth)   │  │          │  │
│  │ community│  │          │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

### 데이터 동기화 전략

사용자 학습 데이터는 **Zustand + localStorage** (오프라인 우선)에 저장되고, 로그인 시 **Supabase user_data 테이블에 양방향 동기화**된다.

- 로그인 → 서버 데이터 pull → Zod 검증 → 6개 스토어에 hydrate
- 스토어 변경 → 1.5초 debounce → 서버에 push
- 서버가 더 최신이면 push 건너뛰고 pull (충돌 해결)
- 비로그인 시 localStorage만 사용 (게스트 모드)

### 퀴즈 데이터 흐름

```
관리자 → 에디터/AI생성/Bulk Import
         ↓
      Zod 입력 검증 → Quality Gate (품질 규칙) → DB 저장
         ↓
      사용자 → 과목/타입별 출제 → 결과 → 오답노트/통계
```

---

## 5. 핵심 설계 결정과 그 이유

### ① 왜 Zustand + localStorage인가 (서버 상태가 아니라)

수험생은 카페, 지하철, 도서관 등 네트워크가 불안정한 환경에서 공부한다. 오프라인에서도 퀴즈를 풀고 오답노트를 볼 수 있어야 하므로, 클라이언트 퍼스트 + 서버 동기화 구조를 선택했다.

### ② 왜 단일 레포 55개 페이지인가

모든 기능이 "학습"이라는 하나의 도메인 안에 있다. 마이크로서비스나 모노레포로 나눌 이유가 없었다. 한 명이 전체를 유지보수할 수 있는 규모다.

### ③ 왜 Supabase인가

PostgreSQL의 안정성 + Auth/Storage 올인원 + 무료 티어. 1인 프로젝트에서 별도 백엔드 서버 운영은 오버헤드다.

---

## 6. 코드를 볼 때 이 파일들부터

| 파일 | 무엇을 보는가 | 경로 |
|------|-------------|------|
| **SyncManager** | 가장 복잡한 로직. 6개 스토어 ↔ 서버 양방향 동기화 | `src/components/SyncManager.tsx` |
| **useStudyStore** | 클라이언트 상태 설계 패턴. Zustand persist | `src/stores/useStudyStore.ts` |
| **sync-schemas** | Zod 스키마로 서버 데이터 검증 | `src/lib/db/sync-schemas.ts` |
| **bulk route** | API 설계 + 입력 검증 + 품질 게이트 통합 | `src/app/api/admin/quiz/bulk/route.ts` |
| **quiz-quality** | 비즈니스 규칙 엔진 (퀴즈 품질 검증) | `src/lib/quiz/quiz-quality.ts` |
| **duplicate-detector** | 한국어 텍스트 유사도 알고리즘 | `src/lib/quiz/duplicate-detector.ts` |

---

## 7. 알려진 기술 부채

솔직하게 적는다. 현재 인지하고 있는 문제들:

1. **sync 스키마와 실제 스토어 필드 불일치** — 스토어에 있는 일부 필드가 Zod 스키마에 누락 (passthrough로 우회 중)
2. **visibilitychange flush가 탭 닫기에서 미작동** — sendBeacon 미적용, async fetch는 탭 종료 시 취소됨
3. **SyncManager 테스트 0개** — 가장 복잡한 컴포넌트에 자동화된 검증 없음
4. **API 간 타입/범위 불일치** — difficulty 범위가 API마다 다름 (1-3 vs 1-5)
5. **O(n²) 중복 감지** — 10,000건 이상에서 성능 보호 없음

---

## 8. 조언을 구하고 싶은 질문

1. **바이브 코딩으로 3개월 만들었는데, 구조적으로 치명적인 문제가 있는가?**
   - 특히 상태 관리(Zustand 6개 스토어), 데이터 동기화, API 설계 관점에서

2. **이걸 실서비스(수십~수백 사용자)로 키우려면 지금 뭘 먼저 고쳐야 하는가?**
   - 확장성, 안정성, 유지보수 측면에서

3. **Java/백엔드 관점에서 이 설계가 어떻게 보이는가?**
   - 에러 처리 패턴, 데이터 무결성, API 계약 관점에서

---

## Git

```
https://github.com/gimbabheaven26-creator/special-education-web.git
```
