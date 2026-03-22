# 강선생 공유 로드맵

> 강선생1, 강선생2 모두 이 파일을 기준으로 전체 방향을 이해한다.
> 세부 지시는 각자의 지시서(kangteacher1-*.md / kangteacher2-*.md) 참조.

---

## 에이전트 구조 (2026-03-19 확정)

| 에이전트 | 도메인 | 소유 파일 영역 |
|---------|--------|-------------|
| **강선생1** | Auth UI + 인증 플로우 | `src/app/auth/`, `src/app/login/`, `src/components/auth/`, `src/middleware.ts` |
| **강선생2** | 데이터 동기화 + /my 페이지 | `src/app/my/`, `src/lib/sync.ts`, `src/stores/*.ts` (동기화 부분) |

**충돌 방지 규칙**:
- 강선생1은 `/my/` 파일 수정 금지, 강선생2는 `auth/` 파일 수정 금지
- `src/lib/db.ts`, `src/lib/supabase/` 수정 필요 시 담당 에이전트가 먼저 수정 후 상대에게 알림
- `docs/contract.md` 수정 → 스미스 프라임에게 요청

---

## 서비스 철학 (공통 이해)

- **게스트 모드 유지**: Auth 없이도 퀴즈/워크시트 전부 접근 가능
- **처음엔 아무것도 묻지 않음**: 로그인 강제 없음, 진도 저장 원하면 로그인
- **라우트 보호**: `/my/*` 만 인증 필수 (나머지 게스트 허용)
- **Phase 설계**: OX→기입→서술형 스캐폴딩 (Q3에 시각적 로드맵 구현)

---

## Q2 스프린트 타임라인 (4~6월)

| 주차 | 강선생1 | 강선생2 |
|------|--------|--------|
| **W1 (지금 시작)** | Supabase 3-레이어 클라이언트 + 미들웨어 | /my 페이지 뼈대 + Phase 진도 표시 UI |
| **W2** | Login UI + OAuth 콜백 + UserMenu | AuthProvider + 스토어 서버 연동 준비 |
| **W3** | Kakao OAuth (사업자 등록증 수령 후) + 보안 검증 | Zustand→Supabase 5개 스토어 동기화 |
| **W4** | E2E 검증 지원 | 게스트→로그인 마이그레이션 + 통합 테스트 |
| **이후** | PWA + 오프라인 기본 | 학습 진도 서버 집계 + 통계 동기화 |
| **안정화** | 접근성(WCAG) + 성능 | E2E 전체 시나리오 (`docs/e2e-scenarios.md`) |

---

## 공통 참조 문서

| 문서 | 용도 |
|------|------|
| `docs/kangteacher-auth-brief.md` | Auth 상세 스펙 (SQL, 코드 패턴 포함) |
| `docs/contract.md` | DB 스키마 계약 (진실의 원천) |
| `docs/e2e-scenarios.md` | 통합 테스트 시나리오 |
| `memory/kangteacher.md` | 강선생 공통 메모리 |

---

## Q3 예고 (2026 7~9월)

- 강선생1: 커뮤니티 게시판 + 소셜 피드
- 강선생2: 시각적 학습 로드맵 (마을 지도 UI, 단일 경로 + 11개 과목 교차)

---

## 완료 보고 방법 (공통)

```json
// ~/.claude/notion-pending.json 작성 → Stop 훅 자동 POST
{
  "title": "완료보고: 강선생1 2026-04-07",
  "type": "세션기록",
  "tags": ["강선생1", "s-e-w", "Auth"],
  "content": "## 완료된 것\n- ...\n\n## 미결\n- ..."
}
```
