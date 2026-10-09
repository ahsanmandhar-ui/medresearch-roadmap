# ADR 0001 — Skip the in-app Master editor

- Status: Accepted
- Date: 2026-10-10
- Deciders: user (project owner)
- Trigger: ARCHITECTURE.md §10 requires an ADR for changes to the security boundary,
  deployment architecture, or storage/verification rules.

## Context

The original architecture assumed two applications:

- a public **Viewer** (interactive research roadmap), and
- a private **Master/content editor** that edits graph/content data, verifies resources,
  previews diffs, and commits validated changes to Git through the GitHub API.

The Master editor (PLAN.md M7) was scoped with an owner-auth boundary (M8.1), GitHub API
write protection (M8.2), server-side audit logging (M8.3), and an in-app "atomic Git
commit" workflow (M7.6). These depended on server-side secrets, an authenticated write
path, and a maintainable private app surface.

The Viewer is hosted as a **static site on GitHub (version control) + Netlify (hosting)**
(REQUIREMENTS.md P13). There is no server-side runtime that could safely hold a GitHub
write token or authorize an owner (AGENTS.md §4: never put API keys/tokens in the client;
ARCHITECTURE.md §9: GitHub write token and owner authorization are server-side only).

## Decision

**Skip the in-app Master editor entirely (M7.1–M7.6 removed from scope).**

Content is authored by **editing the JSON content files in the repository directly**
(by the Schema/Data + Research Curator agents), then committed via a normal Git
commit / pull request. Integrity is preserved by existing guardrails, not by an app:

- **M1.4 content validator** (`validateContent`) validates content on commit/CI.
- **M1.5 CI** runs typecheck, lint, tests, build, and content/schema validation on PRs.
- Resource verification remains the **manual process in `docs/RESOURCE_REVIEW.md`**
  (human-in-the-loop discovery → automated checks → review → classification), with
  `pending`/`rejected` resources kept out of the public Viewer.

Consequently, the M8 items that existed only to protect the in-app write path are
**deferred**:

- **M8.1 owner auth — deferred** (no runtime write path to authorize).
- **M8.2 GitHub API protection — deferred** (the static site makes no runtime GitHub write calls).
- **M8.3 audit logging — deferred** (Git history is the audit log for manual commits).

Kept in scope:

- **M8.4 deployment** (Netlify static deploy from GitHub).
- **M8.5 security review** (strict CSP where practical, verified iframe embeds, sanitized
  Markdown, HTTPS-only external URLs, external links — all still relevant to the Viewer).

## Consequences

- **Security boundary simplified.** No client-side secrets, no GitHub write token, no
  owner-auth surface, no SSRF-prone server component. The remaining Viewer security work
  (M8.5) is smaller: CSP headers, verified-frameable embeds, sanitized Markdown.
- **Authoring is manual and Git-native.** Every content change is a reviewable commit;
  the M1.4 validator + M1.5 CI are the enforcement mechanism. `pending`/`rejected`
  resources live only in repo content files, never in the deployed public Viewer.
- **Verification workflow replacement.** M7.4's in-app verification UI is replaced for M9
  by the manual workflow in `docs/RESOURCE_REVIEW.md`. An optional small automated-checks
  script (HTTPS enforcement, domain-per-kind, duplicate-URL detection) layered on the M1.4
  validator may be added later as a separate slice if desired; it is not required.
- **Cost.** Trade-off: no graphical editor convenience in exchange for a much simpler,
  cheaper, static-only deployment that is straightforward to maintain.

## Alternatives considered

- **Private auth-gated Master editor with serverless commit functions** — rejected:
  requires server-side secret management, owner auth, and a maintainable private app; too
  costly for a static-site roadmap (the user's stated reason).
- **Keep M7 but make it a local-only dev tool (not deployed)** — rejected: still needs a
  maintenance surface and duplicates the Git-native editing path already available.

## Related

- PLAN.md: M7 (skipped), M8 (M8.1–M8.3 deferred, M8.4–M8.5 kept)
- docs/STATE.md: decisions entry "M7 master editor SKIPPED (user decision 2026-10-10)"
- ARCHITECTURE.md §1, §4 (authoring flow), §9 (security)
- REQUIREMENTS.md P09 (amended), P13
- docs/RESOURCE_REVIEW.md (manual verification workflow)
- docs/ROSTER.md (Master Engineer role annotated)
