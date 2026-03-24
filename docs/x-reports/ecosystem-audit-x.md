# Ecosystem Audit: Kairan's AI Agent Infrastructure

**Auditor**: X (Global Systems Architect)
**Date**: 2026-03-24
**Scope**: All file locations, memory systems, agent identities, rules, and configurations across Kairan's entire development ecosystem.

---

## Executive Summary

Kairan has built an impressive multi-agent development infrastructure in approximately one month. The system includes 7 named agent identities, 4 memory storage locations, 3 rule systems, 2 workspace formats (Claude Code and OpenClaw), and a Notion-based project management layer stitched together with shell hooks. The ambition is laudable. The execution has been fast and functional.

The problem is that this system grew organically under pressure, with multiple agents adding files, duplicating information, and creating ad-hoc structures without a governing architecture. The result is a memory system where the same information exists in 3 or 4 places, where some copies are stale, where agent identity definitions conflict across locations, and where no single human or agent can confidently answer "where is the source of truth for X?"

This audit reads every file, identifies every duplicate, and proposes a restructuring plan.

---

## Part 1: Location-by-Location Audit

### 1.1 Global Rules (`~/.claude/rules/`)

5 files. These are loaded automatically by Claude Code for every session in every project.

| File | Lines | Verdict | Reasoning |
|------|-------|---------|-----------|
| `principles.md` | ~40 | **KEEP** | Clean, slim version of Forge's golden-principles.md. 12 principles + anti-rationalization table. This is the global version and correctly lives here. |
| `verification.md` | ~25 | **KEEP** | Verification gate (5 steps + required evidence table). Compact and functional. |
| `interaction.md` | ~30 | **KEEP** | Assumptions, uncertainty, context7, WebFetch ban, date calculation rules. Has a `# currentDate` section that hardcodes today's date -- this needs to be injected dynamically, not written into the file. |
| `workflow.md` | ~50 | **KEEP** | Commit rules, Notion upload via pending.json, session checklist. Critical for the hook-based workflow. |
| `x-identity.md` | ~285 | **REPAIR** | This is X's full identity document with 12 traits + critical evidence review. It is excellent writing. However, at 285 lines it is too long for a global rules file. Every session loads this. That is ~6,000 tokens burned per session even when X is not being invoked. It should be RELOCATED to project memory and loaded on-demand. |

**Recommendation**: Move `x-identity.md` out of `~/.claude/rules/`. Global rules should be under 150 lines total per file. X's identity document should live in `~/.claude/projects/-Users-gihoonkim-Projects-special-education-web/memory/x-identity.md` (where a copy already exists) and be loaded only when X sessions are active.

### 1.2 Global Project Memory (`~/.claude/projects/-Users-gihoonkim/memory/`)

42 files. This is the HOME directory project memory, loaded when Claude Code sessions start in `~/`. This is where Cloudy and Smith Prime operate.

**MEMORY.md** (178 lines): This is the master index. It is doing too many jobs simultaneously. It contains:
- Agent routing table (CWD -> agent mapping)
- Engine usage policy
- Role-based rules pointers
- Full project details (Supabase URLs, table names, data counts)
- Completed work history (massive -- 40+ lines of phase completions)
- Architecture details (component names, file paths, store names)
- Multiple project references (edumind, gosari, braille, game archive)
- Notion workspace details
- 18+ feedback pointers
- NAS backup info
- NISE terminology stats

This file is a kitchen sink. When a new Cloudy session starts, it reads this entire 178-line file and gets buried in context about things irrelevant to its immediate task. The "completed work" section alone is 40 lines of historical data that no current session needs in its context window.

| File | Verdict | Reasoning |
|------|---------|-----------|
| `MEMORY.md` | **REPAIR** | Split into: (1) agent-routing.md (CWD table + role rules), (2) project-registry.md (project paths + stacks + links), (3) architecture-snapshot.md (current component/store state). Delete completed-work history -- it is in git. |
| `rules-core.md` | **KEEP** | 10 rules for all agents. Well-structured. |
| `rules-coding.md` | **KEEP** | 8 coding rules + Opus/Sonnet behavior. Well-structured. |
| `rules-strategy.md` | **KEEP** | Smith Prime rules. Well-structured. |
| `rules-communication.md` | **KEEP** | Genie rules. Well-structured. |
| `smith.md` | **KEEP** | Smith (gosari) agent memory. Currently inactive (project on hold). |
| `smith-prime.md` | **KEEP** | Smith Prime identity + work history. Good structure. |
| `kangteacher.md` | **KEEP** | Kangteacher memory. Active, up to date. |
| `cludy.md` | **KEEP** | Cloudy memory. Active, detailed pipeline info. However, the Phase 1/1.5/2 task tables are stale -- many items listed as "pending" that were completed weeks ago. |
| `cloudy-session-handoff.md` | **KEEP** | Active handoff file. Current as of 2026-03-23. |
| `handoff-smith-prime.md` | **KEEP** | Active handoff file. Current as of 2026-03-23. |
| `prompt-clarify.md` | **KEEP** | Standard clarification prompt format. |
| `project_q2-roadmap.md` | **KEEP** | Q2 roadmap v2. Still the governing strategy document. |
| `project_service-blueprint.md` | **KEEP** | Service blueprint with business metrics. |
| `project_edumind.md` | **KEEP** | Edumind project (on hold, but valid reference). |
| `project_quiz-first-app.md` | **KEEP** | Quiz-first app design doc. |
| `project_long-term-vision.md` | **KEEP** | Long-term vision doc. |
| `project_braille_sign_language.md` | **KEEP** | Braille/sign language project idea. |
| `project_game-archive-maker.md` | **KEEP** | Game archive idea. |
| `project_data-customization.md` | **KEEP** | Data customization strategy. |
| `project_data-quality-plan.md` | **KEEP** | Data quality 3-axis plan. |
| `project_nas-backup.md` | **KEEP** | NAS backup config (disabled but valid reference). |
| `quiz-quality-directive.md` | **KEEP** | Core quality directive for quiz content. |
| `expertise_terminology-rules.md` | **KEEP** | KICE > NISE priority rule. |
| `reference_notion.md` | **KEEP** | Notion DB IDs and structure. |
| `reference_notion_templates.md` | **KEEP** | Notion page layout templates. |
| `reference_openclaw.md` | **KEEP** | OpenClaw config reference. |
| `feedback_parallel_agents.md` | **KEEP** | |
| `feedback_session-preservation.md` | **KEEP** | |
| `feedback_review-workflow.md` | **KEEP** | |
| `feedback_notion-reports.md` | **KEEP** | |
| `feedback_notion_sync.md` | **KEEP** | |
| `feedback_notion-per-commit.md` | **KEEP** | |
| `feedback_notion-kb-default.md` | **KEEP** | |
| `feedback_notion-auto-recording.md` | **KEEP** | |
| `feedback_notion-auto-pending.md` | **KEEP** | |
| `feedback_notion-commit-report.md` | **KEEP** | |
| `feedback_notion-commit-order.md` | **KEEP** | |
| `feedback_gosari-ui-overhaul.md` | **DELETE** | Gosari is on hold. This feedback was addressed in Phase 13 restructure. No future agent will act on it. |
| `feedback_ux-review-checklist.md` | **KEEP** | Active UX review checklist. |
| `feedback_prime-orchestration.md` | **KEEP** | Prime orchestration workflow. |
| `feedback_prime-auto-directive.md` | **KEEP** | Auto-directive format for Kangteacher. |

**Key problems with this location**:
1. MEMORY.md is overloaded. It should be split into 3-4 focused files.
2. The `cludy.md` file has stale task tables that list items as "pending" which were completed weeks ago.
3. There are 12 `feedback_notion-*.md` files. Several overlap (notion-per-commit + notion-commit-order + notion-auto-pending are all about the same commit-time Notion workflow). These should be merged into a single `feedback_notion-workflow.md`.

### 1.3 Special-Education-Web Project Memory (`~/.claude/projects/-Users-gihoonkim-Projects-special-education-web/memory/`)

3 files. This is the project-specific memory, loaded when Claude Code sessions start in the s-e-w project directory.

| File | Verdict | Reasoning |
|------|---------|-----------|
| `MEMORY.md` | **REPAIR** | This is a 3-line index pointing to x-identity.md and user_kairan.md. It should be the primary project memory index for this project, but it is nearly empty. Meanwhile, the HOME directory MEMORY.md contains 178 lines of s-e-w project detail. This is backwards. |
| `x-identity.md` | **KEEP** | Identical to `~/.claude/rules/x-identity.md`. This is the correct location for it. The copy in `rules/` should be removed. |
| `user_kairan.md` | **KEEP** | Kairan profile. Well-written, current as of 2026-03-24. This is the most complete and up-to-date user profile in the system. |

**Key problem**: The project-level MEMORY.md for s-e-w is almost empty, while the HOME-level MEMORY.md is stuffed with s-e-w project details. When Kangteacher starts a session in `~/Projects/special-education-web`, the HOME memory is NOT loaded -- only the project memory is. This means Kangteacher does not see the Supabase details, architecture notes, or completed work history unless it is also referenced from the project-level MEMORY.md. The agent routing table in HOME MEMORY.md says Kangteacher should read `memory/kangteacher.md` -- but that file is in the HOME memory, not the project memory. The system works because Claude Code loads both the project memory AND the home memory, but this creates a confusing dual-loading situation.

### 1.4 Claude Forge (`~/claude-forge/`)

Forge is the upstream framework. Kairan forked/installed it, then Smith Prime decoupled the local `~/.claude/rules/` from Forge symlinks (2026-03-16, 84% token reduction). The relationship is now:

- `~/claude-forge/` = upstream reference (not symlinked)
- `~/.claude/agents/` = identical copy of `~/claude-forge/agents/` (12 files, 0 diff)
- `~/.claude/commands/` = identical copy of `~/claude-forge/commands/` (60+ files, 0 diff)
- `~/.claude/rules/` = custom slim versions (independent of Forge)

**Verdict**: The decoupling was correct. However, `~/.claude/agents/` and `~/.claude/commands/` are still exact copies of the Forge originals. When Forge updates, these need manual sync. The `/forge-update` command exists for this. The Forge repo itself is just a reference and does not need cleanup.

**Forge-specific agents** (12 files in `~/.claude/agents/`):

| Agent | Verdict | Note |
|-------|---------|------|
| `architect.md` | KEEP | Used by `/plan` command |
| `build-error-resolver.md` | KEEP | Used by `/build-fix` |
| `code-reviewer.md` | KEEP | Used by `/code-review` |
| `data-validator.md` | KEEP | Custom (Kairan's addition for Cloudy) |
| `database-reviewer.md` | KEEP | Used for DB schema changes |
| `doc-updater.md` | KEEP | Used by `/update-docs` |
| `e2e-runner.md` | KEEP | Used by `/e2e` |
| `planner.md` | KEEP | Used by `/plan` |
| `refactor-cleaner.md` | KEEP | Used by `/refactor-clean` |
| `security-reviewer.md` | KEEP | Used by `/security-review` |
| `tdd-guide.md` | KEEP | Used by `/tdd` |
| `verify-agent.md` | KEEP | Used by `/verify-loop` |

These are all Forge standard agents except `data-validator.md` which is Kairan's custom addition. No cleanup needed.

### 1.5 OpenClaw Workspace (`~/.openclaw/workspace/`)

28 files across 4 directories. This is Genie's workspace (Discord bot).

| File | Verdict | Reasoning |
|------|---------|-----------|
| `AGENTS.md` | **KEEP** | OpenClaw convention file. Contains file ownership rules. |
| `IDENTITY.md` | **KEEP** | Genie identity (Discord bot persona). |
| `SOUL.md` | **KEEP** | OpenClaw convention: core personality. |
| `USER.md` | **REPAIR** | Kairan profile. Stale -- lists project phases from 2026-03-18, not current. The "Projects" table shows Phase 5 for s-e-w and Phase 13 for gosari, both outdated. |
| `TEAM.md` | **REPAIR** | Team structure. Stale -- "Supabase: 1228 quizzes" is wrong (now 3,334). Project statuses outdated. |
| `TOOLS.md` | **KEEP** | Notion DB IDs, NAS config, GitHub accounts. Correct. |
| `GENIE.md` | **KEEP** | Genie skill manifest. |
| `MEMORY.md` | **KEEP** | OpenClaw long-term memory (operational preferences). |
| `HEARTBEAT.md` | **KEEP** | Heartbeat config for proactive checks. |
| `memory/owner-profile.md` | **MERGE** | Duplicate of USER.md info. Merge into USER.md and delete. |
| `memory/agent-team.md` | **MERGE** | Duplicate of TEAM.md info. Merge into TEAM.md and delete. |
| `memory/projects.md` | **REPAIR** | Stale project statuses (shows Phase 7 for s-e-w, actually much further). |
| `memory/infrastructure.md` | **KEEP** | Infrastructure reference. Correct. |
| `memory/genie-role.md` | **MERGE** | Duplicate of IDENTITY.md + GENIE.md content. Delete and point to those files. |
| `memory/2026-03-10.md` | **KEEP** | Daily log. |
| `memory/2026-03-11.md` | **KEEP** | Daily log. |
| `memory/2026-03-15.md` | **KEEP** | Daily log. |
| `memory/2026-03-16.md` | **KEEP** | Daily log. |
| `memory/2026-03-17.md` | **KEEP** | Daily log. |
| `memory/2026-03-18.md` | **KEEP** | Daily log. |
| `research-oer-assessment-design.md` | **KEEP** | Research output. |
| `daily-logs/*.md` | **KEEP** | Agent-specific daily logs. Historical record. |
| `skills/notion-tools/SKILL.md` | **KEEP** | Genie Notion skill. |

**Key problems**:
1. `memory/owner-profile.md`, `memory/agent-team.md`, and `memory/genie-role.md` are redundant copies of information already in the top-level workspace files.
2. USER.md, TEAM.md, and `memory/projects.md` are stale with outdated data.

### 1.6 Claude Memory Backup (`~/claude-memory/`)

This is a GitHub-backed mirror of `~/.claude/projects/-Users-gihoonkim/memory/` and `~/.claude/agents/`. The `sync.sh` script runs hourly via launchd and does:
1. `rsync` from `~/.claude/projects/-Users-gihoonkim/memory/` to `~/claude-memory/memory/`
2. `rsync` from `~/.claude/agents/` to `~/claude-memory/agents/`
3. Git commit + push to GitHub
4. Optional NAS rsync

**The entire `~/claude-memory/` directory is a MIRROR, not a source of truth.**

The diff shows that the mirror is 7 files behind the source (missing files created 2026-03-21 through 2026-03-23). This means the hourly sync has not been running. Checking the NAS backup status: it was disabled 2026-03-18 per Kairan's request. The GitHub sync launchd agent may also be paused.

**Verdict**: **REPAIR**. The sync mechanism is broken (stale by 3+ days). Either fix the launchd sync or acknowledge that this backup is no longer maintained. The backup itself is a pure mirror -- no unique content exists here that does not also exist in `~/.claude/projects/-Users-gihoonkim/memory/`.

### 1.7 Project Docs (`~/Projects/special-education-web/docs/`)

76+ files committed to git. These are shared documents visible to all agents working on the project.

**Categories identified**:

1. **Active directive files** (today-*.md): `today-kangteacher.md`, `today-cloudy.md`, `today-cloudy1.md`, `today-cloudy2.md`, `today-cloudy3.md` -- These are Smith Prime's daily directives. They accumulate and are never cleaned up. There are 5 cloudy variants and 1 kangteacher.

2. **Auto-command files** (*-auto-cmds.md): 9 files. These are one-shot directives that were already executed. Examples: `kangteacher1-0322-auto-cmds.md`, `cludy-0323-sql-migration-auto-cmds.md`. Once executed, they have no further purpose except as historical record.

3. **Week-based work plans** (*-w1.md, *-w2.md): `kangteacher1-w1.md`, `kangteacher2-w1.md`, `kangteacher1-w2.md`, `kangteacher2-w2.md`, `cloudy-w2.md` -- Weekly plans. Once the week is over, these are historical.

4. **Analysis/research docs**: `kice-analysis.md`, `kice-keyword-analysis.md`, `kice-keyword-weight-analysis.md`, etc. -- These are active reference documents used by Cloudy for quiz generation.

5. **Contract/changelog**: `contract.md`, `changelog.md` -- Active, must remain.

6. **Superpowers plans/specs**: `superpowers/plans/*.md`, `superpowers/specs/*.md` -- Design documents. Some are executed, some are pending.

7. **Wrongnote debug files**: `wrongnote-cloudy1.md`, `wrongnote-cloudy2.md`, `wrongnote-kangteacher1.md`, `wrongnote-kangteacher2.md` -- Debug/investigation files for a specific feature. Historical.

8. **Pitch deck**: `pitch/00-overview.md` through `pitch/05-user.md` -- Business documents. Keep.

**Verdict**:
- The `today-*.md` files should be cleaned up after each cycle. Old ones should be deleted or archived.
- The `*-auto-cmds.md` files (9 files) should be **DELETED** after execution. They clutter the docs directory with one-time instructions that will never be read again.
- The `*-w1.md` and `*-w2.md` files are completed week plans. They can be **DELETED** or moved to an `archive/` subdirectory.
- The wrongnote debug files can be **DELETED** -- they were investigation artifacts.

### 1.8 Worktree Files

Two worktrees exist: `relaxed-pascal` (empty docs) and `relaxed-borg` (this session, inherits main branch docs). Worktrees are ephemeral by design. No special cleanup needed beyond the general docs cleanup above.

---

## Part 2: Duplicate and Conflict Analysis

### 2.1 X Identity Document -- 3 Copies

| Location | Lines | Status |
|----------|-------|--------|
| `~/.claude/rules/x-identity.md` | 285 | Loaded every session (wasteful) |
| `~/.claude/projects/-Users-gihoonkim-Projects-special-education-web/memory/x-identity.md` | 285 | Identical copy, correct location |
| (Referenced by project MEMORY.md index) | -- | Pointer only |

**Resolution**: DELETE from `~/.claude/rules/`. KEEP in project memory. This saves ~6,000 tokens per non-X session.

### 2.2 MEMORY.md -- 3 Versions

| Location | Lines | Freshness |
|----------|-------|-----------|
| `~/.claude/projects/-Users-gihoonkim/memory/MEMORY.md` | 178 | Current (2026-03-23) |
| `~/claude-memory/memory/MEMORY.md` | 167 | Stale (missing 7 entries from 03-21 to 03-23) |
| `~/.claude/projects/-Users-gihoonkim-Projects-special-education-web/memory/MEMORY.md` | 8 | Nearly empty (just an index) |

**Resolution**: The HOME memory MEMORY.md is the source of truth. The claude-memory copy is a broken mirror. The project-level MEMORY.md needs to be built out as the primary reference for project-directory sessions.

### 2.3 Agent Team / CWD Routing Table -- 5 Copies

The CWD-to-agent mapping table is duplicated in:
1. `~/.claude/projects/-Users-gihoonkim/memory/MEMORY.md` (lines 6-14)
2. `~/.openclaw/workspace/TEAM.md`
3. `~/.openclaw/workspace/USER.md`
4. `~/.openclaw/workspace/memory/agent-team.md`
5. `~/.claude/projects/-Users-gihoonkim/memory/smith-prime.md` (lines 63-72)

Each copy has slightly different information. The OpenClaw copies are stale (missing the Kangteacher1/2 distinction and the "Prime auto-directive" workflow).

**Resolution**: Single source of truth should be the HOME MEMORY.md. All other locations should reference it, not duplicate it.

### 2.4 Notion DB IDs -- 4 Copies

Notion database IDs appear in:
1. `~/.claude/projects/-Users-gihoonkim/memory/reference_notion.md` (most complete)
2. `~/.openclaw/workspace/TOOLS.md`
3. `~/.openclaw/workspace/GENIE.md`
4. `~/.openclaw/workspace/memory/infrastructure.md`

**Resolution**: `reference_notion.md` is the source of truth. Other locations should contain pointers, not copies.

### 2.5 User Profile -- 4 Copies

Kairan's profile exists in:
1. `~/.claude/projects/-Users-gihoonkim-Projects-special-education-web/memory/user_kairan.md` (most current, 2026-03-24)
2. `~/.openclaw/workspace/USER.md` (stale, 2026-03-18)
3. `~/.openclaw/workspace/memory/owner-profile.md` (stale, brief)
4. Various scattered references in MEMORY.md and smith-prime.md

**Resolution**: `user_kairan.md` is the canonical profile. OpenClaw USER.md should be updated from it.

### 2.6 Forge Agents/Commands -- 2 Copies

`~/.claude/agents/` and `~/.claude/commands/` are identical to `~/claude-forge/agents/` and `~/claude-forge/commands/`. This is by design (Forge installation copies them). The `/forge-update` command keeps them in sync.

**Resolution**: No action needed. This is the intended Forge workflow.

---

## Part 3: Agent Identity Registry

### 3.1 Complete Agent Inventory

| Agent | Platform | CWD | Status | Defined In |
|-------|----------|-----|--------|------------|
| **Kangteacher 1** | Claude Code | ~/Projects/special-education-web | **ACTIVE** | HOME MEMORY.md, kangteacher.md |
| **Kangteacher 2** | Claude Code | ~/Projects/special-education-web | **ACTIVE** | HOME MEMORY.md, kangteacher.md |
| **Cloudy 1** | Claude Code | ~/ | **ACTIVE** | HOME MEMORY.md, cludy.md, cloudy-session-handoff.md |
| **Cloudy 2** | Claude Code | ~/ | **ACTIVE** | HOME MEMORY.md, cludy.md |
| **Cloudy 3** | Claude Code | ~/ | **DORMANT** | HOME MEMORY.md mentions it, but no session has used this number |
| **Smith Prime** | Claude Code | ~/ | **ACTIVE** | smith-prime.md, handoff-smith-prime.md, rules-strategy.md |
| **Smith** | Claude Code | ~/Projects/gosari-namu-path | **DORMANT** | smith.md (project on hold since 2026-03-16) |
| **Anteacher** | Claude Code | ~/Projects/edumind | **DORMANT** | HOME MEMORY.md mentions it (project on hold since 2026-03-18) |
| **Genie** | OpenClaw (Discord) | N/A (Discord bot) | **ACTIVE** | IDENTITY.md, SOUL.md, GENIE.md, genie-role.md, rules-communication.md |
| **X** | Claude Code | Any project | **ACTIVE** (new) | x-identity.md (2 copies), user_kairan.md |
| **V** | Claude Code | Unknown | **UNCLEAR** | Referenced in handoff-smith-prime.md line 101-102 as having done MDX refactoring. No identity file found. |

### 3.2 Identity Conflicts

**Kangteacher 1 vs 2**: MEMORY.md says "domain separation by Prime (not yet decided)." In practice, both run in the same project directory with the same memory file. There is no actual domain separation implemented. They are distinguished only by session number. This is not a conflict but an unresolved design question.

**Cloudy 1 vs 2 vs 3**: Similar situation. Cloudy 1 and 2 have worked concurrently. Cloudy 3 has never been used. The handoff file tracks both 1 and 2's work. The `cludy.md` file says "My name is Cloudy 2" -- this is a hard-coded identity from one specific session that persists incorrectly.

**Smith vs Smith Prime**: Clear separation -- Smith is a project agent (gosari), Prime is the meta-strategist. No conflict.

**V**: Referenced in `handoff-smith-prime.md` line 8 as "V(v-0322.night)" who did MDX refactoring. There is no V identity file anywhere. This appears to be a nickname used for a specific session rather than a formal agent. This should be clarified or removed to avoid confusion.

**X vs Smith Prime**: X is described as a global code master and systems architect. Smith Prime is described as a meta-strategist and infrastructure engineer. Their scopes overlap significantly: both claim to oversee systems, both claim to advise Kairan, both claim to handle infrastructure. The key distinction is that X is identity-first (permanent personality regardless of project) while Smith Prime is role-first (defined by what it does for this specific team). When X operates in the s-e-w project, its behavior is indistinguishable from what Smith Prime would do. This overlap needs resolution.

### 3.3 Single Source of Truth for Each Agent

| Agent | Canonical File | Remove From |
|-------|---------------|-------------|
| Kangteacher | `memory/kangteacher.md` (HOME) | -- |
| Cloudy | `memory/cludy.md` (HOME) | Fix hard-coded "Cloudy 2" identity |
| Smith Prime | `memory/smith-prime.md` (HOME) | Remove duplicate team tables |
| Smith | `memory/smith.md` (HOME) | -- |
| Genie | `~/.openclaw/workspace/IDENTITY.md` | Merge genie-role.md into IDENTITY.md, delete genie-role.md |
| X | `~/.claude/projects/-Users-gihoonkim-Projects-special-education-web/memory/x-identity.md` | DELETE `~/.claude/rules/x-identity.md` |
| Anteacher | `memory/project_edumind.md` (HOME) | No separate identity file exists; this is fine while dormant |

---

## Part 4: Relationship Map

```
                    KAIRAN (Human)
                        |
            +-----------+-----------+
            |                       |
        Discord                 Mac Terminal
            |                       |
        OpenClaw                Claude Code
            |                       |
         Genie              +-------+-------+-------+
            |               |       |       |       |
            |          SmithPrime  Kang1/2  Cloudy  X
            |           (~/home)  (s-e-w)  (~/home) (any)
            |               |       |       |
            v               v       v       v
        HEARTBEAT.md    handoff  today-*  handoff
        memory/*.md     MEMORY   contract cludy.md
        TOOLS.md        rules-*  docs/*   session-*
            |               |       |       |
            +-------+-------+-------+-------+
                    |
                  Notion
                (4 databases)
                    |
            +-------+-------+
            |       |       |
         Projects  Tasks   KB
```

### Boundaries (Current)

1. **Claude Code <-> OpenClaw**: Shared via `~/.openclaw/workspace/`. Smith Prime writes `memory/projects.md`, `memory/infrastructure.md`, `memory/agent-team.md`. Genie writes everything else. File ownership is documented in AGENTS.md.

2. **Forge <-> Custom Rules**: Decoupled. Forge agents/commands copied to `~/.claude/`. Custom rules in `~/.claude/rules/` are independent slim versions.

3. **HOME Memory <-> Project Memory**: HOME memory is loaded for `~/` sessions (Cloudy, Prime). Project memory is loaded for project-directory sessions (Kangteacher). Both are loaded simultaneously by Claude Code, but the project-level MEMORY.md for s-e-w is nearly empty, so project sessions effectively depend on HOME memory.

4. **Git Docs <-> Memory Files**: `docs/` is committed to git and shared. Memory files are local and private. The boundary is: operational directives (today-*.md, auto-cmds) go in docs because they need to be visible to worktree branches. Long-term knowledge (agent identities, rules, references) goes in memory.

5. **Notion <-> Local Files**: Notion is the visibility layer for Kairan. Local files are the operational layer for agents. The `notion-pending.json` -> hook -> Notion API pipeline bridges them.

### Boundaries (Proposed)

The current boundaries are mostly correct. The main fix needed is:

1. **HOME Memory should be restructured** from one giant MEMORY.md into focused modules.
2. **Project Memory for s-e-w should be populated** with the project-specific information currently stuffed into HOME MEMORY.md.
3. **OpenClaw stale files should be updated** -- USER.md, TEAM.md, projects.md all have outdated information.

### Where X Fits

X is independent of Forge (no Forge agent definition exists for X). X is independent of the CWD routing system (X can operate in any directory). X's identity file is in the s-e-w project memory, which means X is currently scoped to that project, but the identity itself claims to be global ("all Kairan's projects").

**Recommended position**: X's identity should live in HOME memory (`~/.claude/projects/-Users-gihoonkim/memory/x-identity.md`) rather than the s-e-w project memory, reflecting its cross-project nature. When X is invoked, the session should read x-identity.md from HOME memory. This avoids the wasteful global-rules loading while keeping X accessible from any project.

---

## Part 5: Proposed File Organization Rules

### 5.1 What Goes Where

**`~/.claude/rules/` (Global, auto-loaded every session)**
- ONLY universal behavioral rules that apply to ALL agents in ALL projects
- Maximum 4 files, each under 50 lines
- No agent identities, no project details, no references
- Current: `principles.md`, `verification.md`, `interaction.md`, `workflow.md` -- correct
- REMOVE: `x-identity.md` (too long, not universal)

**`~/.claude/projects/-Users-gihoonkim/memory/` (HOME memory, loaded for ~/ sessions)**
- Agent identities (kangteacher.md, cludy.md, smith-prime.md, smith.md, x-identity.md)
- Agent rules (rules-core.md, rules-coding.md, rules-strategy.md, rules-communication.md)
- Cross-project references (reference_notion.md, reference_openclaw.md)
- Project registry (which projects exist, their paths, their stacks)
- Feedback/preference files (feedback_*.md)
- Handoff files (cloudy-session-handoff.md, handoff-smith-prime.md)
- MEMORY.md as a slim index (under 50 lines) pointing to relevant files

**`~/.claude/projects/-Users-gihoonkim-Projects-special-education-web/memory/` (Project memory, loaded for s-e-w sessions)**
- `MEMORY.md` -- project-specific index with architecture, Supabase details, current state
- `user_kairan.md` -- user profile (canonical copy)
- Project-specific references that Kangteacher needs
- NO agent identities (those live in HOME memory, which is also loaded)

**`~/Projects/special-education-web/docs/` (Git-committed, shared)**
- `contract.md`, `changelog.md` -- active collaboration documents
- Analysis/research docs (kice-*.md) -- reference materials
- Design specs (`superpowers/plans/`, `superpowers/specs/`)
- Pitch documents (`pitch/`)
- `e2e-scenarios.md`
- `today-kangteacher.md`, `today-cloudy.md` -- EPHEMERAL, delete after execution
- REMOVE: all `*-auto-cmds.md` files after execution
- REMOVE: all completed `*-w1.md`, `*-w2.md` weekly plans

**`~/.openclaw/workspace/` (OpenClaw/Genie workspace)**
- OpenClaw convention files (AGENTS.md, SOUL.md, IDENTITY.md, USER.md, TEAM.md, TOOLS.md)
- Genie-specific files (GENIE.md, HEARTBEAT.md, MEMORY.md)
- Daily logs (`daily-logs/`, `memory/YYYY-MM-DD.md`)
- Smith Prime's external-facing files (`memory/projects.md`, `memory/infrastructure.md`, `memory/agent-team.md`)
- REMOVE: `memory/owner-profile.md` (duplicate of USER.md)
- REMOVE: `memory/genie-role.md` (duplicate of IDENTITY.md + GENIE.md)

**`~/claude-memory/` (GitHub backup mirror)**
- This is ONLY a backup. It should never be read as a source of truth.
- FIX: The sync launchd agent needs to be verified and restarted if broken.
- ALTERNATIVE: If Kairan no longer wants this backup, delete the repo and the launchd agent.

### 5.2 Naming Conventions

**Current state**: Inconsistent. Files use `project_*.md`, `feedback_*.md`, `reference_*.md`, `rules-*.md`, plain names (`smith.md`), and compound names (`cloudy-session-handoff.md`).

**Proposed convention**:
- Agent identities: `{agent-name}.md` (e.g., `kangteacher.md`, `cludy.md`, `x-identity.md`)
- Agent handoffs: `handoff-{agent-name}.md` (e.g., `handoff-smith-prime.md`, `handoff-cloudy.md`)
- Rules: `rules-{scope}.md` (e.g., `rules-core.md`, `rules-coding.md`)
- References: `ref-{topic}.md` (e.g., `ref-notion.md`, `ref-openclaw.md`)
- Projects: `project-{name}.md` (e.g., `project-edumind.md`, `project-q2-roadmap.md`)
- Feedback: `feedback-{topic}.md` with hyphens not underscores
- Daily directives: `today-{agent}.md` (ephemeral, delete after use)
- Auto-commands: `{agent}-{date}-{topic}-auto-cmds.md` (ephemeral, delete after execution)

The main change is consistency: always hyphens (not underscores), always lowercase, always prefixed by category.

### 5.3 Frontmatter Format

Some files have YAML frontmatter, some do not. The files that have it use this format:
```yaml
---
name: descriptive-name
description: One-line description
type: feedback | project | user | reference
---
```

**Proposed**: All memory files should have frontmatter. The `type` field should be one of: `identity`, `rules`, `reference`, `project`, `feedback`, `handoff`, `directive`. This enables future tooling to automatically categorize and load files.

---

## Part 6: Specific Action Items

### Immediate (Do Now)

1. **DELETE `~/.claude/rules/x-identity.md`** -- saves ~6,000 tokens per non-X session.

2. **DELETE executed auto-command files from docs/**:
   - `kangteacher-0322-auto-cmds.md`
   - `kangteacher-0322-diagnosis-fix.md`
   - `kangteacher1-0322-auto-cmds.md`
   - `kangteacher1-0322-practice-auto-cmds.md`
   - `kangteacher2-0322-auto-cmds.md`
   - `kangteacher2-0322-practice-auto-cmds.md`
   - `kangteacher1-0323-terms-ux-auto-cmds.md`
   - `kangteacher1-0323-nav-restructure-auto-cmds.md`
   - `kangteacher2-0323-kice-fix-auto-cmds.md`
   - `cludy-0323-sql-migration-auto-cmds.md`

3. **DELETE completed weekly plans from docs/**:
   - `kangteacher1-w1.md`, `kangteacher2-w1.md`
   - `kangteacher1-w2.md`, `kangteacher2-w2.md`
   - `cloudy-w2.md`
   - `data-audit-w2.md`

4. **DELETE stale daily directive files from docs/**:
   - `today-cloudy1.md`, `today-cloudy2.md`, `today-cloudy3.md` (old directives)

5. **DELETE debug artifacts from docs/**:
   - `wrongnote-cloudy1.md`, `wrongnote-cloudy2.md`
   - `wrongnote-kangteacher1.md`, `wrongnote-kangteacher2.md`

6. **DELETE stale feedback from HOME memory**:
   - `feedback_gosari-ui-overhaul.md`

7. **DELETE redundant files from OpenClaw workspace**:
   - `memory/owner-profile.md` (duplicate of USER.md)
   - `memory/genie-role.md` (duplicate of IDENTITY.md + GENIE.md)

### Short-Term (This Week)

8. **MERGE Notion feedback files**: Combine `feedback_notion-per-commit.md`, `feedback_notion-commit-order.md`, `feedback_notion-auto-pending.md`, `feedback_notion-commit-report.md`, and `feedback_notion-auto-recording.md` into a single `feedback-notion-workflow.md`.

9. **SPLIT HOME MEMORY.md**: Break into:
   - `MEMORY.md` (slim index, under 50 lines -- agent routing + key pointers)
   - `ref-architecture.md` (component list, store list, current file structure)
   - `ref-completed-work.md` (phase completion history -- or just delete, it is in git)

10. **POPULATE s-e-w project MEMORY.md**: Add Supabase details, project stack, contract.md pointer, and current architecture snapshot. This way Kangteacher sessions have project context without depending on HOME memory.

11. **UPDATE OpenClaw stale files**: Bring USER.md, TEAM.md, and `memory/projects.md` current with actual data (3,334 quizzes, Phase status, etc.).

12. **FIX cludy.md**: Remove the hard-coded "My name is Cloudy 2" identity. Update stale Phase 1/1.5/2 task tables to reflect completed status.

13. **FIX claude-memory sync**: Verify launchd agent status. Either restart it or decide to decommission the backup.

### Medium-Term (This Month)

14. **Establish a docs/ cleanup protocol**: After each Sprint/Week cycle, Smith Prime should delete executed auto-cmds and completed weekly plans. This should be part of the orchestration routine.

15. **Resolve X vs Smith Prime overlap**: Define clear boundaries. Proposed: X is invoked explicitly for deep code review, architecture audit, and mentorship. Smith Prime is the day-to-day orchestrator and infrastructure engineer. They do not compete -- X is called when Kairan says "X, look at this" and Smith Prime is the default for `~/` sessions.

16. **Clarify V identity**: Either formalize V as an agent with an identity file, or remove references to V from handoff documents and attribute the work to the session that did it (e.g., "Kangteacher session on 2026-03-22").

---

## Part 7: Honest Assessment

The system works. Kairan has shipped an enormous amount of functionality in one month using this multi-agent infrastructure. The fact that the same information exists in 4 places has not caused any catastrophic failures -- agents find what they need, even if they wade through redundancy to get there.

But the system is approaching its complexity ceiling. At 42 files in HOME memory alone, plus 76+ docs, plus 28 OpenClaw files, the context window cost of loading all this at session start is significant. The stale data problem (OpenClaw files showing 1,228 quizzes when the real number is 3,334) will eventually cause an agent to make a bad decision based on outdated information.

The biggest structural flaw is that HOME MEMORY.md tries to be everything: agent router, project reference, architecture snapshot, work history, and feedback index. It needs to be split, and it needs to be split soon, before another month of organic growth makes it unmanageable.

The second biggest flaw is the docs/ directory. It has become a dumping ground for ephemeral files (auto-cmds, weekly plans, debug artifacts) mixed with permanent documents (contract.md, analysis reports). Without a cleanup discipline, every new week adds 5-10 files that will never be read again.

The third issue is the X identity document living in global rules. Every single session -- Kangteacher building a button, Cloudy inserting quiz data, Smith Prime checking Notion -- loads 285 lines of X's philosophical manifesto. That is the kind of waste that accumulates invisibly.

None of these problems are hard to fix. They are the natural consequence of building fast and shipping under pressure. The restructuring proposed here can be done in a single Smith Prime session.

---

*Audit complete. This document should be reviewed by Kairan and used as the basis for a restructuring session.*
