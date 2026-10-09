import type { GraphData, GraphNode } from './graphLoader.js';
import type { ResourceRef, VerificationStatus, Partition } from '@research-roadmap/schema';

export interface SearchFilters {
  types?: Array<'node' | 'resource'>;
  partitions?: Partition[];
  verificationStatuses?: VerificationStatus[];
}

export interface SearchResultItem {
  type: 'node' | 'resource';
  id: string;
  title: string;
  description: string;
  score: number;
  node?: GraphNode;
  resource?: ResourceRef;
}

export interface SearchResults {
  query: string;
  totalCount: number;
  nodeCount: number;
  resourceCount: number;
  results: SearchResultItem[];
}

const TITLE_WEIGHT = 10;
const DESCRIPTION_WEIGHT = 5;
const TAG_WEIGHT = 3;
const LEARNING_GOAL_WEIGHT = 2;

export function search(graph: GraphData, query: string, filters?: SearchFilters): SearchResults {
  const q = query.toLowerCase().trim();
  if (!q) {
    return { query, totalCount: 0, nodeCount: 0, resourceCount: 0, results: [] };
  }

  const results: SearchResultItem[] = [];

  const includeNodes = !filters?.types || filters.types.includes('node');
  const includeResources = !filters?.types || filters.types.includes('resource');

  if (includeNodes) {
    for (const node of graph.nodes) {
      const score = scoreNode(node, q);
      if (score > 0) {
        results.push({
          type: 'node',
          id: node.id,
          title: node.title,
          description: node.description,
          score,
          node,
        });
      }
    }
  }

  if (includeResources) {
    for (const resource of graph.resources) {
      if (filters?.partitions && !filters.partitions.includes(resource.partition)) {
        continue;
      }
      if (filters?.verificationStatuses && !filters.verificationStatuses.includes(resource.verification.status)) {
        continue;
      }
      const score = scoreResource(resource, q);
      if (score > 0) {
        results.push({
          type: 'resource',
          id: resource.id,
          title: resource.title,
          description: resource.description,
          score,
          resource,
        });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);

  return {
    query,
    totalCount: results.length,
    nodeCount: results.filter((r) => r.type === 'node').length,
    resourceCount: results.filter((r) => r.type === 'resource').length,
    results,
  };
}

function scoreNode(node: GraphNode, query: string): number {
  let score = 0;

  if (node.title.toLowerCase().includes(query)) {
    score += TITLE_WEIGHT;
  }

  if (node.description.toLowerCase().includes(query)) {
    score += DESCRIPTION_WEIGHT;
  }

  for (const goal of node.learningGoals) {
    if (goal.toLowerCase().includes(query)) {
      score += LEARNING_GOAL_WEIGHT;
    }
  }

  return score;
}

function scoreResource(resource: ResourceRef, query: string): number {
  let score = 0;

  if (resource.title.toLowerCase().includes(query)) {
    score += TITLE_WEIGHT;
  }

  if (resource.description.toLowerCase().includes(query)) {
    score += DESCRIPTION_WEIGHT;
  }

  for (const tag of resource.tags) {
    if (tag.toLowerCase().includes(query)) {
      score += TAG_WEIGHT;
    }
  }

  return score;
}

export function getSearchSuggestions(graph: GraphData, partial: string, maxSuggestions = 5): string[] {
  const p = partial.toLowerCase().trim();
  if (!p) return [];

  const suggestions = new Set<string>();

  for (const node of graph.nodes) {
    if (node.title.toLowerCase().includes(p)) {
      suggestions.add(node.title);
    }
    for (const goal of node.learningGoals) {
      if (goal.toLowerCase().includes(p)) {
        suggestions.add(goal);
      }
    }
  }

  for (const resource of graph.resources) {
    if (resource.title.toLowerCase().includes(p)) {
      suggestions.add(resource.title);
    }
    for (const tag of resource.tags) {
      if (tag.toLowerCase().includes(p)) {
        suggestions.add(tag);
      }
    }
  }

  return Array.from(suggestions).slice(0, maxSuggestions);
}
