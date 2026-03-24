# 1기 최종 스프린트 — 기술 구조 완성

> 작성: 2026-03-24 | 총괄: X | 승인: 카이란
> 기간: 3/25 (수) ~ 4/14 (화), 21일
> 원칙: 3주간 전력 투구. 5월 이후 페이지 구조 변경 없음. 유지보수 + 데이터만.

## 5대 합의 (X 종합 보고서 기반)

1. 기출 3층 시스템이 유일무이한 코어
2. 분석→학습 경로 연결 미완성 (엔진은 있는데 바퀴가 없다)
3. 기능 90점, 감정 설계 60점 (혼이 빠져 있다)
4. 콘텐츠 비율 KICE와 불일치 (교육과정 -11.2%, 법령 +11.9%)
5. 온보딩 + 기출 접근성이 첫 관문

## 실행 구조

| 역할 | 담당 | 작업 |
|------|------|------|
| 총괄 + 품질 | X | 계획, 리뷰, 검증, 오케스트레이션 |
| 전략 + 인프라 | 프라임 | 노션, Google Sheets, 관리자, 구조 |
| 코드 실행 A | 강선생 | UX, 감성, 컴포넌트, 테스트 |
| 코드 실행 B | 클루디 | 데이터, API, 스크립트, validation |

에이전트 병렬: 하루 4~6개 동시. 카이란 하루 3~4시간 (검토 + 도메인 판단).

---

## M0: 기반 구축 (완료, ~3/24)

- [x] 40개 페이지 + 51개 라우트 구축
- [x] quiz_questions 2,177+ 문항
- [x] 에이전트 팀 (프라임, V, 강선생, 클루디, X)
- [x] 진단평가 4개 라우트 검증 (워크시트 뷰어, 데일리, 채점)
- [x] 실력쌓기 3개 라우트 검증 (UI/UX, 아키텍처 한글화)
- [x] 워크시트 플로우 복구 (서버 컴포넌트 전환)
- [x] 오답노트 구조 변경
- [x] 진단평가 세션 묶음 + 기록 표시 + 빈 답변 수정
- [x] fill-in 문항 정리 (174건 삭제, EBD 26문항, 복수 빈칸 패턴)
- [x] 퀴즈 UX (자동이동, 해설 펼침, 결과 리뷰)
- [x] 실력쌓기 + 진단 허브 페이지
- [x] X 종합 보고서 (13개 문서, 6,744줄, 5관점 리뷰)

---

## M1: 감성 + UX + 안전망 (Week 1, 3/25~3/31)

### 강선생 작업
- [ ] 온보딩 자동 실행 — OnboardingGate → 홈 연결 (10줄 이내)
- [ ] 기출분석 메인 탭 — 네비게이션에 '기출분석' 추가, 3단계→1단계 접근
- [ ] 에러 메시지 12개 인간화 — '학습 기록은 안전합니다' 등
- [ ] 점수별 감성 분기 — 0~30%/31~60%/61~90%/91~100% 구간별 메시지
- [ ] 용어 순화 전체 — '진단평가'→'문제풀기', 'SRS'→'간격 반복' 등
- [ ] 빈 상태(empty state) 메시지 + CTA 버튼 전체 추가
- [ ] 마이크로카피 P0 (4건) + P1 (10건)
- [ ] 기출↔개념 직링크 — 취약 키워드에서 MDX 페이지 연결
- [ ] 로딩 상태 텍스트 전체 페이지

### 클루디 작업
- [ ] 스토어 마이그레이션 테스트 (v3→v4→v5) — 오답노트 소실 방지
- [ ] Sentry 에러 모니터링 도입

### 카이란 작업
- 온보딩 5단계 문구 검토
- 감성 분기 메시지 도메인 검토
- 키워드↔MDX 매핑 정확도 검증
- Week 1 배포 사이트 전체 점검

### Week 1 완료 기준
- 첫 방문자가 3초 안에 온보딩 진입
- 기출 1단계 접근
- 전문 용어 0개
- 빈 화면 0개
- 에러 메시지 전부 인간어

---

## M2: 인프라 + 외부 통합 (Week 2, 4/1~4/7)

### 강선생 작업
- [ ] QuizForm (736줄) 분할 — 300줄 이하 컴포넌트 3~4개로
- [ ] QuizClient (684줄) 분할 — 동일 기준
- [ ] 관리자 대시보드 — 기출 브라우저 + 콘텐츠 갭 시각화

### 클루디 작업
- [ ] src/lib 45파일 → 도메인별 분리 (quiz-db, kice-db, user-db 등)
- [ ] import 경로 전체 업데이트
- [ ] quiz_questions 입력 validation 레이어 추가

### 프라임 작업
- [ ] Google Sheets "문제 마스터" 생성 + Apps Script 양방향 동기화
- [ ] KICE 분석 시트 (키워드 히트맵 + 2027 예측)
- [ ] KPI 대시보드 시트
- [ ] 노션 재구조 — 태그 63→15개, 마일스톤 M0~M4, 중복 통합
- [ ] CLAUDE.md 생성

### 카이란 작업
- src/lib 구조 변경 승인
- Google Sheet 실제 수정 테스트
- 시트 데이터 정확도 검증
- 노션 구조 최종 승인
- 관리자 페이지 실사용 테스트

### Week 2 완료 기준
- 500줄+ 컴포넌트 0개
- src/lib 도메인별 분리 완료
- Google Sheets ↔ Supabase 양방향 작동
- 노션 4DB 정리, 마일스톤 통일
- CLAUDE.md 존재

---

## M3: 콘텐츠 + 테스트 + 최종 배포 (Week 3, 4/8~4/14)

### 클루디 작업
- [ ] AI 문항 생성 파이프라인 구축 (기출 키워드 기반)
- [ ] 교육과정 100 + 행동지원 65 + 전환교육 39 = 204문항 초안
- [ ] contract.md 정합성 해소
- [ ] DB 마이그레이션 자동화 (supabase CLI)

### 강선생 작업
- [ ] 마이크로카피 P2 (5건) + P3 (5건) — 24건 전체 완료
- [ ] 서술형 채점 한계 안내 문구
- [ ] 40개 페이지 안내 문구 배치 — 박물관 안내문 수준
- [ ] E2E 테스트 5개 핵심 시나리오

### 프라임 작업
- [ ] Google Drive 폴더 구조 + 안내 README
- [ ] 노션 허브 안내 문구 정비
- [ ] 스프린트 완료 보고서 작성
- [ ] 5월 데이터 검증 로드맵

### 카이란 작업
- 204문항 과목별 10개씩 샘플 검수 (품질 기준 설정)
- 전체 마이크로카피 최종 검토 (도메인 + 감성)
- 안내 문구 톤 검토 (친절함 + 전문성 균형)
- contract 변경 승인
- 수험생 관점 최종 플로우 테스트
- 스프린트 회고, 5월 확정

### Week 3 완료 기준
- 204문항 초안 완료 (5월 검수 원본)
- 마이크로카피 24건 전체 완료
- 40개 페이지 전부 안내 문구 존재
- E2E 테스트 통과
- 빌드 + 린트 + tsc 0 에러
- 최종 배포

---

## M4: 데이터 검증 (5월~, 유지보수 모드)

- [ ] 204문항 + 기존 문항 정확도 검수 (카이란 주도)
- [ ] 키워드↔MDX 매핑 검증
- [ ] 용어사전 현행화 (2009 NISE → 2025)
- [ ] 조언자 피드백 반영
- [ ] 서술형 채점 키워드 보강
- [ ] 버그 수정 (발견 시 에이전트)
- 페이지 구조 변경 없음

---

## Quiz Editor + Google Sheets 동기화 (M2에 통합)

> V가 수립한 계획을 M2 프라임 작업으로 통합

### DB 스키마 보강 (M2 선행)
```sql
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS updated_by text;
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER quiz_questions_updated_at
  BEFORE UPDATE ON quiz_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
```

### API (이미 구현됨)
- /api/admin/quiz — GET, POST
- /api/admin/quiz/[id] — PATCH, DELETE
- /api/admin/quiz/bulk — POST (Sheets용)
- /api/admin/quiz/export — GET

### Google Sheets 동기화
- Apps Script onEdit() → /api/admin/quiz/bulk
- 5분 간격 타이머 → /api/admin/quiz/export
- 충돌: Last-Write-Wins (updated_at 비교)

---

## 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Google API 서비스 계정 복잡 | M2 지연 | Apps Script만으로 우회 |
| 204문항 AI 품질 | M4 검수 부담 | M3 Day 15에서 품질 기준 먼저 설정 |
| 모놀리식 분할 회귀 | M2 버그 | 분할 전 기능 테스트 먼저 작성 |
| 세션 컨텍스트 포화 | 품질 저하 | 40%에서 /strategic-compact, 매일 /checkpoint |
| 창업자 번아웃 | 전체 | 하루 3~4시간 한도, 일요일 가벼운 작업 |

---

## 이전 계획 아카이브

### Quiz Editor (V, 3/23) — M2로 통합
### 진단평가 버그 (강선생, 3/22) — M0 완료
