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
import { parseGitHubRepo, formatCount } from '../githubRepo.js';

export type GitHubRepoViewerTheme = 'light' | 'dark';

/**
 * Optional repository metadata shown in the viewer (AGENTS.md §5). Every field
 * MUST be sourced from an authoritative provider (e.g. a cached GitHub API
 * response resolved off the client) — the viewer NEVER fabricates these values
 * (AGENTS.md §2); an absent field is simply omitted from the UI. GitHub tokens
 * / API keys are never sent from the client (AGENTS.md §4).
 */
export interface GitHubRepoMeta {
  /** Repository description. Falls back to the resource description when absent. */
  description?: string;
  /** Primary programming language, e.g. "TypeScript". */
  language?: string;
  /** Optional CSS color for the language indicator dot. */
  languageColor?: string;
  stars?: number;
  forks?: number;
  openIssues?: number;
  /** SPDX-style license identifier, e.g. "MIT". */
  license?: string;
  /** Last-updated ISO date (YYYY-MM-DD) if known. */
  updatedAt?: string;
  /** Repository topics. */
  topics?: readonly string[];
  /** Plain-text README preview. */
  readme?: string;
}

export interface GitHubRepoViewerProps {
  /** The github-repo resource (already schema-validated). */
  resource: ResourceRef;
  /** Authoritative repository metadata (see GitHubRepoMeta). */
  meta?: GitHubRepoMeta;
  /** Visual theme; defaults to light. */
  theme?: GitHubRepoViewerTheme;
}

/** Neutral git-branch style icon drawn with basic shapes (no brand asset). */
function RepositoryIcon() {
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
      <circle cx="4" cy="3.5" r="1.5" />
      <circle cx="4" cy="12.5" r="1.5" />
      <circle cx="11.5" cy="6" r="1.5" />
      <path d="M4 5v6M11.5 7.5c0 2.6-3.2 3-7.5 3" />
    </svg>
  );
}

/**
 * GitHub repository viewer (AGENTS.md §5).
 *
 * Does NOT iframe the repository page (explicitly forbidden). Instead it shows
 * the repository title and owner (DERIVED from the verified URL, never
 * fabricated), plus caller-supplied description, language, useful metadata
 * (stars/forks/issues/license/topics), an optional README preview, and an
 * "Open Repository" external action (target=_blank + rel=noopener noreferrer).
 * Any metadata not supplied is omitted rather than invented.
 */
export function GitHubRepoViewer({
  resource,
  meta,
  theme = 'light',
}: GitHubRepoViewerProps) {
  if (resource.kind !== 'github-repo') return null;

  const reducedMotion = useReducedMotion();
  const ref = parseGitHubRepo(resource.url);
  const description = meta?.description ?? resource.description;

  const isDark = theme === 'dark';
  const surface = isDark ? '#1a1a1a' : colors.neutral[0];
  const border = isDark ? '#333333' : colors.neutral[200];
  const headingFg = isDark ? '#f0f0f0' : colors.neutral[900];
  const bodyFg = isDark ? '#c8c8c8' : colors.neutral[700];
  const mutedFg = isDark ? '#8f8f8f' : colors.neutral[500];
  const chipBg = isDark ? '#262626' : colors.neutral[100];
  const chipFg = isDark ? '#d0d0d0' : colors.neutral[600];
  const codeBg = isDark ? '#0d1117' : colors.neutral[50];
  const buttonTransition = reducedMotion
    ? 'none'
    : `box-shadow ${transitions.fast} ${transitions.easing.easeOut}`;

  const stats: Array<{ key: string; label: string; value: string }> = [];
  if (typeof meta?.stars === 'number') {
    stats.push({ key: 'stars', label: 'Stars', value: formatCount(meta.stars) });
  }
  if (typeof meta?.forks === 'number') {
    stats.push({ key: 'forks', label: 'Forks', value: formatCount(meta.forks) });
  }
  if (typeof meta?.openIssues === 'number') {
    stats.push({ key: 'issues', label: 'Open issues', value: formatCount(meta.openIssues) });
  }

  const hasChips =
    Boolean(meta?.language || meta?.license) ||
    stats.length > 0 ||
    (meta?.topics?.length ?? 0) > 0;

  return (
    <article
      data-testid="github-repo-viewer"
      data-owner={ref?.owner}
      data-repo={ref?.repo}
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
          color: isDark ? '#c8c8c8' : colors.neutral[700],
        }}
      >
        <RepositoryIcon />
        {ref ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: typography.fontFamily.sans,
                fontSize: typography.fontSize.xs,
                color: mutedFg,
              }}
            >
              {ref.owner}
            </span>
            <h3
              style={{
                margin: 0,
                fontFamily: typography.fontFamily.sans,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: headingFg,
              }}
            >
              {ref.repo}
            </h3>
          </div>
        ) : (
          <h3
            style={{
              margin: 0,
              fontFamily: typography.fontFamily.sans,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: headingFg,
            }}
          >
            {resource.title}
          </h3>
        )}
      </header>
      {description ? (
        <p
          style={{
            margin: 0,
            fontFamily: typography.fontFamily.sans,
            fontSize: typography.fontSize.sm,
            lineHeight: 1.5,
            color: bodyFg,
          }}
        >
          {description}
        </p>
      ) : null}

      {hasChips ? (
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
          {meta?.language ? (
            <li style={chipStyle(chipBg, chipFg)}>
              {meta.languageColor ? (
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: borderRadius.full,
                    backgroundColor: meta.languageColor,
                    display: 'inline-block',
                  }}
                />
              ) : null}
              {meta.language}
            </li>
          ) : null}
          {meta?.license ? <li style={chipStyle(chipBg, chipFg)}>{meta.license}</li> : null}
          {stats.map((stat) => (
            <li key={stat.key} data-testid={`stat-${stat.key}`} style={chipStyle(chipBg, chipFg)}>
              <strong style={{ fontWeight: typography.fontWeight.semibold }}>{stat.value}</strong>{' '}
              {stat.label}
            </li>
          ))}
          {meta?.topics?.map((topic) => (
            <li key={topic} style={chipStyle(chipBg, chipFg)}>
              {topic}
            </li>
          ))}
        </ul>
      ) : null}

      {meta?.readme ? (
        <div
          data-testid="readme-preview"
          style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}
        >
          <span
            style={{
              fontFamily: typography.fontFamily.sans,
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.semibold,
              color: mutedFg,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            README preview
          </span>
          <pre
            style={{
              margin: 0,
              maxHeight: 180,
              overflow: 'auto',
              padding: spacing[3],
              backgroundColor: codeBg,
              border: `1px solid ${border}`,
              borderRadius: borderRadius.md,
              fontFamily: typography.fontFamily.mono,
              fontSize: typography.fontSize.sm,
              color: bodyFg,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {meta.readme}
          </pre>
        </div>
      ) : null}

      {meta?.updatedAt ? (
        <span
          style={{
            fontFamily: typography.fontFamily.sans,
            fontSize: typography.fontSize.xs,
            color: mutedFg,
          }}
        >
          Updated {meta.updatedAt}
        </span>
      ) : null}

      <a
        data-testid="open-repository"
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
        Open Repository ↗
      </a>
    </article>
  );
}

function chipStyle(bg: string, fg: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[1],
    padding: `${spacing[1]} ${spacing[2]}`,
    backgroundColor: bg,
    color: fg,
    borderRadius: borderRadius.full,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xs,
  };
}
