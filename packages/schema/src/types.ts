import type { z } from 'zod';
import type { schema } from './schemas.js';

export type Partition = z.infer<typeof schema.partition>;
export type ResourceKind = z.infer<typeof schema.resourceKind>;
export type VerificationStatus = z.infer<typeof schema.verificationStatus>;
export type Embed = z.infer<typeof schema.embed>;
export type OS = z.infer<typeof schema.os>;
export type Difficulty = z.infer<typeof schema.difficulty>;
export type Priority = z.infer<typeof schema.priority>;

export type Verification = z.infer<typeof schema.verification>;
export type Companion = z.infer<typeof schema.companion>;
export type ResourceRef = z.infer<typeof schema.resourceRef>;
export type RoadmapNode = z.infer<typeof schema.roadmapNode>;
export type NodeInput = z.infer<typeof schema.nodeInput>;
export type ResourceInput = z.infer<typeof schema.resourceInput>;
export type GraphData = z.infer<typeof schema.graphData>;
