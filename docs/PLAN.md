# Implementation Plan

## S0 — Requirements and discovery

### S0.1 Requirements interview
Files:
- docs/REQUIREMENTS.md
- docs/STATE.md

Acceptance:
All production-blocking `NEEDS_USER_INPUT` fields are resolved or explicitly deferred.

### S0.2 Content taxonomy
Files:
- docs/RESEARCH_TAXONOMY.md
- docs/STATE.md

Acceptance:
Node taxonomy and progression are approved before resource collection.

### S0.3 Resource discovery specification
Files:
- docs/RESOURCE_REVIEW.md
- docs/CONTENT_RULES.md

Acceptance:
Verification workflow is fixed before importing external URLs.

## M1 — Foundation

M1.1 monorepo/package scaffolding
M1.2 TypeScript/lint/test/build
M1.3 schema package
M1.4 content validator
M1.5 CI

## M2 — Research graph

M2.1 graph data loader
M2.2 node rendering
M2.3 graph edges
M2.4 camera/focus
M2.5 search
M2.6 checkpoints/progress

## M3 — Visual system

M3.1 theme tokens
M3.2 node visual treatment
M3.3 responsive layout
M3.4 accessibility
M3.5 performance

## M4 — Resource experience

M4.1 sidebar/data section
M4.2 resource cards
M4.3 YouTube embed
M4.4 GitHub repo viewer
M4.5 web embed verification
M4.6 software/guide viewer

## M5 — Floating window system

M5.1 pure layout solver
M5.2 floating state machine
M5.3 drag/resize
M5.4 minimize/restore
M5.5 pane stacking
M5.6 camera insets
M5.7 window-manager store (useWindowManager: raise/paint-order/cascade/minimize-bar docking + open/close/minimize/restore via reduceWindow; renders panes via FloatingWindow + MinimizedBar; consumes M5.6 camera insets with the live camera + window set — added per STATE plan-vs-state drift, 2026-10-09)
M5.8 focus restoration (M3.4b: restore focus to the opener when a floating window closes, ARCHITECTURE §5 — coupled to M5.7 which owns open/close; added per STATE plan-vs-state drift, 2026-10-09)

## M6 — Local persistence/PWA

M6.1 IndexedDB (DONE — delivered the pure/DOM-free versioned key-value primitive `packages/persistence/src/keyValueStore.ts` with an injected backend driver + migration planner; the real browser IndexedDB driver was split out to M6.2b below)
M6.2 notes/assets (DONE — split into two sub-slices:)
  M6.2a pure notes + asset-reference store (DONE — `notesStore.ts` on the M6.1 primitive, memory-driver tested, user-local)
  M6.2b real browser IndexedDB `ObjectStoreBackend` driver (DONE — `indexedDbRegistry.ts`, `createIndexedDbRegistry`, tested with fake-indexeddb; closes the M6.1 IndexedDB gap)
M6.3 backup/restore
M6.4 service worker
M6.5 installability

## M7 — Master editor — SKIPPED (user decision 2026-10-10)

> **SKIPPED (user decision 2026-10-10): no in-app master editor.** The app is a static
> site on GitHub + Netlify; a private master editor with auth and Git-commit write paths
> is too hard to maintain. Content is authored by editing the JSON content files in the
> repo directly, validated by the M1.4 validator and guarded by the M1.5 CI. M7.1–M7.6 are
> removed from scope; titles are kept below (struck-through) so history stays readable.

- ~~M7.1 editor shell~~ (skipped)
- ~~M7.2 graph editing~~ (skipped)
- ~~M7.3 resource editing~~ (skipped)
- ~~M7.4 verification workflow~~ (skipped — for M9, verification is the manual process in docs/RESOURCE_REVIEW.md)
- ~~M7.5 preview~~ (skipped)
- ~~M7.6 atomic Git commit~~ (skipped — commits happen by editing content JSON + a normal Git PR/commit)


## M8 — Security/deployment

M8.1 owner auth — DEFERRED (user decision 2026-10-10: no in-app write path; commits are manual Git on the repo, not runtime-authenticated)
M8.2 GitHub API protection — DEFERRED (user decision 2026-10-10: static site makes no runtime GitHub write calls)
M8.3 audit logging — DEFERRED (user decision 2026-10-10: Git history is the audit log for manual commits)
M8.4 deployment
M8.5 security review

## M9 — Research corpus

M9.1 seed nodes
M9.2 verify resources in batches
M9.3 deduplicate
M9.4 quality review
M9.5 final corpus validation

## Slice sizing

Each implementation slice must:
- touch no more than 3 primary files where practical;
- have one acceptance test;
- finish with gates;
- update STATE.

If a slice cannot satisfy these constraints, split it before coding.
