# OpenCode Workflow

## Session 1
Run `prompts/01-requirements.prompt.md`.

## Session 2
Run `prompts/02-plan.prompt.md`.

## Session 3 onward
Run `prompts/03-next-slice.prompt.md`.

## New chat after every slice

This is intentional. The repository, not the conversation, stores state.

## If a user changes scope

Do not immediately code.

1. update REQUIREMENTS;
2. update PLAN;
3. record the decision;
4. reset `next` if necessary;
5. execute one new slice.

## If a slice is blocked

Use `docs/BLOCKERS.md`.

Never leave the next agent with only a conversational explanation.
