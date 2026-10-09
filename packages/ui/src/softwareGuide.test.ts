import { describe, it, expect } from 'vitest';
import type { ResourceRef } from '@research-roadmap/schema';
import {
  isSoftwareGuideKind,
  resolveSoftwareGuideCta,
  formatOsLabels,
  OS_LABELS,
} from './softwareGuide.js';

function baseResource(overrides: Partial<ResourceRef>): ResourceRef {
  return {
    id: 'r1',
    partition: 'software-guides',
    kind: 'software',
    title: 'R',
    url: 'https://example.com/download',
    description: 'A tool.',
    embed: 'external',
    verification: { status: 'verified' },
    tags: [],
    ...overrides,
  };
}

describe('isSoftwareGuideKind', () => {
  it('accepts software and guide', () => {
    expect(isSoftwareGuideKind('software')).toBe(true);
    expect(isSoftwareGuideKind('guide')).toBe(true);
  });

  it('rejects other kinds', () => {
    expect(isSoftwareGuideKind('web-link')).toBe(false);
    expect(isSoftwareGuideKind('github-repo')).toBe(false);
    expect(isSoftwareGuideKind('youtube-video')).toBe(false);
  });
});

describe('resolveSoftwareGuideCta', () => {
  it('uses Download for software', () => {
    expect(resolveSoftwareGuideCta(baseResource({ kind: 'software' }))).toBe('Download');
  });

  it('uses Read Guide for guide', () => {
    expect(resolveSoftwareGuideCta(baseResource({ kind: 'guide' }))).toBe('Read Guide');
  });

  it('falls back for other kinds', () => {
    expect(resolveSoftwareGuideCta(baseResource({ kind: 'web-link' }))).toBe('Open Resource');
  });
});

describe('formatOsLabels', () => {
  it('returns canonical-ordered, de-duplicated labels', () => {
    expect(formatOsLabels(['linux', 'windows', 'windows'])).toEqual(['Windows', 'Linux']);
  });

  it('returns empty for missing/empty os', () => {
    expect(formatOsLabels(undefined)).toEqual([]);
    expect(formatOsLabels([])).toEqual([]);
  });
});

describe('OS_LABELS', () => {
  it('covers every OS enum value', () => {
    expect(Object.keys(OS_LABELS).sort()).toEqual(
      ['android', 'ios', 'linux', 'macos', 'windows'].sort(),
    );
  });
});
