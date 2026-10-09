import { describe, it, expect } from 'vitest';
import {
  extractYouTubeIds,
  resolveYouTubeEmbedTarget,
  buildPrivacyEnhancedEmbedUrl,
} from './youtubeEmbed.js';

describe('extractYouTubeIds', () => {
  it('parses a watch URL video id', () => {
    expect(extractYouTubeIds('https://www.youtube.com/watch?v=dQw4w9WgXcQ').videoId).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('parses a playlist from the list param', () => {
    const ids = extractYouTubeIds('https://www.youtube.com/playlist?list=PLbpi6ZahtOH6Blw3RGYpWkSAtiBxb7Wgc');
    expect(ids.playlistId).toBe('PLbpi6ZahtOH6Blw3RGYpWkSAtiBxb7Wgc');
    expect(ids.videoId).toBeNull();
  });

  it('parses both video and playlist from a watch URL', () => {
    const ids = extractYouTubeIds(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLbpi6ZahtOH6Blw3RGYpWkSAtiBxb7Wgc',
    );
    expect(ids.videoId).toBe('dQw4w9WgXcQ');
    expect(ids.playlistId).toBe('PLbpi6ZahtOH6Blw3RGYpWkSAtiBxb7Wgc');
  });

  it('parses a youtu.be short link', () => {
    expect(extractYouTubeIds('https://youtu.be/dQw4w9WgXcQ').videoId).toBe('dQw4w9WgXcQ');
  });

  it('parses /embed/, /shorts/, and /live/ paths', () => {
    expect(extractYouTubeIds('https://www.youtube.com/embed/dQw4w9WgXcQ').videoId).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeIds('https://www.youtube.com/shorts/dQw4w9WgXcQ').videoId).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeIds('https://www.youtube.com/live/dQw4w9WgXcQ').videoId).toBe('dQw4w9WgXcQ');
  });

  it('returns null identifiers for a non-YouTube host', () => {
    expect(extractYouTubeIds('https://example.com/watch?v=dQw4w9WgXcQ')).toEqual({
      videoId: null,
      playlistId: null,
    });
  });

  it('rejects malformed video ids (wrong length)', () => {
    expect(extractYouTubeIds('https://www.youtube.com/watch?v=tooshort').videoId).toBeNull();
  });

  it('never throws on invalid input', () => {
    expect(extractYouTubeIds('not a url')).toEqual({ videoId: null, playlistId: null });
    expect(extractYouTubeIds('')).toEqual({ videoId: null, playlistId: null });
  });
});

describe('resolveYouTubeEmbedTarget', () => {
  it('resolves a video target for youtube-video', () => {
    expect(resolveYouTubeEmbedTarget('https://youtu.be/dQw4w9WgXcQ', 'youtube-video')).toEqual({
      kind: 'video',
      id: 'dQw4w9WgXcQ',
    });
  });

  it('resolves a playlist target for youtube-playlist', () => {
    expect(
      resolveYouTubeEmbedTarget(
        'https://www.youtube.com/playlist?list=PLbpi6ZahtOH6Blw3RGYpWkSAtiBxb7Wgc',
        'youtube-playlist',
      ),
    ).toEqual({ kind: 'playlist', id: 'PLbpi6ZahtOH6Blw3RGYpWkSAtiBxb7Wgc' });
  });

  it('returns null for a playlist resource lacking a playlist id', () => {
    expect(resolveYouTubeEmbedTarget('https://youtu.be/dQw4w9WgXcQ', 'youtube-playlist')).toBeNull();
  });

  it('returns null for a video resource lacking a video id', () => {
    expect(
      resolveYouTubeEmbedTarget(
        'https://www.youtube.com/playlist?list=PLbpi6ZahtOH6Blw3RGYpWkSAtiBxb7Wgc',
        'youtube-video',
      ),
    ).toBeNull();
  });
});

describe('buildPrivacyEnhancedEmbedUrl', () => {
  it('builds a nocookie video embed URL', () => {
    expect(buildPrivacyEnhancedEmbedUrl({ kind: 'video', id: 'dQw4w9WgXcQ' })).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    );
  });

  it('builds a nocookie playlist (videoseries) embed URL', () => {
    expect(
      buildPrivacyEnhancedEmbedUrl({ kind: 'playlist', id: 'PLbpi6ZahtOH6Blw3RGYpWkSAtiBxb7Wgc' }),
    ).toBe(
      'https://www.youtube-nocookie.com/embed/videoseries?list=PLbpi6ZahtOH6Blw3RGYpWkSAtiBxb7Wgc',
    );
  });

  it('never uses the tracking youtube.com domain', () => {
    const url = buildPrivacyEnhancedEmbedUrl({ kind: 'video', id: 'dQw4w9WgXcQ' });
    expect(url.startsWith('https://www.youtube-nocookie.com/embed/')).toBe(true);
  });
});
