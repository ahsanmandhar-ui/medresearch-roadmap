import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NodeComponent } from './Node.js';
import type { RoadmapNode } from '@research-roadmap/schema';

const mockNode: RoadmapNode = {
  id: '00_research_foundations',
  parentId: null,
  order: 0,
  title: 'Research Foundations',
  description: 'The fundamental building blocks of clinical research.',
  learningGoals: ['Understand the clinical research workflow.'],
  prerequisites: [],
  resources: [],
};

describe('NodeComponent', () => {
  it('renders node title', () => {
    render(
      <NodeComponent
        node={mockNode}
        x={0}
        y={0}
        state="normal"
        resourceCount={3}
        verifiedCount={2}
        onClick={() => {}}
      />,
    );
    expect(screen.getByText('Research Foundations')).toBeDefined();
  });

  it('renders resource count', () => {
    render(
      <NodeComponent
        node={mockNode}
        x={0}
        y={0}
        state="normal"
        resourceCount={5}
        verifiedCount={3}
        onClick={() => {}}
      />,
    );
    expect(screen.getByText(/5 resources/)).toBeDefined();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(
      <NodeComponent
        node={mockNode}
        x={0}
        y={0}
        state="normal"
        resourceCount={3}
        verifiedCount={2}
        onClick={handleClick}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith('00_research_foundations');
  });

  it('calls onClick when Enter is pressed', () => {
    const handleClick = vi.fn();
    render(
      <NodeComponent
        node={mockNode}
        x={0}
        y={0}
        state="normal"
        resourceCount={3}
        verifiedCount={2}
        onClick={handleClick}
      />,
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledWith('00_research_foundations');
  });

  it('calls onClick when Space is pressed', () => {
    const handleClick = vi.fn();
    render(
      <NodeComponent
        node={mockNode}
        x={0}
        y={0}
        state="normal"
        resourceCount={3}
        verifiedCount={2}
        onClick={handleClick}
      />,
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(handleClick).toHaveBeenCalledWith('00_research_foundations');
  });

  it('has correct ARIA attributes', () => {
    render(
      <NodeComponent
        node={mockNode}
        x={0}
        y={0}
        state="normal"
        resourceCount={3}
        verifiedCount={2}
        onClick={() => {}}
      />,
    );
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toContain('Research Foundations');
    expect(button.getAttribute('aria-label')).toContain('3 resources');
    expect(button.getAttribute('tabIndex')).toBe('0');
  });

  it('reflects selected state in aria-pressed', () => {
    render(
      <NodeComponent
        node={mockNode}
        x={0}
        y={0}
        state="selected"
        resourceCount={3}
        verifiedCount={2}
        onClick={() => {}}
      />,
    );
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true');
  });

  it('reflects normal state in aria-pressed', () => {
    render(
      <NodeComponent
        node={mockNode}
        x={0}
        y={0}
        state="normal"
        resourceCount={3}
        verifiedCount={2}
        onClick={() => {}}
      />,
    );
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('false');
  });
});
