# OpenCode — Resume From State

This is a fresh session.

Read only:
- AGENTS.md
- docs/STATE.md

Then inspect the current `next` slice in docs/PLAN.md.

Do not ask the user to repeat previous chat context.

If STATE contains an unresolved user decision, ask only that question.

Otherwise continue exactly from `next`.
