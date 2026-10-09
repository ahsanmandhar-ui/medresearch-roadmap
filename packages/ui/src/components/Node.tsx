import type { RoadmapNode } from '@research-roadmap/schema';

export type NodeState = 'normal' | 'selected' | 'completed';

export interface NodeComponentProps {
  node: RoadmapNode;
  x: number;
  y: number;
  state: NodeState;
  resourceCount: number;
  verifiedCount: number;
  onClick: (id: string) => void;
}

const WIDTH = 200;
const HEIGHT = 80;

export function NodeComponent({ node, x, y, state, resourceCount, verifiedCount, onClick }: NodeComponentProps) {
  const bgColor = state === 'selected' ? '#2d5a3d' : state === 'completed' ? '#4a7c59' : '#f0f0f0';
  const textColor = state === 'normal' ? '#1a1a1a' : '#ffffff';
  const borderColor = state === 'selected' ? '#1a3d26' : state === 'completed' ? '#2d5a3d' : '#d0d0d0';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${node.title}. ${resourceCount} resources, ${verifiedCount} verified.`}
      aria-pressed={state === 'selected'}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: bgColor,
        color: textColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '12px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: state === 'selected' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.2s ease, background-color 0.2s ease',
        outline: 'none',
      }}
      onClick={() => onClick(node.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(node.id);
        }
      }}
    >
      <div style={{ fontWeight: 600, fontSize: '14px', lineHeight: 1.3 }}>{node.title}</div>
      <div style={{ fontSize: '12px', opacity: 0.8 }}>
        {resourceCount} resources · {verifiedCount} verified
      </div>
    </div>
  );
}
