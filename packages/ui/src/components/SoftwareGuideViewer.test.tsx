import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { ResourceRef } from '@research-roadmap/schema';
import { SoftwareGuideViewer } from './SoftwareGuideViewer.js';

function resource(overrides: Partial<ResourceRef> = {}): ResourceRef {
  return {
    id: 's1',
    partition: 'software-guides',
    kind: 'software',
    title: 'Zotero',
    url: 'https://www.zotero.org/download/',
    description: 'Reference manager.',
    embed: 'external',
    verification: { status: 'verified' },
    tags: [],
    ...overrides,
  };
}

describe('SoftwareGuideViewer', () => {
  it('renders nothing for a non software/guide kind', () => {
    const { container } = render(
      <SoftwareGuideViewer resource={resource({ kind: 'web-link' })} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the resource title and description for software', () => {
    render(<SoftwareGuideViewer resource={resource()} />);
    expect(screen.getByRole('heading', { name: 'Zotero' })).toBeTruthy();
    expect(screen.getByText('Reference manager.')).toBeTruthy();
    expect(screen.getByTestId('kind-label').textContent).toBe('Software');
  });

  it('labels guides and uses the Read Guide CTA', () => {
    render(
      <SoftwareGuideViewer
        resource={resource({
          kind: 'guide',
          title: 'Citation Guide',
          url: 'https://example.org/citation',
        })}
      />,
    );
    expect(screen.getByTestId('kind-label').textContent).toBe('Guide');
    const cta = screen.getByTestId('open-resource');
    expect(cta.textContent).toContain('Read Guide');
    expect(cta.getAttribute('href')).toBe('https://example.org/citation');
  });

  it('uses the Download CTA for software', () => {
    render(<SoftwareGuideViewer resource={resource()} />);
    expect(screen.getByTestId('open-resource').textContent).toContain('Download');
  });

  it('renders OS chips in canonical order when provided', () => {
    render(
      <SoftwareGuideViewer resource={resource({ os: ['linux', 'windows', 'windows'] })} />,
    );
    const meta = screen.getByTestId('meta-list');
    const chips = within(meta)
      .getAllByTestId('os-chip')
      .map((el) => el.textContent);
    expect(chips).toEqual(['Windows', 'Linux']);
  });

  it('renders difficulty and priority chips', () => {
    render(
      <SoftwareGuideViewer resource={resource({ difficulty: 'beginner', priority: 'essential' })} />,
    );
    expect(screen.getByTestId('difficulty-chip').textContent).toBe('Beginner');
    expect(screen.getByTestId('priority-chip').textContent).toBe('Essential');
  });

  it('renders a companion link when present', () => {
    render(
      <SoftwareGuideViewer
        resource={resource({
          companion: { title: 'User Manual', url: 'https://example.org/manual', embed: 'external' },
        })}
      />,
    );
    const companion = screen.getByTestId('companion-link');
    expect(companion.getAttribute('href')).toBe('https://example.org/manual');
    expect(companion.textContent).toContain('User Manual');
    expect(companion.getAttribute('rel')).toContain('noopener');
  });

  it('omits the companion link when absent', () => {
    render(<SoftwareGuideViewer resource={resource()} />);
    expect(screen.queryByTestId('companion-link')).toBeNull();
  });

  it('uses a secure external-open link on the primary action', () => {
    render(<SoftwareGuideViewer resource={resource()} />);
    const cta = screen.getByTestId('open-resource');
    expect(cta.getAttribute('target')).toBe('_blank');
    expect(cta.getAttribute('rel')).toContain('noopener');
    expect(cta.getAttribute('rel')).toContain('noreferrer');
  });

  it('never renders an iframe (no embeddable content)', () => {
    const { container } = render(<SoftwareGuideViewer resource={resource()} />);
    expect(container.querySelector('iframe')).toBeNull();
  });
});
