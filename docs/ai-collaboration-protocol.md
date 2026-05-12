# AI Collaboration Protocol

> 작성: 2026-05-11 | 수정: 2026-05-12 (루멘 리뷰 반영) | 목적: Claude Code의 X, Codex의 루멘, OpenClaw의 지니, V가 같은 SEW repo에서 충돌 없이 협업하게 한다.

## 핵심 원칙

대화 transcript는 자동으로 공유되지 않는다. 공유되는 진실은 파일, git 상태, 명시적으로 남긴 handoff와 daily log다.

우선순위는 다음과 같다.

1. `docs/contract.md`: DB/API 계약의 최상위 진실
2. git 상태: 실제 코드 변경의 진실
3. `~/.openclaw/workspace/memory/YYYY-MM-DD.md`: 로컬 daily log, 에이전트가 실제로 읽는 세션 일지
4. `~/.openclaw/workspace/channel.md`: 세션 간 짧은 handoff
5. `docs/`: 오래 남길 결정, 계획, 리뷰
6. Notion: phase 분기점, 큰 패치, 외부 확인용 완료 기록
7. Discord: 지니의 실시간 알림, 원격 제어, 서비스 피드백 리뷰
8. 각 도구의 대화: 해당 세션 안에서만 유효한 맥락

## 협업 주체

| 이름 | 기반 | 역할 |
|------|------|------|
| 카이란 | 사용자 | 최종 의사결정자, 교육 현장 맥락 제공 |
| X | Claude Code | 주 실행자. 구현, 데이터 파이프라인, UI, 긴 맥락 유지 |
| 루멘 | Codex | 크로스체크 도구. 다른 모델 시각의 리뷰, 구조적 맹점 탐지, 설계 반박, rescue |
| 지니 | OpenClaw | 기억/채널 협업자. 세션 간 메모리와 handoff 관리 |
| V | Claude 기반 | 독립 검증자. contract.md 준수, 보안 감사, 데이터 정합성, 구현 규칙 검증 |

도구명과 별칭을 구분한다.

- Codex: OpenAI Codex 런타임/도구의 공식 이름
- 루멘: SEW에서 Codex 협업자를 부르는 별칭
- Claude Code: Anthropic 도구의 공식 이름
- X: SEW에서 Claude Code 실행자를 부르는 persona
- 지니: OpenClaw 쪽 기억/채널 협업자

## 루멘 주도 개발 모드

카이란이 "루멘 주도 개발"을 선언했거나 Claude Code/X가 토큰 제한으로 멈춘 기간에는 루멘이 구현 주체가 된다.

이 모드의 규칙:

- 루멘은 직접 코드 수정, 빌드/테스트 실행, 문서 업데이트를 수행할 수 있다.
- 중요한 판단은 작업 중 짧게 통보하고, 세션 로그에는 변경 파일, 검증 명령, exit code, 다음 액션을 남긴다.
- `docs/contract.md`, RLS, service role key, 데이터 정합성 위험은 직접 밀어붙이지 않고 V-ESCALATE로 넘긴다.
- 커밋이 필요하면 커밋 메시지에 `lumen` 또는 `lumen-led`를 드러내고 daily log에 근거를 남긴다.
- X가 복귀하면 daily log와 git diff를 기준으로 이어받는다. 대화 transcript 공유를 전제로 삼지 않는다.

## 대화 채널

### 로컬 daily log

경로: `~/.openclaw/workspace/memory/YYYY-MM-DD.md`

X, 루멘, 지니가 실제로 읽고 이어받을 수 있는 가장 안정적인 세션 일지다. Notion은 에이전트가 항상 열람할 수 있다고 가정하지 않는다. 따라서 세션 정리, 진행 상태, 다음 액션은 먼저 로컬 daily log에 남긴다.

필수 시점:

- 세션 시작/종료
- 중요한 판단 변경
- 리뷰 결과 요약
- 빌드/테스트 결과
- 다음 세션의 첫 액션

형식:

```md
## 22:30 루멘
- 상태: X/루멘/지니 협업 프로토콜 수정 중
- 변경: docs/ai-collaboration-protocol.md에 daily log 계층 추가
- 검증: 문서 변경만, build 생략
- 다음: Notion/Discord 훅 정리 여부 결정
```

규칙:

- 모든 X/루멘 세션은 시작/종료 시 daily log에 항목을 반드시 남긴다.
- daily log는 짧게, 그러나 다음 세션이 바로 이어받을 만큼 구체적으로 쓴다.
- 비밀값, 토큰, 개인 인증정보는 절대 쓰지 않는다.
- 커밋 해시, 파일 경로, 테스트 결과, 빌드 결과(exit code)는 남긴다.
- 큰 작업은 `channel.md`에는 요약만 남기고, 자세한 흐름은 daily log 또는 `docs/`에 남긴다.

### `~/.openclaw/workspace/channel.md`

**지니 중심 운영 채널.** X/루멘이 지니에게 알려야 하는 짧은 상태만 남긴다.

사용 시점:

- X가 지니에게 세션마감/작업상태를 남길 때
- 지니가 X에게 확인/응답을 남길 때
- 루멘이 지니에게 리뷰 완료 등 상태를 알릴 때

사용하지 않는 시점:

- X↔루멘 간 리뷰 논의 (→ `docs/reviews/lumen/`)
- 긴 판단이나 구현 세부사항 (→ daily log 또는 `docs/`)

형식:

```md
### [세션마감] X → 지니 (5/11)
프로토콜 문서 정리 완료. 루멘 adversarial review 1회 실행 확인. 커밋 해시: abc1234.
```

### X↔루멘 리뷰 채널

경로: `docs/reviews/lumen/`

X와 루멘 간 리뷰/반박/구조 논의는 별도 파일에 저장한다. channel.md에 넣지 않는다.

사용 시점:

- Codex adversarial review 결과 저장
- X가 루멘에게 리뷰를 요청할 때의 초점 명시
- 루멘이 구조적 반박이나 설계 제안을 남길 때

형식:

```md
# 루멘 리뷰: YYYY-MM-DD 대상

## 판정
needs-attention / approve

## 발견 사항
| 심각도 | 문제 | 위치 |
|--------|------|------|

## X 대응
- [FIXED] ...
- [WONTFIX] ... (사유)
```

### git 상태

코드에 대해서는 `git status`, `git diff`, `git log`가 최우선 공유 수단이다. 다른 세션의 대화가 없어도 파일 변경은 여기서 확인한다.

### `docs/`

장기 결정은 대화가 아니라 문서에 남긴다.

- 작업 계획: `docs/*plan*.md`
- 리뷰 결과: `docs/v-reviews/` 또는 작업별 문서
- 협업 규칙: `docs/ai-collaboration-protocol.md`

### Notion

Notion은 에이전트의 실시간 작업 메모리가 아니다. 에이전트들이 항상 Notion을 열람할 수 있다고 가정하지 않는다.

사용 시점:

- phase 시작/종료
- 큰 패치 완료
- 외부에서 확인할 수 있어야 하는 완료 보고
- 카이란이 나중에 보기 위한 스프린트 로그
- 교육 서비스 운영상 남겨야 하는 기록

사용하지 않는 시점:

- 세션 내부의 잦은 handoff
- 실시간 리뷰
- 아직 검증되지 않은 임시 판단
- 토큰, API 키, 서비스 role key가 포함될 수 있는 내용

권장 포맷:

```json
{
  "destination": "sprint",
  "title": "루멘: X/루멘 협업 프로토콜 정리 (2026-05-11)",
  "agent": "루멘",
  "status": "완료",
  "tags": ["루멘", "협업체계", "특수교육웹"],
  "content": "## 완료\n- ..."
}
```

### Discord / 지니

Discord는 지니가 실시간으로 서비스 상태와 피드백을 확인하는 채널이다.

사용 시점:

- 베타 피드백 실시간 알림
- Vercel/배포 이상 감지
- git 상태, 빌드, 테스트의 원격 확인
- 지니가 카이란에게 즉시 알려야 할 리뷰/운영 신호

Discord 메시지는 짧게 보낸다. 긴 판단, 리뷰 전문, 구현 세부사항은 local daily log 또는 `docs/`에 남기고 Discord에는 링크/요약만 보낸다.

## X↔루멘 소통 방식

두 가지 경로가 있다.

### 실시간 (Claude Code 플러그인)

X 세션 안에서 Codex 플러그인을 호출한다. 카이란이 탭을 전환하지 않는다.

```
카이란: "루멘한테 리뷰 맡겨"
X → /codex:adversarial-review --wait → 루멘이 git diff 읽고 리뷰 → 결과가 X 세션에 반환
```

사용 시점:
- X 작업 완료 후 즉시 크로스체크
- 버그에 막혔을 때 rescue 호출
- 빠른 구조 질문

`/codex:review`, `/codex:adversarial-review`, `/codex:rescue`, `/codex:status`, `/codex:result`, `/codex:cancel`은 일반 skill 파일이 아니라 Claude Code에 설치된 Codex plugin command다. 따라서 `.agents/skills` 목록에 보이지 않아도 플러그인이 설치되어 있으면 호출할 수 있다.

설치/동작 확인은 Claude Code 세션에서 `/codex:status`를 실행해 한다. 정상이라면 플러그인 상태나 background job 목록을 반환해야 하며, 명령을 찾지 못하면 실시간 경로를 쓰지 않고 아래 비동기 경로로 전환한다.

### 비동기 (독립 Codex 세션)

카이란이 별도 Codex 앱/세션에서 루멘과 대화한다. 결과는 파일로 넘긴다.

Claude Code를 쓰지 않는 기간에는 이 비동기 경로를 기본으로 한다.

```
카이란이 Codex 세션에서 루멘에게 설계 논의
→ 결과를 docs/reviews/lumen/ 또는 daily log에 저장
→ X가 다음 세션에서 읽고 반영
```

사용 시점:
- 설계 논의, 아키텍처 반박
- 네이밍, 프로토콜 같은 비코드 의사결정
- X 세션 밖에서의 독립적 분석

## V vs 루멘 역할 구분

| 관점 | V | 루멘 |
|------|---|------|
| 기반 모델 | Claude | Codex (OpenAI) |
| 핵심 질문 | "이 코드가 계약을 지키는가?" | "이 설계에 구조적 맹점이 있는가?" |
| 검증 대상 | contract.md 준수, 보안, RLS, 데이터 정합성 | 아키텍처, 공급망, 충돌 방지, 크로스 모델 편향 |
| 실행 방식 | Agent(subagent_type: "v") | `/codex:review` 또는 독립 Codex 세션 |
| 결과 저장 | `docs/v-reviews/` | `docs/reviews/lumen/` |

둘 다 쓰는 경우: 중요 변경 시 V가 contract 준수를 검증하고, 루멘이 구조적 크로스체크를 병렬로 수행.

루멘이 보안, RLS, service role key, 데이터 정합성, `docs/contract.md` 위반 가능성을 발견하면 직접 결론으로 닫지 않고 V 검증 대상으로 에스컬레이션한다. 기록 위치는 `docs/reviews/lumen/`의 해당 리뷰 파일이며, 긴급하거나 지니가 카이란에게 알려야 하는 운영 신호만 `channel.md`에 짧게 남긴다.

에스컬레이션 브릿지는 다음 중 하나로 반드시 남긴다.

1. X가 루멘 리뷰의 V 대상 항목을 `docs/v-reviews/v-escalation-YYYYMMDD.md`로 이관한다.
2. 루멘이 read-only 리뷰 결과에 `V-ESCALATE` 태그와 심각도를 남기고, X가 다음 세션 시작 시 `docs/v-reviews/`에 옮긴다.
3. 긴급 보안/데이터 손실 위험은 `channel.md`에 `[긴급][V-ESCALATE]` 한 줄 요약을 추가해 지니가 카이란에게 알릴 수 있게 한다.

심각도는 V 리뷰 체계를 따른다. 보안, RLS, service role key, `docs/contract.md` 위반 가능성은 기본 HIGH 이상으로 태깅한다. V와 루멘 판단이 충돌하면 보안/contract/data integrity 영역은 V 판정을 우선하고, 구조/설계 대안 영역은 루멘 판정을 우선한다.

## 기본 워크플로우

1. X가 구현한다.
2. X가 local daily log에 작업 요약을 남긴다.
3. 다음 주체에게 넘길 내용이 있으면 `channel.md`에 지니 앞으로 짧은 handoff를 남긴다.
4. 루멘 리뷰가 필요하면 X가 `/codex:adversarial-review`를 실행한다 (실시간).
5. 루멘 결과를 `docs/reviews/lumen/`에 저장한다.
6. X가 수정한다.
7. 중요 변경이면 V가 contract 검증을 추가로 수행한다.
8. `npm run build` exit 0 확인 후 커밋한다.
9. phase 분기점 또는 큰 패치라면 Notion 스프린트 로그에 외부 기록을 남긴다.

세션 종료 전에는 X와 루멘 모두 local daily log에 현재 상태, 변경 파일, 검증 결과, 다음 액션을 남긴다. 대화 transcript는 공유되지 않으므로 daily log가 다음 세션의 기본 이어받기 지점이다.

## Codex 사용 규칙

현재 브랜치가 `main`이고 변경이 uncommitted 상태라면 `--base main` 리뷰는 빈 결과가 될 수 있다.

상황별 기본 명령:

```bash
/codex:review --background
/codex:adversarial-review --background
/codex:adversarial-review --background auth, data loss, and rollback risks
/codex:rescue --background read-only investigate why the build is failing. Do not edit files.
```

원칙:

- 리뷰는 기본 read-only다.
- rescue는 수정 가능하므로, 조사만 원할 때는 `read-only`와 `Do not edit files.`를 명시한다.
- 큰 변경은 background로 실행하고 `/codex:status`, `/codex:result`, `/codex:cancel`로 관리한다.
- review gate는 사용량 소모와 장기 루프 위험이 있어 기본 비활성화한다.
- review gate는 카이란이 명시적으로 요청하고 세션을 모니터링할 수 있을 때만 활성화한다.

## 충돌 방지 및 커밋 권한

- 기본 커밋은 X(Claude Code)가 한다. 단, 카이란이 루멘 주도 개발을 선언했거나 X가 토큰 제한으로 멈춘 기간에는 루멘이 커밋까지 정리할 수 있다.
- 루멘 rescue가 패치를 만든 경우 리뷰 파일이나 daily log에 `FIXED by X (commit <hash>)` 또는 `FIXED by Lumen rescue, committed by X (commit <hash>, Kaiyan approved)`처럼 주체와 승인 경로를 남긴다.
- 커밋 메시지는 가능하면 `docs(X):`, `fix(X):`, `fix(lumen-rescue):`처럼 주체를 드러낸다. git author가 동일하므로 메시지와 daily log가 감사 추적 수단이다.
- X와 루멘은 같은 파일을 동시에 수정하지 않는다.
- 루멘은 기본적으로 review-only로 시작한다.
- 루멘이 직접 수정하는 rescue는 카이란이 명시했을 때만 수행한다.
- rescue 전에는 반드시 `git status --short --untracked-files=all`로 변경 묶음을 확인한다.
- unrelated 변경은 되돌리지 않는다.
- 기능 작업은 가능하면 `codex/` 또는 기능명 브랜치에서 분리한다.

## 네이밍 규칙

- `AGENTS.md`: Codex가 읽는 프로젝트 지시서. 파일명 고정.
- `CLAUDE.md`: Claude Code가 읽는 프로젝트 지시서. 파일명 고정.
- `persona`: X, V, 지니, 루멘처럼 역할과 정체성이 있는 협업 주체.
- `skill`: 반복 가능한 작업 절차나 자동화 지식.
- `rule`: 프로젝트에서 반드시 지킬 규칙.
- `memory`: 장기 결정, 전략, 사용자 선호.
- `review`: V나 루멘이 남긴 검증 결과.
- `tooling`: `.codex`, `.claude`, MCP, hook 같은 런타임 설정.

`.agents/skills` 같은 기존 로더 경로는 도구 관례일 수 있으므로 임의로 이름을 바꾸지 않는다. 의미 혼동은 문서와 규칙으로 해소한다.

## Handoff 템플릿

### 루멘 리뷰 요청 파일

```md
## YYYY-MM-DD X -> 루멘
- 작업:
- 변경 파일:
- 검증:
- 우려 지점:
- 요청:
```

### 루멘 리뷰 결과 파일

```md
## YYYY-MM-DD 루멘 -> X
- 리뷰 범위:
- 결론:
- 수정 필요:
- 보류 가능:
- 다음 액션:
```

### 지니 운영 채널 메시지

```md
## YYYY-MM-DD X/루멘 -> 지니
- 현재 상태:
- 남은 작업:
- 건드리면 안 되는 파일:
- 다음에 먼저 볼 파일:
```

### Daily log 항목

```md
## HH:MM 주체
- 작업:
- 변경 파일:
- 검증:
- 판단:
- 다음:
```
