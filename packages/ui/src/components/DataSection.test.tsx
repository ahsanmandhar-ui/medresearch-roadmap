import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataSection } from './DataSection.js';
import type { RoadmapNode } from '@research-roadmap/schema';

const baseNode: RoadmapNode = {
  id: 'n1',
  parentId: null,
  order: 0,
  title: 'Variables & Types',
  description: 'Learn the building blocks of values in the language.',
  learningGoals: ['Declare variables', 'Understand primitive types'],
  prerequisites: ['n0'],
  resources: [
    {
      id: 'r1',
      partition: 'videos',
      kind: 'youtube-video',
      title: 'Intro to variables',
      url: 'https://example.com/a',
      description: 'A short intro.',
      embed: 'iframe',
      verification: { status: 'verified' },
      tags: [],
    },
    {
      id: 'r2',
      partition: 'code-web',
      kind: 'web-link',
      title: 'Reference',
      url: 'https://example.com/b',
      description: 'A reference page.',
      embed: 'external',
      verification: { status: 'pending' },
      tags: [],
    },
  ],
};

describe('DataSection', () => {
  it('renders the node title and description', () => {
    render(<DataSection node={baseNode} />);
    expect(screen.getByRole('heading', { name: 'Variables & Types', level: 2 })).toBeTruthy();
    expect(screen.getByText('Learn the building blocks of values in the language.')).toBeTruthy();
  });

  it('shows total and verified resource counts', () => {
    render(<DataSection node={baseNode} />);
    // 2 resources total, 1 verified.
    expect(screen.getByTestId('resource-summary').textContent).toContain('2 resources');
    expect(screen.getByTestId('resource-summary').textContent).toContain('1 verified');
  });

  it('lists learning goals', () => {
    render(<DataSection node={baseNode} />);
    expect(screen.getByText('Declare variables')).toBeTruthy();
    expect(screen.getByText('Understand primitive types')).toBeTruthy();
  });

  it('renders prerequisites as non-interactive when no handler is provided', () => {
    render(<DataSection node={baseNode} prerequisites={[{ id: 'n0', title: 'Getting Started' }]} />);
    // Present as text within a list item, not a button.
    expect(screen.getByText('Getting Started')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Prerequisite: Getting Started' })).toBeNull();
  });

  it('renders prerequisites as buttons and calls onSelectNode when a handler is provided', () => {
    const onSelectNode = vi.fn();
    render(
      <DataSection
        node={baseNode}
        prerequisites={[{ id: 'n0', title: 'Getting Started' }]}
        children={[{ id: 'n2', title: 'Functions' }]}
        onSelectNode={onSelectNode}
      />,
    );

    const prereqButton = screen.getByRole('button', { name: 'Prerequisite: Getting Started' });
    fireEvent.click(prereqButton);
    expect(onSelectNode).toHaveBeenCalledWith('n0');

    const childButton = screen.getByRole('button', { name: 'Child node: Functions' });
    fireEvent.click(childButton);
    expect(onSelectNode).toHaveBeenCalledWith('n2');
  });

  it('shows "None" when there are no prerequisites or children', () => {
    render(<DataSection node={baseNode} />);
    const noneTexts = screen.getAllByText('None');
    expect(noneTexts.length).toBeGreaterThanOrEqual(2);
  });

  it('conditionally renders childrenHint and commonMistakes', () => {
    const { rerender } = render(<DataSection node={baseNode} />);
    expect(screen.queryByText("What's next")).toBeNull();
    expect(screen.queryByText('Common mistakes')).toBeNull();

    rerender(
      <DataSection
        node={{ ...baseNode, childrenHint: 'Study functions next.', commonMistakes: ['Forgetting semicolons'] }}
      />,
    );
    expect(screen.getByText("What's next")).toBeTruthy();
    expect(screen.getByText('Study functions next.')).toBeTruthy();
    expect(screen.getByText('Forgetting semicolons')).toBeTruthy();
  });

  it('exposes a labelled landmark for the node details', () => {
    render(<DataSection node={baseNode} />);
    expect(screen.getByRole('complementary', { name: 'Details for Variables & Types' })).toBeTruthy();
  });
});
