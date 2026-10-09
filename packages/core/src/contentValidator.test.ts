import { describe, it, expect } from 'vitest';
import { validateContent, transformToDomainModel } from './contentValidator.js';

describe('validateContent', () => {
  it('validates correct graph data', () => {
    const data = {
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
    const report = validateContent(data);
    expect(report.valid).toBe(true);
    expect(report.errors).toHaveLength(0);
    expect(report.stats.nodeCount).toBe(1);
    expect(report.stats.resourceCount).toBe(1);
    expect(report.stats.verifiedCount).toBe(1);
  });

  it('reports missing resource references', () => {
    const data = {
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
    const report = validateContent(data);
    expect(report.valid).toBe(false);
    expect(report.errors.some((e) => e.type === 'reference')).toBe(true);
  });

  it('reports missing prerequisite references', () => {
    const data = {
      nodes: [
        {
          node_id: '00_research_foundations',
          title: 'Research Foundations',
          description: 'Test',
          learning_objectives: ['Learn'],
          prerequisites: ['99_nonexistent'],
          resources: [],
        },
      ],
      resources: [],
    };
    const report = validateContent(data);
    expect(report.valid).toBe(false);
    expect(report.errors.some((e) => e.type === 'reference' && e.message.includes('prerequisite'))).toBe(true);
  });

  it('reports duplicate node IDs', () => {
    const data = {
      nodes: [
        {
          node_id: '00_research_foundations',
          title: 'Research Foundations',
          description: 'Test',
          learning_objectives: ['Learn'],
          prerequisites: [],
          resources: [],
        },
        {
          node_id: '00_research_foundations',
          title: 'Duplicate',
          description: 'Test',
          learning_objectives: ['Learn'],
          prerequisites: [],
          resources: [],
        },
      ],
      resources: [],
    };
    const report = validateContent(data);
    expect(report.valid).toBe(false);
    expect(report.errors.some((e) => e.type === 'duplicate' && e.message.includes('node'))).toBe(true);
  });

  it('warns about orphan resources', () => {
    const data = {
      nodes: [
        {
          node_id: '00_research_foundations',
          title: 'Research Foundations',
          description: 'Test',
          learning_objectives: ['Learn'],
          prerequisites: [],
          resources: [],
        },
      ],
      resources: [
        {
          id: 'res_00_1',
          node_id: '00_research_foundations',
          partition: 'software-guides',
          kind: 'Book',
          title: 'Orphan Resource',
          url: 'https://example.com',
          description: 'Not referenced by any node.',
          tags: [],
          verification: { status: 'pending' },
        },
      ],
    };
    const report = validateContent(data);
    expect(report.valid).toBe(true);
    expect(report.warnings.some((w) => w.type === 'orphan-resource')).toBe(true);
  });

  it('warns about empty nodes', () => {
    const data = {
      nodes: [
        {
          node_id: '00_research_foundations',
          title: 'Research Foundations',
          description: 'Test',
          learning_objectives: ['Learn'],
          prerequisites: [],
          resources: [],
        },
      ],
      resources: [],
    };
    const report = validateContent(data);
    expect(report.warnings.some((w) => w.type === 'empty-node')).toBe(true);
  });

  it('rejects invalid schema data', () => {
    const data = { nodes: 'invalid', resources: [] };
    const report = validateContent(data);
    expect(report.valid).toBe(false);
    expect(report.errors.some((e) => e.type === 'schema')).toBe(true);
  });
});

describe('transformToDomainModel', () => {
  it('transforms valid input to domain model', () => {
    const data = {
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
    const result = transformToDomainModel(data);
    expect(result).not.toBeNull();
    expect(result!.nodes).toHaveLength(1);
    expect(result!.nodes[0]!.id).toBe('00_research_foundations');
    expect(result!.nodes[0]!.learningGoals).toEqual(['Understand the clinical research workflow.']);
    expect(result!.resources).toHaveLength(1);
    expect(result!.resources[0]!.id).toBe('res_00_1');
    expect(result!.resources[0]!.verification.status).toBe('verified');
  });

  it('returns null for invalid data', () => {
    const result = transformToDomainModel({ nodes: 'invalid', resources: [] });
    expect(result).toBeNull();
  });
});
