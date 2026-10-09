import { validateGraphData, validateNodeInput, validateResourceInput } from '@research-roadmap/schema';
import type { GraphData, NodeInput, ResourceInput, RoadmapNode, ResourceRef } from '@research-roadmap/schema';

export interface ContentValidationReport {
  valid: boolean;
  errors: ContentError[];
  warnings: ContentWarning[];
  stats: {
    nodeCount: number;
    resourceCount: number;
    verifiedCount: number;
    pendingCount: number;
    rejectedCount: number;
  };
}

export interface ContentError {
  type: 'schema' | 'reference' | 'duplicate';
  message: string;
  nodeId?: string;
  resourceId?: string;
}

export interface ContentWarning {
  type: 'missing-resources' | 'orphan-resource' | 'empty-node';
  message: string;
  nodeId?: string;
  resourceId?: string;
}

export function validateContent(rawData: unknown): ContentValidationReport {
  const errors: ContentError[] = [];
  const warnings: ContentWarning[] = [];

  const graphResult = validateGraphData(rawData);
  if (!graphResult.success || !graphResult.data) {
    return {
      valid: false,
      errors: graphResult.errors.map((msg) => ({ type: 'schema' as const, message: msg })),
      warnings: [],
      stats: { nodeCount: 0, resourceCount: 0, verifiedCount: 0, pendingCount: 0, rejectedCount: 0 },
    };
  }

  const graph = graphResult.data;
  const nodeIds = new Set(graph.nodes.map((n) => n.node_id));
  const resourceIds = new Set(graph.resources.map((r) => r.id));

  const duplicateNodeIds = findDuplicates(graph.nodes.map((n) => n.node_id));
  for (const id of duplicateNodeIds) {
    errors.push({ type: 'duplicate', message: `Duplicate node ID: ${id}`, nodeId: id });
  }

  const duplicateResourceIds = findDuplicates(graph.resources.map((r) => r.id));
  for (const id of duplicateResourceIds) {
    errors.push({ type: 'duplicate', message: `Duplicate resource ID: ${id}`, resourceId: id });
  }

  for (const node of graph.nodes) {
    for (const prereq of node.prerequisites) {
      if (!nodeIds.has(prereq)) {
        errors.push({
          type: 'reference',
          message: `Node "${node.node_id}" references missing prerequisite: ${prereq}`,
          nodeId: node.node_id,
        });
      }
    }

    for (const resId of node.resources) {
      if (!resourceIds.has(resId)) {
        errors.push({
          type: 'reference',
          message: `Node "${node.node_id}" references missing resource: ${resId}`,
          nodeId: node.node_id,
          resourceId: resId,
        });
      }
    }

    if (node.resources.length === 0) {
      warnings.push({
        type: 'empty-node',
        message: `Node "${node.node_id}" has no resources`,
        nodeId: node.node_id,
      });
    }
  }

  const referencedResourceIds = new Set(graph.nodes.flatMap((n) => n.resources));
  for (const resource of graph.resources) {
    if (!referencedResourceIds.has(resource.id)) {
      warnings.push({
        type: 'orphan-resource',
        message: `Resource "${resource.id}" is not referenced by any node`,
        resourceId: resource.id,
      });
    }
  }

  const verifiedCount = graph.resources.filter((r) => r.verification.status === 'verified').length;
  const pendingCount = graph.resources.filter((r) => r.verification.status === 'pending').length;
  const rejectedCount = graph.resources.filter((r) => r.verification.status === 'rejected').length;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      nodeCount: graph.nodes.length,
      resourceCount: graph.resources.length,
      verifiedCount,
      pendingCount,
      rejectedCount,
    },
  };
}

export function transformToDomainModel(rawData: unknown): { nodes: RoadmapNode[]; resources: ResourceRef[] } | null {
  const graphResult = validateGraphData(rawData);
  if (!graphResult.success || !graphResult.data) {
    return null;
  }

  const graph = graphResult.data;
  const resourceMap = new Map<string, ResourceRef>();

  for (const r of graph.resources) {
    resourceMap.set(r.id, {
      id: r.id,
      partition: r.partition,
      kind: r.kind as ResourceRef['kind'],
      title: r.title,
      url: r.url,
      description: r.description,
      organization: r.organization,
      embed: 'external',
      verification: {
        status: r.verification.status,
        checkedAt: r.verification.checked_date,
        source: r.verification.source,
        notes: r.verification.notes,
      },
      tags: r.tags,
      difficulty: r.difficulty,
      priority: r.priority,
    });
  }

  const nodes: RoadmapNode[] = graph.nodes.map((n, index) => ({
    id: n.node_id,
    parentId: n.prerequisites[0] ?? null,
    order: index,
    title: n.title,
    description: n.description,
    learningGoals: n.learning_objectives,
    prerequisites: n.prerequisites,
    resources: n.resources.map((id) => resourceMap.get(id)).filter((r): r is ResourceRef => r !== undefined),
    commonMistakes: n.common_mistakes,
  }));

  const resources: ResourceRef[] = Array.from(resourceMap.values());
  return { nodes, resources };
}

function findDuplicates(items: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of items) {
    if (seen.has(item)) {
      duplicates.add(item);
    }
    seen.add(item);
  }
  return Array.from(duplicates);
}
