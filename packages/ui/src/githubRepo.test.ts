import { describe, it, expect } from 'vitest';
import { parseGitHubRepo, formatCount } from './githubRepo.js';

describe('parseGitHubRepo', () => {
  it('derives owner and repo from a canonical URL', () => {
    expect(parseGitHubRepo('https://github.com/facebook/react')).toEqual({
      owner: 'facebook',
      repo: 'react',
    });
  });

  it('accepts www.github.com', () => {
    expect(parseGitHubRepo('https://www.github.com/facebook/react')).toEqual({
      owner: 'facebook',
      repo: 'react',
    });
  });

  it('tolerates a trailing slash', () => {
    expect(parseGitHubRepo('https://github.com/facebook/react/')).toEqual({
      owner: 'facebook',
      repo: 'react',
    });
  });

  it('strips a .git suffix', () => {
    expect(parseGitHubRepo('https://github.com/facebook/react.git')).toEqual({
      owner: 'facebook',
      repo: 'react',
    });
  });

  it('ignores deeper paths such as /tree/ and /blob/', () => {
    expect(parseGitHubRepo('https://github.com/facebook/react/tree/main/src')).toEqual({
      owner: 'facebook',
      repo: 'react',
    });
    expect(parseGitHubRepo('https://github.com/facebook/react/blob/main/README.md')).toEqual({
      owner: 'facebook',
      repo: 'react',
    });
  });

  it('rejects a non-GitHub host', () => {
    expect(parseGitHubRepo('https://gitlab.com/foo/bar')).toBeNull();
  });

  it('rejects a URL with fewer than two path segments', () => {
    expect(parseGitHubRepo('https://github.com/facebook')).toBeNull();
    expect(parseGitHubRepo('https://github.com/')).toBeNull();
  });

  it('rejects malformed input', () => {
    expect(parseGitHubRepo('not a url')).toBeNull();
    expect(parseGitHubRepo('')).toBeNull();
  });

  it('rejects an invalid owner or repo', () => {
    expect(parseGitHubRepo('https://github.com/-bad-/react')).toBeNull();
    expect(parseGitHubRepo('https://github.com/facebook/re po')).toBeNull();
  });
});

describe('formatCount', () => {
  it('shows small values verbatim', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(999)).toBe('999');
  });

  it('uses k/M suffixes for large values with a trimmed decimal', () => {
    expect(formatCount(1000)).toBe('1k');
    expect(formatCount(1500)).toBe('1.5k');
    expect(formatCount(2_300_000)).toBe('2.3M');
  });

  it('guards against non-finite or negative input', () => {
    expect(formatCount(-5)).toBe('0');
    expect(formatCount(Number.NaN)).toBe('0');
    expect(formatCount(Number.POSITIVE_INFINITY)).toBe('0');
  });
});
