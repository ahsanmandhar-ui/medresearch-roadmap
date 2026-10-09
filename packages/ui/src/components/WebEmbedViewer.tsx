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
import { resolveWebEmbedMode, displayHost } from '../webEmbed.js';

export type WebEmbedViewerTheme = 'light' | 'dark';

export interface WebEmbedViewerProps {
  /** The web-link / github-site resource (already schema-validated). */
  resource: ResourceRef;
  /** Visual theme; defaults to light. */
  theme?: WebEmbedViewerTheme;
}

/** Globe icon drawn with basic shapes (no brand asset). */
function GlobeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M1.5 8h13M8 1.5c2 2 2 11 0 13M8 1.5c-2 2-2 11 0 13" />
    </svg>
  );
}

/**
 * General-website / static-site viewer (AGENTS.md §5, docs/PLAN.md M4.5).
 *
 * Frames the site ONLY when the resource's verified `embed` mode is `'iframe'`
 * (i.e. the verification workflow confirmed the target permits framing via
 * X-Frame-Options / CSP frame-ancestors). Otherwise it renders a card with an
 * external-open action. The client never infers frameability and never proxies
 * or strips frame-blocking security headers (AGENTS.md §2/§4). Delivered via
 * ResourceCard's `viewer` prop, which already gates on `verified`.
 */
export function WebEmbedViewer({ resource, theme = 'light' }: WebEmbedViewerProps) {
  const mode = resolveWebEmbedMode(resource);
  if (mode === 'card' && resource.kind !== 'web-link' && resource.kind !== 'github-site') {
    return null;
  }

  const reducedMotion = useReducedMotion();
  const isDark = theme === 'dark';

  const surface = isDark ? '#1a1a1a' : colors.neutral[0];
  const border = isDark ? '#333333' : colors.neutral[200];
  const mutedFg = isDark ? '#8f8f8f' : colors.neutral[500];

  const buttonTransition = reducedMotion
    ? 'none'
    : `box-shadow ${transitions.fast} ${transitions.easing.easeOut}`;

  const host = displayHost(resource.url);

  if (mode === 'iframe') {
    return (
      <article
        data-testid="web-embed-viewer"
        data-mode="iframe"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[2],
          padding: spacing[3],
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
          <GlobeIcon />
          <span data-testid="web-host">{host || resource.url}</span>
        </header>
        <iframe
          data-testid="web-embed-frame"
          title={resource.title}
          src={resource.url}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-forms allow-popups"
          style={{
            width: '100%',
            minHeight: 420,
            border: `1px solid ${border}`,
            borderRadius: borderRadius.md,
            backgroundColor: surface,
          }}
        />
      </article>
    );
  }

  return renderCard({ resource, isDark, surface, border, mutedFg, buttonTransition, host });
}

interface RenderCardArgs {
  resource: ResourceRef;
  isDark: boolean;
  surface: string;
  border: string;
  mutedFg: string;
  buttonTransition: string;
  host: string;
}

function renderCard({
  resource,
  isDark,
  surface,
  border,
  mutedFg,
  buttonTransition,
  host,
}: RenderCardArgs) {
  const headingFg = isDark ? '#f0f0f0' : colors.neutral[900];
  const bodyFg = isDark ? '#c8c8c8' : colors.neutral[700];

  return (
    <article
      data-testid="web-embed-viewer"
      data-mode="card"
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
          fontFamily: typography.fontFamily.sans,
        }}
      >
        <span style={{ color: mutedFg }}>
          <GlobeIcon />
        </span>
        <h3
          style={{
            margin: 0,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            color: headingFg,
          }}
        >
          {resource.title}
        </h3>
      </header>

      {host ? (
        <span
          data-testid="web-host"
          style={{
            fontFamily: typography.fontFamily.mono,
            fontSize: typography.fontSize.xs,
            color: mutedFg,
          }}
        >
          {host}
        </span>
      ) : null}

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

      <span
        style={{
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.fontSize.xs,
          color: mutedFg,
        }}
      >
        This site can’t be safely embedded, so it opens in a new tab.
      </span>

      <a
        data-testid="external-open"
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
          transition: buttonTransition,
        }}
        onFocus={(event) => {
          event.currentTarget.style.boxShadow = `0 0 0 ${focusRing.width} ${focusRing.color}`;
        }}
        onBlur={(event) => {
          event.currentTarget.style.boxShadow = 'none';
        }}
      >
        Open ↗
      </a>
    </article>
  );
}
