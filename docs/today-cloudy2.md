# 클루디2 긴급 지시서
**작성**: 스미스 프라임 | **날짜**: 2026-03-22 | **우선순위**: 긴급
**CWD**: `~/Projects/special-education-web`

> W2 지시서(cloudy-w2.md) 시작 전에 이 작업부터 완료할 것.

---

## 1. 배경

2026-03-19 클루디 세션에서 17건 데이터 수정을 시도했으나 Supabase에 미반영됐다.
그 사이 신규 데이터 삽입이 이루어져 위반이 130건으로 늘었다.
15건의 ox answer 오류는 지금 이 순간 베타 테스터에게 틀린 정답 판정을 내리고 있다.

T-03, T-11은 Phase 0 Foundation의 미완료 항목이다.

---

## 2. 현재 상태

- **데이터 위반**: ox answer 15건 / multiple answer 17건 / WE 비숫자 키 93건 / WE 정답 키 포함 5건 = 총 130건
- **T-03**: `src/lib/review-db.ts`의 `deleteReview(id)` 함수에 삭제 전 존재 확인 가드 없음
- **T-11**: `quiz_questions` 테이블에 `display_id` 컬럼 없음 (Phase 3 신고 시스템 의존)
- **검증 스크립트**: `scripts/validate-answer-we-2026-03-22.mjs` (data-validator가 생성)

---

## 3. 작업 경로

### Step 1 — ox answer 15건 수정 [즉시]

`contract.md`의 OX 규칙 확인 후:
- answer가 `"0"` 또는 `"1"`로 저장된 OX 문항을 `"O"` 또는 `"X"`로 UPDATE
- `"1"` → `"O"`, `"0"` → `"X"` 또는 실제 문항 내용 확인 후 판단
- 수정 후 `node scripts/validate-answer-we-2026-03-22.mjs` 실행하여 15건 제거 확인

### Step 2 — multiple answer 17건 + WE 98건 수정

```
multiple answer: answer가 텍스트인 것 → 해당 텍스트가 선지 중 몇 번째인지 확인 후 인덱스("0"~"3")로 변환
WE 비숫자 키: wrong_explanations의 키가 텍스트인 것 → 숫자 인덱스 키로 재구성
WE 정답 키: wrong_explanations에 answer와 같은 키가 있는 것 → 해당 키 제거
```

변환 전 반드시 해당 문항의 options 배열과 대조하여 매칭 확인.
불확실한 경우 해당 ID 목록만 기록 후 다음 Step으로 진행.

**완료 기준**: `node scripts/validate-answer-we-2026-03-22.mjs` → 위반 0건

### Step 3 — T-03: review-db.ts 삭제 가드 추가

`src/lib/review-db.ts`의 `deleteReview` 함수 수정:

```typescript
export async function deleteReview(id: number): Promise<boolean> {
  const supabase = await createClient();
  // 삭제 전 존재 확인
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('id', id)
    .single();
  if (!existing) return false; // 없는 항목 삭제 시도 → false
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);
  return !error;
}
```

**완료 기준**: 존재하지 않는 id(999999) 호출 시 false 반환 확인

### Step 4 — T-11: display_id 컬럼 추가

**Step 4-1**: 실제 id 패턴 확인
```sql
SELECT id FROM quiz_questions LIMIT 20;
-- 예: cd-q74, laws-q79, intro-q162 ...
```

**Step 4-2**: 컬럼 추가 SQL 작성 및 실행 (Supabase SQL Editor 또는 서비스 키 스크립트)
- 목표 형식: `CD-0074`, `LAWS-0079` 처럼 사람이 읽기 쉬운 형태
- GENERATED ALWAYS AS STORED 또는 별도 UPDATE 스크립트로 일괄 채우기

**Step 4-3**: TypeScript 타입 추가
```typescript
// src/types/quiz.ts 또는 quiz-question.ts
display_id?: string;
```

**Step 4-4**: contract.md에 display_id 컬럼 반영 → 스미스 프라임 승인 필요
DB 스키마 변경이므로 직접 수정하지 말고 변경 내용을 완료 보고에 기록할 것.

**완료 기준**: `SELECT display_id FROM quiz_questions LIMIT 5` → 가독성 있는 ID 반환

---

## 4. 금지 사항

- `docs/contract.md` 직접 수정 금지 (스미스 프라임 승인 사항)
- 강선생 담당 코드 수정 금지 (UI 컴포넌트, Next.js 라우트, nav-config.ts)
- 불확실한 데이터 수정은 추측으로 진행하지 말고 목록 기록 후 보고

---

## 5. 우선순위

1. **ox answer 15건** — 베타 테스터 정답 판정 오류 중. 즉시 수정.
2. **나머지 데이터 115건** — 높음
3. **T-03** — 중간 (단일 삭제만 있어 긴박하진 않으나 완료 필요)
4. **T-11** — 중간 (Phase 3 준비용)

---

## 6. 완료 보고

작업 완료 후 `~/.claude/notion-pending.json` 작성:
```json
{
  "title": "완료보고: 클루디2 긴급 2026-03-22",
  "type": "세션기록",
  "tags": ["클루디2", "s-e-w", "데이터", "T-03", "T-11"],
  "content": "## 완료\n- ox answer 15건: ✅/❌\n- 나머지 데이터: N건 수정\n- T-03 review-db 가드: ✅/❌\n- T-11 display_id: ✅/❌\n\n## data-validator 결과\n- 위반: N건 (유형별)\n\n## contract.md 변경 필요 사항\n- display_id 컬럼 추가 (스미스 프라임 승인 요청)\n\n## 미결\n- ..."
}
```
