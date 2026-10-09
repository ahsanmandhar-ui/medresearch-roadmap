import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { ResourceRef } from '@research-roadmap/schema';
import { GitHubRepoViewer } from './GitHubRepoViewer.js';

function repo(overrides: Partial<ResourceRef> = {}): ResourceRef {
  return {
    id: 'gh-1',
    partition: 'code-web',
    kind: 'github-repo',
    title: 'React',
    url: 'https://github.com/facebook/react',
    description: 'Fallback resource description',
    organization: 'facebook',
    embed: 'external',
    verification: {
      status: 'verified',
      checkedAt: '2026-01-01',
      source: 'https://github.com/facebook/react',
    },
    tags: ['ui'],
    ...overrides,
  };
}

describe('GitHubRepoViewer', () => {
  it('renders owner and repo derived from the verified URL', () => {
    const { container } = render(<GitHubRepoViewer resource={repo()} />);
    const viewer = container.querySelector('[data-testid="github-repo-viewer"]');
    expect(viewer?.getAttribute('data-owner')).toBe('facebook');
    expect(viewer?.getAttribute('data-repo')).toBe('react');
    expect(screen.getByText('facebook')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'react' })).toBeTruthy();
  });

  it('prefers meta.description over the resource description', () => {
    render(
      <GitHubRepoViewer resource={repo()} meta={{ description: 'A UI library' }} />,
    );
    expect(screen.getByText('A UI library')).toBeTruthy();
    expect(screen.queryByText('Fallback resource description')).toBeNull();
  });

  it('falls back to the resource description when meta has none', () => {
    render(<GitHubRepoViewer resource={repo()} meta={{}} />);
    expect(screen.getByText('Fallback resource description')).toBeTruthy();
  });

  it('renders a language chip with an indicator dot', () => {
    render(
      <GitHubRepoViewer resource={repo()} meta={{ language: 'TypeScript', languageColor: '#3178c6' }} />,
    );
    expect(screen.getByText('TypeScript')).toBeTruthy();
  });

  it('renders star/issue stats using compact formatting', () => {
    render(
      <GitHubRepoViewer resource={repo()} meta={{ stars: 1500, forks: 300, openIssues: 1200 }} />,
    );
    expect(screen.getByTestId('stat-stars').textContent).toContain('1.5k');
    expect(screen.getByTestId('stat-forks').textContent).toContain('300');
    expect(screen.getByTestId('stat-issues').textContent).toContain('1.2k');
  });

  it('renders license and topics when supplied', () => {
    render(
      <GitHubRepoViewer resource={repo()} meta={{ license: 'MIT', topics: ['react', 'ui'] }} />,
    );
    expect(screen.getByText('MIT')).toBeTruthy();
    const metaList = within(screen.getByTestId('meta-list'));
    expect(metaList.getByText('react')).toBeTruthy();
    expect(metaList.getByText('ui')).toBeTruthy();
  });

  it('renders a README preview only when supplied', () => {
    const { rerender } = render(<GitHubRepoViewer resource={repo()} />);
    expect(screen.queryByTestId('readme-preview')).toBeNull();

    rerender(
      <GitHubRepoViewer resource={repo()} meta={{ readme: '# Hello\n\nDocs here' }} />,
    );
    expect(screen.getByTestId('readme-preview')).toBeTruthy();
    expect(screen.getByText(/# Hello/)).toBeTruthy();
  });

  it('shows an Open Repository action with safe rel/target', () => {
    render(<GitHubRepoViewer resource={repo()} />);
    const link = screen.getByTestId('open-repository') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('https://github.com/facebook/react');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('applies a focus ring to the Open action on focus and clears it on blur', () => {
    render(<GitHubRepoViewer resource={repo()} />);
    const link = screen.getByTestId('open-repository');
    fireEvent.focus(link);
    expect(link.style.boxShadow).not.toBe('');
    fireEvent.blur(link);
    expect(link.style.boxShadow).toBe('none');
  });

  it('does NOT render an iframe (AGENTS.md §5)', () => {
    const { container } = render(<GitHubRepoViewer resource={repo()} meta={{ readme: 'x' }} />);
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('falls back to the resource title and omits owner/repo when the URL is unparseable', () => {
    const { container } = render(
      <GitHubRepoViewer resource={repo({ url: 'https://example.com/x' })} />,
    );
    const viewer = container.querySelector('[data-testid="github-repo-viewer"]');
    expect(viewer?.getAttribute('data-owner')).toBeNull();
    expect(viewer?.getAttribute('data-repo')).toBeNull();
    expect(screen.getByRole('heading', { name: 'React' })).toBeTruthy();
  });

  it('renders nothing when the resource is not a github-repo', () => {
    const { container } = render(
      <GitHubRepoViewer resource={repo({ kind: 'web-link' })} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
