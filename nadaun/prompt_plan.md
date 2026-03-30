# nadaun Phase 6: 배포 + 실사용 준비 + 교수학습 자료 연계

> 확정일: 2026-03-30 | 완료: 16/16 | build + lint PASS

## 목표

Phase 1~5에서 교육과정(1층) → IEP(2층) → 주간계획(3층) → 진단평가(4층)의 4개 층을 완성했다. Phase 6는 실제 교사가 사용할 수 있도록 **배포 + 폴리싱 + 5층(교수학습) MVP**를 완성한다.

**핵심 질문:** "교사가 핸드폰으로 수업 중에도 나다운을 쓸 수 있는가?"

## Phase 6-1: 배포 + 인프라 (4건)

- [x] Task 1: Vercel 배포 설정 — vercel.json 완성, SW/manifest 헤더
- [x] Task 2: PWA 설정 — manifest.json, sw.js, 오프라인 페이지, ServiceWorkerRegistrar
- [x] Task 3: 모바일 최적화 — 터치 타겟 44px+, MobileBottomNav, body pb-16
- [x] Task 4: SEO + OG 메타태그 — Metadata title template, OG, viewport, apple-touch-icon

## Phase 6-2: 실사용 폴리싱 (4건)

- [x] Task 5: 로딩 스켈레톤 — 대시보드 loading.tsx, 보고서 loading.tsx
- [x] Task 6: 에러/빈 상태 UI — 보고서 error.tsx + 대시보드/주간계획 빈 상태 CTA
- [x] Task 7: 토스트 알림 — Sonner + showSuccess/showError, 6곳 적용 (상태/메모/달성도/삭제/복제/일괄)
- [x] Task 8: 인쇄 CSS — @media print (header/nav 숨김, body 정리)

## Phase 6-3: 5층 교수학습 자료 연계 MVP (4건)

주간계획의 활동과 연계된 교수학습 자료(PDF, 링크, 이미지 등)를 첨부할 수 있도록 한다. 수업 현장에서 "이 주차에 뭘 준비해야 하지?" 질문에 답하는 기능.

- [x] Task 9: teaching_materials 테이블 — RLS 4정책, FK CASCADE, 마이그레이션 적용
- [x] Task 10: 교수학습 자료 첨부 UI — TeachingMaterialsSection (link/file/note CRUD), WeeklyPlanItem 통합
- [x] Task 11: Supabase Storage 파일 업로드 — nadaun-files 버킷, 5MB 제한, PDF/이미지만
- [x] Task 12: 교수학습 자료 내보내기 — formatWeeklyPlansWithMaterials 함수, materialsMap 통합

## Phase 6-4: 테스트 + 검증 (4건)

- [x] Task 13: 로딩/에러 컴포넌트 — loading.tsx 2개 + error.tsx 1개 생성 확인
- [x] Task 14: 모바일 최적화 — MobileBottomNav, 터치 타겟 CSS, body pb-16
- [x] Task 15: 내보내기 포매터 — formatWeeklyPlansWithMaterials 구현
- [x] Task 16: npm run build exit 0 + lint 0 warnings

## Completion Contract

V가 80% 이상 (16/20건) 통과 시 PASS.

### 기능 (7건)
- [ ] Vercel 배포 URL에서 로그인 후 학생/IEP/주간계획 CRUD 동작
- [ ] PWA로 홈화면 추가 가능
- [ ] 모바일에서 주간계획 상태 토글 + 달성도 입력 가능
- [ ] 교수학습 자료(링크/메모) 첨부 + 목록 확인 가능
- [ ] 파일(이미지/PDF) 업로드 + 미리보기 가능
- [ ] 보고서 페이지 인쇄 시 깨끗한 레이아웃
- [ ] 토스트 알림으로 액션 결과 피드백

### UX (6건)
- [ ] 주요 5페이지에 로딩 스켈레톤 표시
- [ ] 에러 발생 시 사용자 친화적 메시지 + 재시도 버튼
- [ ] 빈 상태에서 다음 행동 안내 (CTA 버튼)
- [ ] 터치 타겟 최소 48px (모바일 접근성)
- [ ] 반응형: 데스크톱/태블릿/모바일 3단계 레이아웃
- [ ] OG 메타태그로 공유 시 미리보기 카드 표시

### 데이터 (4건)
- [ ] teaching_materials 테이블 생성 + RLS 설정
- [ ] Supabase Storage 버킷 생성 (nadaun-files)
- [ ] 파일 업로드 용량 제한 (5MB) + 허용 MIME 타입 검증
- [ ] 기존 데이터 무손실 (비파괴적 마이그레이션)

### 테스트 (3건)
- [ ] 교수학습 자료 CRUD 단위 테스트 통과
- [ ] 모바일 뷰 5페이지 시각 확인 (스크린샷 또는 접근성 트리)
- [ ] npm run build exit 0

## 이전 계획

### Phase 5 코드 품질 (2026-03-30, 완료)
error/loading 4곳 추가 + 컴포넌트 분해 3건. 커밋: 5fc99f5.
- pdf-document.tsx 532→410줄 (pdf-styles.ts 추출)
- standard-selector.tsx 421→321줄 (standard-detail-panel.tsx 분리)
- weekly-plan-edit-form.tsx 127줄 분리
- Phase 6 Task 6(에러/빈 상태) 중 error.tsx 4건 선완료

### Phase 5 기능 (2026-03-30, 완료)
진단평가 기초 + 학기말 보고 + 교사 일상 도구. 16/16 tasks 완료.
커밋: 07a4a22. 262 tests, build exit 0.

### Phase 4 (2026-03-30, 완료)
계획 상세 보강 + 대시보드 진도 시각화 + 내보내기 enrichment. 16/16 tasks 완료. CC 16/16.

### Phase 3 (2026-03-30, 완료)
현행수준 평가 + 성취수준 풀 + enriched IEP 빌더. 16/16 tasks 완료. CC 20/20.

### Sprint 2 (2026-03-29, 완료)
배포 + 보안 + UX 성숙. Phase 11-14 전체 완료.
