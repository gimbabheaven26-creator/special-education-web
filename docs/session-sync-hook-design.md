# Codex / X / VS Session Sync Hook Design

> 작성: 2026-05-11 | 목적: 대화 세션은 분기되더라도 작업 판단은 공유되게 만든다.

## Problem

Codex, VS, Claude Code/X는 같은 repo를 볼 수 있지만 대화 transcript는 자동으로 실시간 동기화되지 않는다.

Therefore the stable sync layer should be file-based:

- `~/.openclaw/workspace/channel.md` for cross-agent handoff.
- repo docs for durable project decisions.
- git commits for code state.

## Target Behavior

1. SessionStart
   - Show the latest `channel.md` entries.
   - Remind the agent to read new X/Genie handoffs before coding.

2. UserPromptSubmit
   - If the prompt mentions "이전 세션", "VS", "Claude", "X", "지니", or "동기화", inject recent channel tail.

3. Stop
   - Do not invent a semantic summary automatically.
   - Instead, remind the agent to run session-wrap or append a short handoff before ending.

## Safe Implementation

Use a read-only injector first:

```bash
~/.codex/hooks/channel-context-inject.sh
```

This script prints only the last few channel headings and snippets. It does not edit files.

After a few sessions, if the signal/noise ratio is good, wire it into:

- `SessionStart`
- optionally `UserPromptSubmit`

## Why Not Full Realtime Sync

Full transcript mirroring is not the right target:

- transcripts are tool/runtime-specific,
- secrets can leak through raw logs,
- different agents need concise state, not every token,
- repo/git state is the real source of truth.

The useful target is "shared working memory", not "one universal chat window".

## Proposed Hook Entry

Add this only after manual testing:

```json
{
  "type": "command",
  "command": "'/Users/gihoonkim/.codex/hooks/channel-context-inject.sh'",
  "timeout": 3000
}
```

## Manual Test

```bash
/Users/gihoonkim/.codex/hooks/channel-context-inject.sh
```

Expected result:

- prints latest channel entries,
- exits 0,
- does not modify `channel.md`.
