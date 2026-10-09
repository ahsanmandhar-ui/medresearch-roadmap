/**
 * Pure GitHub repository URL parsing for the repository viewer (AGENTS.md §5).
 *
 * Owner and repository name are DERIVED from the resource's already-verified
 * URL — never fabricated (AGENTS.md §2). This module is DOM-free and
 * dependency-free so the parsing logic is trivially unit-testable. It extracts
 * ONLY the owner/repo identity; it never fetches or invents repository metadata
 * (description, language, stars, README) — those must be supplied by the caller
 * from an authoritative source. No GitHub token/API key is ever used (§4).
 */

/** Owner and repository identity parsed from a GitHub URL. */
export interface GitHubRepoRef {
  owner: string;
  repo: string;
}

/** Hostnames we accept as GitHub repository sources. */
const GITHUB_HOSTS = new Set(['github.com', 'www.github.com']);

// GitHub usernames: 1-39 chars, alphanumeric, single hyphens between chars.
const OWNER_RE = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
// GitHub repository names: 1-100 chars, alphanumerics plus `.`, `_`, `-`.
const REPO_RE = /^[A-Za-z0-9._-]{1,100}$/;

/**
 * Derive `{ owner, repo }` from a GitHub repository URL.
 *
 * Accepts `github.com` / `www.github.com` URLs and tolerates a trailing slash,
 * a `.git` suffix, and deeper paths (`/tree/…`, `/blob/…`). Returns null for a
 * non-GitHub host, a URL with fewer than two path segments (no repo), or an
 * owner/repo that fails validation. Never throws on bad input.
 */
export function parseGitHubRepo(rawUrl: string): GitHubRepoRef | null {
  if (typeof rawUrl !== 'string' || rawUrl.length === 0) return null;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  if (!GITHUB_HOSTS.has(url.hostname.toLowerCase())) return null;

  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length < 2) return null;

  const owner = segments[0];
  const second = segments[1];
  if (!owner || !second) return null;

  const repo = second.replace(/\.git$/i, '');
  if (!repo) return null;
  if (!OWNER_RE.test(owner) || !REPO_RE.test(repo)) return null;

  return { owner, repo };
}

/**
 * Format a count compactly for display (e.g. 999 -> "999", 1500 -> "1.5k",
 * 2300000 -> "2.3M"). Values below 1000 are shown verbatim; larger values use a
 * single decimal (trimmed) with a SI suffix. Non-finite/negative input -> "0".
 */
export function formatCount(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '0';
  if (value < 1000) return String(Math.trunc(value));

  const units: Array<{ threshold: number; suffix: string }> = [
    { threshold: 1_000_000_000, suffix: 'B' },
    { threshold: 1_000_000, suffix: 'M' },
    { threshold: 1_000, suffix: 'k' },
  ];

  for (const unit of units) {
    if (value >= unit.threshold) {
      const scaled = value / unit.threshold;
      const rounded = scaled >= 100 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
      return `${rounded}${unit.suffix}`;
    }
  }

  return String(Math.trunc(value));
}
