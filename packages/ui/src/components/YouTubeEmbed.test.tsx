import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ResourceRef } from '@research-roadmap/schema';
import { YouTubeEmbed } from './YouTubeEmbed.js';

function makeResource(overrides: Partial<ResourceRef> = {}): ResourceRef {
  return {
    id: 'res-yt',
    partition: 'videos',
    kind: 'youtube-video',
    title: 'Intro to Statistics',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'A statistics intro.',
    embed: 'iframe',
    verification: { status: 'verified', checkedAt: '2026-01-01' },
    tags: [],
    ...overrides,
  };
}

describe('YouTubeEmbed', () => {
  it('renders a privacy-enhanced iframe for a verified youtube video', () => {
    render(<YouTubeEmbed resource={makeResource()} />);
    const frame = screen.getByTitle('Intro to Statistics');
    expect(frame.tagName).toBe('IFRAME');
    expect(frame.getAttribute('src')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    );
  });

  it('renders a playlist videoseries iframe for a youtube playlist', () => {
    render(
      <YouTubeEmbed
        resource={makeResource({
          kind: 'youtube-playlist',
          url: 'https://www.youtube.com/playlist?list=PLbpi6ZahtOH6Blw3RGYpWkSAtiBxb7Wgc',
        })}
      />,
    );
    const frame = screen.getByTitle('Intro to Statistics');
    expect(frame.getAttribute('src')).toBe(
      'https://www.youtube-nocookie.com/embed/videoseries?list=PLbpi6ZahtOH6Blw3RGYpWkSAtiBxb7Wgc',
    );
  });

  it('renders nothing when embed mode is not iframe', () => {
    render(<YouTubeEmbed resource={makeResource({ embed: 'card' })} />);
    expect(screen.queryByTestId('youtube-embed')).toBeNull();
  });

  it('renders nothing for non-YouTube resources', () => {
    render(<YouTubeEmbed resource={makeResource({ kind: 'github-repo', embed: 'card' })} />);
    expect(screen.queryByTestId('youtube-embed')).toBeNull();
  });

  it('renders nothing when no valid id can be derived', () => {
    render(<YouTubeEmbed resource={makeResource({ url: 'https://example.com/not-youtube' })} />);
    expect(screen.queryByTestId('youtube-embed')).toBeNull();
  });

  it('never produces a tracking youtube.com embed src', () => {
    render(<YouTubeEmbed resource={makeResource()} />);
    const frame = screen.getByTitle('Intro to Statistics');
    expect(frame.getAttribute('src')).not.toContain('youtube.com/embed');
    expect(frame.getAttribute('src')).toContain('youtube-nocookie.com');
  });

  it('sets safe iframe attributes', () => {
    render(<YouTubeEmbed resource={makeResource()} />);
    const frame = screen.getByTitle('Intro to Statistics');
    expect(frame.getAttribute('loading')).toBe('lazy');
    expect(frame.getAttribute('allowfullscreen')).not.toBeNull();
    expect(frame.getAttribute('referrerpolicy')).toBe('strict-origin-when-cross-origin');
  });
});
