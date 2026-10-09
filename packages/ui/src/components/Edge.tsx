export type EdgeType = 'prerequisite' | 'sequence';

export interface EdgeComponentProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  type: EdgeType;
  isActive: boolean;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

export function EdgeComponent({ from, to, type, isActive }: EdgeComponentProps) {
  const fromCenter = { x: from.x + NODE_WIDTH / 2, y: from.y + NODE_HEIGHT / 2 };
  const toCenter = { x: to.x + NODE_WIDTH / 2, y: to.y + NODE_HEIGHT / 2 };

  const dx = toCenter.x - fromCenter.x;

  const controlOffset = Math.min(Math.abs(dx) / 2, 100);
  const cp1x = fromCenter.x + controlOffset;
  const cp1y = fromCenter.y;
  const cp2x = toCenter.x - controlOffset;
  const cp2y = toCenter.y;

  const path = `M ${fromCenter.x} ${fromCenter.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toCenter.x} ${toCenter.y}`;

  const strokeColor = isActive ? '#2d5a3d' : '#a0a0a0';
  const strokeWidth = isActive ? 3 : 2;
  const opacity = isActive ? 1 : 0.6;

  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={strokeColor} />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={opacity}
        markerEnd="url(#arrowhead)"
        strokeDasharray={type === 'sequence' ? '5,5' : undefined}
      />
    </svg>
  );
}
