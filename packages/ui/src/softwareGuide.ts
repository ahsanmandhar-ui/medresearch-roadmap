/**
 * Software / guide decision logic (docs/PLAN.md M4.6, docs/CONTENT_RULES.md).
 * Pure and DOM-free so presentation choices are unit-testable.
 *
 * Per CONTENT_RULES.md the software kind maps to an "external download card"
 * (external link + description + platform/priority/difficulty metadata) and the
 * guide kind maps to a "sanitized Markdown renderer". The schema ResourceRef has
 * no inline Markdown body and the repo ships no Markdown/sanitizer dependency,
 * so this slice delivers the dependency-free EXTERNAL CARD that both kinds share;
 * the guide's rendered-Markdown experience is a deferred follow-up that needs a
 * content pipeline + sanitizer (AGENTS.md §1: no silent scope expansion; §4:
 * sanitize Markdown/HTML). Values are derived from the verified resource only —
 * nothing is fabricated (AGENTS.md §2).
 */

import type { ResourceRef } from '@research-roadmap/schema';

/** Resource kinds handled by the software/guide viewer. */
export type SoftwareGuideKind = 'software' | 'guide';

/** Union of OS values carried by a resource (schema `os` field). */
export type ResourceOs = NonNullable<ResourceRef['os']>[number];

/** Type guard: is this kind handled by the software/guide viewer? */
export function isSoftwareGuideKind(kind: ResourceRef['kind']): kind is SoftwareGuideKind {
  return kind === 'software' || kind === 'guide';
}

/** Human-readable labels for the OS enum (schema `osSchema`). */
export const OS_LABELS: Record<ResourceOs, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  android: 'Android',
  ios: 'iOS',
};

/**
 * Call-to-action label for the primary external-open link. Software resources
 * offer a download; guides offer to read the guide. Falls back to a neutral
 * label for any non software/guide kind.
 */
export function resolveSoftwareGuideCta(resource: ResourceRef): string {
  if (resource.kind === 'software') return 'Download';
  if (resource.kind === 'guide') return 'Read Guide';
  return 'Open Resource';
}

/**
 * Map a resource's optional OS list to ordered, de-duplicated human-readable
 * labels, preserving the canonical OS_LABELS order rather than input order.
 * Unknown values (should not occur post-validation) are skipped.
 */
export function formatOsLabels(os: ResourceRef['os']): string[] {
  if (!os || os.length === 0) return [];
  const order: ResourceOs[] = ['windows', 'macos', 'linux', 'android', 'ios'];
  const set = new Set(os);
  return order.filter((value) => set.has(value)).map((value) => OS_LABELS[value]);
}
