import type { ResourceRef } from '@research-roadmap/schema';
import { borderRadius } from '../tokens.js';
import type { FrameSafetyResult } from '../frameSafety.js';

export type WebEmbedTheme = 'light' | 'dark';

export interface WebEmbedProps {
  /** The resource to embed (must be kind github-site or web-link). */
  resource: ResourceRef;
  /** Visual theme for the container chrome; defaults to light. */
  theme?: WebEmbedTheme;
  /**
   * Optional defence-in-depth check. When provided, the iframe renders only if
   * the recorded `embed` mode is `iframe` AND this result is frameable. This
   * lets a caller that re-verified the target's framing headers (via
   * `evaluateFrameability`) override a stale `embed: 'iframe'` decision at
   * render time, without the component ever fetching headers itself.
   */
  frameCheck?: FrameSafetyResult;
}

/** Resource kinds that a general web embed viewer can handle. */
const EMBEDDABLE_WEB_KINDS = new Set(['github-site', 'web-link']);

/**
 * Web embed viewer for GitHub Pages / static sites and general websites
 * (AGENTS.md §5).
 *
 * Renders an iframe ONLY when the resource's verified `embed` mode is `iframe`
 * (and, if supplied, a `frameCheck` still reports frameable). Any other embed
 * mode (`card`/`external`) or an unframeable target renders nothing — the
 * enclosing ResourceCard already provides the external-open fallback action.
 *
 * Never proxies or strips frame-blocking security headers (AGENTS.md §4): it
 * neither sends nor alters network requests; it only decides whether to render
 * a native <iframe> that the browser will subject to the target's own headers.
 */
export function WebEmbed({ resource, theme = 'light', frameCheck }: WebEmbedProps) {
  if (!EMBEDDABLE_WEB_KINDS.has(resource.kind)) return null;
  if (resource.embed !== 'iframe') return null;

  // Defence in depth: honour a fresh framing verdict when one is supplied.
  if (frameCheck && !frameCheck.frameable) return null;

  return (
    <div
      data-testid="web-embed"
      style={{
        position: 'relative',
        width: '100%',
        height: '70vh',
        minHeight: 360,
        overflow: 'hidden',
        borderRadius: borderRadius.md,
        border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e5e5'}`,
        backgroundColor: theme === 'dark' ? '#0d0d0d' : '#ffffff',
      }}
    >
      <iframe
        title={resource.title}
        src={resource.url}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={{
          width: '100%',
          height: '100%',
          border: 0,
          display: 'block',
        }}
      />
    </div>
  );
}
