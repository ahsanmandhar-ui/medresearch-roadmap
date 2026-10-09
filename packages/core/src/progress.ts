export interface ProgressState {
  completedNodes: string[];
  notes: Record<string, string>;
  lastVisited: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface ProgressStats {
  totalNodes: number;
  completedCount: number;
  percentage: number;
  remainingCount: number;
  isComplete: boolean;
}

export interface ProgressListener {
  (state: ProgressState): void;
}

const STORAGE_KEY = 'research-roadmap-progress';

export function createProgressState(): ProgressState {
  return {
    completedNodes: [],
    notes: {},
    lastVisited: null,
    startedAt: null,
    completedAt: null,
  };
}

export function markComplete(state: ProgressState, nodeId: string, totalNodes: number): ProgressState {
  if (state.completedNodes.includes(nodeId)) {
    return state;
  }

  const completedNodes = [...state.completedNodes, nodeId];
  const now = new Date().toISOString();

  return {
    ...state,
    completedNodes,
    startedAt: state.startedAt ?? now,
    completedAt: completedNodes.length === totalNodes ? now : null,
  };
}

export function markIncomplete(state: ProgressState, nodeId: string): ProgressState {
  if (!state.completedNodes.includes(nodeId)) {
    return state;
  }

  return {
    ...state,
    completedNodes: state.completedNodes.filter((id) => id !== nodeId),
    completedAt: null,
  };
}

export function toggleComplete(state: ProgressState, nodeId: string, totalNodes: number): ProgressState {
  if (state.completedNodes.includes(nodeId)) {
    return markIncomplete(state, nodeId);
  }
  return markComplete(state, nodeId, totalNodes);
}

export function isComplete(state: ProgressState, nodeId: string): boolean {
  return state.completedNodes.includes(nodeId);
}

export function setNote(state: ProgressState, nodeId: string, note: string): ProgressState {
  return {
    ...state,
    notes: { ...state.notes, [nodeId]: note },
  };
}

export function getNote(state: ProgressState, nodeId: string): string | undefined {
  return state.notes[nodeId];
}

export function removeNote(state: ProgressState, nodeId: string): ProgressState {
  const notes = { ...state.notes };
  delete notes[nodeId];
  return { ...state, notes };
}

export function setLastVisited(state: ProgressState, nodeId: string): ProgressState {
  return { ...state, lastVisited: nodeId };
}

export function getProgressStats(state: ProgressState, totalNodes: number): ProgressStats {
  const completedCount = state.completedNodes.length;
  const percentage = totalNodes > 0 ? Math.round((completedCount / totalNodes) * 100) : 0;

  return {
    totalNodes,
    completedCount,
    percentage,
    remainingCount: totalNodes - completedCount,
    isComplete: completedCount === totalNodes && totalNodes > 0,
  };
}

export function getCompletedNodes(state: ProgressState): string[] {
  return [...state.completedNodes];
}

export function getIncompleteNodes(state: ProgressState, allNodeIds: string[]): string[] {
  return allNodeIds.filter((id) => !state.completedNodes.includes(id));
}

export function resetProgress(): ProgressState {
  return createProgressState();
}

export function saveProgress(state: ProgressState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable
  }
}

export function loadProgress(): ProgressState {
  if (typeof localStorage === 'undefined') return createProgressState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createProgressState();
    const parsed = JSON.parse(raw) as ProgressState;
    return {
      completedNodes: Array.isArray(parsed.completedNodes) ? parsed.completedNodes : [],
      notes: parsed.notes ?? {},
      lastVisited: parsed.lastVisited ?? null,
      startedAt: parsed.startedAt ?? null,
      completedAt: parsed.completedAt ?? null,
    };
  } catch {
    return createProgressState();
  }
}

export function subscribeProgress(listener: ProgressListener): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        listener(JSON.parse(e.newValue) as ProgressState);
      } catch {
        // Invalid JSON
      }
    }
  };

  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
