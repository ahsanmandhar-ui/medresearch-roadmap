import type { ResourceRef } from '@research-roadmap/schema';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  focusRing,
  transitions,
} from '../tokens.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import {
  isSoftwareGuideKind,
  resolveSoftwareGuideCta,
  formatOsLabels,
} from '../softwareGuide.js';

export type SoftwareGuideViewerTheme = 'light' | 'dark';

export interface SoftwareGuideViewerProps {
  /** The software or guide resource (already schema-validated). */
  resource: ResourceRef;
  /** Visual theme; defaults to light. */
  theme?: SoftwareGuideViewerTheme;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const PRIORITY_LABELS: Record<string, string> = {
  essential: 'Essential',
  recommended: 'Recommended',
  supplementary: 'Supplementary',
};

/**
 * External download/read card for `software` and `guide` resources
 * (docs/PLAN.md M4.6, CONTENT_RULES.md). Renders nothing for other kinds.
 *
 * All values are derived from the verified resource (AGENTS.md §2 — never
 * fabricated). The primary action is a secure external-open link
 * (target=_blank + rel=noopener noreferrer, §4); the optional `companion`
 * link (when present) is offered as a secondary action. The guide's inline
 * Markdown experience is intentionally out of scope for this dependency-free
 * slice (see softwareGuide.ts header).
 */
export function SoftwareGuideViewer({ resource, theme = 'light' }: SoftwareGuideViewerProps) {
  if (!isSoftwareGuideKind(resource.kind)) return null;

  const reducedMotion = useReducedMotion();
  const isDark = theme === 'dark';

  const surface = isDark ? '#1a1a1a' : colors.neutral[0];
  const border = isDark ? '#333333' : colors.neutral[200];
  const headingFg = isDark ? '#f5f5f5' : colors.neutral[800];
  const bodyFg = isDark ? '#c8c8c8' : colors.neutral[700];
  const mutedFg = isDark ? '#8f8f8f' : colors.neutral[500];
  const chipBg = isDark ? colors.neutral[800] : colors.neutral[100];
  const chipFg = isDark ? colors.neutral[200] : colors.neutral[700];

  const linkTransition = reducedMotion
    ? 'none'
    : `border-color ${transitions.fast} ${transitions.easing.easeOut}, box-shadow ${transitions.fast} ${transitions.easing.easeOut}`;

  const cta = resolveSoftwareGuideCta(resource);
  const osLabels = formatOsLabels(resource.os);
  const kindLabel = resource.kind === 'software' ? 'Software' : 'Guide';

  return (
    <article
      data-testid="software-guide-viewer"
      data-kind={resource.kind}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[3],
        padding: spacing[4],
        backgroundColor: surface,
        border: `1px solid ${border}`,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.sm,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          color: mutedFg,
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.fontSize.xs,
        }}
      >
        <span aria-hidden="true">
          {resource.kind === 'software' ? <DownloadIcon /> : <GuideIcon />}
        </span>
        <span data-testid="kind-label">{kindLabel}</span>
      </header>

      <h3
        style={{
          margin: 0,
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: headingFg,
          lineHeight: typography.lineHeight.tight,
        }}
      >
        {resource.title}
      </h3>

      {resource.organization ? (
        <span
          data-testid="organization"
          style={{
            fontFamily: typography.fontFamily.sans,
            fontSize: typography.fontSize.xs,
            color: mutedFg,
          }}
        >
          {resource.organization}
        </span>
      ) : null}

      {resource.description ? (
        <p
          style={{
            margin: 0,
            fontFamily: typography.fontFamily.sans,
            fontSize: typography.fontSize.sm,
            lineHeight: 1.5,
            color: bodyFg,
          }}
        >
          {resource.description}
        </p>
      ) : null}

      {osLabels.length > 0 || resource.difficulty || resource.priority || resource.tags.length > 0 ? (
        <ul
          data-testid="meta-list"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: spacing[2],
            margin: 0,
            padding: 0,
            listStyle: 'none',
          }}
        >
          {osLabels.map((label) => (
            <li key={label} data-testid="os-chip" style={chipStyle(chipBg, chipFg)}>
              {label}
            </li>
          ))}
          {resource.difficulty ? (
            <li data-testid="difficulty-chip" style={chipStyle(chipBg, chipFg)}>
              {DIFFICULTY_LABELS[resource.difficulty] ?? resource.difficulty}
            </li>
          ) : null}
          {resource.priority ? (
            <li data-testid="priority-chip" style={chipStyle(chipBg, chipFg)}>
              {PRIORITY_LABELS[resource.priority] ?? resource.priority}
            </li>
          ) : null}
          {resource.tags.map((tag) => (
            <li key={tag} style={chipStyle(chipBg, chipFg)}>
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      {resource.companion ? (
        <a
          data-testid="companion-link"
          href={resource.companion.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: spacing[1],
            padding: `${spacing[2]} ${spacing[3]}`,
            border: `1px solid ${border}`,
            borderRadius: borderRadius.md,
            textDecoration: 'none',
            fontFamily: typography.fontFamily.sans,
            fontSize: typography.fontSize.sm,
            color: bodyFg,
            outline: 'none',
            transition: linkTransition,
          }}
          onFocus={(event) => {
            event.currentTarget.style.boxShadow = `0 0 0 ${focusRing.width} ${focusRing.color}`;
          }}
          onBlur={(event) => {
            event.currentTarget.style.boxShadow = 'none';
          }}
        >
          {resource.companion.title} ↗
        </a>
      ) : null}

      <a
        data-testid="open-resource"
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: spacing[1],
          padding: `${spacing[2]} ${spacing[4]}`,
          backgroundColor: isDark ? colors.neutral[800] : colors.neutral[900],
          color: colors.neutral[0],
          borderRadius: borderRadius.md,
          textDecoration: 'none',
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          outline: 'none',
          transition: linkTransition,
        }}
        onFocus={(event) => {
          event.currentTarget.style.boxShadow = `0 0 0 ${focusRing.width} ${focusRing.color}`;
        }}
        onBlur={(event) => {
          event.currentTarget.style.boxShadow = 'none';
        }}
      >
        {cta} ↗
      </a>
    </article>
  );
}

function chipStyle(bg: string, fg: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${spacing[1]} ${spacing[2]}`,
    backgroundColor: bg,
    color: fg,
    borderRadius: borderRadius.full,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xs,
  };
}

/** Simple download-arrow icon (no brand asset). */
function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5v8m0 0 3-3m-3 3-3-3M2.5 12.5h11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Simple open-book icon (no brand asset). */
function GuideIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 3.5C6.5 2.5 4.5 2.3 2.5 2.7v9c2-.4 4-.2 5.5.8 1.5-1 3.5-1.2 5.5-.8v-9c-2-.4-4-.2-5.5.8Zm0 0v9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
