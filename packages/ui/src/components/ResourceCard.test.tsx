import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ResourceRef } from '@research-roadmap/schema';
import { ResourceCard } from './ResourceCard.js';

function makeResource(overrides: Partial<ResourceRef> = {}): ResourceRef {
  return {
    id: 'res-1',
    partition: 'videos',
    kind: 'youtube-video',
    title: 'Intro to TypeScript',
    url: 'https://www.youtube.com/watch?v=abc123',
    description: 'A beginner-friendly introduction to TypeScript.',
    organization: 'Example Channel',
    embed: 'iframe',
    verification: { status: 'verified', checkedAt: '2026-01-01' },
    tags: ['typescript', 'basics'],
    difficulty: 'beginner',
    priority: 'essential',
    ...overrides,
  };
}

describe('ResourceCard', () => {
  it('renders title, description, and organization', () => {
    render(<ResourceCard resource={makeResource()} />);
    expect(screen.getByText('Intro to TypeScript')).toBeTruthy();
    expect(screen.getByText('A beginner-friendly introduction to TypeScript.')).toBeTruthy();
    expect(screen.getByText('Example Channel')).toBeTruthy();
  });

  it('renders a verification badge with the correct status', () => {
    render(<ResourceCard resource={makeResource()} />);
    const card = screen.getByTestId('resource-card');
    expect(card.getAttribute('data-verification')).toBe('verified');
    expect(screen.getByTestId('verification-badge').textContent).toBe('Verified');
  });

  it('renders kind, difficulty, and priority badges', () => {
    render(<ResourceCard resource={makeResource()} />);
    const row = screen.getByTestId('badge-row');
    expect(row.textContent).toContain('Video');
    expect(row.textContent).toContain('Beginner');
    expect(row.textContent).toContain('Essential');
  });

  it('renders tags', () => {
    render(<ResourceCard resource={makeResource()} />);
    const tags = screen.getByTestId('tag-list');
    expect(tags.textContent).toContain('typescript');
    expect(tags.textContent).toContain('basics');
  });

  it('renders an external-open link with safe rel attributes', () => {
    render(<ResourceCard resource={makeResource()} />);
    const link = screen.getByTestId('external-open');
    expect(link.getAttribute('href')).toBe('https://www.youtube.com/watch?v=abc123');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders the verified viewer slot only for verified resources', () => {
    const { rerender } = render(
      <ResourceCard resource={makeResource()} viewer={<div>EMBEDDED_VIEWER</div>} />,
    );
    expect(screen.getByText('EMBEDDED_VIEWER')).toBeTruthy();

    rerender(
      <ResourceCard
        resource={makeResource({ verification: { status: 'pending' } })}
        viewer={<div>EMBEDDED_VIEWER</div>}
      />,
    );
    expect(screen.queryByText('EMBEDDED_VIEWER')).toBeNull();
  });

  it('shows pending and rejected statuses with their labels', () => {
    const { rerender } = render(
      <ResourceCard resource={makeResource({ verification: { status: 'pending' } })} />,
    );
    expect(screen.getByTestId('verification-badge').textContent).toBe('Pending');

    rerender(
      <ResourceCard resource={makeResource({ verification: { status: 'rejected' } })} />,
    );
    expect(screen.getByTestId('verification-badge').textContent).toBe('Rejected');
  });

  it('omits the checked-at line when not verified-checked', () => {
    render(
      <ResourceCard
        resource={makeResource({ verification: { status: 'verified' } })}
      />,
    );
    expect(screen.queryByText(/^Checked/)).toBeNull();
  });

  it('applies a visible focus ring on the external link when focused', () => {
    render(<ResourceCard resource={makeResource()} />);
    const link = screen.getByTestId('external-open');
    fireEvent.focus(link);
    expect(link.style.boxShadow).not.toBe('');
    fireEvent.blur(link);
    // Blur clears the ring by setting box-shadow to 'none' (jsdom keeps the
    // normalized 'none' value rather than an empty string).
    expect(link.style.boxShadow).toBe('none');
  });
});
