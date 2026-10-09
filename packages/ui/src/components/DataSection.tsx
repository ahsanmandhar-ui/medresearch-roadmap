import type { RoadmapNode } from '@research-roadmap/schema';
import {
  colors,
  lightColors,
  darkColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  focusRing,
} from '../tokens.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

/** A prerequisite or child node, with its title resolved by the caller. */
export interface RelatedNode {
  id: string;
  title: string;
}

export type DataSectionTheme = 'light' | 'dark';

export interface DataSectionProps {
  /** The selected roadmap node whose details are displayed. */
  node: RoadmapNode;
  /** Prerequisite nodes, titles resolved by the caller (core.getParents). */
  prerequisites?: RelatedNode[];
  /** Child nodes, titles resolved by the caller (core.getChildren). */
  children?: RelatedNode[];
  /** Invoked with a related node id when its chip is activated. */
  onSelectNode?: (id: string) => void;
  /** Colour theme; defaults to light. */
  theme?: DataSectionTheme;
}

const headingStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

/** Count of resources verified per AGENTS.md §2 (production shows verified only). */
function countVerified(node: RoadmapNode): number {
  return node.resources.filter((r) => r.verification.status === 'verified').length;
}

/**
 * The sidebar / data section for the selected roadmap node (M4.1).
 *
 * Presents the node's description, learning goals, prerequisites, children, and
 * common mistakes, plus a resource summary. Related-node chips become focusable
 * buttons when `onSelectNode` is provided. Colour and motion follow the M3.1
 * theme tokens and the M3.4a reduced-motion setting.
 *
 * Related-node titles are resolved by the caller rather than looked up here so
 * `packages/ui` stays free of a `ui → core` dependency (see docs/STATE.md).
 */
export function DataSection({
  node,
  prerequisites = [],
  children = [],
  onSelectNode,
  theme = 'light',
}: DataSectionProps) {
  const reducedMotion = useReducedMotion();
  const palette = theme === 'dark' ? darkColors : lightColors;
  const verified = countVerified(node);
  const totalResources = node.resources.length;

  const chipHoverBg = theme === 'dark' ? colors.green[800] : colors.green[100];
  const chipTransition = reducedMotion
    ? 'none'
    : `background-color ${transitions.fast} ${transitions.easing.easeOut}, color ${transitions.fast} ${transitions.easing.easeOut}`;

  const renderRelatedList = (items: RelatedNode[], label: string) => {
    if (items.length === 0) {
      return (
        <p style={{ margin: 0, fontSize: typography.fontSize.sm, color: palette.textSecondary }}>
          None
        </p>
      );
    }
    return (
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
        {items.map((item) => {
          const ariaLabel = `${label}: ${item.title}`;
          const base: React.CSSProperties = {
            fontSize: typography.fontSize.sm,
            color: palette.text,
            background: palette.surface,
            border: `1px solid ${palette.border}`,
            borderRadius: borderRadius.full,
            padding: '4px 12px',
            transition: chipTransition,
            font: 'inherit',
          };
          if (typeof onSelectNode !== 'function') {
            return (
              <li key={item.id} style={base}>
                {item.title}
              </li>
            );
          }
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-label={ariaLabel}
                onClick={() => onSelectNode(item.id)}
                style={{ ...base, cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = chipHoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = palette.surface;
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = `${focusRing.width} solid ${palette.borderFocus}`;
                  e.currentTarget.style.outlineOffset = focusRing.offset;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                {item.title}
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  const sectionStyle: React.CSSProperties = { marginBottom: spacing[4] };

  return (
    <aside
      aria-label={`Details for ${node.title}`}
      style={{
        background: palette.background,
        color: palette.text,
        border: `1px solid ${palette.border}`,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.sm,
        padding: spacing[5],
        maxWidth: '360px',
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: typography.fontFamily.sans,
      }}
    >
      <h2 style={{ margin: '0 0 12px 0', fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, lineHeight: typography.lineHeight.tight }}>
        {node.title}
      </h2>

      <p
        data-testid="resource-summary"
        style={{ margin: '0 0 16px 0', fontSize: typography.fontSize.sm, color: palette.textSecondary }}
      >
        {totalResources} {totalResources === 1 ? 'resource' : 'resources'} · {verified} verified
      </p>

      <section aria-labelledby="ds-description" style={sectionStyle}>
        <h3 id="ds-description" style={headingStyle}>
          Description
        </h3>
        <p style={{ margin: 0, fontSize: typography.fontSize.base, lineHeight: typography.lineHeight.relaxed, color: palette.text }}>
          {node.description}
        </p>
      </section>

      <section aria-labelledby="ds-goals" style={sectionStyle}>
        <h3 id="ds-goals" style={headingStyle}>
          Learning goals
        </h3>
        {node.learningGoals.length === 0 ? (
          <p style={{ margin: 0, fontSize: typography.fontSize.sm, color: palette.textSecondary }}>None</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: spacing[5], fontSize: typography.fontSize.base, lineHeight: typography.lineHeight.relaxed, color: palette.text }}>
            {node.learningGoals.map((goal, i) => (
              <li key={i}>{goal}</li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="ds-prereqs" style={sectionStyle}>
        <h3 id="ds-prereqs" style={headingStyle}>
          Prerequisites
        </h3>
        {renderRelatedList(prerequisites, 'Prerequisite')}
      </section>

      <section aria-labelledby="ds-children" style={sectionStyle}>
        <h3 id="ds-children" style={headingStyle}>
          Leads to
        </h3>
        {renderRelatedList(children, 'Child node')}
      </section>

      {node.childrenHint ? (
        <section aria-labelledby="ds-hint" style={sectionStyle}>
          <h3 id="ds-hint" style={headingStyle}>
            What's next
          </h3>
          <p style={{ margin: 0, fontSize: typography.fontSize.sm, color: palette.textSecondary, lineHeight: typography.lineHeight.normal }}>
            {node.childrenHint}
          </p>
        </section>
      ) : null}

      {node.commonMistakes && node.commonMistakes.length > 0 ? (
        <section aria-labelledby="ds-mistakes">
          <h3 id="ds-mistakes" style={headingStyle}>
            Common mistakes
          </h3>
          <ul style={{ margin: 0, paddingLeft: spacing[5], fontSize: typography.fontSize.base, lineHeight: typography.lineHeight.relaxed, color: palette.text }}>
            {node.commonMistakes.map((mistake, i) => (
              <li key={i}>{mistake}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}