# Research Roadmap Architecture

## 1. Product

A public installable web application presents an interactive research roadmap as a graph. Selecting a node reveals verified resources. Resources are grouped into:

- Videos
- Code & Web
- Software & Guides

Resources may open in an animated floating window over the map. Only one resource partition may be detached at a time.

A private Master application edits graph/content data and commits validated changes to Git.

## 2. Repository

```text
research-roadmap/
  apps/
    viewer/
    master/
  packages/
    schema/
    core/
    layout/
    ui/
  data/
    graph.json
    nodes/
    guides/
  docs/
    STATE.md
    PLAN.md
    ROSTER.md
    REQUIREMENTS.md
    CONTENT_RULES.md
    RESOURCE_REVIEW.md
    BLOCKERS.md
    REQUESTS.md
  scripts/
  tests/
  .github/
  AGENTS.md
  OPENCODE_START.md
  package.json
  pnpm-workspace.yaml
```

## 3. Domain model

### Node

```ts
interface RoadmapNode {
  id: string;
  parentId: string | null;
  order: number;
  title: string;
  shortTitle?: string;
  description: string;
  learningGoals: string[];
  prerequisites: string[];
  resources: ResourceRef[];
  childrenHint?: string;
}
```

### Resource

```ts
type Partition = "videos" | "code-web" | "software-guides";

type ResourceKind =
  | "youtube-video"
  | "youtube-playlist"
  | "github-repo"
  | "github-site"
  | "web-link"
  | "software"
  | "guide";

type VerificationStatus = "verified" | "pending" | "rejected";

interface ResourceRef {
  id: string;
  partition: Partition;
  kind: ResourceKind;
  title: string;
  url: string;
  description: string;
  organization?: string;
  embed: "iframe" | "card" | "external";
  verification: {
    status: VerificationStatus;
    checkedAt?: string;
    checkedBy?: string;
    source?: string;
    notes?: string;
  };
  tags: string[];
  companion?: {
    title: string;
    url: string;
    embed: "iframe" | "card" | "external";
  };
  os?: ("windows"|"macos"|"linux"|"android"|"ios")[];
}
```

## 4. Data flow

```text
Git data
  ↓
Zod validation
  ↓
Viewer loader/cache
  ↓
Graph store
  ↓
Selected node
  ↓
Resource partition
  ↓
Resource window
  ↓
verified viewer adapter
```

Master:

```text
Editor
 ↓
schema validation
 ↓
resource verification
 ↓
diff preview
 ↓
atomic Git commit
 ↓
CI validation
 ↓
Viewer deployment
```

## 5. Window behavior

State machine:

```text
DOCKED → FLOATING → MINIMIZED
   ↑         ↓          |
   └─────────┴──────────┘
```

Rules:
- one detached partition at a time;
- dragging/resizing remains inside the stage;
- minimized bars cannot overlap;
- map camera refits around large windows;
- reduced-motion mode disables nonessential animation.

## 6. Resource adapter design

Each resource kind maps to a viewer adapter:

```text
YouTube → iframe adapter
GitHub repo → API/card adapter
GitHub site → iframe/card adapter
web-link → verified iframe/card adapter
software → external download card
guide → sanitized Markdown renderer
```

Adapters must never silently turn an unverified URL into an iframe.

## 7. Performance

Targets:
- avoid one React state update per animation frame;
- use transforms for node/camera movement;
- one edge canvas;
- lazy-load resource panes;
- do not preload all videos;
- do not cache third-party iframe content;
- virtualize very large resource lists if required.

## 8. Accessibility

- keyboard navigation through graph nodes;
- semantic buttons;
- focus restoration after closing windows;
- visible focus ring;
- ARIA labels for icon controls;
- reduced-motion support;
- contrast checks.

## 9. Security

- no client-side secrets;
- HTTPS external URLs;
- SSRF protection for server-side embed checks;
- sanitized Markdown;
- GitHub write token server-side only;
- owner authorization server-side;
- strict CSP where practical.

## 10. Architecture changes

Any change to domain model, storage, security boundary, deployment architecture, or resource verification rules requires an ADR under `docs/adr/`.
