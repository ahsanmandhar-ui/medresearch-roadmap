# Content Rules

## Purpose

Define standards for all content in the Research Roadmap — nodes, resources, descriptions, and metadata.

## Node Rules

### Required Fields

Every node must have:
- `id` — unique, kebab-case, numbered prefix (e.g., `00_research_foundations`)
- `title` — concise, descriptive (max 80 chars)
- `description` — 1-3 sentences explaining what the node covers
- `learning_objectives` — 3-5 measurable outcomes
- `prerequisites` — array of node IDs (empty for root nodes)
- `resources` — array of resource IDs (minimum 3 per node)

### Optional Fields

- `short_title` — abbreviated title for compact UI (max 30 chars)
- `common_mistakes` — array of frequent errors researchers make at this stage
- `children_hint` — description of what branches exist below this node

### Node ID Convention

- Format: `NN_kebab_case_title`
- NN = zero-padded number (00, 01, 02...)
- Numbers reflect progression order in the core pathway
- Branch nodes continue the sequence

### Content Standards

- Descriptions must be original — no copy-paste from external sources
- Learning objectives must be actionable (use verbs: "Apply", "Construct", "Evaluate")
- Prerequisites must reference existing node IDs
- Common mistakes must be specific and actionable

## Resource Rules

### Required Fields

Every resource must have:
- `id` — unique, format: `res_NN_M` (node number, resource index)
- `node_id` — associated node
- `partition` — one of: `videos`, `code-web`, `software-guides`
- `kind` — one of: `youtube-video`, `youtube-playlist`, `github-repo`, `github-site`, `web-link`, `software`, `guide`
- `title` — accurate, concise
- `url` — HTTPS-only, verified
- `description` — 1-2 sentences, original
- `verification` — object with status, checkedAt, checkedBy, source, notes

### Optional Fields

- `organization` — issuing organization or author
- `difficulty` — `beginner` | `intermediate` | `advanced`
- `priority` — `essential` | `recommended` | `supplementary`
- `tags` — array of relevant keywords
- `companion` — related resource with title, url, embed type
- `os` — supported operating systems (for software)

### Partition Assignment

| Partition | Resource Kinds | Display |
|-----------|---------------|---------|
| `videos` | youtube-video, youtube-playlist | Video player embed |
| `code-web` | github-repo, github-site, web-link | Card or iframe |
| `software-guides` | software, guide | External link card |

### Resource Kind to Adapter Mapping

| Kind | Viewer Adapter | Embed Strategy |
|------|---------------|----------------|
| youtube-video | iframe adapter | Privacy-enhanced YouTube embed |
| youtube-playlist | iframe adapter | Privacy-enhanced YouTube playlist embed |
| github-repo | API/card adapter | Repository card with README preview |
| github-site | iframe/card adapter | Iframe if verified frameable, else card |
| web-link | verified iframe/card | Iframe if verified frameable, else external card |
| software | external download card | External link with description |
| guide | sanitized Markdown renderer | Rendered Markdown content |

### URL Rules

- All URLs must be HTTPS
- No URL shorteners
- No affiliate links
- No tracking parameters
- YouTube URLs must be standard watch or youtu.be format
- GitHub URLs must point to a specific repository (not a user/org profile)

### Description Rules

- Must be original — no copy-paste from external sites
- Must accurately describe what the resource provides
- Must not make claims the resource cannot support
- Maximum 2 sentences
- No promotional language

### Tag Rules

- Use lowercase, kebab-case tags
- Maximum 5 tags per resource
- Tags must be relevant to the node's subject matter
- Standard tags for common topics: `R`, `Python`, `systematic-review`, `meta-analysis`, `biostatistics`, `clinical-trials`, `reporting-guidelines`

## Content Integrity

### Prohibited Content

- Shadow libraries (Sci-Hub, LibGen, etc.)
- Resources that violate terms of service (e.g., unauthorized scraping tools)
- Paywalled resources presented as free
- Misleading or inaccurate descriptions
- Promotional content disguised as educational resources

### Academic Integrity

- Resources must respect copyright and licensing
- Open-access and open-source resources preferred
- Commercial tools clearly labeled as such
- No endorsement implied by inclusion

## Language

- All content in English
- Technical terms may include original language with English explanation
- No region-specific slang or idioms

## Update Policy

- Node content can be updated when methodology evolves
- Resource URLs must be re-verified when changed
- Outdated resources should be replaced, not deleted (mark as rejected with reason)
- Major taxonomy changes require ADR
