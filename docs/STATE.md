# Cross-Session State

current: M5 | floating-window system (M4 complete; M5.1 pure layout solver done)
status: in-progress

done:
- project control files created
- OpenCode cross-session protocol defined
- research resource integrity rules defined
- architecture and content schema defined
- S0.1 requirements interview completed — all NEEDS_USER_INPUT resolved
- S0.2 content taxonomy approved — 18 nodes, 61 resources documented
- S0.3 resource discovery specification completed — verification workflow and content rules defined
- M1.1 monorepo scaffolding completed — pnpm workspaces, 6 packages, root tsconfig
- M1.2 TypeScript/lint/test/build completed — ESLint flat config, Vitest, build scripts for all packages
- M1.3 schema package completed — Zod schemas, types, validators, 19 unit tests passing
- M1.4 content validator completed — validateContent + transformToDomainModel, 9 unit tests passing
- B001 resolved — pnpm reinstalled with allow-scripts, workspace binaries linked
- M1.5 CI completed — GitHub Actions workflow with typecheck, lint, test, build jobs
- M2.1 graph data loader completed — loadGraph, getNode, getChildren, getParents, search, 32 unit tests passing
- M2.2 node rendering completed — NodeComponent with states, ARIA, keyboard nav, 8 unit tests passing
- M2.3 graph edges completed — EdgeComponent with SVG curves, arrow markers, active/inactive states, 7 unit tests passing
- M2.4 camera/focus completed — pan, zoom, focusOn, fitBounds, coordinate transforms, 21 unit tests passing
- M2.5 search completed — full-text search with ranking, filters, suggestions, 14 unit tests passing
- M2.6 checkpoints/progress completed — progress tracking, notes, localStorage persistence, 27 unit tests passing
- M3.1 theme tokens completed — color palette, typography, spacing, shadows, z-index, breakpoints, light/dark variants, 16 unit tests passing
- M3.2 node visual treatment completed — 7 node states, light/dark variants, hover/focus/selected/completed/locked styles, 15 unit tests passing
- M3.3 responsive layout completed — useMediaQuery, useBreakpoint hooks, mobile/tablet/desktop detection, 5 unit tests passing
- M3.4 reduced-motion support completed (2026-10-09, Cline session) — useReducedMotion hook + pure motion helpers (resolveTransition, resolveDuration, NO_MOTION), 8 new unit tests; also fixed pre-existing lint error in Edge.tsx (unused `dy`)
- M3.4a keyboard-navigation-graph completed (2026-10-09, Cline session) — pure keyboardNav.ts solver (findNextNode/directionFromKey), useGraphKeyboardNavigation hook, 14 new unit tests; exported from package index
- M3.5a viewport-culling completed (2026-10-09, Cline session) — pure culling.ts (isRectInBounds, cullNodesToBounds, countVisible, getCullStats) with world-space WorldBounds input; 13 new unit tests; exported from package index
- M3.5b frame-coalescing render scheduler completed (2026-10-09, Cline session) — pure renderScheduler.ts (createRenderScheduler) collapses N schedule() calls into one flush per frame; injectable frame mechanism (rAF w/ setTimeout fallback); 7 new unit tests; exported from package index
- M4.1 sidebar/data section completed (2026-10-09, Cline session) — DataSection.tsx presents selected RoadmapNode details (description, learning goals, prerequisites, leads-to, what's-next, common mistakes, resource+verified summary); M3.1 theme tokens + M3.4a reduced-motion; related-node titles caller-resolved (no ui→core dep); 8 new component tests; added global jsdom matchMedia test setup
- M4.2 resource cards completed (2026-10-09, Cline session) — ResourceCard.tsx renders a schema ResourceRef (title, description, organization, kind/difficulty/priority badges, tags, checked-at, verified-only viewer slot, external-open link); semantic-color verification badges (verified=success/pending=warning/rejected=error); useReducedMotion hover; keyboard-focusable link with rel=noopener noreferrer; 9 new component tests; consumed ResourceRef + VerificationStatus/Difficulty/Priority from @research-roadmap/schema
- git repo initialized and initial project import pushed to GitHub (2026-10-09, Cline session) — branch main, remote origin https://github.com/ahsanmandhar-ui/medresearch-roadmap.git, commits ec89e2b (initial import ~108 files) + ebbe148 (STATE.md git milestone). Local main tracks origin/main. No secrets committed (PAT used transiently via token-in-URL only). Token lacked `workflow` scope on first push → GitHub rejected .github/workflows/ci.yml; resolved with a workflow-scoped token.
- M4.6 software/guide viewer completed (2026-10-09, Cline session) — softwareGuide.ts pure helpers (isSoftwareGuideKind, resolveSoftwareGuideCta [software→Download, guide→Read Guide], formatOsLabels canonical-ordered/deduped OS labels, OS_LABELS) + SoftwareGuideViewer.tsx (external download/read card: title, description, kind, difficulty/priority chips, OS tags, optional companion secondary link, primary external-open link; NEVER fabricates download URLs/versions/OS); 10 component tests + pure parser tests; exported from package index. Guide inline-Markdown renderer deferred (needs content pipeline + sanitizer per §4).
- M4.3 youtube embed viewer completed (2026-10-09, Cline session) — youtubeEmbed.ts pure parser (extractYouTubeIds, resolveYouTubeEmbedTarget, buildPrivacyEnhancedEmbedUrl) derives video/playlist ids from the verified resource URL (never fabricated); YouTubeEmbed.tsx renders a 16:9 privacy-enhanced youtube-nocookie.com iframe only for iframe-mode youtube-video/playlist resources (delivered via ResourceCard.viewer); 15 parser + 7 component tests
- M4.4 github repo viewer completed (2026-10-09, Cline session) — pure githubRepo.ts (parseGitHubRepoUrl: owner/repo from verified URL) + GitHubRepoViewer.tsx showing repo title, owner, description (meta preferred, resource fallback), language chip, license, stars/forks/issues stats, topics, README preview, and Open Repository button; NEVER iframes a GitHub repo page (AGENTS.md §5); 24 new tests; exported from package index
- M4.5 web embed verification completed (2026-10-09, Cline session) — frameSafety.ts (pure X-Frame-Options / CSP frame-ancestors decision logic: evaluateFrameability, parseFrameAncestors, originMatchesDirective; never proxies/strips headers §4) + webEmbed.ts (resolveWebEmbedMode, isWebEmbedKind, displayHost) + WebEmbed.tsx (verification-gated iframe) + WebEmbedViewer.tsx (iframe when verified-frameable, else external-open card §5); 51 new tests; exported from package index. NOTE: files were scaffolded by an earlier compacted session but left unfinalized (2 typecheck TS2532 errors + 1 lint no-unused-vars); this session verified/cohered them, fixed all 3, and ran the gates green.
- M5.1 pure layout solver completed (2026-10-09, Cline session) — packages/layout (window/layout agent area, AGENTS.md §3) layoutSolver.ts: DOM-free/dependency-free geometry over {x,y,width,height} rects encoding ARCHITECTURE.md §5 window rules — clampWindowToStage (windows stay inside stage on drag/resize), moveWindow, resizeWindow (min size + stage cap, top-left fixed), rectsOverlap, layoutMinimizedBars (bottom-docked non-overlapping minimized bars, row-wrapping), placeWindowInStage (cascade), clampAllToStage; 14 new unit tests; vitest.config.ts (node env, mirrors core); exported from package index. Consumption by drag/resize/minimize handlers deferred to M5.2+ window components (primitive approach, like M3.4a/M3.5a).

decisions:
- one session executes one slice
- STATE.md is the sole cross-session handoff source
- unknown resources remain pending
- public Viewer displays verified resources only
- GitHub repos use cards/README rather than iframe
- YouTube uses privacy-enhanced embed when permitted
- brand: "Research Roadmap"
- colors: neutral gray/green
- deployment: GitHub (dev/VC) + Netlify (hosting), domain researchroadmap.com
- domain scope: both core methods + medical/clinical tracks
- videos: English only
- commercial tools: included with clear labeling
- mobile: bottom nav + bottom sheets + resource sheets + swipe gestures
- visual reference: uidesign/ folder (4 assets)
- reduced-motion: detect via prefers-reduced-motion (useReducedMotion on useMediaQuery); collapse transitions to 'none' and durations to '0ms' via pure motion helpers; consumed by UI components to disable nonessential animation
- keyboard navigation: pure DOM-free spatial solver (keyboardNav.ts) picks nearest node by primary axis distance, ties broken by perpendicular drift toward alignment; a thin useGraphKeyboardNavigation hook maps keydown→direction→solver→onNavigate (focus management delegated to caller). Neighbor testNode predicates are ignored on purpose; consistent with camera spatialDistance convention in packages/core.
- viewport culling (M3.5a): pure AABB intersection over world-space rects. Caller derives WorldBounds from the camera via core's screenToWorld (single source of truth for the world↔screen transform) — culling.ts does NOT duplicate that transform and does NOT depend on packages/core, keeping packages/ui dependency-free (no ui→core edge). Render only nodes intersecting the visible region; optional `padding` renders a margin to avoid pop-in during pan/zoom.
- render scheduler (M3.5b): createRenderScheduler(flush) coalesces many schedule() calls into one flush per animation frame (pan/zoom/hover fire per-event). Frame mechanism is injected for deterministic tests + SSR safety; defaults to requestAnimationFrame with setTimeout fallback. Guarantees at most one flush per frame and none after cancel(). Wire a graph container's render() through it in M4/M5.
- data section (M4.1): DataSection renders a selected RoadmapNode's details using M3.1 tokens. Related-node (prerequisites/children) TITLES are passed in pre-resolved (caller uses core.getParents/getChildren) so packages/ui stays free of a ui→core dependency — component imports only RoadmapNode from @research-roadmap/schema (already a ui dependency). Resource summary shows total + verified counts only (AGENTS.md §2: never fabricate metadata; production shows verified only). Hover motion respects useReducedMotion. jsdom lacks window.matchMedia, so a global vitest setup (packages/ui/src/test/setup.ts) mocks it for component tests that touch media-query hooks.
- resource card (M4.2): ResourceCard renders a schema-validated ResourceRef. Uses M3.1 semantic tokens for verification badges (verified→success, pending→warning, rejected→error); neutral badges for kind/difficulty/priority. Verification-gated viewer slot (AGENTS.md §5): an optional `viewer` node is shown ONLY for verified resources so unverified content is never displayed in production; external-open link always present with target=_blank + rel=noopener noreferrer (AGENTS.md §4 security). Imports ResourceRef/VerificationStatus/Difficulty/Priority types from @research-roadmap/schema (already a ui dependency; no ui→core dep). Reduced-motion respected for hover transitions; external link is keyboard-focusable with a visible focus ring. This is the reusable card shell that M4.3–M4.6 viewers plug into via the `viewer` prop. jsdom note: blur sets box-shadow:'none' which jsdom keeps normalized as 'none' (not '') — test asserts 'none'.
- youtube embed (M4.3): youtubeEmbed.ts is a pure, DOM-free parser. IDs are DERIVED from the resource's already-verified URL (extractYouTubeIds handles watch/?v=, ?list=, youtu.be, /embed/, /shorts/, /live/, /playlist?list=) — never fabricated (AGENTS.md §2). resolveYouTubeEmbedTarget matches id to kind (playlist needs list id; video needs v id). buildPrivacyEnhancedEmbedUrl ALWAYS emits youtube-nocookie.com/embed (privacy-enhanced, AGENTS.md §5) — never the tracking youtube.com domain. YouTubeEmbed.tsx renders a responsive 16:9 iframe only when kind is youtube-video/playlist AND embed==='iframe' AND a valid id resolves; otherwise renders nothing (non-iframe modes fall back to the card's external-open link). Delivered via ResourceCard's `viewer` prop. Does not proxy/strip frame-blocking headers (AGENTS.md §4).
- github repo viewer (M4.4): githubRepo.ts is a pure, DOM-free parser (parseGitHubRepoUrl) that extracts {owner, repo} from the resource's verified github.com URL (validates charset; strips trailing .git). GitHubRepoViewer.tsx renders a repo CARD — it NEVER iframes a GitHub repo page (AGENTS.md §5). Shows: repo title (owner/repo heading), owner, description (meta.description preferred, resource.description fallback), language chip (optional languageColor dot), license, compact-formatted stars/forks/issues stats, topics, README preview (verbatim, scrollable <pre>), updated-at, and an "Open Repository" external link (target=_blank + rel=noopener noreferrer). All repo metadata is caller-supplied via the optional `meta` prop (fetched elsewhere) — the viewer itself performs NO network fetch and fabricates nothing; only owner/repo are derived from the URL. Renders only for kind==='github-repo'; falls back to the resource title + omits owner/repo heading when the URL is unparseable. Delivered via ResourceCard's verified-gated `viewer` prop. Uses M3.1 tokens + useReducedMotion; Open button is keyboard-focusable with a visible focus ring.
- web embed verification (M4.5): frameSafety.ts is a PURE, DOM-free decision engine for cross-origin iframe safety (AGENTS.md §5/§4). evaluateFrameability interprets X-Frame-Options (DENY/SAMEORIGIN block cross-origin; ALLOW-FROM matches only the given embedderOrigin) and CSP frame-ancestors ('none' blocks; '*' allows; a specific origin list allows only on match, conservative when the embedder origin is unknown; multiple frame-ancestors directives are intersected). parseFrameAncestors extracts the effective allowance tokens; originMatchesDirective supports '*', scheme-only, exact scheme://host[:port], and wildcard scheme://*.host (case-insensitive, never throws). It NEVER proxies or strips headers (§4) — it only interprets them, so the authoring/master verifier (which can actually observe the headers) unit-tests the logic. webEmbed.ts: resolveWebEmbedMode returns 'iframe' ONLY for kinds github-site/web-link when the verified embed mode is 'iframe', else 'card' — the resource's recorded decision is authoritative; the client never infers/overrides frameability (§2). WebEmbed.tsx renders a verification-gated iframe (only when embed==='iframe' and, if a frameCheck FrameSafetyResult is supplied, still frameable — defence-in-depth re-verification without any client-side header fetch). WebEmbedViewer.tsx is the ResourceCard-viewer: it iframes a verified-frameable site (host header + sandboxed iframe) or otherwise renders an external-open card (globe header, host, description, "opens in a new tab" note, keyboard-focusable Open link with rel=noopener noreferrer). All metadata is derived from the verified URL or schema; nothing fabricated.
- software/guide viewer (M4.6): CONTENT_RULES.md maps `software` → external download card and `guide` → sanitized Markdown renderer. The schema ResourceRef carries NO inline Markdown body and the repo ships NO Markdown/sanitizer dependency, so this slice delivers the dependency-free EXTERNAL CARD that both kinds share (AGENTS.md §1: no silent scope expansion; §4: sanitize Markdown/HTML). softwareGuide.ts is pure/DOM-free: isSoftwareGuideKind (kind guard for software|guide), resolveSoftwareGuideCta (software→'Download', guide→'Read Guide', else 'Open Resource'), formatOsLabels (maps the optional schema `os` array to canonical-ordered, de-duplicated human labels via OS_LABELS; unknown values skipped), OS_LABELS. SoftwareGuideViewer.tsx renders ONLY for software/guide kinds: title, description, kind, difficulty + priority chips (DIFFICULTY_LABELS/PRIORITY_LABELS), OS tags (from formatOsLabels), an optional companion secondary external link (when resource.companion is present), and a primary external-open link (target=_blank + rel=noopener noreferrer, keyboard-focusable, visible focus ring). NOTHING is fabricated — all values derive from the verified resource (download URL = resource.url; no invented versions/OS). The guide's rendered-Markdown experience is a DEFERRED follow-up requiring a content pipeline + a sanitizer (documented here, not silently expanded). Delivered via ResourceCard's verified-gated `viewer` prop. Uses M3.1 tokens + useReducedMotion.
- pure layout solver (M5.1): packages/layout is the window/layout agent's area (AGENTS.md §3). layoutSolver.ts is DOM-free/dependency-free (AGENTS.md §4) and operates on {x,y,width,height} rects in stage (screen) space, encoding docs/ARCHITECTURE.md §5 window rules as pure geometry. clampWindowToStage first limits a window to the stage dimensions (can never exceed the stage) then clamps its top-left so every edge stays in-bounds — this is the invariant behind "dragging/resizing stays inside the stage." moveWindow translates by delta and re-clamps (size preserved; drag never resizes). resizeWindow honors a minimum (DEFAULT_MIN_WINDOW, overridable), caps at the stage, keeps the top-left fixed. rectsOverlap is strict-interior AABB (edge-touching is not overlap). layoutMinimizedBars docks N bars along the bottom, left-to-right, wrapping rows upward when a row would overflow — bars in a row are width+gap apart and rows height+gap apart, so none overlap (the "minimized bars cannot overlap" rule). placeWindowInStage cascades new windows by index (down-right) then clamps. clampAllToStage re-clamps a full window set after a stage resize. All functions return new rects (no mutation). vitest.config.ts uses environment:'node' (mirrors packages/core, no DOM needed). Consumption by real drag/resize/minimize handlers is deferred to M5.2+ window components (primitive-first approach, like M3.4a keyboard-nav and M3.5a culling). NOTE: build emits layoutSolver.test.d.ts alongside prod decls because tsconfig `include:["src"]` matches core's pattern and dist/ is gitignored — left consistent with core rather than deviating.
- git/remote (2026-10-09, user-authorized): branch `main`, remote origin = https://github.com/ahsanmandhar-ui/medresearch-roadmap.git, initial commit ec89e2b. .gitignore excludes node_modules, dist, build output, *.env*, and temp gate outputs — so no secrets or build artifacts are committed. Pushing a file under .github/workflows/ requires the PAT to have the `workflow` scope (else GitHub rejects with "refusing to allow a Personal Access Token to create or update workflow"). Auth method: token-in-URL + `git -c credential.helper=` (non-interactive; avoids the interactive credential.helper=helper-selector prompt). Never store or log the token.

confirmed requirements:
- P10: Research Roadmap
- P11: Design placeholder
- P12: Neutral gray/green
- P13: GitHub + Netlify, researchroadmap.com
- C05: 18 nodes, 61 resources (4 batches)
- C06: Both tracks
- C07: English only
- C08: Include commercial
- U08: Bottom nav + sheets + swipe
- U09: uidesign/ folder

open risks:
- initial resource corpus not yet verified (61 resources pending validation)
- deployment target not yet confirmed (Netlify plan, domain registration)
- packages/core lint gate is red (pre-existing, unrelated to M3.4) — must be cleared by core agent before a repo-wide `lint` gate can pass

next: M5.2 | window component + drag/resize behavior (consume the M5.1 layout solver in packages/ui; M5.1 primitive done)

next_options (priority order):
- M5.2 window component: build a FloatingWindow React component (packages/ui) with a title bar, close/minimize buttons, and drag + resize handles that call packages/layout moveWindow/resizeWindow/clampWindowToStage (all pure, already tested). Wire the M3.5b createRenderScheduler to coalesce drag/resize frame updates. This is the first real consumer of the M5.1 solver.
- M5.3 window manager/store: a stateful manager that tracks open windows, z-order/focus, cascade placement via placeWindowInStage, minimized-bar docking via layoutMinimizedBars, and open/close/minimize/restore actions.
- M3.4b focus restoration — UNBLOCKED once M5.2/M5.3 exist (restore focus to the opener when a floating window closes, ARCHITECTURE.md §5). Now buildable since the window system exists.
- M3.5b wiring (deferred): once a graph container exists in M4/M5, route render() through createRenderScheduler and render cullNodesToBounds(nodes, worldBounds-from-camera).
- Contrast-checking utility/test + ARIA-label audit as components are built (M4/M5).

checkpoint_verification (2026-10-09, Cline/Step5 resume session):
- M3.3 independently reproduced: packages/ui 51/51, packages/core 94/94, packages/schema 19/19 — all green BEFORE M3.4 work
- Reported M3.3 desktop-mock fix confirmed present (useMediaQuery.test.tsx returns true for '(min-width: 1024px)')
- Git (session start, at checkpoint recovery): branch master, NO commits, NO remotes — all work was untracked and preserved; no destructive git used. [Superseded 2026-10-09: git later initialized on branch main and pushed to origin with explicit user authorization — initial commit ec89e2b; see the `git/remote` decision above.]
- Pre-existing lint debt discovered: packages/core has 6 no-unused-vars errors (contentValidator.ts x5, progress.test.ts x1) — NOT in scope for M3.4 (core is data-runtime agent area) → handoff request filed in docs/REQUESTS.md

m34_gates (Cline session 2026-10-09, packages/ui):
- test: 59/59 passed (7 files) — was 51/51; +8 from motion.test.ts (5) and useReducedMotion.test.tsx (3)
- typecheck: clean (tsc --noEmit, no output)
- lint: clean (eslint src/, no output) — includes the Edge.tsx unused-`dy` fix
- build: clean (tsc --declaration --emitDeclarationOnly; emitted motion.d.ts, hooks/useReducedMotion.d.ts)
- Note: run package binaries directly (node_modules/.bin/*.cmd) with file redirection on PowerShell; do not run `pnpm test`/`pnpm --parallel` directly (PowerShell mangles stderr → false non-zero exit). First Vite/jsdom transform takes ~20-26s.

m34a_gates (Cline session 2026-10-09, packages/ui):
- test: 73/73 passed (9 files) — was 59/59; +14 from keyboardNav.test.ts (10) and useGraphKeyboardNavigation.test.tsx (4)
- typecheck: clean (tsc --noEmit, no output)
- lint: clean (eslint src/, no output)
- build: clean (tsc --declaration --emitDeclarationOnly; emitted keyboardNav.d.ts, hooks/useGraphKeyboardNavigation.d.ts)
- files created: src/keyboardNav.ts, src/keyboardNav.test.ts, src/hooks/useGraphKeyboardNavigation.ts, src/hooks/useGraphKeyboardNavigation.test.tsx
- files modified: src/index.ts, src/hooks/index.ts (exports)
- scope note: M3.4a delivers the reusable navigation PRIMITIVES (solver + hook) in packages/ui. Actual keydown wiring into a rendered graph component is deferred to M4/M5 app slices where a graph container exists; NodeComponent already has its own single-node keyboard handling from M2.2 which is unaffected.

m35a_gates (Cline session 2026-10-09, packages/ui):
- test: 86/86 passed (10 files) — was 73/73; +13 from culling.test.ts
- typecheck: clean (tsc --noEmit, no output)
- lint: clean (eslint src/, no output)
- build: clean (tsc --declaration --emitDeclarationOnly; emitted culling.d.ts)
- files created: src/culling.ts, src/culling.test.ts
- files modified: src/index.ts (exports)
- scope note: M3.5a delivers the pure viewport-culling PRIMITIVES in packages/ui, operating on world-space WorldBounds. Wiring into a rendered graph container is deferred to M4/M5 where a container + camera exist. Caller computes WorldBounds via packages/core screenToWorld (no ui→core dependency introduced).

m35b_gates (Cline session 2026-10-09, packages/ui):
- test: 93/93 passed (11 files) — was 86/86; +7 from renderScheduler.test.ts
- typecheck: clean (tsc --noEmit, no output)
- lint: clean (eslint src/, no output)
- build: clean (tsc --declaration --emitDeclarationOnly; emitted renderScheduler.d.ts)
- files created: src/renderScheduler.ts, src/renderScheduler.test.ts
- files modified: src/index.ts (exports)
- scope note: M3.5b delivers a pure frame-coalescing render-scheduler PRIMITIVE in packages/ui. No @ts-ignore/@ts-expect-error used (AGENTS.md §4); the rAF-fallback test simulates a missing rAF via Object.defineProperty. Wiring a graph container's render() through the scheduler is deferred to M4/M5.

m41_gates (Cline session 2026-10-09, packages/ui):
- test: 101/101 passed (12 files) — was 93/93; +8 from DataSection.test.tsx
- typecheck: clean (tsc --noEmit, no output)
- lint: clean (eslint src/, no output)
- build: clean (tsc --declaration --emitDeclarationOnly; emitted dist/components/DataSection.d.ts)
- files created: src/components/DataSection.tsx, src/components/DataSection.test.tsx, src/test/setup.ts
- files modified: src/index.ts (exports), vitest.config.ts (setupFiles → global jsdom matchMedia mock)
- scope note: M4.1 delivers the sidebar/data-section React component in packages/ui. It renders a selected RoadmapNode's details; prerequisites/leads-to are caller-resolved titles (no ui→core dep). First failure during the slice was `window.matchMedia is not a function` under jsdom — a TEST-environment gap (jsdom lacks matchMedia), NOT a production bug; fixed with a global vitest setup mock, not by weakening source. Uses fireEvent (not user-event) to avoid adding a dependency. Consuming DataSection in an actual layout is deferred to M4.2+ when a graph/sidebar shell exists.

m42_gates (Cline session 2026-10-09, packages/ui):
- test: 110/110 passed (13 files) — was 101/101; +9 from ResourceCard.test.tsx
- typecheck: clean (tsc --noEmit, no output)
- lint: clean (eslint src/, no output)
- build: clean (tsc --declaration --emitDeclarationOnly; emitted dist/components/ResourceCard.d.ts)
- files created: src/components/ResourceCard.tsx, src/components/ResourceCard.test.tsx
- files modified: src/index.ts (exports)
- scope note: M4.2 delivers the reusable ResourceCard React component in packages/ui — the card shell M4.3–M4.6 viewers plug into via the `viewer` prop. Verification badges use M3.1 semantic tokens; viewer slot is verification-gated (verified only) per AGENTS.md §5; external link uses rel=noopener noreferrer. Imports ResourceRef/VerificationStatus/Difficulty/Priority from @research-roadmap/schema (no ui→core dep). One test-assertion fix during the slice: onBlur sets box-shadow:'none' which jsdom normalizes to 'none' (not '') — corrected the assertion to match real behavior (not a source defect). Type-specific viewers (M4.3 YouTube, M4.4 GitHub, M4.5 web, M4.6 software/guide) are NOT built here.

m43_gates (Cline session 2026-10-09, packages/ui):
- test: 132/132 passed (15 files) — was 110/110; +22 from youtubeEmbed.test.ts (15) and YouTubeEmbed.test.tsx (7)
- typecheck: clean (tsc --noEmit, no output)
- lint: clean (eslint src/, no output)
- build: clean (tsc --declaration --emitDeclarationOnly; emitted youtubeEmbed.d.ts, dist/components/YouTubeEmbed.d.ts)
- files created: src/youtubeEmbed.ts, src/youtubeEmbed.test.ts, src/components/YouTubeEmbed.tsx, src/components/YouTubeEmbed.test.tsx
- files modified: src/index.ts (exports: YouTubeEmbed component + youtubeEmbed pure helpers + types)
- scope note: M4.3 delivers the privacy-enhanced YouTube viewer (AGENTS.md §5). Two fixes during the slice, both legitimate: (1) TS2345 — the isYouTube boolean did not narrow resource.kind; replaced with an explicit kind ternary so resolveYouTubeEmbedTarget receives a narrowed union. (2) prefer-const — playlistId was never reassigned. Neither concealed a defect. IDs are derived from the verified URL only (never fabricated, §2); iframe src is always youtube-nocookie.com; renders nothing unless embed==='iframe' and a valid id resolves. Consumption: pass <YouTubeEmbed resource={r} /> as ResourceCard's viewer prop (ResourceCard already gates on verified + provides external fallback). M4.4 GitHub repo viewer is next.

m44_gates (Cline session 2026-10-09, packages/ui):
- test: 156/156 passed (17 files) — was 132/132; +24 from githubRepo.test.ts (12) and GitHubRepoViewer.test.tsx (12)
- typecheck: clean (tsc --noEmit, no output)
- lint: clean (eslint src/, no output)
- build: clean (tsc --declaration --emitDeclarationOnly; emitted githubRepo.d.ts, dist/components/GitHubRepoViewer.d.ts)
- files created: src/githubRepo.ts, src/githubRepo.test.ts, src/components/GitHubRepoViewer.tsx, src/components/GitHubRepoViewer.test.tsx
- files modified: src/index.ts (exports: GitHubRepoViewer component + GitHubRepoMeta type + parseGitHubRepoUrl pure helper)
- scope note: M4.4 delivers the GitHub repo viewer (AGENTS.md §5 — NEVER iframe a GitHub repo page). Three legitimate fixes during the slice, none concealed a defect: (1) TS2532 — segments[1] possibly undefined under noUncheckedIndexedAccess; guarded with explicit `second` variable before .replace(). (2) lint no-unused-vars — removed unused `vi` + GitHubRepoMeta imports. (3) test getByText('react') matched multiple elements (topic vs repo heading); scoped topic assertions to within(meta-list) and used getByRole('heading') for the repo name. Consumption: pass <GitHubRepoViewer resource={r} meta={fetchedMeta} /> as ResourceCard's viewer prop; meta (language/license/stars/readme/etc.) is fetched by the caller and passed in — the viewer does no network I/O. M4.5 web embed verification is next.

m46_gates (Cline session 2026-10-09, packages/ui):
- test: 225/225 passed (23 files) — was 156/156 (M4.4); cumulative after M4.5 + M4.6. M4.6 added 10 SoftwareGuideViewer tests + pure softwareGuide helper tests (frameSafety 26, webEmbed + WebEmbed + WebEmbedViewer came from M4.5).
- typecheck: clean (tsc --noEmit, no output)
- lint: clean (eslint src/, no output)
- build: clean (tsc --declaration --emitDeclarationOnly; emitted softwareGuide.d.ts, dist/components/SoftwareGuideViewer.d.ts)
- files created: src/softwareGuide.ts, src/softwareGuide.test.ts, src/components/SoftwareGuideViewer.tsx, src/components/SoftwareGuideViewer.test.tsx
- files modified: src/index.ts (exports: SoftwareGuideViewer + softwareGuide pure helpers + SoftwareGuideKind/ResourceOs types)
- scope note: M4.6 delivers the dependency-free external download/read card for software+guide resources (CONTENT_RULES.md). The guide's sanitized inline-Markdown renderer is intentionally DEFERRED (needs a content pipeline + Markdown sanitizer — AGENTS.md §1 no silent scope expansion, §4 sanitize). All values derive from the verified resource; nothing fabricated. This completes the M4 resource-experience viewers set (data-section, resource-cards, youtube, github, web-embed, software/guide). Next milestone per docs/PLAN.md = M5.

next_session_instructions:
- Resume Research Roadmap. Read AGENTS.md, this file, docs/REQUIREMENTS.md, docs/PLAN.md.
- Environment: Windows + PowerShell; pnpm 12.10.1, node v24.21.0; workspace binaries linked under node_modules/.bin.
- Run gates per package directly, redirect to a file, then read the file. If the 30s shell cap trips on first Vite/jsdom transform, use Start-Process + poll.
- Do NOT commit, push, or add git remotes without explicit user authorization (AGENTS.md §7). Git is now initialized on branch `main` with initial commit ec89e2b and remote origin = https://github.com/ahsanmandhar-ui/medresearch-roadmap.git (pushed 2026-10-09 with explicit authorization). Token-in-URL + `credential.helper=` was required to push non-interactively (system credential.helper=helper-selector hangs unattended); the PAT was used transiently per-command and is NOT stored in .git/config or any file. For future pushes, prompt the user for a fresh token with `repo`+`workflow` scope, then: `git -c credential.helper= push https://x-access-token:<TOKEN>@github.com/ahsanmandhar-ui/medresearch-roadmap.git main`. NEVER log or commit the token.
- M3 Visual System milestone COMPLETE (M3.1 tokens, M3.2 node visuals, M3.3 responsive, M3.4 accessibility [reduced-motion + keyboard-nav primitives], M3.5 performance [M3.5a culling + M3.5b render-scheduler]). All as tested pure primitives in packages/ui.
- M4 resource experience COMPLETE. M4.1 DataSection.tsx (selected-node details; caller-resolved related titles, no ui->core dep). M4.2 ResourceCard.tsx (reusable verified-gated card shell; semantic verification badges; external-open with rel=noopener noreferrer). M4.3 YouTubeEmbed.tsx + youtubeEmbed.ts (privacy-enhanced youtube-nocookie.com iframe; IDs derived from verified URL, never fabricated; renders only for iframe-mode youtube kinds). M4.4 GitHubRepoViewer.tsx + githubRepo.ts (repo CARD — NEVER iframes GitHub per §5; owner/repo parsed from verified URL; caller passes meta via optional `meta` prop — viewer does no network I/O). M4.5 web embed: frameSafety.ts (pure X-Frame-Options/CSP frame-ancestors decision helpers) + webEmbed.ts (resolveWebEmbedMode/isWebEmbedKind/displayHost) + WebEmbed.tsx (low-level iframe-only primitive w/ optional frameCheck defence-in-depth) + WebEmbedViewer.tsx (complete viewer: iframe when verified-frameable, else external-open card). NOTE WebEmbed vs WebEmbedViewer are intentionally distinct (primitive vs full viewer) — both exported. M4.6 SoftwareGuideViewer.tsx + softwareGuide.ts (dependency-free external download/read card for software+guide; OS tags, difficulty/priority chips, primary + optional companion external links; NOTHING fabricated; guide inline-Markdown renderer DEFERRED pending content pipeline + sanitizer). All viewers are delivered through ResourceCard's verified-gated `viewer` prop. Global jsdom matchMedia mock lives at src/test/setup.ts (wired via vitest.config.ts setupFiles) - reuse for any component test touching useMediaQuery/useBreakpoint/useReducedMotion. Use fireEvent for interactions (user-event is NOT installed; do not add it).
- Next actionable slice per docs/PLAN.md milestone order = M5 floating-window system (next milestone after M4). M5 is the prerequisite that unblocks M3.4b focus restoration. The three deferred primitives (render scheduling, culling, keyboard nav) should be wired into the graph/sidebar shell when it is assembled in M5: render <DataSection> for the selected node and <ResourceCard viewer={...}> per resource, and:
     • render scheduling: route the container's render() through createRenderScheduler (one flush/frame).
     • culling: compute WorldBounds from the camera via packages/core screenToWorld, then render cullNodesToBounds(nodes, worldBounds).
     • keyboard nav: useGraphKeyboardNavigation (nodes, currentId from focus, focus returned id via ref map).
- M3.4b focus restoration after closing floating windows — BLOCKED on M5 window system (does not exist yet). Do NOT build it speculatively before M5 exists.
- All M3.x work belongs to packages/ui (design-system agent). Do not modify packages/core without a docs/REQUESTS.md handoff (its lint gate is still red — see open risks).

