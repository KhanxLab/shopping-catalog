# Orchestration — main session + subagents

These rules are for the main session. If you are a subagent, ignore this section and follow your
own prompt.

## Standing authorization

This file is my durable request to use the subagents below whenever the triage calls for them;
don't ask again. When the triage says the task is simple, don't spawn any: every subagent starts
cold and costs tokens.

## Triage first

Classify each request before acting and pick the lightest level that is still safe. If the work
turns out bigger than it looked, re-classify and switch to the orchestrated flow.

**Direct — you do it yourself** (delegating only bulky lookups, see below). Location known or found in a couple of searches, about 1–3
files, low risk. Examples: change a button color or a text, fix a typo, rename, tweak config, a
small bug with an obvious cause, a question about code you can read quickly. Make the change, run
the relevant check, answer.

**Orchestrated — use the agents.** Any of:
- a new feature, or a bug whose cause is unknown;
- discovery across an unfamiliar area, more than ~3 files, or more than one module;
- a public API/contract, DB schema, migration, auth/permissions, concurrency or money change;
- the user cites a reference implementation (V2, legacy, backend, another repo or module);
- the user asks for a plan, tests or a review.

Flow (skip any step whose answer you already have):
1. Investigate: `Explore` to locate code, `researcher` to understand a reference, a contract or
   docs. Launch independent ones in the same message so they run in parallel.
2. Plan: write it yourself — you have the context. Ask the user only for decisions they must make.
3. Implement: `implementer` with the plan. Review fixes under ~10 lines you make yourself.
4. Review: `reviewer` on the real diff.
5. Validate: `validator` runs the checks and verifies the original requirement. Fail → fix →
   validate again. After 3 failed cycles, stop and report the blocker with evidence.

A pure question ("how does X work?") needs at most `Explore`/`researcher`, never the pipeline.

## Main context: delegate by judgment

You are the brain of the work and can do anything yourself; nothing here forbids it. The aim is
that this conversation's context doesn't fill with material you only needed once: everything here
is re-sent on every later turn, and sessions that grow past ~200k tokens burn usage fast.

Before a step, ask: will its raw output (file contents, search hits, logs, test runs) be useful
here in later turns, or do I only need the conclusion?
- Only the conclusion, and getting it is bulky — many files to read, a broad search, a PR that
  spans many files, long test/build output → delegate to `Explore`, `researcher` or `validator`
  and keep their summary. This applies to direct tasks too.
- You need the detail to reason or edit, or it's quick (a few reads, a targeted grep) → do it
  here; a subagent's cold start would cost more than it saves.
- When reading here, prefer line ranges and targeted greps over whole large files, and trim long
  command output.
- If an unrelated task arrives in an already long conversation, suggest `/clear` or a new session.

## Agents

| Agent | Model | Use for |
|---|---|---|
| `Explore` | Haiku | Locate files, symbols, call chains (read-only) |
| `researcher` | Sonnet | How an existing implementation, contract or doc works (read-only, web) |
| `implementer` | Sonnet | Write the code from the approved plan |
| `reviewer` | Opus | Independent review of the diff (read-only) |
| `validator` | Sonnet | Tests/lint/typecheck/build + acceptance criteria |

Prefer these over `general-purpose` (which runs on Sonnet via `CLAUDE_CODE_SUBAGENT_MODEL`).
Don't use `reviewer` for work you or a cheaper agent can do.

## Effort

Frontmatter sets each agent's default (`medium`). You may pass `effort: high` to `researcher`,
`implementer` or `validator` for complex or high-risk work. Never `low`, `xhigh` or `max`, and
never raise `reviewer`.

## Delegation prompts

Subagents see nothing of this conversation. Include: the original requirement (quote it when
precision matters), scope in/out, paths and facts already established, the expected deliverable.
For `implementer`, also the plan, the files to touch and the project rules that apply.

Never run two writing agents on the same files at once.

## Verify what workers deliver

A subagent's report is a claim, not proof. When a worker finishes — especially `implementer` —
you check the real result against what the user asked before moving on or answering:
- Turn the original request into a short checklist and confirm each item in the actual changes
  (`git diff --stat`, then the relevant hunks), not in the report.
- Confirm nothing out of scope was touched and that the checks it says it ran really passed.
- For a large diff, let `reviewer`/`validator` do the detailed pass, then check their verdict
  against your checklist; you still decide if the request is met.
- Anything missing or wrong goes back to the worker (or you fix it if small) and is re-checked.
  Never report done on the worker's word alone.

For investigation agents, treat findings as leads: verify what the implementation depends on, and
read the code yourself when two agents disagree.

## Ponytail

Ponytail applies at every level: the smallest complete change. Pass that rule on to `implementer`.

## Final answer

What was done, files changed, checks run and their results, review findings and how each was
handled, anything open or out of scope.

## Git Commits — No Co-Authorship

Never add co-authorship attribution lines (`Co-Authored-By:`, Claude-Session, etc.) to git commits,
regardless of project or context. Write clear, descriptive commit messages without these lines.
This applies globally across all repositories.
