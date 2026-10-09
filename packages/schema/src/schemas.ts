import { z } from 'zod';

export const partitionSchema = z.enum(['videos', 'code-web', 'software-guides']);

export const resourceKindSchema = z.enum([
  'youtube-video',
  'youtube-playlist',
  'github-repo',
  'github-site',
  'web-link',
  'software',
  'guide',
]);

export const verificationStatusSchema = z.enum(['verified', 'pending', 'rejected']);

export const embedSchema = z.enum(['iframe', 'card', 'external']);

export const osSchema = z.enum(['windows', 'macos', 'linux', 'android', 'ios']);

export const difficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);

export const prioritySchema = z.enum(['essential', 'recommended', 'supplementary']);

const httpsUrlSchema = z.string().url().refine(
  (url) => url.startsWith('https://'),
  { message: 'URL must use HTTPS' },
);

const isoDateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  { message: 'Date must be in YYYY-MM-DD format' },
);

const verificationSchema = z.object({
  status: verificationStatusSchema,
  checkedAt: isoDateSchema.optional(),
  checkedBy: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

const companionSchema = z.object({
  title: z.string().min(1),
  url: httpsUrlSchema,
  embed: embedSchema,
});

const resourceRefSchema = z.object({
  id: z.string().min(1),
  partition: partitionSchema,
  kind: resourceKindSchema,
  title: z.string().min(1),
  url: httpsUrlSchema,
  description: z.string().min(1),
  organization: z.string().optional(),
  embed: embedSchema,
  verification: verificationSchema,
  tags: z.array(z.string()),
  companion: companionSchema.optional(),
  os: z.array(osSchema).optional(),
  difficulty: difficultySchema.optional(),
  priority: prioritySchema.optional(),
});

const roadmapNodeSchema = z.object({
  id: z.string().min(1),
  parentId: z.string().nullable(),
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  shortTitle: z.string().max(30).optional(),
  description: z.string().min(1),
  learningGoals: z.array(z.string().min(1)),
  prerequisites: z.array(z.string().min(1)),
  resources: z.array(resourceRefSchema),
  childrenHint: z.string().optional(),
  commonMistakes: z.array(z.string().min(1)).optional(),
});

const nodeInputSchema = z.object({
  node_id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  learning_objectives: z.array(z.string().min(1)),
  prerequisites: z.array(z.string().min(1)),
  recommended_sequence: z.array(z.string().min(1)).optional(),
  common_mistakes: z.array(z.string().min(1)).optional(),
  resources: z.array(z.string().min(1)),
});

const resourceInputSchema = z.object({
  id: z.string().min(1),
  node_id: z.string().min(1),
  partition: partitionSchema,
  kind: z.string().min(1),
  title: z.string().min(1),
  url: httpsUrlSchema,
  description: z.string().min(1),
  organization: z.string().optional(),
  difficulty: difficultySchema.optional(),
  priority: prioritySchema.optional(),
  tags: z.array(z.string()),
  verification: z.object({
    status: verificationStatusSchema,
    checked_date: isoDateSchema.optional(),
    source: z.string().optional(),
    notes: z.string().optional(),
  }),
});

const graphDataSchema = z.object({
  nodes: z.array(nodeInputSchema),
  resources: z.array(resourceInputSchema),
});

export const schema = {
  partition: partitionSchema,
  resourceKind: resourceKindSchema,
  verificationStatus: verificationStatusSchema,
  embed: embedSchema,
  os: osSchema,
  difficulty: difficultySchema,
  priority: prioritySchema,
  verification: verificationSchema,
  companion: companionSchema,
  resourceRef: resourceRefSchema,
  roadmapNode: roadmapNodeSchema,
  nodeInput: nodeInputSchema,
  resourceInput: resourceInputSchema,
  graphData: graphDataSchema,
};
