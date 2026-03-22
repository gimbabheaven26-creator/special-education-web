# 클루디2 지시서 — 데이터 검증 + concepts 매핑
**작성**: 스미스 프라임 | **날짜**: 2026-03-22 | **우선순위**: 높음
**CWD**: `~/` (홈 디렉토리)

> **Round 1 독립 작업** — 클루디1과 병렬 실행 가능. 강선생 대기 없음.

---

## 배경

- 2026-03-22 today-cloudy2.md 긴급 작업에서 일부 항목 완료 여부 불확실
- concepts 폴더명이 DB의 과목 제목과 불일치하는 3건이 미수정 상태
- contract.md에 반영되지 않은 필드 2개 목록화 필요

---

## 작업 경로

### Step 1 — 데이터 위반 현황 확인

```bash
cd ~/Projects/special-education-web
node scripts/validate-answer-we-2026-03-22.mjs
```

결과를 기록: 위반 건수, 유형별 분류.
0건이면 → Step 2로. 잔여 있으면 → 수정 후 재검증.

### Step 2 — T-11 display_id 완료 여부 확인

Supabase SQL Editor 또는 service key 스크립트로:
```sql
SELECT display_id FROM quiz_questions LIMIT 5;
```

- 컬럼 존재 + 가독성 있는 값(CD-0074 등) → T-11 완료로 기록
- 컬럼 없음 → today-cloudy2.md Step 4 실행

### Step 3 — concepts 과목 매핑 3건 수정

DB 과목 title과 /concepts 폴더명 불일치:

| DB subjects.title | concepts 폴더명 | 수정 방향 |
|-------------------|----------------|----------|
| 진단 및 평가 | 폴더명 확인 필요 | DB title 또는 폴더명 통일 |
| 교육과정 | 폴더명 확인 필요 | DB title 또는 폴더명 통일 |
| 행동지원 | 폴더명 확인 필요 | DB title 또는 폴더명 통일 |

실제 폴더명을 확인하여 매핑 수정. 폴더명 변경 시 nav-config.ts 영향 없도록 URL slug 기준으로 처리.

### Step 4 — contract.md 불일치 목록화

`docs/contract.md`를 읽고, 다음 두 항목이 없으면 변경 요청 문서 작성:
- `reviews` 테이블의 `admin_note` 컬럼
- `reviews` 테이블의 `image_urls` 컬럼

`docs/contract-change-request.md` 파일 작성 (직접 수정 금지):
```markdown
# contract.md 변경 요청
요청자: 클루디2 | 날짜: 2026-03-22

## 추가 요청
- reviews.admin_note: TEXT, nullable (이미 코드에서 사용 중)
- reviews.image_urls: TEXT[], nullable (이미 코드에서 사용 중)

## 근거
코드 review-db.ts에서 admin_note, image_urls 필드를 사용 중이나 contract.md에 미반영.
```

---

## 금지 사항

- `docs/contract.md` 직접 수정 금지 (스미스 프라임/카이란 승인 필요)
- nav-config.ts 수정 금지 (강선생 담당)
- 불확실한 데이터는 추측 수정 금지 — 목록 기록 후 보고

---

## Auto 명령어

```
/auto --mode bugfix 데이터 검증: validate-answer-we-2026-03-22.mjs 실행으로 위반 0건 확인, T-11 display_id 완료 여부 검증, concepts 과목 매핑 3건 불일치 수정, contract.md 불일치(admin_note/image_urls) 변경요청 문서 작성
```

---

## 완료 보고

```bash
# notion-pending.json 작성 후 커밋
{
  "title": "완료보고: 클루디2 데이터검증 2026-03-22",
  "tags": ["클루디2", "s-e-w", "데이터", "T-11"],
  "content": "위반 건수: N건\nT-11: ✅/❌\nconcepts 매핑: N건 수정\ncontract 변경요청: ✅"
}
```
