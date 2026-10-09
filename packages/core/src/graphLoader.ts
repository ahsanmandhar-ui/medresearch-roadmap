import { validateContent, transformToDomainModel } from './contentValidator.js';
import type { RoadmapNode, ResourceRef } from '@research-roadmap/schema';

export interface GraphNode extends RoadmapNode {
  children: string[];
}

export interface GraphEdge {
  from: string;
  to: string;
  type: 'prerequisite' | 'sequence';
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  resources: ResourceRef[];
  nodeMap: Map<string, GraphNode>;
}

export function loadGraph(rawData: unknown): GraphData | null {
  const report = validateContent(rawData);
  if (!report.valid) {
    return null;
  }

  const domain = transformToDomainModel(rawData);
  if (!domain) {
    return null;
  }

  const childrenMap = new Map<string, string[]>();
  for (const node of domain.nodes) {
    for (const prereq of node.prerequisites) {
      const children = childrenMap.get(prereq) ?? [];
      children.push(node.id);
      childrenMap.set(prereq, children);
    }
  }

  const edges: GraphEdge[] = [];
  for (const node of domain.nodes) {
    for (const prereq of node.prerequisites) {
      edges.push({ from: prereq, to: node.id, type: 'prerequisite' });
    }
  }

  const nodes: GraphNode[] = domain.nodes.map((node) => ({
    ...node,
    children: childrenMap.get(node.id) ?? [],
  }));

  const nodeMap = new Map<string, GraphNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  return { nodes, edges, resources: domain.resources, nodeMap };
}

export function getNode(graph: GraphData, id: string): GraphNode | undefined {
  return graph.nodeMap.get(id);
}

export function getChildren(graph: GraphData, id: string): GraphNode[] {
  const node = graph.nodeMap.get(id);
  if (!node) return [];
  return node.children
    .map((childId) => graph.nodeMap.get(childId))
    .filter((n): n is GraphNode => n !== undefined);
}

export function getParents(graph: GraphData, id: string): GraphNode[] {
  const node = graph.nodeMap.get(id);
  if (!node) return [];
  return node.prerequisites
    .map((parentId) => graph.nodeMap.get(parentId))
    .filter((n): n is GraphNode => n !== undefined);
}

export function getResourcesForNode(graph: GraphData, nodeId: string): ResourceRef[] {
  const node = graph.nodeMap.get(nodeId);
  if (!node) return [];
  return node.resources;
}

export function getEdgesForNode(graph: GraphData, nodeId: string): GraphEdge[] {
  return graph.edges.filter((e) => e.from === nodeId || e.to === nodeId);
}

export function getRootNodes(graph: GraphData): GraphNode[] {
  return graph.nodes.filter((n) => n.prerequisites.length === 0);
}

export function getLeafNodes(graph: GraphData): GraphNode[] {
  return graph.nodes.filter((n) => n.children.length === 0);
}

export function searchNodes(graph: GraphData, query: string): GraphNode[] {
  const q = query.toLowerCase();
  return graph.nodes.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.learningGoals.some((g) => g.toLowerCase().includes(q)),
  );
}

export function searchResources(graph: GraphData, query: string): ResourceRef[] {
  const q = query.toLowerCase();
  return graph.resources.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q)),
  );
}
