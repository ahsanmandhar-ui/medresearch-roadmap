import { describe, it, expect } from 'vitest';
import { search, getSearchSuggestions } from './search.js';
import { loadGraph } from './graphLoader.js';

const sampleData = {
  nodes: [
    {
      node_id: '00_research_foundations',
      title: 'Research Foundations',
      description: 'The fundamental building blocks of clinical research.',
      learning_objectives: ['Understand the clinical research workflow.', 'Formulate a PICO question.'],
      prerequisites: [],
      resources: ['res_00_1'],
    },
    {
      node_id: '01_study_design',
      title: 'Study Design Selection',
      description: 'Choosing the appropriate epidemiological or experimental design.',
      learning_objectives: ['Match the research question to the correct study design.'],
      prerequisites: ['00_research_foundations'],
      resources: ['res_01_1'],
    },
    {
      node_id: '02_protocol_development',
      title: 'Protocol Development & Preregistration',
      description: 'Creating a detailed, reproducible plan for the study.',
      learning_objectives: ['Write a comprehensive study protocol.'],
      prerequisites: ['01_study_design'],
      resources: ['res_02_1'],
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
      description: 'The absolute gold standard text for clinical research foundations.',
      tags: ['FINER', 'PICO', 'Study conceptualization'],
      verification: { status: 'verified', checked_date: '2023-10-24' },
    },
    {
      id: 'res_01_1',
      node_id: '01_study_design',
      partition: 'software-guides',
      kind: 'Official Guideline',
      title: 'CEBM Levels of Evidence',
      url: 'https://www.cebm.ox.ac.uk/resources/levels-of-evidence',
      description: 'Standardized hierarchy of study designs and evidence quality.',
      tags: ['Hierarchy of Evidence', 'Study Design'],
      verification: { status: 'verified', checked_date: '2023-10-24' },
    },
    {
      id: 'res_02_1',
      node_id: '02_protocol_development',
      partition: 'software-guides',
      kind: 'Official Guideline',
      title: 'SPIRIT Statement',
      url: 'https://www.spirit-statement.org/',
      description: 'Guideline for the minimum content of a clinical trial protocol.',
      tags: ['Clinical Trials', 'Protocol', 'Guideline'],
      verification: { status: 'verified', checked_date: '2023-10-24' },
    },
  ],
};

describe('search', () => {
  it('returns empty results for empty query', () => {
    const graph = loadGraph(sampleData)!;
    const results = search(graph, '');
    expect(results.totalCount).toBe(0);
    expect(results.results).toHaveLength(0);
  });

  it('finds nodes by title', () => {
    const graph = loadGraph(sampleData)!;
    const results = search(graph, 'Study Design');
    expect(results.nodeCount).toBeGreaterThan(0);
    expect(results.results[0]?.type).toBe('node');
  });

  it('finds resources by title', () => {
    const graph = loadGraph(sampleData)!;
    const results = search(graph, 'SPIRIT');
    expect(results.resourceCount).toBeGreaterThan(0);
    expect(results.results.some((r) => r.type === 'resource')).toBe(true);
  });

  it('finds resources by tag', () => {
    const graph = loadGraph(sampleData)!;
    const results = search(graph, 'PICO');
    expect(results.resourceCount).toBeGreaterThan(0);
  });

  it('ranks title matches higher than description matches', () => {
    const graph = loadGraph(sampleData)!;
    const results = search(graph, 'Research');
    const titleMatch = results.results.find((r) => r.title.includes('Research'));
    const descMatch = results.results.find((r) => !r.title.includes('Research') && r.description.includes('Research'));
    if (titleMatch && descMatch) {
      expect(titleMatch.score).toBeGreaterThan(descMatch.score);
    }
  });

  it('filters by type', () => {
    const graph = loadGraph(sampleData)!;
    const results = search(graph, 'Design', { types: ['node'] });
    expect(results.resourceCount).toBe(0);
    expect(results.nodeCount).toBeGreaterThan(0);
  });

  it('filters by partition', () => {
    const graph = loadGraph(sampleData)!;
    const results = search(graph, 'Design', { partitions: ['videos'] });
    expect(results.resourceCount).toBe(0);
  });

  it('filters by verification status', () => {
    const graph = loadGraph(sampleData)!;
    const results = search(graph, 'Design', { verificationStatuses: ['pending'] });
    expect(results.resourceCount).toBe(0);
  });

  it('is case-insensitive', () => {
    const graph = loadGraph(sampleData)!;
    const results = search(graph, 'STUDY');
    expect(results.totalCount).toBeGreaterThan(0);
  });

  it('returns correct counts', () => {
    const graph = loadGraph(sampleData)!;
    const results = search(graph, 'Design');
    expect(results.totalCount).toBe(results.nodeCount + results.resourceCount);
  });
});

describe('getSearchSuggestions', () => {
  it('returns suggestions for partial query', () => {
    const graph = loadGraph(sampleData)!;
    const suggestions = getSearchSuggestions(graph, 'Res');
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('returns empty array for empty query', () => {
    const graph = loadGraph(sampleData)!;
    const suggestions = getSearchSuggestions(graph, '');
    expect(suggestions).toHaveLength(0);
  });

  it('limits suggestions to max', () => {
    const graph = loadGraph(sampleData)!;
    const suggestions = getSearchSuggestions(graph, 'a', 2);
    expect(suggestions.length).toBeLessThanOrEqual(2);
  });

  it('returns empty array for no matches', () => {
    const graph = loadGraph(sampleData)!;
    const suggestions = getSearchSuggestions(graph, 'zzzznonexistent');
    expect(suggestions).toHaveLength(0);
  });
});
