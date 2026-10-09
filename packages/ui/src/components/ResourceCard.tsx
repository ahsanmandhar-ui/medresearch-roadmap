import type { ResourceRef } from '@research-roadmap/schema';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  focusRing,
} from '../tokens.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

export type ResourceCardTheme = 'light' | 'dark';

/** Human-readable labels for each resource kind (no invented metadata). */
const KIND_LABELS: Record<ResourceRef['kind'], string> = {
  'youtube-video': 'Video',
  'youtube-playlist': 'Playlist',
  'github-repo': 'Repository',
  'github-site': 'Site',
  'web-link': 'Web link',
  software: 'Software',
  guide: 'Guide',
};

/** Human-readable labels for difficulty. */
const DIFFICULTY_LABELS: Record<NonNullable<ResourceRef['difficulty']>, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/** Human-readable labels for priority. */
const PRIORITY_LABELS: Record<NonNullable<ResourceRef['priority']>, string> = {
  essential: 'Essential',
  recommended: 'Recommended',
  supplementary: 'Supplementary',
};

/** Human-readable labels for verification status. */
const VERIFICATION_LABELS: Record<ResourceRef['verification']['status'], string> = {
  verified: 'Verified',
  pending: 'Pending',
  rejected: 'Rejected',
};

/** Semantic colors keyed by verification status. */
const VERIFICATION_COLORS: Record<
  ResourceRef['verification']['status'],
  { bg: string; fg: string }
> = {
  verified: { bg: colors.semantic.successLight, fg: colors.semantic.success },
  pending: { bg: colors.semantic.warningLight, fg: colors.semantic.warning },
  rejected: { bg: colors.semantic.errorLight, fg: colors.semantic.error },
};

export interface ResourceCardProps {
  /** The resource to display (already schema-validated). */
  resource: ResourceRef;
  /** Visual theme; defaults to light. */
  theme?: ResourceCardTheme;
  /**
   * Optional verified-only viewer content (AGENTS.md §5). The production Viewer
   * renders viewers only for `verified` resources; non-verified resources show
   * the card's external-open action instead. This prop is ignored for
   * non-verified resources so unverified content is never displayed.
   */
  viewer?: React.ReactNode;
}

export function ResourceCard({
  resource,
  theme = 'light',
  viewer,
}: ResourceCardProps) {
  const reducedMotion = useReducedMotion();
  const hoverTransition = reducedMotion
    ? 'none'
    : `border-color ${transitions.fast} ${transitions.easing.easeOut}, box-shadow ${transitions.fast} ${transitions.easing.easeOut}`;

  const verification = resource.verification.status;
  const verificationColor = VERIFICATION_COLORS[verification];
  const isVerified = verification === 'verified';

  return (
    <article
      data-testid="resource-card"
      data-verification={verification}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[3],
        padding: spacing[4],
        backgroundColor: theme === 'dark' ? '#1a1a1a' : colors.neutral[0],
        border: `1px solid ${theme === 'dark' ? '#333333' : colors.neutral[200]}`,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.sm,
        transition: hoverTransition,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: spacing[3],
        }}
      >
        <h4
          style={{
            margin: 0,
            fontFamily: typography.fontFamily.sans,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            color: theme === 'dark' ? '#f5f5f5' : colors.neutral[800],
            lineHeight: typography.lineHeight.tight,
          }}
        >
          {resource.title}
        </h4>
        <span
          data-testid="verification-badge"
          aria-label={`Verification status: ${VERIFICATION_LABELS[verification]}`}
          style={{
            flexShrink: 0,
            padding: `${spacing[1]} ${spacing[2]}`,
            backgroundColor: verificationColor.bg,
            color: verificationColor.fg,
            borderRadius: borderRadius.full,
            fontFamily: typography.fontFamily.sans,
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.semibold,
          }}
        >
          {VERIFICATION_LABELS[verification]}
        </span>
      </div>

      {resource.organization ? (
        <span
          style={{
            fontFamily: typography.fontFamily.sans,
            fontSize: typography.fontSize.sm,
            color: theme === 'dark' ? '#a0a0a0' : colors.neutral[500],
          }}
        >
          {resource.organization}
        </span>
      ) : null}

      <p
        style={{
          margin: 0,
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.fontSize.sm,
          color: theme === 'dark' ? '#d0d0d0' : colors.neutral[600],
          lineHeight: typography.lineHeight.normal,
        }}
      >
        {resource.description}
      </p>

      <div
        data-testid="badge-row"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing[2],
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.fontSize.xs,
        }}
      >
        <Badge theme={theme} label={KIND_LABELS[resource.kind]} />
        {resource.difficulty ? (
          <Badge theme={theme} label={DIFFICULTY_LABELS[resource.difficulty]} />
        ) : null}
        {resource.priority ? (
          <Badge theme={theme} label={PRIORITY_LABELS[resource.priority]} />
        ) : null}
      </div>

      {resource.tags.length > 0 ? (
        <ul
          data-testid="tag-list"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: spacing[2],
            margin: 0,
            padding: 0,
            listStyle: 'none',
          }}
        >
          {resource.tags.map((tag) => (
            <li
              key={tag}
              style={{
                padding: `${spacing[1]} ${spacing[2]}`,
                backgroundColor: theme === 'dark' ? '#262626' : colors.neutral[100],
                color: theme === 'dark' ? '#d0d0d0' : colors.neutral[600],
                borderRadius: borderRadius.sm,
                fontFamily: typography.fontFamily.sans,
                fontSize: typography.fontSize.xs,
              }}
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      {isVerified && viewer ? <div data-testid="viewer-slot">{viewer}</div> : null}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing[3],
          marginTop: spacing[1],
        }}
      >
        {resource.verification.checkedAt ? (
          <span
            style={{
              fontFamily: typography.fontFamily.sans,
              fontSize: typography.fontSize.xs,
              color: theme === 'dark' ? '#767676' : colors.neutral[400],
            }}
          >
            Checked {resource.verification.checkedAt}
          </span>
        ) : (
          <span />
        )}
        <a
          data-testid="external-open"
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontFamily: typography.fontFamily.sans,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: theme === 'dark' ? '#66bb6a' : colors.neutral[800],
            textDecoration: 'underline',
            borderRadius: borderRadius.sm,
            outline: 'none',
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
      </div>
    </article>
  );
}

interface BadgeProps {
  theme: ResourceCardTheme;
  label: string;
}

function Badge({ theme, label }: BadgeProps) {
  return (
    <span
      style={{
        padding: `${spacing[1]} ${spacing[2]}`,
        backgroundColor: theme === 'dark' ? '#262626' : colors.neutral[100],
        color: theme === 'dark' ? '#d0d0d0' : colors.neutral[600],
        borderRadius: borderRadius.full,
      }}
    >
      {label}
    </span>
  );
}
