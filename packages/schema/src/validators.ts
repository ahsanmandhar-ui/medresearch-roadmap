import { schema } from './schemas.js';
import type { GraphData, NodeInput, ResourceInput, RoadmapNode, ResourceRef } from './types.js';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
}

export function validateNodeInput(input: unknown): ValidationResult<NodeInput> {
  const result = schema.nodeInput.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data, errors: [] };
  }
  return { success: false, errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) };
}

export function validateResourceInput(input: unknown): ValidationResult<ResourceInput> {
  const result = schema.resourceInput.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data, errors: [] };
  }
  return { success: false, errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) };
}

export function validateGraphData(input: unknown): ValidationResult<GraphData> {
  const result = schema.graphData.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data, errors: [] };
  }
  return { success: false, errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) };
}

export function validateRoadmapNode(input: unknown): ValidationResult<RoadmapNode> {
  const result = schema.roadmapNode.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data, errors: [] };
  }
  return { success: false, errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) };
}

export function validateResourceRef(input: unknown): ValidationResult<ResourceRef> {
  const result = schema.resourceRef.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data, errors: [] };
  }
  return { success: false, errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) };
}
