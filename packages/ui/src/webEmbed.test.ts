import { describe, it, expect } from 'vitest';
import type { ResourceRef } from '@research-roadmap/schema';
import { isWebEmbedKind, resolveWebEmbedMode, displayHost } from './webEmbed.js';

function resource(overrides: Partial<ResourceRef>): ResourceRef {
  return {
    id: 'r1',
    partition: 'code-web',
    kind: 'web-link',
    title: 'MDN',
    url: 'https://developer.mozilla.org/',
    description: 'Web docs.',
    embed: 'iframe',
    verification: { status: 'verified' },
    tags: [],
    ...overrides,
  };
}

describe('isWebEmbedKind', () => {
  it('accepts web-link and github-site', () => {
    expect(isWebEmbedKind('web-link')).toBe(true);
    expect(isWebEmbedKind('github-site')).toBe(true);
  });

  it('rejects non-web kinds', () => {
    expect(isWebEmbedKind('youtube-video')).toBe(false);
    expect(isWebEmbedKind('github-repo')).toBe(false);
    expect(isWebEmbedKind('software')).toBe(false);
  });
});

describe('resolveWebEmbedMode', () => {
  it('uses iframe for web-link with embed iframe', () => {
    expect(resolveWebEmbedMode(resource({ kind: 'web-link', embed: 'iframe' }))).toBe('iframe');
  });

  it('uses iframe for github-site with embed iframe', () => {
    expect(resolveWebEmbedMode(resource({ kind: 'github-site', embed: 'iframe' }))).toBe('iframe');
  });

  it('falls back to card when embed is card', () => {
    expect(resolveWebEmbedMode(resource({ embed: 'card' }))).toBe('card');
  });

  it('falls back to card when embed is external', () => {
    expect(resolveWebEmbedMode(resource({ embed: 'external' }))).toBe('card');
  });

  it('falls back to card for non-web kinds even with embed iframe', () => {
    expect(resolveWebEmbedMode(resource({ kind: 'github-repo', embed: 'iframe' }))).toBe('card');
    expect(resolveWebEmbedMode(resource({ kind: 'youtube-video', embed: 'iframe' }))).toBe('card');
  });
});

describe('displayHost', () => {
  it('returns the host of a valid URL', () => {
    expect(displayHost('https://developer.mozilla.org/en-US/docs')).toBe('developer.mozilla.org');
  });

  it('returns empty string for an invalid URL', () => {
    expect(displayHost('not a url')).toBe('');
    expect(displayHost('')).toBe('');
  });
});
