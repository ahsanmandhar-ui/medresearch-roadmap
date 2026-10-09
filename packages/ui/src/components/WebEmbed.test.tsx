import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ResourceRef } from '@research-roadmap/schema';
import { WebEmbed } from './WebEmbed.js';
import type { FrameSafetyResult } from '../frameSafety.js';

function webResource(overrides: Partial<ResourceRef> = {}): ResourceRef {
  return {
    id: 'res-web-1',
    partition: 'code-web',
    kind: 'web-link',
    title: 'Example Docs',
    url: 'https://example.com/docs',
    description: 'An example documentation site.',
    embed: 'iframe',
    verification: { status: 'verified', checkedAt: '2026-01-01' },
    tags: [],
    ...overrides,
  };
}

describe('WebEmbed', () => {
  it('renders an iframe for a verified web-link with embed mode iframe', () => {
    const { container } = render(<WebEmbed resource={webResource()} />);
    const wrapper = container.querySelector('[data-testid="web-embed"]');
    expect(wrapper).not.toBeNull();
    const iframe = screen.getByTitle('Example Docs');
    expect(iframe.getAttribute('src')).toBe('https://example.com/docs');
  });

  it('renders an iframe for a github-site resource', () => {
    render(
      <WebEmbed
        resource={webResource({ kind: 'github-site', url: 'https://octo.github.io/app' })}
      />,
    );
    expect(screen.getByTitle('Example Docs').getAttribute('src')).toBe(
      'https://octo.github.io/app',
    );
  });

  it('renders nothing when embed mode is not iframe', () => {
    const { container } = render(
      <WebEmbed resource={webResource({ embed: 'card' })} />,
    );
    expect(container.querySelector('[data-testid="web-embed"]')).toBeNull();
  });

  it('renders nothing when embed mode is external', () => {
    const { container } = render(
      <WebEmbed resource={webResource({ embed: 'external' })} />,
    );
    expect(container.querySelector('[data-testid="web-embed"]')).toBeNull();
  });

  it('renders nothing for a non-web resource kind', () => {
    const { container } = render(
      <WebEmbed resource={webResource({ kind: 'github-repo' })} />,
    );
    expect(container.querySelector('[data-testid="web-embed"]')).toBeNull();
  });

  it('honours a fresh frameCheck that reports not frameable (overrides stale iframe mode)', () => {
    const frameCheck: FrameSafetyResult = {
      frameable: false,
      reason: 'X-Frame-Options: DENY',
      explicit: true,
    };
    const { container } = render(
      <WebEmbed resource={webResource()} frameCheck={frameCheck} />,
    );
    expect(container.querySelector('[data-testid="web-embed"]')).toBeNull();
  });

  it('renders when a fresh frameCheck reports frameable', () => {
    const frameCheck: FrameSafetyResult = {
      frameable: true,
      reason: 'No restriction',
      explicit: false,
    };
    const { container } = render(
      <WebEmbed resource={webResource()} frameCheck={frameCheck} />,
    );
    expect(container.querySelector('[data-testid="web-embed"]')).not.toBeNull();
  });

  it('sets safe iframe attributes', () => {
    render(<WebEmbed resource={webResource()} />);
    const iframe = screen.getByTitle('Example Docs');
    expect(iframe.getAttribute('loading')).toBe('lazy');
    expect(iframe.getAttribute('referrerpolicy')).toBe('strict-origin-when-cross-origin');
    // The component must never inject a proxy or rewrite the target URL.
    expect(iframe.getAttribute('src')).toBe('https://example.com/docs');
  });
});
