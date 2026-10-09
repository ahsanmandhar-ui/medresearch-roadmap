# Blockers

## B001 — pnpm workspace binaries not linked

- **Slice:** M1.3 schema-package
- **First error:** `pnpm install` completes without error but `node_modules/.bin/tsc` and `node_modules/.bin/vitest` are not available in workspace packages
- **Reproduction:** `pnpm --filter @research-roadmap/schema typecheck` times out; `pnpm --filter @research-roadmap/schema exec vitest run` produces no output
- **Attempted fixes:** Re-ran `pnpm install` multiple times; tried direct `npx tsc` (installs wrong package); tried `node_modules/.bin/tsc.cmd` (not found)
- **Root cause:** pnpm was installed via `npm install -g pnpm` with install scripts blocked (`allowScripts` not set). The pnpm binary works for `install` but workspace linking may be incomplete.
- **Current state:** Schema package code is written but cannot be typechecked or tested in this environment
- **Resolution:** Fixed 2026-10-09 — reinstalled pnpm with `npm config set allow-scripts pnpm --location=user` + `npm install -g pnpm`, then `pnpm install` linked all workspace binaries.

No active blockers.
