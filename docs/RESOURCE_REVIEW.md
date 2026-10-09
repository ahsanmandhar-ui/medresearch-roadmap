# Resource Review & Verification Workflow

## Purpose

Define the process for verifying resources before they appear in the production Viewer. No resource reaches the public without passing through this workflow.

## Verification States

| State | Meaning | Viewer Visibility |
|-------|---------|-------------------|
| `pending` | Discovered but not yet checked | Master editor only |
| `verified` | Checked and confirmed valid | Public Viewer |
| `rejected` | Checked and found unacceptable | Master editor only (with reason) |

## Verification Workflow

### Step 1: Discovery

A resource is proposed with:
- title
- url
- kind (youtube-video, github-repo, web-link, software, guide, etc.)
- partition (videos, code-web, software-guides)
- proposed node association

### Step 2: Automated Checks

Before human review, run automated checks:

1. **URL validity** — does the URL resolve (HTTP 200)?
2. **HTTPS enforcement** — reject non-HTTPS URLs
3. **Domain check** — is the domain appropriate for the claimed kind?
   - YouTube videos → `youtube.com` or `youtu.be`
   - GitHub repos → `github.com`
   - CRAN packages → `cran.r-project.org`
4. **Duplicate detection** — does this URL already exist in the corpus?

### Step 3: Human Review

A reviewer with domain expertise checks:

1. **Content accuracy** — does the resource actually cover what the title/description claims?
2. **Currency** — is the resource current and maintained?
   - For software: is the latest version referenced?
   - For guidelines: is this the current version?
   - For videos: is the content still accurate?
3. **Quality** — is the resource accurate, well-produced, and useful?
4. **Relevance** — does it genuinely help with the node's learning objectives?
5. **Accessibility** — for videos: are captions available? For web tools: is there a free tier?

### Step 4: Classification

Reviewer assigns:
- `verification.status`: verified | rejected
- `verification.checkedAt`: ISO date
- `verification.checkedBy`: reviewer identifier
- `verification.source`: where the verification was performed
- `verification.notes`: any caveats or observations

### Step 5: Approval

- `verified` resources become eligible for production Viewer
- `rejected` resources are logged with reason for future reference
- `pending` resources remain in Master editor only

## Rejection Criteria

A resource is rejected if any of the following apply:

1. **Broken URL** — does not resolve or returns 404
2. **Misrepresented content** — title/description does not match actual content
3. **Outdated** — superseded by a newer version or withdrawn
4. **Low quality** — inaccurate, misleading, or poorly produced
5. **Inappropriate** — violates academic integrity (e.g., shadow libraries, API-violating scrapers)
6. **Dead project** — GitHub repo abandoned with no maintenance for 2+ years and no active fork
7. **Paywalled core content** — essential content behind paywall with no free alternative
8. **Non-HTTPS** — URL does not support HTTPS

## Rejection Log

Rejected resources are recorded in `docs/RESOURCE_REVIEW.md` (this file) under the Rejection Log section with:
- resource title and URL
- reason for rejection
- date of rejection
- reviewer

## Re-verification

Resources should be re-verified:
- When the resource URL changes
- When a new version of software/guidelines is released
- Annually for active resources
- When a user reports an issue

## Batch Review Process

For initial corpus population:

1. Reviewer processes resources in batches of 10-15
2. Each batch is documented with date and reviewer
3. Batch results are committed to Git with a summary
4. Disputed resources are escalated to a second reviewer
