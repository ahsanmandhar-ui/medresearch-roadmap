import { describe, it, expect } from 'vitest';
import { findNextNode, directionFromKey } from './keyboardNav.js';
import type { NavigableNode } from './keyboardNav.js';

const NODE_W = 200;
const NODE_H = 80;

function node(id: string, x: number, y: number): NavigableNode {
  return { id, x, y, width: NODE_W, height: NODE_H };
}

// 2x2 grid layout (centers):
//   a (100,40)    b (400,40)
//   c (100,240)   d (400,240)
const nodes: NavigableNode[] = [
  node('a', 0, 0),
  node('b', 300, 0),
  node('c', 0, 200),
  node('d', 300, 200),
];

describe('directionFromKey', () => {
  it('maps arrow keys to directions', () => {
    expect(directionFromKey('ArrowUp')).toBe('up');
    expect(directionFromKey('ArrowDown')).toBe('down');
    expect(directionFromKey('ArrowLeft')).toBe('left');
    expect(directionFromKey('ArrowRight')).toBe('right');
  });

  it('returns null for unmapped keys', () => {
    expect(directionFromKey('Enter')).toBeNull();
    expect(directionFromKey('a')).toBeNull();
  });
});

describe('findNextNode', () => {
  it('finds the node to the right', () => {
    expect(findNextNode(nodes, 'a', 'right')).toBe('b');
  });

  it('finds the node below', () => {
    expect(findNextNode(nodes, 'a', 'down')).toBe('c');
  });

  it('returns null when nothing is to the left', () => {
    expect(findNextNode(nodes, 'a', 'left')).toBeNull();
  });

  it('returns null when nothing is above', () => {
    expect(findNextNode(nodes, 'a', 'up')).toBeNull();
  });

  it('returns null when the current node is unknown', () => {
    expect(findNextNode(nodes, 'missing', 'right')).toBeNull();
  });

  it('prefers the aligned node on ties', () => {
    const layout: NavigableNode[] = [
      node('cur', 0, 0), // center (100,40)
      node('aligned', 300, 0), // center (400,40) aligned
      node('offset', 300, 120), // center (400,160) offset vertically
    ];
    expect(findNextNode(layout, 'cur', 'right')).toBe('aligned');
  });

  it('picks the nearest node when several lie in the direction', () => {
    const layout: NavigableNode[] = [
      node('cur', 0, 0),
      node('near', 250, 0),
      node('far', 600, 0),
    ];
    expect(findNextNode(layout, 'cur', 'right')).toBe('near');
  });

  it('navigates up and treats out-of-range directions as dead ends', () => {
    expect(findNextNode(nodes, 'd', 'right')).toBeNull();
    expect(findNextNode(nodes, 'd', 'up')).toBe('b');
  });
});
