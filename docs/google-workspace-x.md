# Google Workspace 전략 설계서

> 작성자: X (Google Workspace 통합 아키텍트)
> 대상: 강선생(Kairan) — 10년차 특수교육 교사, 코딩 1개월차
> 날짜: 2026-03-24

---

## 목차

1. [현황 감사 (Phase 1)](#phase-1-현황-감사)
2. [Google Drive 폴더 구조 (Phase 2)](#phase-2-google-drive-폴더-구조)
3. [Google Sheets 템플릿 설계 (Phase 3)](#phase-3-google-sheets-템플릿-설계)
4. [동기화 아키텍처 (Phase 4)](#phase-4-동기화-아키텍처)
5. [교육적 설계 (Phase 5)](#phase-5-교육적-설계)
6. [학습 경로 (Phase 6)](#phase-6-강선생-학습-경로)

---

## Phase 1: 현황 감사

### 현재 갖고 있는 것

냉장고 속 재료를 먼저 확인하듯, 이미 만들어진 Google 연동 코드를 정리한다.

#### 1.1 API 엔드포인트 (이미 동작 중)

| 엔드포인트 | 메서드 | 기능 | 상태 |
|---|---|---|---|
| `/api/admin/quiz` | GET | 문제 목록 조회 (필터, 페이지네이션) | 완성 |
| `/api/admin/quiz` | POST | 단일 문제 생성 | 완성 |
| `/api/admin/quiz/[id]` | PATCH | 문제 수정 | 완성 |
| `/api/admin/quiz/[id]` | DELETE | 문제 삭제 | 완성 |
| `/api/admin/quiz/bulk` | POST | 최대 500건 일괄 upsert | 완성 |
| `/api/admin/quiz/export` | GET | JSON/CSV 전체 내보내기 | 완성 |
| `/api/admin/chapters` | GET | 과목별 챕터 목록 | 완성 |

**핵심 발견**: `/api/admin/quiz/bulk`와 `/api/admin/quiz/export`는 Google Sheets 양방향 동기화를 위해 이미 설계되었다. `ADMIN_API_KEY` 환경변수 기반 인증도 준비되어 있다.

#### 1.2 Apps Script 템플릿 (작성됨, 미연결)

파일 위치: `docs/apps-script-template.js`

이 스크립트는 이미 다음 기능을 포함한다:
- `onEdit()` — 시트 수정 시 자동으로 `/api/admin/quiz/bulk`에 전송
- `syncFromDB()` — DB 데이터를 시트로 가져오기
- `onOpen()` — "퀴즈 관리" 커스텀 메뉴 추가
- `setupTimeTrigger()` — 5분 간격 자동 동기화

**문제점**: API_BASE_URL과 ADMIN_API_KEY가 placeholder 상태. 실제 Google Sheet에 연결되지 않았다.

#### 1.3 관리자 UI (부분 완성)

- `/admin` — 대시보드: 전체 문항 수, 과목별/유형별/난이도별 통계
- `/admin/editor` — 문제 목록 + CRUD 폼
- Google Sheets 동기화 전용 관리 페이지는 **없음**

#### 1.4 데이터 현황

| 데이터 | 수량 | 저장소 | Sheets 연동 |
|---|---|---|---|
| 퀴즈 문항 | 906+ | Supabase `quiz_questions` | bulk API 준비됨 |
| 과목 | 17개 | Supabase `subjects` | 미연동 |
| 챕터 | 39개 | Supabase `chapters` | 미연동 |
| KICE 기출 | 12년치 (2016~2027) | `data/kice-기출/` JSON | 미연동 |
| 키워드 분석 | 1,417개 고유 키워드 | `docs/kice-keyword-data.json` | 미연동 |
| 용어 사전 | 1,129+ 항목 | `data/terminology/` | 미연동 |
| 학습 기록 | 2,061건 | Supabase `user_data` | 미연동 |

#### 1.5 의존성 현황

`package.json`에 `googleapis` 패키지는 **없음**. 현재 동기화 방식은 Google Apps Script 단독으로 설계되었다(서버 사이드에서 Sheets API를 직접 호출하지 않음).

#### 1.6 감사 결론

> **"80% 완성된 다리"** — API와 Apps Script 양쪽 끝은 만들어졌지만, 가운데 연결(실제 Sheet 생성 + Script 배포 + 환경변수 설정)이 빠져 있다. 추가 코딩 없이 설정만으로 연결 가능하다.

---

## Phase 2: Google Drive 폴더 구조

학교 교무실 서류함처럼, 아무나 와서 봐도 "아, 여기 이런 자료가 있구나" 알 수 있게 구성한다.

### 2.1 전체 구조

```
특수교육 공부방/
│
├── 📋 01_문제 관리/
│   ├── 문제 마스터 시트          ← 핵심! 906+ 문항 관리
│   ├── 문제 품질 체크리스트       ← 검수용
│   └── 📖 README (이 폴더 안내)
│
├── 📊 02_기출 분석/
│   ├── 기출 키워드 분석 시트      ← 12년치 키워드 히트맵
│   ├── 기출 영역별 출제 빈도      ← 과목별 연도별 매트릭스
│   ├── 2027 예측 워크시트         ← 다음 시험 대비
│   └── 📖 README (이 폴더 안내)
│
├── 📈 03_운영 대시보드/
│   ├── 사용자 현황 시트           ← 활성 사용자, 학습 패턴
│   ├── 콘텐츠 커버리지 시트       ← 과목별 문항 수, 빈 영역
│   └── 📖 README (이 폴더 안내)
│
├── 📝 04_개발 기록/
│   ├── 개발 진행 시트             ← 기능 목록, 상태, 스프린트
│   ├── 의사결정 로그              ← 왜 이렇게 만들었나
│   ├── 에이전트 세션 기록         ← AI 에이전트 작업 이력
│   └── 📖 README (이 폴더 안내)
│
├── 📚 05_학습 자료/
│   ├── 플랫폼 사용 가이드         ← 자문위원용
│   ├── 용어 사전 시트             ← 1,129개 특수교육 용어
│   ├── 과목별 학습 로드맵         ← 시험 준비 안내
│   └── 📖 README (이 폴더 안내)
│
└── 🔧 06_설정/
    ├── 환경변수 참조 (값 없이 키만)
    ├── 시트 템플릿 모음            ← 새 시트 만들 때 복사용
    └── 📖 README (이 폴더 안내)
```

### 2.2 각 폴더 상세

#### 📋 01_문제 관리/

| 항목 | 내용 |
|---|---|
| **목적** | 906+ 퀴즈 문항의 생성, 수정, 검수를 Google Sheets에서 수행 |
| **편집자** | 강선생(주), 자문위원(검수), AI 에이전트(대량 생성 후 검수 대기) |
| **플랫폼 연결** | Apps Script `onEdit()` → `/api/admin/quiz/bulk` (실시간 동기화) |
| **동기화 방향** | 양방향: Sheets ↔ Supabase |
| **가이드 텍스트** | 시트 상단 3행에 사용법, 컬럼 설명, 색상 범례 포함 |

#### 📊 02_기출 분석/

| 항목 | 내용 |
|---|---|
| **목적** | KICE 기출문제 12년치 분석 데이터를 시각적으로 탐색 |
| **편집자** | AI 에이전트(분석 결과 업로드), 강선생(해석, 메모 추가) |
| **플랫폼 연결** | 수동 업로드 (분석 스크립트 실행 후 CSV/JSON → 시트 붙여넣기) |
| **동기화 방향** | 단방향: 플랫폼 → Sheets (분석 결과만 내보내기) |
| **가이드 텍스트** | 각 시트 상단에 "이 분석은 무엇을 보여주는가?" 설명 |

#### 📈 03_운영 대시보드/

| 항목 | 내용 |
|---|---|
| **목적** | 사이트 사용 현황을 비개발자도 볼 수 있게 시각화 |
| **편집자** | 자동 갱신 (Apps Script 타이머), 강선생(메모 추가) |
| **플랫폼 연결** | Apps Script 타이머 → Supabase API → 시트 자동 갱신 |
| **동기화 방향** | 단방향: Supabase → Sheets (읽기 전용) |
| **가이드 텍스트** | "이 시트는 자동으로 갱신됩니다. 직접 수정하지 마세요." |

#### 📝 04_개발 기록/

| 항목 | 내용 |
|---|---|
| **목적** | 개발 과정 자체를 문서화 — 포트폴리오이자 학습 자료 |
| **편집자** | 강선생(수동), AI 에이전트(세션 완료 시 자동 기록) |
| **플랫폼 연결** | 없음 (순수 문서) |
| **동기화 방향** | 해당 없음 |
| **가이드 텍스트** | "이 폴더는 개발 여정의 일지입니다. 누구든 읽고 배울 수 있습니다." |

#### 📚 05_학습 자료/

| 항목 | 내용 |
|---|---|
| **목적** | 자문위원과 협력자가 플랫폼과 데이터를 이해할 수 있게 안내 |
| **편집자** | 강선생(가이드 작성), AI 에이전트(용어사전 갱신) |
| **플랫폼 연결** | 용어사전은 `data/terminology/` 기반 자동 생성 가능 |
| **동기화 방향** | 단방향: 플랫폼 → Sheets |
| **가이드 텍스트** | "처음 오신 분은 여기부터 읽어주세요." |

#### 🔧 06_설정/

| 항목 | 내용 |
|---|---|
| **목적** | 시트 템플릿, 환경변수 키 목록, 설정 참조 문서 |
| **편집자** | 강선생만 |
| **플랫폼 연결** | 없음 (참조용) |
| **동기화 방향** | 해당 없음 |
| **가이드 텍스트** | "API 키나 비밀번호는 절대 여기에 적지 마세요. 키 이름만 적습니다." |

---

## Phase 3: Google Sheets 템플릿 설계

### 3.1 문제 마스터 시트 (Quiz Master Sheet)

엑셀처럼 생긴 표 하나가 906개 문제 전체를 관리하는 "본부"가 된다. 교무실에 있는 시험 문제 원본 폴더와 같다.

#### 시트 탭 구성

| 탭 이름 | 용도 |
|---|---|
| `📖 사용법` | 이 시트 사용 가이드 (가장 먼저 보는 탭) |
| `문제 전체` | 전체 문항 데이터 (메인) |
| `과목별 보기` | 과목 필터 뷰 (피벗 테이블) |
| `검수 대기` | status="검수필요"인 문항 자동 필터 |
| `변경 이력` | 수정 로그 (자동 기록) |

#### 메인 탭 "문제 전체" 컬럼 구조

행 1~3은 가이드, 행 4가 헤더, 행 5부터 데이터:

**행 1 (제목행)**: 배경색 `#1a73e8`(파랑), 흰 글씨
```
특수교육 공부방 — 문제 마스터 시트 | 최종 동기화: {자동갱신 시각}
```

**행 2 (안내행)**: 배경색 `#e8f0fe`(연파랑)
```
이 시트의 내용은 실시간으로 플랫폼에 반영됩니다. 수정하면 자동으로 DB에 저장됩니다. 문제가 생기면 [변경 이력] 탭에서 이전 값을 확인하세요.
```

**행 3 (색상 범례)**: 배경색 `#f8f9fa`(회색)
```
🟢 완성 | 🟡 검수 필요 | 🔴 오류 있음 | 🔵 AI 생성 (미검수) | ⬜ 빈 칸 = 입력 필요
```

**행 4 (헤더)**: 배경색 `#34a853`(초록), 흰 글씨, 고정(freeze)

| 열 | 헤더 | DB 컬럼 | 타입 | 필수 | 설명 |
|---|---|---|---|---|---|
| A | ID | `id` | 텍스트 | O | `BS-001` 형식. 과목코드-번호. 수정 금지 |
| B | 과목 | `subject` | 드롭다운 | O | 11개 과목 중 선택 |
| C | 챕터 | `chapter` | 드롭다운 | O | 과목에 따라 목록 변경 |
| D | 유형 | `type` | 드롭다운 | O | multiple/ox/fill_in/descriptive/scenario_composite |
| E | 난이도 | `difficulty` | 드롭다운 | O | 1(기본), 2(심화), 3(고난도) |
| F | 문제 | `question` | 장문 텍스트 | O | 문제 본문 |
| G | 정답 | `answer` | 텍스트 | O | 정답 |
| H | 해설 | `explanation` | 장문 텍스트 | O | 정답 해설 |
| I | 선택지 | `options` | JSON 배열 | 조건 | 객관식일 때 필수. ["보기1","보기2","보기3","보기4"] |
| J | 사례 | `case_context` | 장문 텍스트 | - | 시나리오/사례 지문 |
| K | 오답 해설 | `wrong_explanations` | JSON 객체 | - | {"1":"해설","2":"해설",...} |
| L | 출처 | `source` | 텍스트 | - | "2024-전공A-3번" 형식 |
| M | 태그 | `tags` | JSON 배열 | - | ["ABA","강화"] |
| N | 상태 | (시트 전용) | 드롭다운 | - | 완성/검수필요/오류/AI생성 |
| O | 메모 | (시트 전용) | 텍스트 | - | 검수자 코멘트 |

#### 데이터 검증 규칙

시트의 "데이터 > 데이터 확인"에서 설정:

```
B열 (과목): 목록에서 선택
  → introduction, curriculum, inclusive-education, assessment,
    behavior-support, transition, laws, visual-impairment,
    hearing-impairment, physical-disability, communication-disorder

D열 (유형): 목록에서 선택
  → multiple, ox, fill_in, descriptive, scenario_composite

E열 (난이도): 목록에서 선택
  → 1, 2, 3

N열 (상태): 목록에서 선택
  → 완성, 검수필요, 오류, AI생성
```

#### 조건부 서식 규칙

| 조건 | 서식 | 범위 |
|---|---|---|
| N열 = "완성" | 행 전체 배경 `#e6f4ea` (연초록) | A:O |
| N열 = "검수필요" | 행 전체 배경 `#fef7e0` (연노랑) | A:O |
| N열 = "오류" | 행 전체 배경 `#fce8e6` (연빨강) | A:O |
| N열 = "AI생성" | 행 전체 배경 `#e8f0fe` (연파랑) | A:O |
| F열(문제) 비어있음 | F셀 배경 `#ea4335` (빨강) | F:F |
| G열(정답) 비어있음 | G셀 배경 `#ea4335` (빨강) | G:G |
| D열="multiple" AND I열 비어있음 | I셀 배경 `#ea4335` | I:I |

#### 문제 추가 방법 (비개발자용 단계별 안내)

이 내용은 시트의 `📖 사용법` 탭에 그대로 들어간다:

```
╔══════════════════════════════════════════════════╗
║  새 문제 추가하기 (5분 가이드)                    ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  1단계: [문제 전체] 탭으로 이동                    ║
║  2단계: 맨 아래 빈 행으로 스크롤                   ║
║  3단계: A열(ID)은 비워두세요 — 자동 생성됩니다      ║
║  4단계: B열(과목)을 클릭 → 드롭다운에서 선택       ║
║  5단계: C열(챕터)을 클릭 → 드롭다운에서 선택       ║
║  6단계: D열(유형)을 클릭 → 드롭다운에서 선택       ║
║  7단계: E열(난이도)을 클릭 → 1/2/3 선택            ║
║  8단계: F열에 문제 본문 입력                       ║
║  9단계: G열에 정답 입력                            ║
║  10단계: H열에 해설 입력                           ║
║  11단계: N열 상태를 "검수필요"로 설정               ║
║                                                  ║
║  ★ 객관식(multiple)이면 I열에 선택지도 입력        ║
║    형식: ["보기1","보기2","보기3","보기4"]          ║
║                                                  ║
║  ★ 입력 완료 후 3~5초 안에 자동 저장됩니다         ║
║  ★ 문제가 생기면 강선생에게 연락하세요             ║
╚══════════════════════════════════════════════════╝
```

#### 유형별 입력 예시

`📖 사용법` 탭에 포함될 예시:

**객관식 (multiple)**
| 열 | 값 |
|---|---|
| D (유형) | multiple |
| F (문제) | 다음 중 정적강화에 해당하는 것은? |
| G (정답) | 2 |
| I (선택지) | ["칭찬하기","토큰 주기","과제 줄이기","타임아웃"] |
| H (해설) | 토큰 주기는 원하는 것(자극)을 제공하므로 정적강화이다... |

**OX**
| 열 | 값 |
|---|---|
| D (유형) | ox |
| F (문제) | UDL은 사후적 수정이 아니라 처음부터 다양한 학습자를 고려하여 설계하는 것이다. |
| G (정답) | O |
| H (해설) | UDL(보편적 학습설계)은 처음부터 모든 학습자의 다양성을 고려... |

**빈칸채우기 (fill_in)**
| 열 | 값 |
|---|---|
| D (유형) | fill_in |
| F (문제) | 긍정적 행동지원(PBS)에서 문제행동의 기능을 파악하기 위해 실시하는 평가를 (    )이라 한다. |
| G (정답) | 기능행동평가 |
| H (해설) | 기능행동평가(FBA)는 문제행동의 기능(원인)을 체계적으로... |

---

### 3.2 기출 분석 시트 (KICE Analysis Sheet)

10년치 기출문제가 "어떤 과목에서, 어떤 키워드가, 몇 번 나왔는지" 한눈에 보이는 히트맵이다. 마치 날씨 지도를 보듯 "올해 시험에 뭐가 나올 것 같은지" 예측하는 데 쓴다.

#### 탭 구성

| 탭 이름 | 용도 |
|---|---|
| `📖 분석 가이드` | 이 시트 사용법 및 분석 방법론 |
| `연도별 영역 출제표` | 과목 x 연도 매트릭스 (메인) |
| `키워드 히트맵` | 상위 100 키워드 x 연도 빈도 |
| `키워드 전체 목록` | 1,417개 키워드 빈도순 정렬 |
| `2027 예측` | 예측 워크시트 |

#### "연도별 영역 출제표" 탭

**행 1 (제목)**: 배경색 `#7b1fa2`(보라), 흰 글씨
```
KICE 특수교육 임용시험 — 연도별 영역 출제 빈도 (2016~2026)
```

**행 2 (안내)**:
```
각 셀의 숫자는 해당 연도 시험에서 해당 영역이 출제된 문항 수입니다. 색이 진할수록 많이 출제되었습니다.
```

| 열 | 내용 |
|---|---|
| A | 영역(과목) |
| B | 비중(%) |
| C~M | 2016 ~ 2026 (각 연도) |
| N | 합계 |
| O | 평균 |
| P | 추세(상승/하락/안정) |

데이터 행 (예시):

| 영역 | 비중 | 2016 | 2017 | ... | 2026 | 합계 | 평균 | 추세 |
|---|---|---|---|---|---|---|---|---|
| 행동지원 | 15% | 3 | 4 | ... | 5 | 42 | 3.8 | 상승 |
| 교육과정 | 15% | 2 | 3 | ... | 4 | 35 | 3.2 | 안정 |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

조건부 서식: 셀 값에 따라 색상 스케일 적용
- 0: 흰색
- 1~2: `#e8f5e9` (연초록)
- 3~4: `#a5d6a7` (초록)
- 5+: `#2e7d32` (진초록)

P열 (추세) 수식 예시:
```
=IF(SLOPE(C4:M4,{2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026})>0.2,
  "↑ 상승",
  IF(SLOPE(C4:M4,{2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026})<-0.2,
    "↓ 하락",
    "→ 안정"))
```

#### "키워드 히트맵" 탭

| 열 | 내용 |
|---|---|
| A | 순위 |
| B | 키워드 |
| C | 전체 빈도 |
| D~N | 2016 ~ 2026 (각 연도별 빈도) |
| O | 최근 3년 추세 |

상위 20개 키워드 (기존 `kice-terms.json` 기반):
```
1. 자폐성장애 (23회)
2. 지적장애 (16회)
3. 점자 (15회)
4. 뇌성마비 (13회)
5. 순회교육 (12회)
...
```

#### "2027 예측" 워크시트

자문위원들과 함께 작성하는 탭:

| 열 | 내용 |
|---|---|
| A | 영역 |
| B | 최근 3년 출제 빈도 |
| C | 추세 |
| D | 예상 출제 확률 (높음/중/낮음) |
| E | 주목 키워드 |
| F | 자문위원 의견 |
| G | 대비 전략 |

---

### 3.3 사용자 현황 시트 (User Dashboard Sheet)

카페 사장님이 POS 매출 보고서를 보듯, 플랫폼 운영 현황을 한눈에 확인하는 대시보드다.

#### 탭 구성

| 탭 이름 | 용도 |
|---|---|
| `📖 대시보드 안내` | 읽는 법 안내 |
| `요약` | 핵심 지표 한 페이지 |
| `일별 활동` | 날짜별 활성 사용자, 풀이 수 |
| `과목별 통계` | 과목별 정답률, 인기도 |

#### "요약" 탭 구조

**행 1 (제목)**: 배경색 `#0d47a1`(남색), 흰 글씨
```
특수교육 공부방 — 운영 현황 | 자동 갱신: 매일 06:00
```

**행 2 (경고)**: 배경색 `#fff3e0`(연주황)
```
이 시트는 자동으로 갱신됩니다. 직접 수정하면 다음 갱신 시 덮어씌워집니다.
```

핵심 지표 블록:

| 지표 | 셀 위치 | 데이터 소스 |
|---|---|---|
| 전체 사용자 수 | B5 | Supabase `profiles` COUNT |
| 이번 주 활성 사용자 | D5 | `user_data` WHERE updated_at > 7일전 |
| 전체 문항 수 | B7 | `quiz_questions` COUNT |
| 이번 주 풀이 횟수 | D7 | `quiz_records` COUNT 최근 7일 |
| 평균 정답률 | B9 | `quiz_records` 정답/전체 비율 |
| 가장 인기 과목 | D9 | 풀이 횟수 기준 TOP 1 |

#### 자동 갱신 방법 (Supabase → Sheets)

Apps Script에서 Supabase REST API를 직접 호출한다. Supabase는 PostgREST 기반이므로 URL + `apikey` 헤더만으로 조회 가능하다.

```javascript
// Apps Script 예시: 사용자 수 가져오기
function fetchUserCount() {
  var url = CONFIG.SUPABASE_URL + '/rest/v1/profiles?select=id&limit=1';
  var response = UrlFetchApp.fetch(url, {
    headers: {
      'apikey': CONFIG.SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + CONFIG.SUPABASE_ANON_KEY,
      'Prefer': 'count=exact'
    }
  });
  // content-range 헤더에서 전체 수 파싱
  var range = response.getHeaders()['content-range'];
  // "0-0/42" → 42
  return parseInt(range.split('/')[1]);
}
```

> 보안 주의: Supabase의 anon key와 RLS(Row Level Security)를 활용한다. anon key는 공개되어도 RLS가 데이터를 보호한다. 하지만 대시보드용으로는 `service_role` 키가 필요할 수 있으므로, Apps Script 내부에만 저장하고 시트에는 절대 노출하지 않는다.

---

### 3.4 개발 진행 시트 (Development Progress Sheet)

일반 사무실의 프로젝트 진행 현황판과 같다. "지금 뭘 만들고 있고, 뭐가 끝났고, 뭐가 남았는지" 한눈에 본다.

#### 탭 구성

| 탭 이름 | 용도 |
|---|---|
| `📖 프로젝트 안내` | 프로젝트 소개, 팀 구성 |
| `기능 목록` | 전체 기능과 상태 |
| `스프린트` | 주간/2주간 작업 계획 |
| `버그/이슈` | 발견된 문제와 해결 상태 |
| `의사결정 로그` | 왜 이렇게 만들었는가 |

#### "기능 목록" 탭

| 열 | 내용 | 설명 |
|---|---|---|
| A | 카테고리 | 학습, 기출, 관리, 인증, UI 등 |
| B | 기능명 | 예: "퀴즈 풀이 화면" |
| C | 상태 | 완료/진행중/예정/보류 |
| D | 우선순위 | 높음/중/낮음 |
| E | 담당 | 강선생/에이전트명 |
| F | 시작일 | 2026-03-15 |
| G | 완료일 | 2026-03-20 |
| H | 관련 커밋 | 해시 또는 PR 링크 |
| I | 노트 | 구현 메모 |

조건부 서식:
- C열 = "완료": 행 배경 `#e6f4ea`
- C열 = "진행중": 행 배경 `#fff3e0`
- C열 = "보류": 행 배경 `#f5f5f5`, 글씨 `#9e9e9e`

#### "의사결정 로그" 탭

이 탭은 강선생이 "왜 이렇게 만들었는지" 기록하는 곳이다. 나중에 자문위원이나 협력자에게 설명할 때 귀중한 자료가 된다.

| 열 | 내용 |
|---|---|
| A | 날짜 |
| B | 주제 |
| C | 선택한 방안 |
| D | 대안들 |
| E | 선택 이유 |
| F | 결과/교훈 |

---

## Phase 4: 동기화 아키텍처

### 4.1 기술 옵션 비교

자전거, 버스, 택시 중 "지금 상황에 맞는 교통수단"을 고르는 것과 같다.

#### 옵션 A: Google Apps Script (현재 방식) — 추천

| 항목 | 내용 |
|---|---|
| **원리** | Google Sheet 안에서 실행되는 JavaScript. 시트 수정 시 자동으로 우리 API를 호출 |
| **장점** | 추가 서버 불필요, 무료, 이미 템플릿 있음, Google 계정만 있으면 됨 |
| **단점** | 실행 시간 제한 (6분), 에러 로그 확인이 다소 번거로움 |
| **복잡도** | 낮음 — 코드 복사+붙여넣기 + 환경변수 2개 설정 |
| **강선생 적합도** | 최적. 이미 코드가 있고, 추가 학습 최소 |

#### 옵션 B: Google Sheets API (googleapis npm)

| 항목 | 내용 |
|---|---|
| **원리** | Next.js 서버에서 Google Sheets API를 직접 호출 |
| **장점** | 서버 사이드 제어 가능, 복잡한 로직 구현 가능 |
| **단점** | 서비스 계정 설정 필요, 패키지 추가, 코드 복잡도 증가 |
| **복잡도** | 중간 — OAuth 또는 서비스 계정 설정, 패키지 설치, API 라우트 작성 |
| **강선생 적합도** | 낮음. 지금 단계에서는 과도한 복잡도 |

#### 옵션 C: CSV 수동 내보내기/가져오기

| 항목 | 내용 |
|---|---|
| **원리** | API에서 CSV 다운로드 → Google Sheets에 붙여넣기 |
| **장점** | 가장 단순, 의존성 제로, 실수해도 영향 없음 |
| **단점** | 수동 작업 필요, 실시간 아님, 대량 수정 시 번거로움 |
| **복잡도** | 최저 |
| **강선생 적합도** | 임시 방편으로 좋음. 장기적으론 부족 |

#### 옵션 D: Zapier/Make (노코드 자동화)

| 항목 | 내용 |
|---|---|
| **원리** | 노코드 플랫폼에서 Supabase ↔ Google Sheets 연결 |
| **장점** | 코딩 불필요, 시각적 설정, 다양한 트리거 |
| **단점** | 월 비용 발생 (무료 플랜 제한), Supabase 커넥터가 제한적 |
| **복잡도** | 낮음 — 하지만 디버깅이 어려움 |
| **강선생 적합도** | 중간. 비용 대비 효과가 낮음 (이미 Apps Script가 있으므로) |

### 4.2 추천 아키텍처: Apps Script 중심

```
┌─────────────────────────────────────────────────────────────┐
│                    Google Sheets                             │
│  ┌──────────┐    ┌──────────────┐    ┌────────────────┐     │
│  │ 문제 편집 │───▶│ onEdit() 함수 │───▶│ /api/admin/    │     │
│  │ (수동)    │    │ (Apps Script)│    │ quiz/bulk      │     │
│  └──────────┘    └──────────────┘    │ (POST)         │     │
│                                      └───────┬────────┘     │
│                                              │              │
│                                              ▼              │
│                                      ┌──────────────┐      │
│                                      │   Supabase    │      │
│                                      │   quiz_       │      │
│                                      │   questions   │      │
│                                      └──────┬───────┘      │
│                                             │               │
│                                             ▼               │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ 시트 갱신 │◀───│ syncFromDB() │◀───│ /api/admin/  │      │
│  │ (자동)    │    │ (타이머/수동)│    │ quiz/export  │      │
│  └──────────┘    └──────────────┘    │ (GET)        │      │
│                                      └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Sheets → Platform (데이터 입력 흐름)

#### 트리거: 셀 수정 시 자동 전송

이미 `apps-script-template.js`의 `onEdit(e)`가 이 역할을 한다. 개선 사항:

```javascript
function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  if (sheet.getName() !== CONFIG.SHEET_NAME) return;

  var row = e.range.getRow();
  if (row <= 4) return; // 행 1~3 가이드, 행 4 헤더 → 무시

  // ① 변경 이력 기록
  logChange(sheet, row, e.range.getColumn(), e.oldValue, e.value);

  // ② 유효성 검사
  var values = sheet.getRange(row, 1, 1, COLUMNS.length).getValues()[0];
  var question = parseRow(values);

  if (!question.subject || !question.question || !question.answer) {
    // 필수 필드 미입력 → 동기화 건너뜀, 셀 배경만 변경
    sheet.getRange(row, 1, 1, COLUMNS.length).setBackground('#fce8e6');
    return;
  }

  // ③ API 전송
  var response = UrlFetchApp.fetch(CONFIG.API_BASE_URL + '/api/admin/quiz/bulk', {
    method: 'POST',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + CONFIG.ADMIN_API_KEY },
    payload: JSON.stringify({ questions: [question] }),
    muteHttpExceptions: true,
  });

  // ④ 결과 반영
  if (response.getResponseCode() === 200) {
    sheet.getRange(row, 1, 1, COLUMNS.length).setBackground(null); // 에러 색상 제거
    SpreadsheetApp.getActiveSpreadsheet().toast('저장 완료', '동기화', 2);
  } else {
    sheet.getRange(row, 1, 1, COLUMNS.length).setBackground('#fce8e6');
    SpreadsheetApp.getActiveSpreadsheet().toast(
      '저장 실패: ' + response.getContentText(), '오류', 5
    );
  }
}
```

#### 충돌 해결 전략

시트와 관리자 페이지에서 동시에 수정할 경우:

| 상황 | 해결 방식 |
|---|---|
| 시트에서 수정 → DB 반영 | `onEdit()` → upsert (기존 값 덮어쓰기) |
| 관리자 페이지에서 수정 → 시트 미반영 | 다음 `syncFromDB()` 실행 시 시트 갱신 |
| 양쪽 동시 수정 (드뭄) | **"마지막 쓴 사람 승리" (Last Write Wins)** |

현실적으로, 강선생이 혼자 또는 1~2명 자문위원과 작업하므로 동시 충돌 가능성은 극히 낮다. 복잡한 충돌 해결 로직은 불필요하다.

**실용적 규칙**: "문제 수정은 시트에서만, 사용자 데이터 조회는 대시보드에서만"

#### 유효성 검사 (에러 방지)

Apps Script에서 DB 전송 전 검증:

```javascript
function validateQuestion(q) {
  var errors = [];

  if (!q.subject) errors.push('과목 누락');
  if (!q.question) errors.push('문제 본문 누락');
  if (!q.answer) errors.push('정답 누락');
  if (q.type === 'multiple' && (!q.options || q.options.length < 2)) {
    errors.push('객관식은 선택지 2개 이상 필요');
  }
  if (q.difficulty && ![1,2,3].includes(Number(q.difficulty))) {
    errors.push('난이도는 1/2/3만 가능');
  }

  return errors;
}
```

### 4.4 Platform → Sheets (데이터 내보내기 흐름)

#### 자동 갱신 (타이머)

```javascript
// 매일 오전 6시에 DB → 시트 동기화
function setupDailySync() {
  // 기존 트리거 삭제
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(t) {
    if (t.getHandlerFunction() === 'syncFromDB') {
      ScriptApp.deleteTrigger(t);
    }
  });

  // 새 타이머 설정
  ScriptApp.newTrigger('syncFromDB')
    .timeBased()
    .atHour(6)
    .everyDays(1)
    .create();
}
```

#### 수동 갱신 (메뉴)

기존 `onOpen()` 함수가 이미 "퀴즈 관리 > DB에서 가져오기" 메뉴를 제공한다. 추가 메뉴:

```javascript
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('퀴즈 관리')
    .addItem('DB에서 가져오기 (전체)', 'syncFromDB')
    .addItem('DB에서 가져오기 (과목 선택)', 'syncBySubject')
    .addSeparator()
    .addItem('사용자 현황 갱신', 'refreshDashboard')
    .addSeparator()
    .addItem('설정', 'showSettings')
    .addToUi();
}
```

### 4.5 설정 및 배포 단계 (강선생용)

"다리를 연결하는" 실제 작업 순서:

```
단계 1: Google Sheets 생성
  └─ Google Drive에서 "새 스프레드시트" 생성
  └─ 이름: "특수교육 공부방 — 문제 마스터 시트"

단계 2: Apps Script 열기
  └─ 시트 메뉴 > 확장 프로그램 > Apps Script 클릭
  └─ 기존 코드 전체 삭제
  └─ docs/apps-script-template.js 내용 복사+붙여넣기

단계 3: 환경변수 설정
  └─ CONFIG 객체의 두 값 수정:
     API_BASE_URL: Vercel 배포 URL (예: https://special-education-web.vercel.app)
     ADMIN_API_KEY: Vercel 환경변수에 설정된 ADMIN_API_KEY 값

단계 4: 트리거 설정
  └─ Apps Script 편집기에서 실행 > setupTimeTrigger 선택 > 실행
  └─ Google 계정 권한 승인 (처음 1회)

단계 5: 첫 동기화
  └─ 시트로 돌아가기
  └─ 메뉴 > 퀴즈 관리 > DB에서 가져오기
  └─ 906+ 문항이 시트에 나타나면 성공

단계 6: 테스트
  └─ 아무 문항 하나의 해설(H열)을 살짝 수정
  └─ 3초 후 "동기화 완료" 토스트 메시지 확인
  └─ 관리자 페이지(/admin/editor)에서 해당 문항 확인
```

---

## Phase 5: 교육적 설계

모든 시트는 "설명서 없이는 쓸모없는 기계"가 되지 않도록, 시트 자체가 설명서를 포함한다.

### 5.1 사용법 섹션 ("📖 이 시트 사용법")

모든 시트의 **첫 번째 탭**에 포함:

#### 필수 포함 항목

```
[시트 이름] 사용 가이드
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 이 시트는 무엇인가?
   → 한 문장 설명

2. 누가 편집하나?
   → 편집 가능한 사람과 역할

3. 어떤 탭이 있나?
   → 각 탭의 목적 1줄 설명

4. 색상 의미
   🟢 초록 = 완성/정상
   🟡 노랑 = 확인 필요
   🔴 빨강 = 오류/긴급
   🔵 파랑 = AI가 생성, 사람 검수 필요

5. 주의사항
   → "이 셀은 수정하면 안 됩니다" 등

6. 도움이 필요하면?
   → 강선생 연락처
```

### 5.2 색상 코딩 체계

모든 시트에서 일관되게 사용하는 색상:

| 색상 | HEX | 의미 | 사용처 |
|---|---|---|---|
| 진파랑 | `#1a73e8` | 시트 제목 | 행 1 |
| 연파랑 | `#e8f0fe` | 안내 메시지 / AI 생성 | 행 2, 상태 |
| 진초록 | `#34a853` | 헤더 | 행 4 |
| 연초록 | `#e6f4ea` | 완성/정상 | 상태별 행 |
| 연노랑 | `#fef7e0` | 검수 필요 | 상태별 행 |
| 연빨강 | `#fce8e6` | 오류 | 상태별 행 |
| 진빨강 | `#ea4335` | 필수 항목 비어있음 | 빈 셀 |
| 회색 | `#f8f9fa` | 범례, 부가 정보 | 행 3 |
| 보라 | `#7b1fa2` | 분석/통계 시트 제목 | 기출 분석 |
| 남색 | `#0d47a1` | 대시보드 시트 제목 | 운영 현황 |

### 5.3 인라인 용어 설명

시트 곳곳에서 전문 용어가 나올 때, 별도 용어집이 아니라 **셀 메모(노트)**로 바로 설명한다.

설정 방법: 셀 우클릭 > "메모 삽입"

예시:
- B열 헤더 "과목" 셀의 메모:
  ```
  과목(subject)이란?
  특수교육 시험의 11개 영역 중 하나.
  예: behavior-support = 행동지원
  영어 slug로 입력하는 이유: 프로그램 내부에서 이 값으로 데이터를 찾기 때문
  ```

- D열 헤더 "유형" 셀의 메모:
  ```
  문제 유형(type)이란?
  - multiple: 4지선다 객관식
  - ox: O/X 참거짓 판단
  - fill_in: 빈칸에 정답 작성
  - descriptive: 서술형 (문장으로 답)
  - scenario_composite: 사례 제시 후 복수 소문항
  ```

- E열 헤더 "난이도" 셀의 메모:
  ```
  난이도(difficulty) 기준:
  1 = 기본: 용어 정의, 단순 사실 확인
  2 = 심화: 비교/분석, 사례 적용
  3 = 고난도: 실제 기출 수준, 통합적 사고 필요
  ```

### 5.4 "왜 이런 구조인가?" 설명

시트의 `📖 사용법` 탭 하단에 포함:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
왜 이런 구조인가?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q: 왜 과목을 영어(slug)로 입력하나요?
A: 프로그램 코드에서 "behavior-support"라는 키로 데이터를 찾기 때문입니다.
   시트에서 "행동지원"이라고 쓰면, 프로그램이 인식하지 못합니다.
   드롭다운을 사용하면 실수를 방지할 수 있습니다.

Q: 왜 선택지(options)를 JSON 형식으로 쓰나요?
A: 프로그램이 ["보기1","보기2","보기3","보기4"] 형태로 데이터를 저장하기
   때문입니다. 쉼표로 구분하면 "보기 안에 쉼표가 있는 경우" 문제가 생깁니다.

Q: 왜 시트가 자동으로 플랫폼에 반영되나요?
A: 시트 안에 "Apps Script"라는 작은 프로그램이 돌아가고 있어서,
   셀을 수정하면 자동으로 우리 서버에 "이 문항이 바뀌었어요"라고 알립니다.
   마치 구글 문서가 자동 저장되는 것과 비슷합니다.

Q: ID는 왜 직접 수정하면 안 되나요?
A: ID는 각 문항의 "주민등록번호"와 같습니다. 바꾸면 학습 기록,
   오답 노트 등 연결된 데이터가 모두 끊어집니다.
```

### 5.5 변경 이력 탭

모든 데이터 시트에 `변경 이력` 탭을 추가하여 "누가 언제 뭘 바꿨는지" 자동 기록한다:

```javascript
function logChange(sheet, row, col, oldValue, newValue) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logSheet = ss.getSheetByName('변경 이력')
    || ss.insertSheet('변경 이력');

  // 헤더가 없으면 추가
  if (logSheet.getLastRow() === 0) {
    logSheet.getRange(1, 1, 1, 6).setValues([[
      '시각', '행', '열', '이전 값', '새 값', '수정자'
    ]]);
    logSheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  }

  var colName = sheet.getRange(4, col).getValue(); // 헤더에서 컬럼명
  var user = Session.getActiveUser().getEmail() || '알 수 없음';

  logSheet.appendRow([
    new Date(),
    row,
    colName,
    oldValue || '(비어있음)',
    newValue || '(비어있음)',
    user
  ]);
}
```

### 5.6 10분 온보딩 시나리오

자문위원이 처음 Google Drive를 열었을 때의 경험:

```
1분: Drive 폴더 목록을 본다
  → 번호 + 이모지로 순서가 명확. "01_문제 관리"부터 보면 되겠구나.

2분: "01_문제 관리" 폴더의 README를 연다
  → "이 폴더는 906개 퀴즈 문항을 관리합니다" — 한 줄로 이해.

3분: "문제 마스터 시트"를 연다
  → 첫 탭이 "📖 사용법". 자동으로 여기서 시작.

5분: 사용법 탭을 읽는다
  → 색상 범례, 컬럼 설명, "새 문제 추가하기" 안내를 읽음.

7분: "문제 전체" 탭으로 이동
  → 헤더 위 3줄의 안내 텍스트 확인. 셀 메모(노트)로 용어 확인.

10분: 아무 문항의 해설을 읽어본다
  → 데이터 구조를 이해. "아, 이렇게 정리되어 있구나."
```

---

## Phase 6: 강선생 학습 경로

### 6.1 학습 우선순위

교사가 수업 계획을 세우듯, "지금 꼭 필요한 것"부터 배운다.

#### 반드시 배울 것 (1주차)

| 기술 | 이유 | 학습 시간 |
|---|---|---|
| 데이터 유효성 검사 설정 | 드롭다운으로 입력 오류 방지 | 30분 |
| 조건부 서식 | 상태별 색상으로 한눈에 파악 | 30분 |
| 필터 / 필터 보기 | 과목별, 상태별로 문항 걸러보기 | 20분 |
| 셀 메모 (노트) 추가 | 다른 사람을 위한 설명 달기 | 10분 |
| 시트 보호 / 행 고정 | 가이드 행을 실수로 삭제하지 않도록 | 15분 |

#### 알면 좋은 것 (2~3주차)

| 기술 | 이유 | 학습 시간 |
|---|---|---|
| COUNTIF, COUNTA | 과목별 문항 수 자동 집계 | 30분 |
| VLOOKUP 또는 XLOOKUP | 과목 코드 → 한글 이름 변환 | 30분 |
| 피벗 테이블 | 과목별/유형별/난이도별 요약 | 45분 |
| 차트 만들기 | 데이터 시각화 (자문위원 프레젠테이션용) | 30분 |
| IMPORTRANGE | 다른 시트의 데이터 참조 | 20분 |

#### 에이전트에게 맡길 것 (배울 필요 없음)

| 기술 | 이유 |
|---|---|
| Apps Script 코딩 | 이미 템플릿이 있고, 수정은 에이전트가 함 |
| Google Sheets API 연동 | 서버 사이드 코딩 영역 |
| 복잡한 정규표현식 | 데이터 정제는 스크립트로 처리 |
| 매크로 녹화 / VBA | Google Sheets에서는 Apps Script가 대체 |

### 6.2 실습 과제 (강선생 데이터 활용)

#### 실습 1: 데이터 유효성 검사 (30분)

```
목표: B열(과목)에 드롭다운 목록 만들기

1. 빈 시트를 하나 만든다
2. A1에 "과목코드", B1에 "한글이름"을 적는다
3. A2~A12에 아래 값을 입력한다:
   introduction
   curriculum
   inclusive-education
   assessment
   behavior-support
   transition
   laws
   visual-impairment
   hearing-impairment
   physical-disability
   communication-disorder

4. B2~B12에 한글 이름을 입력한다:
   특수교육학 개론
   교육과정
   통합교육
   진단 및 평가
   행동지원
   전환교육
   관련 법령
   시각장애
   청각장애
   지체장애
   의사소통장애

5. 다른 시트에서 데이터 > 데이터 확인 > 목록(범위) 선택
6. A2:A12 범위를 참조하여 드롭다운 완성

★ 성공 기준: 과목 셀을 클릭하면 드롭다운이 나타나고,
             목록에 없는 값을 입력하면 경고가 뜬다.
```

#### 실습 2: 조건부 서식 (30분)

```
목표: 난이도에 따라 행 색상 자동 변경

1. 문제 마스터 시트에서 데이터 10줄 정도 입력한다
2. 전체 데이터 범위를 선택한다 (예: A5:O15)
3. 서식 > 조건부 서식 클릭
4. 다음 규칙 3개를 추가한다:

   규칙 1:
   - 맞춤 수식: =$E5=1
   - 서식: 배경색 #e6f4ea (연초록)

   규칙 2:
   - 맞춤 수식: =$E5=2
   - 서식: 배경색 #fff3e0 (연주황)

   규칙 3:
   - 맞춤 수식: =$E5=3
   - 서식: 배경색 #fce8e6 (연빨강)

★ 성공 기준: 난이도를 바꾸면 행 색상이 자동으로 변한다.
```

#### 실습 3: COUNTIF로 통계 만들기 (30분)

```
목표: 과목별 문항 수를 자동으로 세기

1. 새 탭 "통계"를 만든다
2. A1: "과목", B1: "문항 수"
3. A2~A12에 11개 과목 코드 입력
4. B2 셀에 다음 수식 입력:
   =COUNTIF('문제 전체'!B:B,A2)
5. B2 셀을 B3~B12까지 복사 (드래그)

6. B13에 합계:
   =SUM(B2:B12)

7. 옆에 차트 삽입:
   C2~C12 범위 선택 > 삽입 > 차트 > 원형 차트 선택

★ 성공 기준: 문제를 추가하면 통계 숫자와 차트가 자동으로 바뀐다.
```

#### 실습 4: 필터 보기 (20분)

```
목표: "행동지원" 과목만 보는 필터 만들기

1. "문제 전체" 탭에서 데이터 > 필터 보기 만들기
2. B열(과목) 헤더의 필터 아이콘 클릭
3. "behavior-support"만 체크
4. 이 필터 보기에 이름 지정: "행동지원만"

5. 두 번째 필터 보기 만들기:
   N열(상태) = "검수필요"
   이름: "검수 대기 문항"

★ 성공 기준: 필터 보기를 전환하면 해당 조건의 행만 표시된다.
            다른 사람이 볼 때는 전체가 보인다 (필터 보기는 개인용).
```

#### 실습 5: VLOOKUP으로 과목명 변환 (30분)

```
목표: 영어 과목 코드를 한글 이름으로 자동 변환

1. "문제 전체" 탭에 P열 "과목명(한글)" 추가
2. P5 셀에 다음 수식 입력:
   =VLOOKUP(B5,'과목코드'!A:B,2,FALSE)
   (실습 1에서 만든 과목코드 시트 참조)
3. P5를 아래로 복사

★ 성공 기준: B열에 "behavior-support"라고 되어 있으면
            P열에 자동으로 "행동지원"이 나타난다.

★ 보너스: IFERROR로 감싸서 매칭 안 되면 "분류 미정" 표시
   =IFERROR(VLOOKUP(B5,'과목코드'!A:B,2,FALSE),"분류 미정")
```

### 6.3 Google Sheets를 "컨트롤 패널"로 쓰기

최종 목표: Google Sheets 하나를 열면 플랫폼의 모든 것이 보이고, 여기서 대부분의 관리 작업을 할 수 있다.

#### 컨트롤 패널 개념도

```
┌──────────────────────────────────────────┐
│          문제 마스터 시트                  │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ 문제 편집 │  │ 통계 확인 │  │ 검수   │ │
│  │ (쓰기)   │  │ (읽기)   │  │ (체크) │ │
│  └──────────┘  └──────────┘  └────────┘ │
│                    │                      │
│                    ▼                      │
│         ┌──────────────────┐             │
│         │  커스텀 메뉴      │             │
│         │  ├ DB에서 가져오기 │             │
│         │  ├ 과목별 가져오기 │             │
│         │  ├ 대시보드 갱신  │             │
│         │  └ 설정           │             │
│         └──────────────────┘             │
└──────────────────────────────────────────┘
```

#### 일상 워크플로우

```
아침 (5분):
  1. 문제 마스터 시트 열기
  2. 메뉴 > 퀴즈 관리 > DB에서 가져오기 (최신 데이터 동기화)
  3. 필터 보기 > "검수 대기 문항" 선택
  4. AI가 생성한 문항 검수 (정답, 해설 확인)
  5. 상태를 "완성"으로 변경 → 자동 DB 반영

주간 (15분):
  1. 기출 분석 시트 확인 — 새로운 분석 결과가 있는지
  2. 운영 대시보드 확인 — 이번 주 활성 사용자 수
  3. 개발 진행 시트 갱신 — 완료된 기능 체크, 다음 주 계획

월간 (30분):
  1. 자문위원에게 시트 링크 공유
  2. "02_기출 분석 > 2027 예측" 탭에서 함께 토론
  3. 부족한 영역의 문제 추가 계획 수립
```

### 6.4 학습 리소스

| 주제 | 리소스 | 시간 |
|---|---|---|
| Google Sheets 기초 | Google 공식 도움말 "Sheets 시작하기" | 1시간 |
| 데이터 유효성 | Google 도움말 "데이터 확인 규칙 추가" | 20분 |
| 조건부 서식 | Google 도움말 "조건부 서식 규칙 사용" | 20분 |
| 피벗 테이블 | Google 도움말 "피벗 테이블 만들기 및 사용" | 30분 |
| VLOOKUP | Google 도움말 "VLOOKUP 함수" | 15분 |
| Apps Script 개요 | Google 도움말 "Apps Script 개요" | 30분 (읽기만) |

---

## 부록: 즉시 실행 체크리스트

강선생이 "오늘 당장" 할 수 있는 작업 순서:

### 오늘 (30분)

- [ ] Google Drive에 "특수교육 공부방" 폴더 생성
- [ ] 하위 폴더 6개 생성 (01_문제 관리 ~ 06_설정)
- [ ] "문제 마스터 시트" 스프레드시트 생성
- [ ] 행 1~4 가이드 텍스트 입력

### 이번 주 (2시간)

- [ ] 과목 드롭다운 설정 (실습 1)
- [ ] 조건부 서식 설정 (실습 2)
- [ ] Apps Script에 `docs/apps-script-template.js` 복사
- [ ] CONFIG에 실제 URL과 API 키 입력
- [ ] 첫 `syncFromDB()` 실행 → 906+ 문항 불러오기
- [ ] 테스트: 1건 수정 → 플랫폼 반영 확인

### 이번 달 (5시간)

- [ ] 기출 분석 시트 생성 + KICE 키워드 데이터 붙여넣기
- [ ] 운영 대시보드 시트 생성 + Apps Script 추가
- [ ] 개발 진행 시트 작성 (기존 기능 목록 정리)
- [ ] 자문위원 1명에게 공유 + 피드백 수집
- [ ] 피드백 반영하여 가이드 텍스트 보완

---

## 부록: Apps Script 전체 코드 (확장 버전)

기존 `docs/apps-script-template.js`를 확장한 완전한 버전. 위에서 설명한 모든 기능을 포함한다.

```javascript
// ============================================================
// 특수교육 공부방 — Google Sheets ↔ Supabase 양방향 동기화
// 버전: 2.0
// ============================================================

var CONFIG = {
  API_BASE_URL: '',          // 예: https://special-education-web.vercel.app
  ADMIN_API_KEY: '',         // Vercel 환경변수 ADMIN_API_KEY 값
  SHEET_NAME: '문제 전체',   // 메인 데이터 탭 이름
  HEADER_ROW: 4,             // 헤더가 있는 행 (1~3은 가이드)
  LOG_SHEET_NAME: '변경 이력',
};

// 컬럼 매핑 (시트 컬럼 순서)
var COLUMNS = [
  'id', 'subject', 'chapter', 'type', 'difficulty',
  'question', 'answer', 'explanation', 'options',
  'caseContext', 'wrongExplanations', 'source', 'tags',
];

// JSON 파싱이 필요한 컬럼
var JSON_COLUMNS = ['options', 'wrongExplanations', 'tags'];

// ── 커스텀 메뉴 ──────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('퀴즈 관리')
    .addItem('DB에서 가져오기 (전체)', 'syncFromDB')
    .addSeparator()
    .addItem('매일 자동 동기화 설정', 'setupDailySync')
    .addItem('자동 동기화 해제', 'removeSyncTriggers')
    .addToUi();
}

// ── 셀 수정 시 자동 동기화 ──────────────────────

function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  if (sheet.getName() !== CONFIG.SHEET_NAME) return;

  var row = e.range.getRow();
  if (row <= CONFIG.HEADER_ROW) return;

  // 변경 이력 기록
  logChange(sheet, row, e.range.getColumn(), e.oldValue, e.value);

  // 행 데이터 읽기
  var values = sheet.getRange(row, 1, 1, COLUMNS.length).getValues()[0];
  var question = parseRow(values);

  // 필수 필드 확인
  if (!question.subject || !question.question || !question.answer) {
    return; // 필수값 없으면 동기화 건너뜀
  }

  // ID가 없으면 새 문항 → 동기화 건너뜀 (수동 DB 저장 후 syncFromDB로 ID 받기)
  if (!question.id) return;

  // API 전송
  try {
    var response = UrlFetchApp.fetch(CONFIG.API_BASE_URL + '/api/admin/quiz/bulk', {
      method: 'POST',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + CONFIG.ADMIN_API_KEY },
      payload: JSON.stringify({ questions: [question] }),
      muteHttpExceptions: true,
    });

    if (response.getResponseCode() === 200) {
      SpreadsheetApp.getActiveSpreadsheet().toast('저장 완료', '동기화', 2);
    } else {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        '저장 실패: ' + response.getResponseCode(), '오류', 5
      );
    }
  } catch (err) {
    SpreadsheetApp.getActiveSpreadsheet().toast('네트워크 오류', '오류', 5);
  }
}

// ── DB → 시트 동기화 ──────────────────────────

function syncFromDB() {
  if (!CONFIG.API_BASE_URL || !CONFIG.ADMIN_API_KEY) {
    SpreadsheetApp.getUi().alert(
      'CONFIG의 API_BASE_URL과 ADMIN_API_KEY를 먼저 설정하세요.'
    );
    return;
  }

  var response = UrlFetchApp.fetch(
    CONFIG.API_BASE_URL + '/api/admin/quiz/export?format=json',
    {
      headers: { 'Authorization': 'Bearer ' + CONFIG.ADMIN_API_KEY },
      muteHttpExceptions: true,
    }
  );

  if (response.getResponseCode() !== 200) {
    SpreadsheetApp.getActiveSpreadsheet().toast('데이터 가져오기 실패', '오류', 5);
    return;
  }

  var parsed = JSON.parse(response.getContentText());
  var questions = parsed.questions || parsed;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME)
    || ss.insertSheet(CONFIG.SHEET_NAME);

  // 헤더 (행 4)
  sheet.getRange(CONFIG.HEADER_ROW, 1, 1, COLUMNS.length).setValues([COLUMNS]);
  sheet.getRange(CONFIG.HEADER_ROW, 1, 1, COLUMNS.length)
    .setBackground('#34a853')
    .setFontColor('#ffffff')
    .setFontWeight('bold');

  // 데이터
  var rows = questions.map(function(q) {
    return COLUMNS.map(function(col) {
      var val = q[col];
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    });
  });

  if (rows.length > 0) {
    var dataStartRow = CONFIG.HEADER_ROW + 1;
    sheet.getRange(dataStartRow, 1, rows.length, COLUMNS.length).setValues(rows);

    // 남은 행 삭제
    var lastRow = sheet.getLastRow();
    if (lastRow > dataStartRow + rows.length - 1) {
      sheet.deleteRows(
        dataStartRow + rows.length,
        lastRow - (dataStartRow + rows.length - 1)
      );
    }
  }

  // 행 고정 (가이드 + 헤더)
  sheet.setFrozenRows(CONFIG.HEADER_ROW);

  ss.toast(rows.length + '건 동기화 완료', '성공', 3);
}

// ── 유틸리티 ──────────────────────────────────

function parseRow(values) {
  var question = {};
  COLUMNS.forEach(function(col, i) {
    var val = values[i];
    if (JSON_COLUMNS.indexOf(col) !== -1 && typeof val === 'string' && val) {
      try { val = JSON.parse(val); } catch (_e) { /* keep as string */ }
    }
    if (val !== '' && val !== null) question[col] = val;
  });
  return question;
}

function logChange(sheet, row, col, oldValue, newValue) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logSheet = ss.getSheetByName(CONFIG.LOG_SHEET_NAME);
  if (!logSheet) {
    logSheet = ss.insertSheet(CONFIG.LOG_SHEET_NAME);
    logSheet.getRange(1, 1, 1, 6).setValues([[
      '시각', '행', '컬럼', '이전 값', '새 값', '수정자'
    ]]);
    logSheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  }

  var colName = '';
  try {
    colName = sheet.getRange(CONFIG.HEADER_ROW, col).getValue();
  } catch (_e) {
    colName = '열 ' + col;
  }

  var user = Session.getActiveUser().getEmail() || '알 수 없음';

  logSheet.appendRow([
    new Date(),
    row,
    colName,
    oldValue || '(비어있음)',
    newValue || '(비어있음)',
    user
  ]);
}

// ── 타이머 설정 ──────────────────────────────

function setupDailySync() {
  removeSyncTriggers();
  ScriptApp.newTrigger('syncFromDB')
    .timeBased()
    .atHour(6)
    .everyDays(1)
    .create();
  SpreadsheetApp.getActiveSpreadsheet().toast(
    '매일 오전 6시에 자동 동기화됩니다', '설정 완료', 3
  );
}

function removeSyncTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(t) {
    if (t.getHandlerFunction() === 'syncFromDB') {
      ScriptApp.deleteTrigger(t);
    }
  });
}
```

---

## 부록: 과목 코드 참조표

시트 작업 시 빠르게 참조할 수 있도록:

| 코드 (slug) | 한글 이름 | 시험 비중 | 우선순위 |
|---|---|---|---|
| `introduction` | 특수교육학 개론 | 15% | 높음 |
| `curriculum` | 교육과정 | 15% | 높음 |
| `behavior-support` | 행동지원 | 15% | 높음 |
| `assessment` | 진단 및 평가 | 12% | 높음 |
| `inclusive-education` | 통합교육 | 12% | 높음 |
| `transition` | 전환교육 | 8% | 중간 |
| `laws` | 관련 법령 | 8% | 중간 |
| `visual-impairment` | 시각장애 | 4% | 중간 |
| `hearing-impairment` | 청각장애 | 4% | 중간 |
| `physical-disability` | 지체장애 | 4% | 중간 |
| `communication-disorder` | 의사소통장애 | 3% | 중간 |

## 부록: 문제 유형 참조표

| 코드 (type) | 한글 | 설명 | 필수 추가 필드 |
|---|---|---|---|
| `multiple` | 객관식 | 4지선다형 | options (선택지 배열) |
| `ox` | OX | 참/거짓 판단 | 없음 (정답: O 또는 X) |
| `fill_in` | 빈칸채우기 | 핵심 용어 작성 | 없음 |
| `descriptive` | 서술형 | 문장으로 서술 | 없음 |
| `scenario_composite` | 시나리오 복합 | 사례 제시 + 소문항 | case_context, sub_questions |
