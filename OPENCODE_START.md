# OpenCode Start Contract

You are the lead implementation agent for the Research Roadmap project.

## First action

Read, in this order:

1. `AGENTS.md`
2. `docs/STATE.md`
3. `docs/REQUIREMENTS.md`
4. `docs/ARCHITECTURE.md`
5. `docs/PLAN.md` only as needed for the current `next` slice

Do not read the entire repository unless the current slice requires it.

## Mandatory requirement gate

Before writing application code, inspect `docs/REQUIREMENTS.md`.

If any requirement required by the current slice is marked `UNKNOWN`, `NEEDS_USER_INPUT`, or `UNDECIDED`, ask the user the minimum necessary questions and stop.

Do NOT:
- guess the missing answer;
- replace a missing URL with a guessed URL;
- choose a brand name when the user has not chosen one;
- populate resources from memory;
- silently change scope.

Questions should be grouped into one concise checklist.

## Session isolation

Every OpenCode session is stateless except for repository files.

`docs/STATE.md` is the authoritative handoff state.

At the beginning:
- read STATE;
- identify `current`, `status`, and `next`;
- inspect only files needed for that slice.

At the end:
- update STATE;
- write a concise slice report;
- record decisions and unresolved questions;
- never rely on the chat transcript for future work.

## Execution rule

Do exactly one slice per session unless the user explicitly requests otherwise.

If the slice is too large, split it before coding.

Do not start a later slice merely because the current slice finished early.

## Completion

A slice is complete only when its acceptance check and required gates pass.

If a gate fails:
1. read only the first useful error;
2. make one targeted fix;
3. rerun;
4. if it fails again, bisect the slice;
5. after maximum split depth, write `docs/BLOCKERS.md` and stop.

Do not hide errors or bypass gates.
