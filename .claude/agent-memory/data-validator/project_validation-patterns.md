---
name: validation-patterns
description: 반복적으로 발견되는 데이터 위반 패턴 — 새 배치 검증 시 우선 확인
type: project
---

## 반복 위반 패턴 (2026-03-22 업데이트)

### 최근 검증 이력

| 날짜 | 배치 | 건수 | 결과 |
|------|------|------|------|
| 2026-03-22 | cd-q129~148, inc-q128~147 (40건) | 0건 위반 | CLEAN — V1~V9 전항목 PASS. 양 과목 D1:4 D2:12 D3:4 균형 분포. |
| 2026-03-22 | hi-q147~166, vi-q169~188 (40건) | 1건 위반→1건 자동 수정 | PASS — vi-q177 WE key '2' 누락(추가) + R5 금지문구 치환 후 전항목 PASS |
| 2026-03-22 | hi-q127~146, vi-q149~168 (40건) + 전체 DB 3254건 | 대상 배치 0건/전체 722건→613건 | 대상 배치 PASS. 전체 자동 수정 109건(V2×10, V3×32, V4×14, V5×25, V9×28). 잔존 613건(V6×93, V7×520) — 수동 재작성 필요 |
| 2026-03-22 | bs-q241~260, trans-q176~195, asmnt-q280~299 (60건) | 0건 위반 | CLEAN — V1~V9+금지문구 전항목 PASS. 3과목 모두 D1:4 D2:12 D3:4 균형 분포. |
| 2026-03-21 | bs-q221~240, intro-q221~240, pd-q95~114 (60건) | 17건 위반 → 17건 자동 수정 | CLEAN — V2 3건(fba→pbs), V5 14건(options jsonb→text[]) 수정 후 전항목 PASS |
| 2026-03-21 | cd-q109~128, inc-q108~127, cur-q196~215 (60건) | 0건 위반 | CLEAN — V1~V8 전항목 통과 |
| 2026-03-21 | bs-q201~220, trans-q156~175, vi-q129~148, hi-q107~126 (신규 80건) + 전체 DB 3034건 | 730건 위반 → 127건 자동 수정, 잔존 45건(R5 수동), 11건(R4 수동) | HAS_ISSUES→PARTIAL_FIX — R1 16건+R2 76건+R3 15건 수정완료. 신규 배치 자체 CLEAN. R5 45건·R4 11건 수동 재작성 필요 |
| 2026-03-21 | asmnt-q245~q279 (35건), cur-q161~q195 (35건), kice-2027-v2-* (20건) | 1건 위반→수정 | CLEAN — asmnt-q249 WE 금지 문구('옳은 설명이다') 3건 → '이 선지는 옳은 내용이어서 정답이 아니다.' 패턴으로 UPDATE 완료 |
| 2026-03-19 | bs-q170~177, trans-q120~131, cur-q151~160, intro-q189~195 (37건) | 0건 위반 | CLEAN — RI/ID/VC/완전성 전항목 PASS |
| 2026-03-19 | 전체 DB 풀 검증 (2458 퀴즈) — answer/WE 집중 4항목 검증 | 0건 위반 | CLEAN — OX/multiple answer + WE키 + WE정답키 전항목 PASS |
| 2026-03-19 | 전체 DB 풀 검증 (2438 퀴즈) — answer/WE 집중 검증 | 95건 위반 | HAS_ISSUES — answer 31건(multiple 16+OX 15), WE키≥4 59건, WE정답키 5건 |
| 2026-03-19 | laws-batch4.json (laws-q189~208) + assessment-batch3.json (asmnt-q81~100) | 40건 | CLEAN — 전항목 PASS |
| 2026-03-19 | 4에이전트 병렬 생성 갭 보충 문항 (agent1~4, intro-q135~172, bs-q144~149, cd-q70~76, vi-q91~102, hi-q75~80, cur-q129~138, trans-q114~119, pd-q70~74) | 90건 | CLEAN — 전항목 PASS |
| 2026-03-19 | 14건 일괄 수정 후 재검증 (cd-q10/16/22/29/33/37, hi-q37, intro-q99/102, laws-q58/79, pd-q12/21, vi-q4) | 14건 | CLEAN — 전항목 PASS |
| 2026-03-19 | 오늘 신규 삽입 문항 63건 + 기존 위반 14건 검증 | 14건 위반 | HAS_ISSUES — answer 5건, WE 키 8건, WE 정답 키 1건 |
| 2026-03-19 | 전체 DB 풀 검증 (1000 퀴즈, 316 워크시트) | 906건 위반 | HAS_ISSUES — RI 33건, ID 856건, VC 17건, 완전성 0건 |
| 2026-03-18 | gap-fill-batch2-all.json (intro-q129~134, cur-q126~128, trans-q111~113, hi-q72~74, vi-q82~90, 24건) | 24건 | CLEAN — 전항목 통과 |
| 2026-03-18 | intro-q114~128, hi-q69~71, inc-q85~87, bs-q117~119, trans-q102~110, cur-q123~125, asmnt-q78~80 (39건) | 39건 | CLEAN — 전항목 통과 |
| 2026-03-18 | 21건 수정 후 재검증 + 전체 multiple 재스캔 (338건) | 32건 잔존 | HAS_ISSUES — 21건 PASS, 전체 32건 미수정 잔존 |
| 2026-03-18 | 전체 DB 풀 검증 (2061 퀴즈) | — | HAS_ISSUES (82건 위반) |
| 2026-03-18 | cd-q63 wrong_explanations 수정 + 685건 tags 태깅 | — | PASS |
| 2026-03-18 | intro-q95~q113 최종 재검증 | 19건 | CLEAN (패턴 6 수정 완료 후 전항목 통과) |
| 2026-03-18 | gap-fill-intro-19.json (intro-q95~113) | 19건 | FAIL (wrong_explanations 키='4', 4문항 8건) |
| 2026-03-18 | gap-fill-laws-30c.json (laws-q159~188) 재검증 | 30건 | CLEAN (answer/wrong_exp 수정 완료 후 통과) |
| 2026-03-18 | gap-fill-laws-30c.json (laws-q159~188) | 30건 | FAIL (answer/wrong_exp 포맷, 17문항 34건) |
| 2026-03-18 | kice-nise-2025-q3.json (cur-q112~122, bs-q110~116, trans-q90~101, intro-q89~94) | 36건 | CLEAN |
| 2026-03-18 | gap-fill-laws-30b.json (laws-q129~q158) | 30건 | CLEAN |
| 2026-03-18 | gap-fill-laws-30.json (laws-q99~q128) | 30건 | CLEAN |
| 2026-03-17 | gap-fill-others.json 등 | 다수 | FAIL(answer/wrong_exp 포맷) |

### 패턴 1: gap-fill-others.json 스타일 answer 포맷 오류
- **문제**: multiple 타입 문항에서 answer 값으로 "0"~"3" 숫자 인덱스 대신 선택지 원문 텍스트를 그대로 기입
- **영향 파일**: gap-fill-others.json (7건 전체 multiple 문항)
- **영향 항목**: cd-q68, bs-q102, trans-q78, hi-q68, vi-q77, pd-q68, vi-q80
- **contract.md 규칙**: answer (multiple): "0" ~ "3" 문자열
- **조치 필요**: answer를 숫자 인덱스("0"~"3")로 수정 후 재삽입

### 패턴 2: gap-fill-others.json wrong_explanations 비숫자 키
- **문제**: wrong_explanations 키가 "0","1","2","3" 대신 선택지 원문 텍스트 사용
- **영향 항목**: cd-q68, bs-q102, trans-q78, hi-q68, vi-q77, pd-q68, vi-q80
- **contract.md 규칙**: wrong_explanations jsonb {"0": "...", "2": "..."} — 숫자 인덱스 키
- **조치 필요**: answer 수정과 동시에 wrong_explanations 키도 정수형 인덱스로 수정

### 패턴 3: 존재하지 않는 chapter 참조
- **문제**: quiz_questions.chapter 가 chapters 테이블에 없는 slug를 사용
- **영향 항목**: kice-2027-predicted.json | bs-q106 | chapter=fba (behavior-support에 fba 챕터 미존재)
- **기존 해결책**: chapters 테이블에 해당 챕터를 추가하거나, 기존 챕터 slug로 수정

### 패턴 4: kice-2027-predicted.json 난이도 편향
- **문제**: 20문항 전체가 difficulty=3 (심화) — 100% 단일 난이도
- **contract.md 규칙**: 분포 이상 경고 (100% 단일 레벨 지양)
- **비고**: 예측 문항 특성상 의도적일 수 있으나, 기초/중급 예측 문항 추가 권장

### 패턴 6: wrong_explanations 키='4' (5지선다 혼용)
- **문제**: multiple 타입 options가 4개(0~3 인덱스)임에도 wrong_explanations에 키='4'가 들어가는 경우
- **영향 파일**: gap-fill-intro-19.json
- **영향 항목**: intro-q99, intro-q102, intro-q105, intro-q108 (4문항)
- **원인**: 문제 본문 안에 5번째 오답 설명이 실수로 포함됨 (wrong_explanations에 키 "4" 기입)
- **contract.md 규칙**: wrong_explanations jsonb {"0": "...", "2": "..."} — 키는 options 인덱스 "0"~"3"만 허용
- **조치 필요**: 해당 4문항의 wrong_explanations에서 키="4" 항목 제거 후 DB UPDATE
- **확인**: intro-q99 wrong_exp 예시 → {"1":"...","2":"...","3":"...","4":"..."} — "4" 제거 필요

### 패턴 5: DB 삽입 확인 후 검증 의뢰
- **발생**: 삽입 완료 후 검증 의뢰 — CONFLICT_WITH_DB가 전 항목에서 발생 = 정상
- **해석**: 96개 전체 이미 삽입됨. CONFLICT는 오류가 아닌 삽입 성공 확인.

### 패턴 11: R5 분류 B — '옳지 않은 것' 유형 아닌 문항에서 금지 문구 (2026-03-21 잔존 15건)
- **문제**: "옳은 설명이다", "정확하다", "맞다" 등이 WE 본문의 사실 서술 일부로 사용됨
- **영향 항목**: asmnt-q72, asmnt-q216, trans-q89, intro-q150, cur-q129, hi-q29, intro-q102, bs-q158, vi-q72, asmnt-q209, intro-q204, asmnt-q229, intro-q108, intro-q105, intro-q99
- **수정 방법**: WE 텍스트를 중립적 사실 서술로 재작성 (금지 문구 제거) — 클루디 담당
- **우선순위**: 중간 (UI 오동작은 아님, 퀄리티 문제)

### 패턴 14: V7 잔존 520건 (2026-03-22 현황)
- **문제**: "옳지 않은 것" 유형 문항의 wrong_explanations 오답 선지에 "이 선지는 옳은 내용이어서 정답이 아니다" 패턴 누락
- **과목별**: behavior-support(99), laws(104), introduction(69), inclusive-education(30), transition(36), curriculum(51), hearing-impairment(27), visual-impairment(38), assessment(36), communication-disorder(18), physical-disability(12)
- **성격**: V7은 대규모 콘텐츠 재작성 필요. 자동 수정 불가. 클루디가 배치별로 처리 권장.
- **V6 93건 연관**: V7 미충족 문항 중 금지 문구(옳은 설명이다/맞다/정확하다)가 WE에 남아있는 경우. V7 패턴 접두어 추가 시 동시 해결.

### 패턴 12: R5 분류 A — '이 선지는...' 접두어 추가 후 본문에 금지 문구 잔존 (2026-03-21 잔존 30건)
- **문제**: R5 자동 수정 시 "이 선지는 옳은 내용이어서 정답이 아니다. " 접두어를 추가했으나, 원본 문장에 "옳은 설명이다", "맞다" 등이 포함되어 재검증에서 다시 검출됨
- **성격**: R6 패턴(접두어)은 충족, R5 금지 문구는 원본 설명의 의미론적 일부로 제거 시 내용 훼손 가능성
- **해결 방향**: "이 선지는 옳은 내용이어서 정답이 아니다. [내용 설명]" — 내용 설명 부분에서 금지 문구를 중립 표현으로 교체
- **예**: "...이므로 옳은 설명이다." → "...에 해당한다." / "...이 맞다." → "...이다."
- **우선순위**: 중간 (클루디 다음 데이터 작업 시 일괄 처리 권장)

### 패턴 7: answer/wrong_explanations 포맷 오류 — 2026-03-21 수정 완료 (기존 잔존 해소)
- **수정 완료 (2026-03-21)**: R1 16건(텍스트→인덱스 변환), R2 76건(키 범위+정답키), R3 15건(null 처리)
- **이전 수정 완료 (14건, 이전 세션)**: cd-q10/16/22/29/33/37, hi-q37, intro-q99/102, laws-q58/79, pd-q12/21, vi-q4
- **현재 잔존 위반 (2026-03-19 전체 검증 기준, 총 95건)**:

  #### A. multiple answer 비정상값 — 16건
  | ID | answer 현재값 | 수정 방향 |
  |----|--------------|----------|
  | cd-q33 | "4" | options 4개인데 인덱스 4→ "3" 의심 또는 문항 재확인 |
  | laws-q73 | "4" | options 4개인데 인덱스 4 → 재확인 |
  | asmnt-q32 | "4" | options 4개인데 인덱스 4 → 재확인 |
  | laws-q54 | "4" | options 4개인데 인덱스 4 → 재확인 |
  | vi-q36 | "4" | options 4개인데 인덱스 4 → 재확인 |
  | pd-q12 | 텍스트 (모로반사 설명) | options[0] 해당 → "0" |
  | cd-q16 | "시간지연" | options에서 해당 인덱스 확인 필요 |
  | pd-q7 | 텍스트 | 인덱스 변환 필요 |
  | vi-q4 | 텍스트 | 인덱스 변환 필요 |
  | cd-q10 | "실물 사진" | 인덱스 변환 필요 |
  | cd-q2 | "대치" | 인덱스 변환 필요 |
  | hi-q3 | 텍스트 | 인덱스 변환 필요 |
  | hi-q15 | 텍스트 | 인덱스 변환 필요 |
  | pd-q2 | "불수의적이고 불규칙한 사지 움직임" | 인덱스 변환 필요 |
  | hi-q11 | 텍스트 | 인덱스 변환 필요 |
  | vi-q19 | 텍스트 | 인덱스 변환 필요 |

  #### B. OX answer "0"/"1" 사용 — 15건 (계약 위반: "O"/"X" 필요)
  cd-q74(1), intro-q156(0), intro-q162(1), vi-q98(1), bs-q147(0), intro-q166(0),
  cur-q131(0), hi-q77(1), cur-q136(0), pd-q73(0), trans-q117(1), intro-q138(0),
  intro-q145(0), vi-q93(0), intro-q151(0)
  - **수정 방법**: "0" → "X", "1" → "O" 로 일괄 변환

  #### C. wrong_explanations 키 >= "4" — 59건 (options 인덱스 범위 초과)
  **과목별**: pd(14), hi(14), cd(13), laws(11), intro(4), vi(2), trans(1)
  **주요 항목**: intro-q108, cd-q37, pd-q12, cd-q16, pd-q7, cd-q25, cd-q22, cd-q10, cd-q2, hi-q21, trans-q33, intro-q102, laws-q68, hi-q37, laws-q62, hi-q3, laws-q60, laws-q64, laws-q72, hi-q25, hi-q33, hi-q15, cd-q29, pd-q21, pd-q37, pd-q2, pd-q25, pd-q33, vi-q24, laws-q32, laws-q77, intro-q105, intro-q99, hi-q29, laws-q58, hi-q11, laws-q86, laws-q88, laws-q66, pd-q29, vi-q31
  - **"4" 키**: 데이터 생성 시 5지선다 혼용 오류 → 키="4" 제거
  - **텍스트 키**: 선택지 원문을 키로 사용 → 인덱스로 변환

  #### D. wrong_explanations 정답 키 포함 — 5건
  | ID | answer | WE에 포함된 정답 해설 내용 |
  |----|--------|--------------------------|
  | laws-q41 | "3" | "전환교육에는 직업교육뿐 아니라 자립생활훈련..." — 정답 설명이 WE에 포함 |
  | laws-q46 | "2" | "뇌병변장애는 신체적 장애에 해당하므로..." — 정답 설명이 WE에 포함 |
  | laws-q79 | "3" | "보호자의 의견진술 기회를 충분히 보장..." — 정답 설명이 WE에 포함 |
  | laws-q84 | "3" | "치료지원 제공 시 의료행위에 해당하는 치료는 제외..." — 정답 설명이 WE에 포함 |
  | laws-q93 | "3" | "배치 시 보호자의 의견을 수렴하여야 한다" — 정답 설명이 WE에 포함 |
  - **수정 방법**: WE에서 answer 키에 해당하는 항목 제거 (정답 해설은 explanation 컬럼에만)

### 패턴 10: OX 타입 answer 숫자 인덱스 사용 (신규 패턴 — 2026-03-19)
- **문제**: ox 타입 문항의 answer가 "O"/"X" 대신 "0"(거짓) / "1"(참)으로 입력됨
- **영향 항목**: 15건 (cur-q131/136, intro-q138/145/151/156/162/166, bs-q147, cd-q74, hi-q77, pd-q73, trans-q117, vi-q93/98)
- **원인 추정**: 갭 보충 에이전트가 binary 0/1 체계로 출력 — contract.md 규칙 미준수
- **수정 방법**: "0" → "X", "1" → "O" 일괄 변환
- **우선순위**: 높음 (UI에서 정오 판정 오류 직접 유발)

### 패턴 8: 고아 chapter 참조 (2026-03-19 재확인)
- **문제**: quiz_questions.chapter가 chapters 테이블에 없는 slug 사용
- **현황 (2026-03-19)**: 33건 (24 unique subject::chapter pair)
  - 이전 168건에서 감소 — 일부 정비 반영된 것으로 보임
- **업데이트 (2026-03-21)**: behavior-support::fba — bs-q238~240 3건 → chapter=pbs로 수정 완료
- **잔존 pair 전체**: physical-disability::(cerebral-palsy, aac), hearing-impairment::(oral-method, hearing-assessment), inclusive-education::(strategies, practices, inclusive-strategies, cooperative-learning), transition::(transition-planning, transition-assessment, theory), laws::(welfare-act, theory, practices), curriculum::planning, introduction::(autism-characteristics, disability-concept), assessment::practices, communication-disorder::articulation-disorder (외 4개)
- **해결**: chapters 테이블에 해당 slug 추가 또는 기존 slug로 리매핑

### 패턴 9: ID 명명 규칙 비준수 856건 (2026-03-19 재확인)
- **문제**: *-ox-* 해시 패턴, kice-20xx-*, term-* 패턴이 contract.md {prefix}q{n} 규칙과 불일치
- **현황 (2026-03-19)**: 전체 1000건 중 508건 quiz, 32건 worksheet_topics, 316건 worksheet_questions
  - quiz 총 1000건으로 감소 (이전 2061건 대비 — DB 재정비 또는 페이지네이션 한계 가능성)
- **breakdown**: *-ox-* 464건, kice-* 26건, term-* 18건 / worksheet_topics 32건 전체 / worksheet_questions 316건 전체
- **비고**: contract.md v2 "대규모 리네임 리스크 고려 필요" — 실제 UI 기능에는 영향 없음. 낮은 우선순위.

### 패턴 13: options 컬럼 jsonb 객체 포맷 오류 (2026-03-21 신규)
- **문제**: multiple 타입 문항의 options 컬럼이 `text[]` 배열 대신 `{"0":"...","1":"...","2":"...","3":"..."}` jsonb 객체로 삽입됨
- **증상**: Supabase JS 클라이언트 조회 시 options 필드가 null 반환 (text[] 캐스팅 실패)
- **영향 배치**: intro-q221~240 중 14건 (intro-q222, q225, q230, q234, q238, q239 제외)
- **원인 추정**: 삽입 스크립트에서 options를 JSON 객체로 직렬화 — 배열 리터럴 대신 key-value 객체 사용
- **수정 방법**: opts['0']~opts['3'] 순서로 text[] 배열 재조립 후 UPDATE
- **수정 완료**: 2026-03-21, 14건 자동 수정
- **재발 방지**: 삽입 스크립트 검토 시 options 필드가 `["a","b","c","d"]` 형식인지 확인 (객체 형식 금지)
