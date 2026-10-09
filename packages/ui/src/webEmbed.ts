/**
 * Web-embed decision logic for general websites and static sites
 * (docs/PLAN.md M4.5, AGENTS.md §5). Pure and DOM-free so the framing decision
 * is deterministic and unit-testable, independent of any network probe.
 *
 * Rule (§5): iframe a general website ONLY when it is verified as frameable;
 * otherwise render a card with an external-open action. In this project the
 * resource's verified `embed` mode is the authoritative signal — `embed:
 * 'iframe'` means the verification workflow has confirmed the target permits
 * framing (X-Frame-Options / CSP frame-ancestors). The client NEVER infers
 * frameability, never overrides the recorded decision, and never proxies or
 * strips frame-blocking headers (AGENTS.md §2/§4).
 */

import type { ResourceRef } from '@research-roadmap/schema';

/** Resource kinds handled by the general-website / static-site viewer. */
export type WebEmbedKind = 'web-link' | 'github-site';

/** How a web resource should be presented. */
export type WebEmbedMode = 'iframe' | 'card';

/** Type guard: is this kind handled by the web-embed viewer? */
export function isWebEmbedKind(kind: ResourceRef['kind']): kind is WebEmbedKind {
  return kind === 'web-link' || kind === 'github-site';
}

/**
 * Resolve whether a web resource may be iframed or must fall back to a card.
 *
 * Returns `'iframe'` ONLY when the kind is a web-embed kind AND the verified
 * `embed` mode is `'iframe'`. Every other case (embed 'card'/'external', or a
 * non-web kind) falls back to `'card'` with an external-open action.
 */
export function resolveWebEmbedMode(resource: ResourceRef): WebEmbedMode {
  if (!isWebEmbedKind(resource.kind)) return 'card';
  return resource.embed === 'iframe' ? 'iframe' : 'card';
}

/**
 * Best-effort display host for a URL, e.g. "developer.mozilla.org". Returns an
 * empty string for anything unparseable; the caller should treat this as
 * decorative and never rely on it for security decisions.
 */
export function displayHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
}
