import { describe, it, expect } from 'vitest';
import { schema } from './schemas.js';
import { validateNodeInput, validateResourceInput, validateGraphData } from './validators.js';

describe('partitionSchema', () => {
  it('accepts valid partitions', () => {
    expect(schema.partition.parse('videos')).toBe('videos');
    expect(schema.partition.parse('code-web')).toBe('code-web');
    expect(schema.partition.parse('software-guides')).toBe('software-guides');
  });

  it('rejects invalid partitions', () => {
    expect(() => schema.partition.parse('invalid')).toThrow();
  });
});

describe('resourceKindSchema', () => {
  it('accepts all valid kinds', () => {
    const kinds = [
      'youtube-video',
      'youtube-playlist',
      'github-repo',
      'github-site',
      'web-link',
      'software',
      'guide',
    ];
    for (const kind of kinds) {
      expect(schema.resourceKind.parse(kind)).toBe(kind);
    }
  });

  it('rejects invalid kinds', () => {
    expect(() => schema.resourceKind.parse('invalid')).toThrow();
  });
});

describe('verificationStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(schema.verificationStatus.parse('verified')).toBe('verified');
    expect(schema.verificationStatus.parse('pending')).toBe('pending');
    expect(schema.verificationStatus.parse('rejected')).toBe('rejected');
  });
});

describe('httpsUrlSchema', () => {
  it('accepts HTTPS URLs', () => {
    const result = schema.resourceRef.safeParse({
      id: 'test',
      partition: 'code-web',
      kind: 'web-link',
      title: 'Test',
      url: 'https://example.com',
      description: 'Test description',
      embed: 'card',
      verification: { status: 'verified' },
      tags: [],
    });
    expect(result.success).toBe(true);
  });

  it('rejects HTTP URLs', () => {
    const result = schema.resourceRef.safeParse({
      id: 'test',
      partition: 'web-link',
      kind: 'web-link',
      title: 'Test',
      url: 'http://example.com',
      description: 'Test description',
      embed: 'card',
      verification: { status: 'verified' },
      tags: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('validateNodeInput', () => {
  it('validates a correct node input', () => {
    const input = {
      node_id: '00_research_foundations',
      title: 'Research Foundations',
      description: 'The fundamental building blocks of clinical research.',
      learning_objectives: ['Understand the clinical research workflow.', 'Formulate a PICO question.'],
      prerequisites: [],
      recommended_sequence: ['00_research_foundations', '01_study_design'],
      common_mistakes: ['Formulating a question that is too broad.'],
      resources: ['res_00_1', 'res_00_2'],
    };
    const result = validateNodeInput(input);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects a node with missing required fields', () => {
    const input = {
      node_id: '00_research_foundations',
      title: '',
      description: 'Test',
      learning_objectives: [],
      prerequisites: [],
      resources: [],
    };
    const result = validateNodeInput(input);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects a node with invalid node_id', () => {
    const input = {
      node_id: '',
      title: 'Test',
      description: 'Test description',
      learning_objectives: ['Learn something'],
      prerequisites: [],
      resources: ['res_00_1'],
    };
    const result = validateNodeInput(input);
    expect(result.success).toBe(false);
  });
});

describe('validateResourceInput', () => {
  it('validates a correct resource input', () => {
    const input = {
      id: 'res_00_1',
      node_id: '00_research_foundations',
      partition: 'software-guides',
      kind: 'Book',
      title: 'Designing Clinical Research',
      url: 'https://shop.lww.com/Designing-Clinical-Research/p/9781496382068',
      description: 'The absolute gold standard text for clinical research foundations.',
      organization: 'Lippincott Williams & Wilkins',
      difficulty: 'beginner',
      priority: 'essential',
      tags: ['FINER', 'PICO'],
      verification: {
        status: 'verified',
        checked_date: '2023-10-24',
        source: 'LWW Official Catalog',
        notes: '4th and 5th editions are both highly relevant.',
      },
    };
    const result = validateResourceInput(input);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects a resource with HTTP URL', () => {
    const input = {
      id: 'res_00_1',
      node_id: '00_research_foundations',
      partition: 'videos',
      kind: 'YouTube',
      title: 'Test Video',
      url: 'http://example.com',
      description: 'Test description',
      tags: [],
      verification: { status: 'pending' },
    };
    const result = validateResourceInput(input);
    expect(result.success).toBe(false);
  });

  it('rejects a resource with missing verification', () => {
    const input = {
      id: 'res_00_1',
      node_id: '00_research_foundations',
      partition: 'videos',
      kind: 'YouTube',
      title: 'Test Video',
      url: 'https://example.com',
      description: 'Test description',
      tags: [],
    };
    const result = validateResourceInput(input);
    expect(result.success).toBe(false);
  });
});

describe('validateGraphData', () => {
  it('validates correct graph data', () => {
    const input = {
      nodes: [
        {
          node_id: '00_research_foundations',
          title: 'Research Foundations',
          description: 'The fundamental building blocks of clinical research.',
          learning_objectives: ['Understand the clinical research workflow.'],
          prerequisites: [],
          resources: ['res_00_1'],
        },
      ],
      resources: [
        {
          id: 'res_00_1',
          node_id: '00_research_foundations',
          partition: 'software-guides',
          kind: 'Book',
          title: 'Designing Clinical Research',
          url: 'https://shop.lww.com/Designing-Clinical-Research/p/9781496382068',
          description: 'The absolute gold standard text.',
          tags: ['FINER'],
          verification: { status: 'verified', checked_date: '2023-10-24' },
        },
      ],
    };
    const result = validateGraphData(input);
    expect(result.success).toBe(true);
  });

  it('rejects graph data with mismatched node/resource references', () => {
    const input = {
      nodes: [
        {
          node_id: '00_research_foundations',
          title: 'Research Foundations',
          description: 'Test',
          learning_objectives: ['Learn'],
          prerequisites: [],
          resources: ['res_99_99'],
        },
      ],
      resources: [],
    };
    const result = validateGraphData(input);
    expect(result.success).toBe(true);
  });

  it('rejects empty graph data', () => {
    const input = { nodes: [], resources: [] };
    const result = validateGraphData(input);
    expect(result.success).toBe(true);
  });
});

describe('roadmapNodeSchema', () => {
  it('validates a correct roadmap node', () => {
    const node = {
      id: '00_research_foundations',
      parentId: null,
      order: 0,
      title: 'Research Foundations',
      description: 'The fundamental building blocks of clinical research.',
      learningGoals: ['Understand the clinical research workflow.'],
      prerequisites: [],
      resources: [],
    };
    const result = schema.roadmapNode.safeParse(node);
    expect(result.success).toBe(true);
  });

  it('validates a node with all optional fields', () => {
    const node = {
      id: '01_study_design',
      parentId: '00_research_foundations',
      order: 1,
      title: 'Study Design',
      shortTitle: 'Design',
      description: 'Choosing the appropriate study design.',
      learningGoals: ['Match the research question to the correct study design.'],
      prerequisites: ['00_research_foundations'],
      resources: [],
      childrenHint: 'Branches into observational and experimental designs.',
      commonMistakes: ['Confusing retrospective cohort with case-control studies.'],
    };
    const result = schema.roadmapNode.safeParse(node);
    expect(result.success).toBe(true);
  });

  it('rejects a node with negative order', () => {
    const node = {
      id: '00_research_foundations',
      parentId: null,
      order: -1,
      title: 'Research Foundations',
      description: 'Test',
      learningGoals: ['Learn'],
      prerequisites: [],
      resources: [],
    };
    const result = schema.roadmapNode.safeParse(node);
    expect(result.success).toBe(false);
  });
});
