import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { EdgeComponent } from './Edge.js';

describe('EdgeComponent', () => {
  it('renders an SVG element', () => {
    const { container } = render(
      <EdgeComponent
        from={{ x: 0, y: 0 }}
        to={{ x: 300, y: 0 }}
        type="prerequisite"
        isActive={false}
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('renders a path element', () => {
    const { container } = render(
      <EdgeComponent
        from={{ x: 0, y: 0 }}
        to={{ x: 300, y: 0 }}
        type="prerequisite"
        isActive={false}
      />,
    );
    const path = container.querySelector('path');
    expect(path).not.toBeNull();
  });

  it('renders with correct aria-hidden attribute', () => {
    const { container } = render(
      <EdgeComponent
        from={{ x: 0, y: 0 }}
        to={{ x: 300, y: 0 }}
        type="prerequisite"
        isActive={false}
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders a marker for arrowhead', () => {
    const { container } = render(
      <EdgeComponent
        from={{ x: 0, y: 0 }}
        to={{ x: 300, y: 0 }}
        type="prerequisite"
        isActive={false}
      />,
    );
    const marker = container.querySelector('marker');
    expect(marker).not.toBeNull();
  });

  it('renders with stroke color based on active state', () => {
    const { container: activeContainer } = render(
      <EdgeComponent
        from={{ x: 0, y: 0 }}
        to={{ x: 300, y: 0 }}
        type="prerequisite"
        isActive={true}
      />,
    );
    const activePath = activeContainer.querySelector('path');
    expect(activePath?.getAttribute('stroke')).toBe('#2d5a3d');

    const { container: inactiveContainer } = render(
      <EdgeComponent
        from={{ x: 0, y: 0 }}
        to={{ x: 300, y: 0 }}
        type="prerequisite"
        isActive={false}
      />,
    );
    const inactivePath = inactiveContainer.querySelector('path');
    expect(inactivePath?.getAttribute('stroke')).toBe('#a0a0a0');
  });

  it('renders dashed line for sequence type', () => {
    const { container } = render(
      <EdgeComponent
        from={{ x: 0, y: 0 }}
        to={{ x: 300, y: 0 }}
        type="sequence"
        isActive={false}
      />,
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('stroke-dasharray')).toBe('5,5');
  });

  it('renders solid line for prerequisite type', () => {
    const { container } = render(
      <EdgeComponent
        from={{ x: 0, y: 0 }}
        to={{ x: 300, y: 0 }}
        type="prerequisite"
        isActive={false}
      />,
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('stroke-dasharray')).toBeNull();
  });
});
