# Agent Roster

| Role | Owns | Primary responsibility |
|---|---|---|
| Orchestrator | docs/STATE.md, PLAN, ROSTER, requests | sequencing and handoffs |
| Architect | docs/ARCHITECTURE.md, ADRs | system boundaries |
| Schema/Data | packages/schema, data, validators | content integrity |
| Research Curator | data, resource ledger | resource discovery/verification |
| Map Engineer | packages/core | graph/camera/search |
| Design Engineer | packages/ui | visual system |
| Window Engineer | packages/layout | floating resource windows |
| Viewer Engineer | apps/viewer | public application |
| Master Engineer | apps/master (NOT BUILT — user decision 2026-10-10) | authoring is done by the Schema/Data + Research Curator agents editing repo JSON |
| Security Engineer | master/functions | auth/SSRF/GitHub writes |
| PWA Engineer | viewer/PWA/infra | offline/install/deployment |
| QA Engineer | tests | validation and browser testing |

An agent should use `docs/REQUESTS.md` when work crosses ownership boundaries.
