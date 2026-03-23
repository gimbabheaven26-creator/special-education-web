# 클루디 실행 커맨드 — quiz_questions.chapter 마이그레이션 (2026-03-23)
작성: 스미스 프라임

> 세션 열면 아래 Step 순서대로 복붙 실행.
> 프로젝트 경로: `~/Projects/special-education-web`

---

## 배경

V(v-0322.night)가 `src/lib/db.ts`에서 chapters DB 테이블 대신 로컬 MDX 파일 기반으로 과목/챕터 구조를 읽도록 리팩토링 완료 (커밋 fa4a10a).

이에 따라 `quiz_questions.chapter` 컬럼 값도 기존 영어 slug(예: `standardized-tests`, `pbs`, `aba`)에서 MDX concept slug(예: `표준화검사와점수`, `긍정적행동지원`, `기본이론`)로 변경 필요.

SQL 스크립트: `docs/migration-chapters-to-concepts.sql` (58개 UPDATE)

---

## Step 1 — 백업 먼저

```
/auto --mode bugfix quiz_questions 백업 후 chapter 마이그레이션 실행. 프로젝트: ~/Projects/special-education-web. 작업: (1) Supabase Service Role Key(.env.local의 SUPABASE_SERVICE_ROLE_KEY)를 사용해 quiz_questions_backup 테이블 생성: CREATE TABLE IF NOT EXISTS quiz_questions_backup AS SELECT * FROM quiz_questions; (2) 백업 완료 확인: SELECT COUNT(*) FROM quiz_questions_backup; (3) docs/migration-chapters-to-concepts.sql 내용을 읽어서 Supabase REST API 또는 scripts/insert-with-service-key.mjs 패턴으로 실행. (4) 검증 쿼리로 영어 slug 잔존 여부 확인: SELECT DISTINCT subject, chapter FROM quiz_questions WHERE chapter ~ '^[a-z]' AND chapter NOT IN ('cbm', 'iep', 'udl') ORDER BY subject, chapter; → 결과 0건이면 성공. 완료 기준: 영어 slug 잔존 0건 (cbm, iep, udl 3개는 영어 유지가 맞음)
```

---

## 완료 후 검증

```bash
# 잔존 영어 slug 확인 (cbm/iep/udl 제외)
# Supabase 대시보드 SQL Editor 또는 REST API로 실행:
# SELECT DISTINCT subject, chapter FROM quiz_questions
# WHERE chapter ~ '^[a-z]'
# AND chapter NOT IN ('cbm', 'iep', 'udl')
# ORDER BY subject, chapter;
```

- [ ] 결과 0건 확인
- [ ] `quiz_questions_backup` 테이블 존재 확인 (롤백용)

---

## 참고: 롤백 방법

마이그레이션 실패 시:
```sql
-- 롤백: 백업에서 복원
UPDATE quiz_questions q
SET chapter = b.chapter
FROM quiz_questions_backup b
WHERE q.id = b.id;
```

---

## 주의사항

- `cbm`, `iep`, `udl` 3개는 영어 slug 그대로 유지 (MDX slug와 동일)
- SQL 스크립트는 `BEGIN; ... COMMIT;` 트랜잭션으로 감싸져 있어 중간 실패 시 자동 롤백됨
- data-validator 에이전트로 마이그레이션 후 정합성 검증 권장
