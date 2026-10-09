# AGENTS.md — Research Roadmap OpenCode Rules

## 0. Prime directives

1. Plan before application code.
2. One slice per OpenCode session.
3. `docs/STATE.md` is the cross-session source of truth.
4. Never invent research resources or URLs.
5. Never commit secrets.
6. Validate all external content.
7. Do not silently expand scope.
8. Do not mark a slice complete while its acceptance check fails.
9. Prefer small, testable modules over monolithic files.
10. Preserve the existing architecture unless an ADR explicitly changes it.

## 1. Requirement protocol

`docs/REQUIREMENTS.md` contains three kinds of information:

- `CONFIRMED`: may be implemented.
- `ASSUMED`: must be confirmed before any dependent production slice.
- `NEEDS_USER_INPUT`: ask the user.

For content resources, a URL is not confirmed merely because it looks plausible. It must be discovered/verified from an authoritative source.

## 2. Research-content integrity

Every resource has provenance and verification state.

Allowed states:
- `verified`
- `pending`
- `rejected`

Production Viewer may display `verified` resources only.

`pending` resources may appear in the private Master/editor as work-in-progress.

Do not infer:
- whether a website allows iframe embedding;
- YouTube video IDs;
- GitHub repository ownership;
- guideline currentness;
- R package versions;
- software download URLs.

## 3. Architecture ownership

| Area | Owner |
|---|---|
| `packages/schema` | schema/data agent |
| `packages/core` | map/data-runtime agent |
| `packages/layout` | window/layout agent |
| `packages/ui` | design-system agent |
| `apps/viewer` | viewer agent |
| `apps/master` | master/security agent |
| `data/` | research-content agent |
| `docs/` | orchestrator/architect |
| tests/QA | QA agent |

An agent must not modify another area merely to make its own slice convenient. Create a handoff request in `docs/BLOCKERS.md` or `docs/REQUESTS.md`.

## 4. Technical rules

- TypeScript strict.
- No `any` unless documented.
- No `@ts-ignore`.
- Shared domain types come from `packages/schema`.
- Pure algorithms live outside UI components.
- Validate external input with shared schemas.
- HTTPS-only external URLs.
- Sanitize Markdown/HTML.
- Keyboard accessible.
- Visible focus.
- Respect reduced motion.
- WCAG AA target.
- No iframe caching.
- Never proxy/strip frame-blocking security headers.
- Do not put API keys or GitHub tokens in the client.

## 5. Resource viewer rules

### YouTube
Use privacy-enhanced YouTube embedding when the video is verified as embeddable.

### GitHub repository
Do not iframe a GitHub repository page. Show:
- repository title;
- owner;
- description;
- language;
- useful metadata if available;
- README preview;
- Open Repository button.

### GitHub Pages / static site
Iframe only after URL verification and only when the target permits framing.

### General website
Use iframe only if verified frameable. Otherwise use a card with an external-open action.

### Guidelines
Prefer official issuing organizations. Record:
- organization;
- guideline title;
- publication/update year if verified;
- URL;
- verification date;
- source type.

## 6. Slice gates

Default gates:

- typecheck
- lint
- unit tests
- content/schema validation
- production build

UI slices additionally require:
- Playwright smoke
- zero console errors
- keyboard smoke
- reduced-motion smoke

Do not claim visual fidelity from tests alone.

## 7. Git

- One branch per slice.
- Conventional commits.
- Never force-push.
- Never commit `.env`, tokens, node_modules, build output or personal data.
- Do not push to main automatically.

## 8. Failure protocol

If a gate fails:
1. inspect first error;
2. targeted fix;
3. rerun;
4. second failure → split;
5. split depth 3 maximum;
6. write blocker and stop.

A later fix for a discovered bug requires a regression test.

## 9. Cross-session protocol

At session start:
- STATE first.

At session end:
- update STATE;
- record files changed;
- record commands/gates;
- record unresolved decisions;
- set exactly one next slice.

The next session must be able to continue without reading the previous conversation.
