import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ResourceRef } from '@research-roadmap/schema';
import { WebEmbedViewer } from './WebEmbedViewer.js';

function resource(overrides: Partial<ResourceRef>): ResourceRef {
  return {
    id: 'r1',
    partition: 'code-web',
    kind: 'web-link',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/en-US/',
    description: 'Resources for developers, by developers.',
    embed: 'iframe',
    verification: { status: 'verified' },
    tags: [],
    ...overrides,
  };
}

describe('WebEmbedViewer', () => {
  it('renders an iframe when embed mode is iframe', () => {
    const { container } = render(<WebEmbedViewer resource={resource({ embed: 'iframe' })} />);
    const viewer = container.querySelector('[data-testid="web-embed-viewer"]');
    expect(viewer?.getAttribute('data-mode')).toBe('iframe');

    const frame = container.querySelector('[data-testid="web-embed-frame"]');
    expect(frame).toBeTruthy();
    expect(frame?.getAttribute('src')).toBe('https://developer.mozilla.org/en-US/');
    expect(frame?.getAttribute('sandbox')).toContain('allow-scripts');
    expect(frame?.getAttribute('referrerpolicy')).toBe('no-referrer');
  });

  it('renders a card with an external-open link when embed mode is card', () => {
    const { container } = render(<WebEmbedViewer resource={resource({ embed: 'card' })} />);
    const viewer = container.querySelector('[data-testid="web-embed-viewer"]');
    expect(viewer?.getAttribute('data-mode')).toBe('card');

    expect(container.querySelector('[data-testid="web-embed-frame"]')).toBeNull();
    const link = screen.getByTestId('external-open');
    expect(link.getAttribute('href')).toBe('https://developer.mozilla.org/en-US/');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders a card when embed mode is external', () => {
    const { container } = render(<WebEmbedViewer resource={resource({ embed: 'external' })} />);
    expect(container.querySelector('[data-testid="web-embed-viewer"]')?.getAttribute('data-mode')).toBe(
      'card',
    );
    expect(container.querySelector('[data-testid="web-embed-frame"]')).toBeNull();
  });

  it('shows the display host in the iframe header', () => {
    render(<WebEmbedViewer resource={resource({ embed: 'iframe' })} />);
    expect(screen.getByTestId('web-host').textContent).toBe('developer.mozilla.org');
  });

  it('shows title and description in the card fallback', () => {
    render(<WebEmbedViewer resource={resource({ embed: 'card' })} />);
    expect(screen.getByRole('heading', { name: 'MDN Web Docs' })).toBeTruthy();
    expect(screen.getByText('Resources for developers, by developers.')).toBeTruthy();
  });

  it('returns null for a non-web-embed kind', () => {
    const { container } = render(
      <WebEmbedViewer resource={resource({ kind: 'github-repo', embed: 'card' })} />,
    );
    expect(container.querySelector('[data-testid="web-embed-viewer"]')).toBeNull();
  });

  it('supports github-site with iframe embed', () => {
    const { container } = render(
      <WebEmbedViewer
        resource={resource({ kind: 'github-site', url: 'https://user.github.io/project/', embed: 'iframe' })}
      />,
    );
    expect(container.querySelector('[data-testid="web-embed-viewer"]')?.getAttribute('data-mode')).toBe(
      'iframe',
    );
    expect(container.querySelector('[data-testid="web-embed-frame"]')?.getAttribute('src')).toBe(
      'https://user.github.io/project/',
    );
  });

  it('applies a focus ring on the card external link', () => {
    render(<WebEmbedViewer resource={resource({ embed: 'card' })} />);
    const link = screen.getByTestId('external-open');
    expect(link.style.boxShadow).toBe('');
    fireEvent.focus(link);
    expect(link.style.boxShadow).not.toBe('');
    expect(link.style.boxShadow).not.toBe('none');
  });
});
