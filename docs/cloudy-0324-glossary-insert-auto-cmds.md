# 클루디 지시서 — 노션 글로서리 DB 배치 삽입 (Day 3–4)

날짜: 2026-03-24 작성 (실행: 2026-03-27~28)
작성: 스미스 프라임
대상: 클루디 (~/Projects/special-education-web)

---

## 배경

스미스 프라임이 2026-03-24 Day 1 작업으로:
- **스프린트 로그 DB** 생성 완료 (`32dd1034-8f3f-8103-ae65-d4fda63c4bae`)
- **특수교육 글로서리 DB** 생성 완료 (`32dd1034-8f3f-819b-b6f5-e0734d89553b`)
- `.env.local`에 `NOTION_GLOSSARY_DB_ID` 추가 완료

클루디가 해야 할 것: **글로서리 DB에 용어 데이터 배치 삽입**
- NISE 용어사전 1,129개 (우선)
- KICE-only 키워드 (빈도 3 이상, NISE에 없는 것, 약 250~350개)

---

## 현재 상태

### 데이터 파일 위치
- NISE: `data/terminology/nise-dictionary.json` — 1,129 items
  - 필드: `doc_id`, `term_ko`, `term_hanja`, `term_en`, `definition`
  - 정의 최대 길이: 2003자 → 500자로 축약해서 삽입
- KICE: `data/terminology/kice-terms.json`
  - 필드: `keywords_by_frequency` 딕셔너리 (키워드: 빈도)
  - 총 1,417 unique keywords
- 과목 역방향 인덱스: `data/terminology/by-subject/` — 11개 파일
  - 파일 목록: introduction.json, behavior-support.json, visual-impairment.json,
    hearing-impairment.json, physical-disability.json, communication-disorder.json,
    curriculum.json, transition.json, inclusive-education.json, assessment.json, laws.json
  - 각 파일: `{"terms": [{"term_ko": "...", ...}]}`

### 환경변수 (.env.local)
- `NOTION_API_KEY` — 있음
- `NOTION_GLOSSARY_DB_ID=32dd1034-8f3f-819b-b6f5-e0734d89553b` — 있음

### 글로서리 DB 스키마 (노션에 이미 생성됨)
| 속성명 | 타입 |
|--------|------|
| 용어 | title |
| 한자 | rich_text |
| 영문 | rich_text |
| 출처 | select: NISE / KICE / 이론서 |
| 과목 | multi_select: 11개 과목 |
| KICE빈도 | number |
| 중요도 | select: 고 / 중 / 저 |
| 정의요약 | rich_text (500자 이내) |
| 날짜 | date |

---

## Step 1 — notion-glossary-insert.mjs 작성

파일 경로: `scripts/notion-glossary-insert.mjs`

```
/auto --mode feature notion-glossary-insert.mjs 작성 — NISE + KICE 노션 글로서리 DB 배치 삽입

[배경]
특수교육 글로서리 DB(32dd1034-8f3f-819b-b6f5-e0734d89553b)에 NISE 1129개 + KICE-only 키워드 배치 삽입.
Notion rate limit 방어를 위해 요청 간 350ms 딜레이.

[구현 대상: scripts/notion-glossary-insert.mjs]

CLI 인터페이스:
  node scripts/notion-glossary-insert.mjs --source nise --start 0 --end 500
  node scripts/notion-glossary-insert.mjs --source nise --start 500 --end 1129
  node scripts/notion-glossary-insert.mjs --source kice --freq-min 3
  node scripts/notion-glossary-insert.mjs --dry-run --source nise --start 0 --end 5

환경변수 읽기:
  - NOTION_API_KEY: process.env.NOTION_API_KEY (NOT from .env.local 파싱 — 반드시 process.env 사용)
  - NOTION_GLOSSARY_DB_ID: process.env.NOTION_GLOSSARY_DB_ID
  - 없으면 throw Error

데이터 로드:
  - NISE: JSON.parse(readFileSync('data/terminology/nise-dictionary.json', 'utf8'))
  - KICE 빈도 맵: JSON.parse(readFileSync('data/terminology/kice-terms.json', 'utf8')).keywords_by_frequency
  - 과목 인덱스: data/terminology/by-subject/*.json → term_ko → subject 역방향 Map 구축
    파일명 → 과목명 매핑:
      introduction.json → 특수교육학개론
      behavior-support.json → 행동지원
      visual-impairment.json → 시각장애
      hearing-impairment.json → 청각장애
      physical-disability.json → 지체장애
      communication-disorder.json → 의사소통장애
      curriculum.json → 교육과정
      transition.json → 전환교육
      inclusive-education.json → 통합교육
      assessment.json → 진단평가
      laws.json → 법령

중요도 분류:
  KICE빈도 >= 10 → "고", >= 3 → "중", 그 외 → "저"

정의 축약 (500자):
  definition.slice(0, 500) + (초과 시 "...")

Notion 페이지 생성 (각 항목마다):
  POST https://api.notion.com/v1/pages
  parent.database_id = process.env.NOTION_GLOSSARY_DB_ID
  properties:
    용어 (title): term_ko
    한자 (rich_text): term_hanja (없으면 skip)
    영문 (rich_text): term_en (없으면 skip)
    출처 (select): "NISE" 또는 "KICE"
    과목 (multi_select): 역방향 인덱스에서 찾은 과목들 (없으면 skip)
    KICE빈도 (number): kiceFreqMap[term_ko] || 0
    중요도 (select): "고"/"중"/"저"
    정의요약 (rich_text): 축약된 정의 (없으면 skip)
    날짜 (date): 오늘 날짜 (ISO 형식)

딜레이: 350ms (rate limit 방어)
진행 로그: 50개마다 console.log (진행: N/total OK:n FAIL:n)

KICE-only 로직 (--source kice):
  1. NISE term_ko Set 구축
  2. kiceFreqMap에서 NISE에 없는 키워드만 필터 (freq >= FREQ_MIN)
  3. 빈도 내림차순 정렬
  4. 정의요약 없이 삽입 (KICE 키워드는 정의 미보유)

[검증 항목]
- --dry-run 5건: console.log에 용어/출처/KICE빈도/중요도 출력 확인
- 실제 5건 삽입: 노션 글로서리 DB에서 직접 확인
- FAIL 0건

[커밋 메시지]
feat(scripts): notion-glossary-insert.mjs — NISE+KICE 노션 글로서리 배치 삽입 스크립트
```

---

## Step 2 — .env.local에 env var 확인

스크립트 실행 전 반드시 확인:
```bash
cd ~/Projects/special-education-web
grep "NOTION_API_KEY\|NOTION_GLOSSARY_DB_ID" .env.local
```

두 키가 모두 있어야 한다. 없으면 추가:
```
NOTION_API_KEY=ntn_...
NOTION_GLOSSARY_DB_ID=32dd1034-8f3f-819b-b6f5-e0734d89553b
```

스크립트는 `dotenv`를 사용해 .env.local을 자동 로드하거나,
실행 시 env var를 직접 전달:
```bash
# 방법 1: dotenv 사용 (스크립트에 구현된 경우)
node scripts/notion-glossary-insert.mjs --source nise --start 0 --end 5 --dry-run

# 방법 2: env var 직접 전달
NOTION_API_KEY=$(grep NOTION_API_KEY .env.local | cut -d= -f2) \
NOTION_GLOSSARY_DB_ID=$(grep NOTION_GLOSSARY_DB_ID .env.local | cut -d= -f2) \
node scripts/notion-glossary-insert.mjs --source nise --start 0 --end 5 --dry-run
```

---

## Step 3 — dry-run 검증

```bash
cd ~/Projects/special-education-web

# NISE 첫 5건 dry-run
NOTION_API_KEY=$(grep NOTION_API_KEY .env.local | cut -d= -f2) \
NOTION_GLOSSARY_DB_ID=$(grep NOTION_GLOSSARY_DB_ID .env.local | cut -d= -f2) \
node scripts/notion-glossary-insert.mjs --source nise --start 0 --end 5 --dry-run

# KICE-only dry-run (빈도 10 이상)
NOTION_API_KEY=$(grep NOTION_API_KEY .env.local | cut -d= -f2) \
NOTION_GLOSSARY_DB_ID=$(grep NOTION_GLOSSARY_DB_ID .env.local | cut -d= -f2) \
node scripts/notion-glossary-insert.mjs --source kice --freq-min 10 --dry-run
```

기대 출력 예시:
```
[DRY] Would insert: 가계 연구 | source: NISE | freq: 0 | importance: 저
[DRY] Would insert: 가족 중심 서비스 | source: NISE | freq: 0 | importance: 저
...
```

---

## Step 4 — 실제 배치 삽입

dry-run 확인 후 실제 삽입 실행:

```bash
cd ~/Projects/special-education-web

# 전반부 (0~564)
NOTION_API_KEY=$(grep NOTION_API_KEY .env.local | cut -d= -f2) \
NOTION_GLOSSARY_DB_ID=$(grep NOTION_GLOSSARY_DB_ID .env.local | cut -d= -f2) \
node scripts/notion-glossary-insert.mjs --source nise --start 0 --end 564

# 후반부 (564~1129) — Day 4
NOTION_API_KEY=$(grep NOTION_API_KEY .env.local | cut -d= -f2) \
NOTION_GLOSSARY_DB_ID=$(grep NOTION_GLOSSARY_DB_ID .env.local | cut -d= -f2) \
node scripts/notion-glossary-insert.mjs --source nise --start 564 --end 1129

# KICE-only (빈도 3 이상) — Day 4
NOTION_API_KEY=$(grep NOTION_API_KEY .env.local | cut -d= -f2) \
NOTION_GLOSSARY_DB_ID=$(grep NOTION_GLOSSARY_DB_ID .env.local | cut -d= -f2) \
node scripts/notion-glossary-insert.mjs --source kice --freq-min 3
```

---

## Step 5 — 완료 보고

삽입 완료 후 pending.json 작성 → 커밋:
```json
{
  "destination": "sprint",
  "title": "클루디: 노션 글로서리 배치 삽입 완료 (NISE 1129 + KICE-only N건)",
  "agent": "클루디",
  "status": "완료",
  "tags": ["클루디", "노션인프라", "데이터"],
  "content": "## 완료 사항\n\n- NISE 용어사전 1129개 삽입 (OK: N FAIL: N)\n- KICE-only 빈도3+ N개 삽입\n- notion-glossary-insert.mjs 커밋: [해시]\n\n## 글로서리 DB\n\nhttps://www.notion.so/32dd10348f3f819bb6f5e0734d89553b"
}
```

---

## 금지사항

- NOTION_API_KEY, NOTION_GLOSSARY_DB_ID 하드코딩 금지
- rate limit 무시하고 딜레이 없이 실행 금지 (429 에러 폭발)
- nise-dictionary.json 원본 수정 금지 (읽기 전용)
- 글로서리 DB ID 직접 코드에 박지 말 것 — 항상 process.env.NOTION_GLOSSARY_DB_ID
