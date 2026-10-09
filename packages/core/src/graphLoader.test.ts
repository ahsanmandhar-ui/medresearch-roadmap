import { describe, it, expect } from 'vitest';
import {
  loadGraph,
  getNode,
  getChildren,
  getParents,
  getResourcesForNode,
  getEdgesForNode,
  getRootNodes,
  getLeafNodes,
  searchNodes,
  searchResources,
} from './graphLoader.js';

const sampleData = {
  nodes: [
    {
      node_id: '00_research_foundations',
      title: 'Research Foundations',
      description: 'The fundamental building blocks of clinical research.',
      learning_objectives: ['Understand the clinical research workflow.'],
      prerequisites: [],
      resources: ['res_00_1'],
    },
    {
      node_id: '01_study_design',
      title: 'Study Design Selection',
      description: 'Choosing the appropriate study design.',
      learning_objectives: ['Match the research question to the correct study design.'],
      prerequisites: ['00_research_foundations'],
      resources: ['res_01_1'],
    },
    {
      node_id: '02_protocol_development',
      title: 'Protocol Development',
      description: 'Creating a detailed study plan.',
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
      description: 'The absolute gold standard text.',
      tags: ['FINER', 'PICO'],
      verification: { status: 'verified', checked_date: '2023-10-24' },
    },
    {
      id: 'res_01_1',
      node_id: '01_study_design',
      partition: 'software-guides',
      kind: 'Official Guideline',
      title: 'CEBM Levels of Evidence',
      url: 'https://www.cebm.ox.ac.uk/resources/levels-of-evidence',
      description: 'Standardized hierarchy of study designs.',
      tags: ['Hierarchy of Evidence'],
      verification: { status: 'verified', checked_date: '2023-10-24' },
    },
    {
      id: 'res_02_1',
      node_id: '02_protocol_development',
      partition: 'software-guides',
      kind: 'Official Guideline',
      title: 'SPIRIT Statement',
      url: 'https://www.spirit-statement.org/',
      description: 'Guideline for clinical trial protocols.',
      tags: ['Clinical Trials', 'Protocol'],
      verification: { status: 'verified', checked_date: '2023-10-24' },
    },
  ],
};

describe('loadGraph', () => {
  it('loads valid graph data', () => {
    const graph = loadGraph(sampleData);
    expect(graph).not.toBeNull();
    expect(graph!.nodes).toHaveLength(3);
    expect(graph!.edges).toHaveLength(2);
    expect(graph!.resources).toHaveLength(3);
  });

  it('returns null for invalid data', () => {
    const graph = loadGraph({ nodes: 'invalid', resources: [] });
    expect(graph).toBeNull();
  });

  it('returns null for missing references', () => {
    const badData = {
      nodes: [
        {
          node_id: '00_test',
          title: 'Test',
          description: 'Test',
          learning_objectives: ['Test'],
          prerequisites: ['99_missing'],
          resources: [],
        },
      ],
      resources: [],
    };
    const graph = loadGraph(badData);
    expect(graph).toBeNull();
  });
});

describe('getNode', () => {
  it('returns a node by ID', () => {
    const graph = loadGraph(sampleData)!;
    const node = getNode(graph, '00_research_foundations');
    expect(node).toBeDefined();
    expect(node!.title).toBe('Research Foundations');
  });

  it('returns undefined for missing node', () => {
    const graph = loadGraph(sampleData)!;
    expect(getNode(graph, '99_missing')).toBeUndefined();
  });
});

describe('getChildren', () => {
  it('returns child nodes', () => {
    const graph = loadGraph(sampleData)!;
    const children = getChildren(graph, '00_research_foundations');
    expect(children).toHaveLength(1);
    expect(children[0]!.id).toBe('01_study_design');
  });

  it('returns empty array for leaf nodes', () => {
    const graph = loadGraph(sampleData)!;
    const children = getChildren(graph, '02_protocol_development');
    expect(children).toHaveLength(0);
  });
});

describe('getParents', () => {
  it('returns parent nodes', () => {
    const graph = loadGraph(sampleData)!;
    const parents = getParents(graph, '02_protocol_development');
    expect(parents).toHaveLength(1);
    expect(parents[0]!.id).toBe('01_study_design');
  });

  it('returns empty array for root nodes', () => {
    const graph = loadGraph(sampleData)!;
    const parents = getParents(graph, '00_research_foundations');
    expect(parents).toHaveLength(0);
  });
});

describe('getResourcesForNode', () => {
  it('returns resources for a node', () => {
    const graph = loadGraph(sampleData)!;
    const resources = getResourcesForNode(graph, '00_research_foundations');
    expect(resources).toHaveLength(1);
    expect(resources[0]!.id).toBe('res_00_1');
  });

  it('returns empty array for node with no resources', () => {
    const graph = loadGraph(sampleData)!;
    const resources = getResourcesForNode(graph, '99_missing');
    expect(resources).toHaveLength(0);
  });
});

describe('getEdgesForNode', () => {
  it('returns edges connected to a node', () => {
    const graph = loadGraph(sampleData)!;
    const edges = getEdgesForNode(graph, '01_study_design');
    expect(edges).toHaveLength(2);
  });

  it('returns empty array for isolated node', () => {
    const graph = loadGraph(sampleData)!;
    const edges = getEdgesForNode(graph, '99_missing');
    expect(edges).toHaveLength(0);
  });
});

describe('getRootNodes', () => {
  it('returns nodes with no prerequisites', () => {
    const graph = loadGraph(sampleData)!;
    const roots = getRootNodes(graph);
    expect(roots).toHaveLength(1);
    expect(roots[0]!.id).toBe('00_research_foundations');
  });
});

describe('getLeafNodes', () => {
  it('returns nodes with no children', () => {
    const graph = loadGraph(sampleData)!;
    const leaves = getLeafNodes(graph);
    expect(leaves).toHaveLength(1);
    expect(leaves[0]!.id).toBe('02_protocol_development');
  });
});

describe('searchNodes', () => {
  it('finds nodes by title', () => {
    const graph = loadGraph(sampleData)!;
    const results = searchNodes(graph, 'Study Design');
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe('01_study_design');
  });

  it('finds nodes by description', () => {
    const graph = loadGraph(sampleData)!;
    const results = searchNodes(graph, 'fundamental building blocks');
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe('00_research_foundations');
  });

  it('is case-insensitive', () => {
    const graph = loadGraph(sampleData)!;
    const results = searchNodes(graph, 'STUDY DESIGN');
    expect(results).toHaveLength(1);
  });

  it('returns empty array for no matches', () => {
    const graph = loadGraph(sampleData)!;
    const results = searchNodes(graph, 'zzzznonexistent');
    expect(results).toHaveLength(0);
  });
});

describe('searchResources', () => {
  it('finds resources by title', () => {
    const graph = loadGraph(sampleData)!;
    const results = searchResources(graph, 'SPIRIT');
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe('res_02_1');
  });

  it('finds resources by tag', () => {
    const graph = loadGraph(sampleData)!;
    const results = searchResources(graph, 'PICO');
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe('res_00_1');
  });

  it('is case-insensitive', () => {
    const graph = loadGraph(sampleData)!;
    const results = searchResources(graph, 'spirit');
    expect(results).toHaveLength(1);
  });

  it('returns empty array for no matches', () => {
    const graph = loadGraph(sampleData)!;
    const results = searchResources(graph, 'zzzznonexistent');
    expect(results).toHaveLength(0);
  });
});
