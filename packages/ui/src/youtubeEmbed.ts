/**
 * Pure YouTube URL parsing for privacy-enhanced embedding (AGENTS.md §5).
 *
 * IDs are DERIVED from the resource's already-verified URL — never fabricated
 * (AGENTS.md §2). This module is DOM-free and dependency-free so the parsing
 * logic is trivially unit-testable. It produces only youtube-nocookie.com embed
 * URLs (privacy-enhanced); plain youtube.com embeds are intentionally never
 * produced.
 */

/** YouTube identifiers extracted from a source URL. Null when absent/invalid. */
export interface YouTubeIds {
  videoId: string | null;
  playlistId: string | null;
}

/** A resolved embed target ready to build a privacy-enhanced embed URL. */
export interface YouTubeEmbedTarget {
  kind: 'video' | 'playlist';
  id: string;
}

const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;
const PLAYLIST_ID_RE = /^[A-Za-z0-9_-]{12,}$/;

/** Hostnames we accept as YouTube sources (including the privacy variant). */
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'youtu.be',
]);

function sanitizeVideoId(value: string | null): string | null {
  if (value && VIDEO_ID_RE.test(value)) return value;
  return null;
}

function sanitizePlaylistId(value: string | null): string | null {
  if (value && PLAYLIST_ID_RE.test(value)) return value;
  return null;
}

/**
 * Extract video and playlist identifiers from a YouTube URL.
 *
 * Supports watch (?v= / ?list=), youtu.be short links, /embed/, /shorts/,
 * /live/, and /playlist?list= forms. Returns null identifiers when a component
 * is missing or malformed; never throws on bad input.
 */
export function extractYouTubeIds(rawUrl: string): YouTubeIds {
  const empty: YouTubeIds = { videoId: null, playlistId: null };
  if (typeof rawUrl !== 'string' || rawUrl.length === 0) return empty;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return empty;
  }

  const host = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return empty;

  let videoId: string | null = null;
  const playlistId = sanitizePlaylistId(url.searchParams.get('list'));

  if (host === 'youtu.be') {
    videoId = sanitizeVideoId(url.pathname.split('/').filter(Boolean)[0] ?? null);
  } else {
    // ?v= takes precedence for video; also check common path prefixes.
    videoId = sanitizeVideoId(url.searchParams.get('v'));
    if (videoId === null) {
      const segments = url.pathname.split('/').filter(Boolean);
      const [first, second] = segments;
      if ((first === 'embed' || first === 'shorts' || first === 'live' || first === 'v') && second) {
        videoId = sanitizeVideoId(second);
      }
    }
  }

  return { videoId, playlistId };
}

/**
 * Resolve the best embed target for a given YouTube resource kind.
 *
 * `youtube-playlist` prefers a playlist id; `youtube-video` prefers a video id.
 * Falls back to the other identifier only when it matches the requested kind,
 * so a playlist resource with only a video id is treated as unresolved.
 * Returns null when nothing valid is available.
 */
export function resolveYouTubeEmbedTarget(
  rawUrl: string,
  kind: 'youtube-video' | 'youtube-playlist',
): YouTubeEmbedTarget | null {
  const { videoId, playlistId } = extractYouTubeIds(rawUrl);

  if (kind === 'youtube-playlist') {
    if (playlistId) return { kind: 'playlist', id: playlistId };
    return null;
  }

  // youtube-video
  if (videoId) return { kind: 'video', id: videoId };
  return null;
}

/**
 * Build a privacy-enhanced (youtube-nocookie.com) embed URL for a target.
 * Always uses youtube-nocookie.com; never the tracking youtube.com domain.
 */
export function buildPrivacyEnhancedEmbedUrl(target: YouTubeEmbedTarget): string {
  const base = 'https://www.youtube-nocookie.com/embed';
  if (target.kind === 'playlist') {
    return `${base}/videoseries?list=${encodeURIComponent(target.id)}`;
  }
  return `${base}/${encodeURIComponent(target.id)}`;
}
