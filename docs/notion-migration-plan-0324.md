# 노션 워크스페이스 마이그레이션 4주 계획

작성: 스미스 프라임
날짜: 2026-03-24
기반: X 진단 (7가지 문제) + 카이란 결정 반영

---

## 카이란 결정 사항 (확정)

| # | 질문 | 결정 |
|---|------|------|
| 1 | 스프린트 로그 DB 위치 | **독립 최상위 + 허브 linked view embed** |
| 2 | 기존 KB 삭제 범위 | **"완료보고:" 패턴 전부 삭제** |
| 3 | 글로서리 내용 채우기 | **클루디가 NISE/KICE JSON batch insert + 카이란 이론서 추가** |
| 4 | 작업 관리 DB | **스프린트 로그로 통합 폐기** |

---

## 핵심 결론

`notion-pending-poster.sh`의 `type` 필드 무시 → DB 라우팅 분기로 수정.
이 한 줄이 "KB 스팸" 문제의 기술적 해결이다.

현재 4 DB → 6 DB:

| DB | 변경 | 목적 |
|----|------|------|
| 프로젝트 대시보드 | 유지 | 프로젝트 현황 |
| 작업 관리 | **폐기 → 스프린트 로그로 통합** | |
| 지식 베이스 | 유지 (재정의) | 리서치/회고/인사이트만 |
| 교육 데이터 관리 | 유지 | 과목별 퀴즈 현황 |
| **스프린트 로그** | **신설** | 에이전트 완료보고 전용 |
| **의사결정** | **신설** | 기술/전략 결정사항 |
| **글로서리** | **신설** | 특수교육 + 프로젝트 용어 |

---

## 1주차 (03/24-03/30): 신규 DB 3개 생성

### 스미스 프라임 실행

**DB 생성 공통 조건**
- 위치: 독립 최상위 (사이드바 직접 접근)
- 방법: curl로 Notion API 직접 호출 (MCP create-a-data-source 버그 우회)
- 생성 즉시 `reference_notion.md`에 DB ID 기록

**스프린트 로그 DB**
```
속성:
  제목: title
  에이전트: select (강선생/클루디/안선생/스미스/스미스-프라임)
  날짜: date
  프로젝트: select (special-education-web/edumind/gosari/인프라)
  유형: select (완료보고/진행중/블로커)
  커밋: rich_text
```

**의사결정 DB**
```
속성:
  제목: title
  날짜: date
  영역: select (아키텍처/전략/인프라/UX/데이터)
  결정자: select (카이란/스미스-프라임/강선생/클루디)
  상태: select (확정/보류/번복)
  태그: multi_select
```

**글로서리 DB**
```
속성:
  용어: title
  정의: rich_text
  출처: select (KICE/NISE/이론서/프로젝트)
  과목: select (지적장애/자폐/청각장애/시각장애/지체장애/학습장애/공통)
  태그: multi_select
```

**기존 작업 관리 DB**
- 1주차에 신규 페이지 생성 중단 (에이전트 rules 임시 업데이트)
- 3주차에 내용 이전 후 archive

### 카이란 직접 (5분)
- 3개 DB 아이콘 설정
- 카이란 허브에 linked view embed (DB 각각 드래그)

---

## 2주차 (03/31-04/06): 파이프라인 재배선

### `notion-pending-poster.sh` 라우팅 로직 추가

```python
# type → DB ID 라우팅 테이블
TYPE_TO_DB = {
    "세션기록": "[스프린트 로그 DB ID]",
    "완료보고": "[스프린트 로그 DB ID]",
    "진행중":   "[스프린트 로그 DB ID]",
    "의사결정": "[의사결정 DB ID]",
    "리서치":   "323d1034-8f3f-815b-816d-fb88391f31da",  # KB
    "회고":     "323d1034-8f3f-815b-816d-fb88391f31da",  # KB
    "용어":     "[글로서리 DB ID]",
}
db_id = TYPE_TO_DB.get(notion_type, "323d1034-8f3f-815b-816d-fb88391f31da")
```

### pending.json 스키마 확장

```json
{
  "title": "완료보고: 강선생1 — OX퀴즈 페이지 신설",
  "type": "세션기록",
  "agent": "강선생1",
  "project": "special-education-web",
  "tags": ["강선생", "특수교육웹"],
  "content": "..."
}
```

`agent`, `project` 필드 → 스프린트 로그 DB 속성에 자동 매핑

### `notion-todo-inject.sh` 소스 DB 교체

```
Before: 작업 관리 DB ID
After:  스프린트 로그 DB ID (유형=진행중 필터)
```

### `feedback_notion-workflow.md` 업데이트

에이전트별 라우팅 기준 표 추가:

| 에이전트 | type 값 | → DB |
|---------|---------|------|
| 강선생/클루디/안선생/스미스 | 세션기록/완료보고 | 스프린트 로그 |
| 스미스 프라임 | 의사결정 | 의사결정 DB |
| 스미스 프라임 | 세션기록 | 스프린트 로그 |
| 모든 에이전트 | 리서치/회고 | 지식 베이스 KB |
| 모든 에이전트 | 용어 | 글로서리 |

---

## 3주차 (04/07-04/13): 기존 데이터 정리 + 글로서리 batch insert

### 3-A. 기존 KB 정리

**삭제 대상** (카이란 결정: 전부 삭제):
- 제목이 "완료보고:" 패턴인 모든 페이지
- 제목이 "세션기록:" 패턴인 에이전트 로그

**절차**:
1. `post-search`로 KB 내 "완료보고:" 전체 조회 (페이지네이션 루프)
2. 목록 출력 (카이란 최종 확인)
3. `API-delete-a-block`으로 archive 처리
   - ⚠️ Notion archive = 30일 내 복구 가능 (완전 삭제 아님)
4. 작업 관리 DB도 동일하게 archive

**유지 기준** (삭제 제외):
- 유형이 리서치/회고/의사결정/계획인 페이지
- 카이란이 직접 작성한 페이지
- 피치 문서, 분석 보고서 등 전략 자료

### 3-B. 글로서리 batch insert (클루디 작업)

**원천 데이터**:
```
data/terminology/nise-dictionary.json  → 1,129 용어
data/terminology/kice-terms.json       → 1,417 키워드
data/concepts/[subject]/*.mdx         → 11과목 개념 설명
```

**클루디 스크립트 (`scripts/notion-glossary-insert.mjs`)**:
```javascript
// NISE 용어 → 출처=NISE, 과목 분류 자동화
// KICE 키워드 → 출처=KICE, 과목=기출 연도 태그
// 300ms 딜레이 루프 (Notion API rate limit)
// 중복 체크: post-search로 용어 기존 여부 확인 후 insert
```

**4주차 이후**: 카이란 이론서 내용 추가 → 클루디가 MDX와 교차 링크

### 3-C. 태그 통합 (55 → 20)

```
에이전트 (5): 강선생 / 클루디 / 안선생 / 스미스-프라임 / 스미스
프로젝트 (4): 특수교육웹 / edumind / gosari / 인프라
영역     (6): 아키텍처 / 데이터 / UX / 인증-보안 / 자동화 / 퀴즈-콘텐츠
유형     (3): 결정사항 / 리서치 / 회고
상태     (2): 진행중 / 완료
```

기존 페이지 태그 → `patch-page`로 일괄 교체 (300ms 딜레이)

---

## 4주차 (04/14-04/20): 운영 체계 확립

### Q2 태스크 등록

`project_q2-roadmap.md` 기반으로 스프린트 로그 DB에 TODO 30-50개 일괄 등록  
→ `notion-todo-inject.sh` 실제로 작동하기 시작

### 카이란 허브 최종 구조

```
카이란 허브
├─ 프로젝트 대시보드 (gallery view)
├─ 스프린트 로그 (table, 최근 10개)
├─ 의사결정 (table, 확정 필터)
├─ 지식 베이스 (table, 리서치/회고만)
├─ 교육 데이터 관리 (기존)
└─ 글로서리 (table view)
```

### 최종 검증 (7개)

| # | 항목 |
|---|------|
| 1 | 에이전트 완료보고 → 스프린트 로그 DB |
| 2 | KB에 신규 완료보고 없음 |
| 3 | 의사결정 type → 의사결정 DB |
| 4 | 태그 20개 이하 |
| 5 | 스프린트 로그 DB에 TODO 30개 이상 |
| 6 | 기존 KB 페이지 수 40% 이상 감소 |
| 7 | reference_notion.md에 6개 DB ID 전부 기록 |

---

## 관련 파일

| 파일 | 변경 내용 |
|------|---------|
| `~/.claude/hooks/notion-pending-poster.sh` | type → DB 라우팅 분기 추가 |
| `~/.claude/hooks/notion-todo-inject.sh` | 소스 DB ID 교체 (작업관리→스프린트로그) |
| `~/.claude/projects/-Users-gihoonkim/memory/reference_notion.md` | 신규 3개 DB ID 등록 |
| `~/.claude/projects/-Users-gihoonkim/memory/feedback_notion-workflow.md` | 에이전트 라우팅 규칙 업데이트 |
| `scripts/notion-glossary-insert.mjs` | 신규 — 글로서리 batch insert (클루디) |
