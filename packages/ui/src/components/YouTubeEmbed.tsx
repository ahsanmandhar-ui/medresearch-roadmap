import type { ResourceRef } from '@research-roadmap/schema';
import { borderRadius } from '../tokens.js';
import {
  resolveYouTubeEmbedTarget,
  buildPrivacyEnhancedEmbedUrl,
} from '../youtubeEmbed.js';

export type YouTubeEmbedTheme = 'light' | 'dark';

export interface YouTubeEmbedProps {
  /** The resource to embed (must be kind youtube-video or youtube-playlist). */
  resource: ResourceRef;
  /** Visual theme for the container chrome; defaults to light. */
  theme?: YouTubeEmbedTheme;
}

/**
 * Privacy-enhanced YouTube iframe viewer (AGENTS.md §5).
 *
 * Renders a responsive 16:9 embed using youtube-nocookie.com. The video/playlist
 * id is derived from the resource's already-verified URL — never fabricated.
 * Renders nothing when the resource's `embed` mode is not `iframe` (those modes
 * fall back to the card's external-open action) or when no valid id can be
 * derived. Never proxies or strips frame-blocking headers (AGENTS.md §4).
 */
export function YouTubeEmbed({ resource, theme = 'light' }: YouTubeEmbedProps) {
  const isYouTube =
    resource.kind === 'youtube-video' || resource.kind === 'youtube-playlist';
  if (!isYouTube) return null;
  if (resource.embed !== 'iframe') return null;

  const kind: 'youtube-video' | 'youtube-playlist' =
    resource.kind === 'youtube-playlist' ? 'youtube-playlist' : 'youtube-video';
  const target = resolveYouTubeEmbedTarget(resource.url, kind);
  if (!target) return null;

  const embedUrl = buildPrivacyEnhancedEmbedUrl(target);

  return (
    <div
      data-testid="youtube-embed"
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '56.25%', // 16:9 aspect ratio
        height: 0,
        overflow: 'hidden',
        borderRadius: borderRadius.md,
        backgroundColor: theme === 'dark' ? '#0d0d0d' : '#000000',
      }}
    >
      <iframe
        title={resource.title}
        src={embedUrl}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 0,
        }}
      />
    </div>
  );
}
