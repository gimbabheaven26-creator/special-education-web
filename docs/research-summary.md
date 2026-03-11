# 해외 사례 및 학술 연구 종합 보고서
> 작성: 강선생 | 2026-03-11 | 4개 병렬 에이전트 리서치 결과 종합

---

## 핵심 발견 TOP 10

### 1. FSRS 알고리즘 도입 (최우선)
- 현재 Leitner 5단계 → `ts-fsrs` npm 패키지로 백엔드 교체 권장
- SM-2 대비 **20-30% 적은 복습으로 동일 기억률** 달성
- DSR 모델(Difficulty-Stability-Retrievability), 21개 훈련 가능 매개변수
- Leitner UI는 유지하되 백엔드만 FSRS로 전환하는 하이브리드 접근

### 2. 한국 시장 공백이 거대함
- 해커스/임용닷컴/박문각/윌비스/G스쿨 → **전부 동영상 강의 모델**
- 간격반복, 적응형 퀴즈, 영역별 진단, 모바일 최적화 → **아무도 안 하고 있음**
- 모든 기능이 차별화 포인트

### 3. 간격 반복 효과: 메타분석 근거
- 효과 크기 d = 0.54~0.78 (중-대 효과)
- Anki 사용자: 모든 시험에서 **6-7%p 높은 점수** (Gilbert 2023)
- 6개월 후 기억 유지: 간격반복 80-90% vs 벼락치기 20-30%

### 4. 인출 연습(Testing Effect) = 핵심 학습 메커니즘
- 효과 크기 d = 0.50~0.88
- 단순 재독보다 **능동적 회상**이 압도적으로 효과적
- 플래시카드 + 퀴즈 조합이 최강

### 5. 문제 유형별 피드백 전략이 달라야 함
| 문제 유형 | 피드백 타이밍 | 근거 |
|----------|------------|------|
| OX/객관식 | 즉시 | 단순 사실 확인, 즉시 교정 |
| 빈칸 채우기 | 즉시 + 정답 비교 | 인출 시도 후 확인이 학습 강화 |
| 서술형 | 지연 (자기평가 먼저) | 깊은 처리를 위해 자기 평가 선행 |

### 6. 성장 마인드셋: 연구가 복잡함
- 전체 효과: d = 0.05 (약함) — 단, 위험군 학습자에서는 유의미
- **하지 말 것**: "잘하고 있어요!", "더 열심히!", 빈약한 칭찬
- **해야 할 것**: 데이터 기반 전략 칭찬, 현명한 피드백(높은 기준 + 도달 가능성 표현)
- "이 문제의 전체 초회 정답률은 23%입니다. 어렵게 느껴지는 건 당연합니다" 같은 정규화 메시지

### 7. 마이크로러닝 5-10분이 최적
- 파지율 25-60% 향상, 완료율 80%
- 효과 크기 0.74 SD
- 주 3-5회, 모바일 전달이 핵심

### 8. 스트릭 = 습관 형성의 핵심
- Duolingo: 7일 스트릭 달성자 → 과정 완료 가능성 **3.6배**
- 스트릭 프리즈(주 1-2회) 허용이 오히려 유지율 향상
- 스트릭과 일일 목표 분리 권장

### 9. CentralReach ABA Knowledge Builder = 골드 스탠다드 모델
- 5,000+ 모의문제, SAFMEDS(빠른 유창성 훈련), 성과 대시보드
- **평가 → 약점 파악 → 맞춤 학습 → 재평가** 사이클
- 우리 플랫폼의 이상적 모델

### 10. UDL(보편적 학습 설계) 필수
- 특수교육 플랫폼이 접근성을 실천하지 않으면 모순
- WCAG 2.2 AA 최소 준수
- React Aria 컴포넌트 활용, VoiceOver 테스트

---

## 경쟁 분석

### 국내 (전부 동영상 강의 모델)
| 플랫폼 | 특징 | 약점 |
|--------|------|------|
| 해커스 임용 | 노량진 + 온라인 | 간격반복 없음, 모바일 미흡 |
| 임용닷컴 | 무료 모의고사 | 적응형 없음 |
| 박문각 임용 | 노량진 학원 | 디지털 도구 없음 |
| G스쿨 | 특수교육 전문 강사 | 동영상만 |

### 해외 벤치마크
| 플랫폼 | 국가 | 핵심 참고점 |
|--------|------|-----------|
| 240 Tutoring | US | 진단평가 → 가중치 기반 학습 경로 |
| StudyABA | US | 시험 시뮬레이션 UI, 99% 합격 예측률 |
| CentralReach | US | SAFMEDS + 적응형 학습 경로 |
| FlashGenius | US | AI 시나리오 매일 생성 |
| nasen Academy | UK | SEND 전문가 커뮤니티 플랫폼 |
| Relias Academy | US | 시뮬레이션 모듈 (실제 상황 체험) |

---

## 학술 DB 조사 결과

### 활용 가능 데이터베이스
| DB | URL | 분야 |
|----|-----|------|
| Google Scholar | scholar.google.com | 전 분야 |
| ERIC | eric.ed.gov | 교육학 |
| RISS | riss.kr | 한국 학위논문/학술지 |
| KCI | kci.go.kr | 한국 학술지 인용색인 |
| DBpia | dbpia.co.kr | 국내 학술 플랫폼 |
| CiNii | cir.nii.ac.jp | 일본 학술 |
| PubMed/PMC | ncbi.nlm.nih.gov | 의학/행동과학 |
| DOAJ | doaj.org | 오픈액세스 학술지 |

### 핵심 논문 목록 (TOP 15)
1. Maye et al. (2026) - 간격반복 메타분석, d=0.78
2. Gilbert et al. (2023) - Anki 코호트 연구, 6-7%p 향상
3. Roediger & Karpicke (2006) - 인출연습 원저
4. Bjork & Bjork - 바람직한 어려움 4가지
5. Brunmair & Richter (2019) - 교차학습 메타분석, g=0.42
6. Macnamara & Burgoyne (2023) - 성장마인드셋 비판적 메타분석
7. Burnette et al. (2023) - 성장마인드셋 반론
8. Mayer & Fiorella (2022) - 멀티미디어 학습 15원리
9. Duolingo (2023-2025) - 스트릭/습관 형성 연구
10. Ryan & Deci (2020) - 자기결정이론
11. 한국 특수교육 온라인 학습 실태 (KCI)
12. 특수학급 교사 TPACK 연구 (DBpia)
13. Kim et al. (2024) - Inclusive Education in South Korea
14. AI/VR/LLM in Special Education (Springer 2025)
15. Goldman et al. (2024) - AI 특수교사 업무 지원

---

## 콘텐츠 구조 권장안

### MDX 콘텐츠 계층
```
과목 (Subject) - 시험 가중치 태그
  └── 단원 (Module)
       ├── frontmatter: { bloom_level, dok_level, exam_weight, tags }
       ├── 학습목표 (3-5개)
       ├── 본문 (8-12분 읽기 분량)
       ├── 핵심용어 → 플래시카드 자동 생성
       ├── 확인문제 (형성평가)
       └── 관련 기출 (KICE 연계)
```

### 문항 분류 체계 (이중 분류)
| 유형 | 임용고시 대응 | Bloom's | DOK | 자동채점 |
|------|-------------|---------|-----|---------|
| 플래시카드 | 기입형 대비 | 1-2 | 1 | O |
| 빈칸채우기 | 기입형 (2점) | 1-2 | 1-2 | O (퍼지매칭) |
| OX/객관식 | 형성평가 | 2-3 | 1-2 | O |
| 단답형 | 서술형 (4점) | 3-4 | 2-3 | 루브릭 제시 |
| 사례분석 | 서술형 (4점) | 4-5 | 3-4 | 루브릭 제시 |

### 서술형 (4점) 분석적 루브릭
- 핵심 개념 포함 (0-1점)
- 논리적 설명 (0-1점)
- 구체적 사례/근거 (0-1점)
- 전문 용어 정확성 (0-1점)

---

## 구현 우선순위 로드맵

### Phase 1 - MVP 보완 (즉시)
1. FSRS 백엔드 전환 (`ts-fsrs`)
2. 문제 유형별 피드백 타이밍 차별화
3. 일일 스트릭 시스템
4. 진행 시각화 (주제별 마스터리)
5. 엄지 영역 기반 모바일 UI 개선
6. 데이터 기반 성장 마인드셋 피드백 개선
7. 마이크로러닝 세션 (5-10분 단위)
8. 유혹적 세부사항 제거 (장식 요소 최소화)

### Phase 2 - 성장 (1-3개월)
9. 진단평가 → 맞춤 학습 경로
10. 신뢰도 기반 학습 (확신도 1-5)
11. 인터리빙 모드 (주제 섞어 출제)
12. 기입형 퍼지매칭 (한국어 조사/띄어쓰기 대응)
13. 오프라인 PWA
14. 푸시 알림 (간격반복 기반)
15. WCAG 2.2 AA 접근성

### Phase 3 - 최적화 (3-6개월)
16. 개인화 FSRS 매개변수 최적화
17. 시험 시뮬레이션 모드 (기입형 6문항 + 서술형 17문항)
18. AI 시나리오 생성 (Claude API)
19. 학습 커뮤니티 (Discord 연동)
20. 상대적 리더보드 (선택적)

---

---

## 글로벌 특수교육 기관/대학/자원 (클루디 리서치)
> 2026-03-11 클루디 추가. 5개 병렬 에이전트로 8개국 100+ URL 조사.

### 국가별 특수교육 기관 (NISE 대응 기관)

| 국가 | 기관 | URL | 핵심 자원 |
|------|------|-----|-----------|
| 한국 | 국립특수교육원 (KNISE) | https://www.nise.go.kr/ | 262건 연구보고서, 연수원 |
| 미국 | OSEP + 30개 TA센터 | https://osepideasthatwork.org/ | IRIS 70모듈, PBIS, MTSS, HLP 22개 |
| 일본 | NISE Japan | https://www.nise.go.jp/ | **170+ 무료 강의**(学びラボ), インクルDB |
| 영국 | Whole School SEND | https://www.wholeschoolsend.org.uk/ | **25 무료 CPD** (각 20분), DfE £12M 지원 |
| 독일 | KMK + DIPF Leibniz | https://www.dipf.de/en | 8개 Förderschwerpunkte, FePrax 진단 |
| 핀란드 | EDUFI + Valteri | https://www.valteri.fi/en/ | 3단계 지원 모델, 550+ 전문가 |
| 호주 | AITSL | https://www.aitsl.edu.au/ | 교사 기준 7개, 4단계 경력 체계 |
| 유럽 | European Agency (EASNIE) | https://www.european-agency.org/ | 31개국 비교 도구, EASIE 통계 |

### 3대 벤치마크 모델 심층 분석

#### IRIS Center (미국 Vanderbilt) — "깊이" 모델
- **STAR Legacy Cycle** 5단계: Challenge → Initial Thoughts → Perspectives(4~8페이지) → Wrap Up → Assessment(8~12문항)
- 70+ 모듈, 300+ Info Brief, 225+ 비디오, PD 인증서(80%+)
- CEC 22 HLPs 매핑, 팝업 용어사전, 비디오 자막/트랜스크립트
- **우리 적용**: 모듈 구조 일관성, 시나리오 기반 평가, 용어사전 팝업
- URL: https://iris.peabody.vanderbilt.edu/

#### Whole School SEND (영국) — "바이트사이즈" 모델
- **Learn-Practice-Reflect** 사이클, 각 20분
- 25 유닛: 안전/소속감(3), 언어/의사소통(4), 사회정서(3), 감각/신체(3), 인지/학습(7), 자폐(5)
- **장애명이 아닌 "장벽(barrier)" 중심 분류** — 99% 사용자 만족도
- EEF 평가: SEND Review 학교 학생이 GCSE 영어에서 1개월 추가 진전
- **우리 적용**: 20분 단위 설계, 장벽 중심 태깅, 무료 모델의 효과 검증
- URL: https://www.wholeschoolsend.org.uk/

#### NISE学びラボ (일본) — "라이브러리" 모델
- 174 콘텐츠, 33,363명 사용자, 1,116 기관 등록
- 장애유형별 + 역할별(신임/중견/관리자) 연수 프로그램
- 기관이 커스텀 연수 편성 가능, 학습자별 진도 추적
- **2024년에야 이해도 체크 테스트 추가** (97/174) → 퀴즈 퍼스트인 우리가 선진적
- **우리 적용**: 오픈 액세스(교사+학부모+복지+의료), 기관 등록, 에코시스템 연동
- URL: https://labo.nise.go.jp/

### 국가별 교사 자격 비교

| | 한국 | 미국 | 일본 | 독일 | 핀란드 |
|---|---|---|---|---|---|
| 시험 | KICE 전국 통일 | Praxis (주별) | 도도부현별 | Staatsprüfung | 없음 (학위) |
| 경쟁률 | 5.82:1 | N/A | 2.4:1 | N/A | N/A |
| 장애영역 | 10개 | 주별 상이 | 5개 | 8개 | 통합적 |
| 특징 | 중앙집중 | Praxis+주인증 | 기초면허+특별지원 이중 | 2단계(대학+실습) | 석사 의무 |

### 한국 중등특수교육과 전체 목록 (22개 대학)

| 대학 | 홈페이지 | 초등/중등 |
|------|----------|-----------|
| 단국대 (1971 최초) | https://www.dankook.ac.kr/web/kor/-192 | 중등 |
| 이화여대 | https://sped.ewha.ac.kr/ | 중등 |
| 대구대 | https://se.daegu.ac.kr/main | 초등+중등 |
| 공주대 | https://spedu.kongju.ac.kr/ | 유아+초등+중등 |
| 부산대 | https://special.pusan.ac.kr/ | 중등 |
| 한국교원대 | https://www.knue.ac.kr/sped/ | 유아+초등+중등 |
| 강남대 | https://sped.kangnam.ac.kr/ | 초등+중등 |
| 전남대 | https://spededu.jnu.ac.kr/ | 유아+초등+중등 |
| 조선대 | https://special.chosun.ac.kr/ | 중등 |
| 우석대 | https://wuse.woosuk.ac.kr/ | 초등+중등 |
| 중부대 | https://www.joongbu.ac.kr/sse/ | 유아+초등+중등+특수체육 |
| 대전대 (A등급) | https://www.dju.ac.kr/sse/main.do | 중등 |
| 건양대 | https://sse.konyang.ac.kr/ | 초등+중등 |
| 창원대 | https://www.changwon.ac.kr/spedu/ | 중등 |
| 극동대 | https://www.kdu.ac.kr/secsped/main.do | 초등+중등 |
| 위덕대 | https://special.uu.ac.kr/ | 초등+중등 |
| 대구한의대 | https://www.dhu.ac.kr/HOME/specialedu/ | 중등 |
| 순천향대 | https://home.sch.ac.kr/spedu/ | 중등 |
| 세한대 | https://www.sehan.ac.kr/ | 중등 |
| 나사렛대 | https://cms.kornu.ac.kr/spedu/ | 초등 |
| 백석대 | https://community.bu.ac.kr/special/ | 유아+초등+중등(체육) |
| 가톨릭대 | https://sped.catholic.ac.kr/ | 중등 |

특수체육교육과: 한국체육대, 영남대, 용인대 (3개)

### 2026 임용시험 정보
- **경쟁률**: 전국 5.82:1, 서울 6.63:1
- **구조**: 교육학 논술(20점/60분) + 전공A(40점/90분) + 전공B(40점/90분)
- **KICE 2026 문항 공개**: https://cdn2.kice.re.kr/middle-26/index.html
- **합격선**: 64~73점대 (전년 대비 하락)

### 무료 교사학습 모듈 (해외)

| 자원 | URL | 형식 |
|------|-----|------|
| IRIS Center | https://iris.peabody.vanderbilt.edu/ | 70개 모듈 + PD 인증서 |
| NISE学びラボ | https://labo.nise.go.jp/ | 170+ 강의 (15~30분) |
| Whole School SEND | https://www.wholeschoolsend.org.uk/ | 25 CPD (각 20분) |
| PBIS World | https://www.pbisworld.com/ | Tier 1-3 행동 중재 |
| Intervention Central | https://www.interventioncentral.org/ | RTI 도구/자원 |
| JYU 온라인 (핀란드) | https://onlinecourses.jyu.fi/course/section.php?id=2211 | 특수교육 (영어, 무료) |
| OpenLearn (영국) | https://www.open.edu/openlearn/ | 900+ 코스, CC 라이선스 |
| 過去問ドットコム (일본) | https://kakomonn.com/kyosai | 무료 교원시험 과거문+해설 |

### 국제 확장 가능성
- **일본**: 자치단체별 분산 시험 → 통합 퀴즈 플랫폼 수요 존재, 경쟁자 없음
- **영어권**: Praxis 대비 시장 존재하나 특수교육 특화 무료 플랫폼 부족
- **개도국**: UNESCO 통합교육 추진 중, 저비용 플랫폼 수요

### 오픈소스 프로젝트

| 프로젝트 | 라이선스 | 설명 |
|----------|----------|------|
| Cboard | GPL-3.0 | UNICEF 지원 AAC, 45+ 언어 |
| TAO | GPL-2.0 | WCAG 준수 평가 플랫폼 |
| ts-fsrs | MIT | FSRS TypeScript 구현 (이미 도입 예정) |

---

## 상세 보고서 위치
- 해외 EdTech 사례: `~/Desktop/edtech-research-report.md`
- 논문 DB 조사: `~/Desktop/academic-database-research-report.md`
- OER/콘텐츠/평가설계: `~/.openclaw/workspace/research-oer-assessment-design.md`
- 학습심리학 연구: `~/Desktop/learning-science-research-findings.md`
- **글로벌 종합 (클루디)**: `~/.openclaw/workspace/daily-logs/클루디-글로벌리서치-2026-03-11.md`
- **유럽 상세**: `~/Desktop/european-special-education-research.md`
- **기타국가+에드테크**: `~/Desktop/global-special-education-research.md`

## 주요 출처 (150+)
강선생 리서치 50+, 클루디 글로벌 리서치 100+. 상세 보고서 각각의 Sources 섹션 참조.
