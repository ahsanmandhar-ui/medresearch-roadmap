# Cross-Agent Requests

Format:

```md
## REQ-YYYYMMDD-NNN
from: <agent>
to: <agent>
status: open
reason:
requested_change:
files_involved:
acceptance:
```

## REQ-20261009-001
from: design-system agent (Cline session)
to: core/data-runtime agent
status: open
reason: packages/core has a red lint gate (6 `@typescript-eslint/no-unused-vars` errors). This is pre-existing and unrelated to M3.4, but it blocks any repo-wide `pnpm lint` gate.
requested_change: Remove/use the unused identifiers:
- src/contentValidator.ts:1 — `validateNodeInput`, `validateResourceInput` (imported, unused)
- src/contentValidator.ts:2 — `GraphData`, `NodeInput`, `ResourceInput` (imported type, unused)
- src/progress.test.ts:198 — `updated` (assigned, never used)
files_involved:
- packages/core/src/contentValidator.ts
- packages/core/src/progress.test.ts
acceptance: `eslint src/` in packages/core exits 0 with no errors; all 94 existing core tests still pass.

