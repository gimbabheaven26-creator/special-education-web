# 클루디 지시서 — 데이터 W2

**날짜**: 2026-03-24 시작 (W1 완료 후)
**에이전트**: 클루디1 (신규 과목 + 예측 문항) / 클루디2 (품질 감사 + 수정)
**CWD**: `~/` (홈)

---

## 클루디1 W2 명령

```
/orchestrate 다음 작업을 순서대로 완료:

[Day1 — 병렬 4개]
Agent1: SELECT DISTINCT subject_id FROM quiz_questions → 아직 문항 없는 과목 확인.
  평가(as) 과목 신규 문항 35개 생성 (as-q001~ 부터. DB에 이미 있으면 max+1 이어서).
  OX/기입/서술형 혼합, KICE 기출 동형 + 2027 예측. scripts/insert-with-service-key.mjs 사용.
Agent2: 교육과정(ec 또는 cur) 과목 신규 문항 35개 생성. prefix는 DB 확인 후 결정.
  교육과정 재구성, IEP, 보편적 학습설계(UDL) 중심.
Agent3: 방향A — data/kice-기출/ 2024~2026 전공A+B 파일 분석
  → 최근 3년 미출제 토픽 10개 + 연속 출제 토픽 10개 목록화
  → docs/kice-keyword-weight-analysis.md 업데이트 (2027 예측 섹션)
Agent4: 방향C — 장특법 2024~2025 시행규칙 변경사항 웹 검색
  → laws 과목 기존 문항 중 개정 사항 반영 필요 문항 목록화
  → 수정 필요 문항 UPDATE (최대 10건)

[Day2 — 병렬 4개]
Agent1: as(평가) MDX 개념 설명 5개 — data/concepts/as/ 생성
  진단평가 / 형성평가 / 역동적 평가 / CBM / 포트폴리오 평가
Agent2: ec/cur(교육과정) MDX 개념 설명 5개 — data/concepts/ec/ 또는 cur/
  IEP / 교육과정 재구성 / UDL / 전환교육과정 / 개별화교수
Agent3: 방향A 2027 예측 문항 20선 생성
  Day1 Agent3가 도출한 미출제 토픽 기반. OX 10개 + 기입 6개 + 서술형 4개.
  scripts/insert-with-service-key.mjs 사용. subject_id는 해당 과목으로.
Agent4: data-validator 실행 → PASS. 실패 시 오류 수정 후 재실행.

금지: vi/hi/bs/trans 문항 수정 (클루디2 담당)
사용 스크립트: scripts/insert-with-service-key.mjs
```

---

## 클루디2 W2 명령

```
/orchestrate 다음 작업을 순서대로 완료:

[Day1 — 병렬 2개]
Agent1: 방향B 품질 감사 — SQL 5종 전체 실행
  (1) SELECT id, explanation FROM quiz_questions WHERE length(explanation) < 30
  (2) SELECT id FROM quiz_questions WHERE type='multiple' AND wrong_explanations IS NULL
  (3) SELECT id FROM quiz_questions WHERE tags = '[]' OR tags IS NULL
  (4) SELECT question, COUNT(*) FROM quiz_questions GROUP BY question HAVING COUNT(*) > 1
  (5) 구형 용어 문항 — data/terminology/nise-dictionary.json 교차 확인
  → 감사 결과 docs/data-audit-w2.md 에 기록

Agent2: vi(시각) + hi(청각) W1 삽입 데이터 정합성 재확인
  — 오답 보기 논리 오류, 난이도 태그 불일치, answer 필드 형식 오류
  — 수정 필요 문항 UPDATE 실행

[Day2 — 순차]
Step3: Agent1 감사 결과 기반 자동 수정
  — explanation < 30자: 50자 이상으로 UPDATE
  — wrong_explanations 누락 multiple: 오답 해설 3개 추가
  — tags 미설정: subject_id 기반 자동 태그 배정
  — 중복 문항: 품질 낮은 쪽 soft-delete (is_active=false)
  → 목표: 감사 발견 결함의 80% 이상 수정
Step4: bs(행동) + trans(전환) 고품질 추가 문항 20개 각 생성
  (W1 삽입 이후 범위 이어서. max ID 확인 후 시작)
Step5: data-validator 실행 → PASS. 실패 시 즉시 수정 후 재실행.

금지: as/ec/cur 문항 수정 (클루디1 담당)
사용 스크립트: scripts/insert-with-service-key.mjs
참고: data/terminology/nise-dictionary.json
```

---

## 공통 완료 기준

- data-validator PASS
- `npm run build` — 클루디가 직접 실행 불필요 (강선생 담당). 단 DB 스키마 변경 시 contract.md 수정 → 스미스 프라임에게 요청.

## 완료 보고

```json
// ~/.claude/notion-pending.json
{
  "title": "완료보고: 클루디1 W2 2026-03-24",
  "type": "세션기록",
  "tags": ["클루디1", "s-e-w", "데이터"],
  "content": "## 완료된 것\n- as 문항 35개 ✅\n- ec 문항 35개 ✅\n- 2027 예측 20선 ✅\n\n## 미결\n- ..."
}
```
