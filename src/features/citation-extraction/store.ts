import { create } from 'zustand';

interface OptimisticRefData {
  added: boolean;
  timestamp: number;
}

interface CitationStore {
  activeSearchId: string | null;
  selectedReference: string | null;
  optimisticRefs: Record<string, Record<string, OptimisticRefData>>; // searchId -> { ref -> data }
  setActiveSearchId: (id: string | null) => void;
  setSelectedReference: (reference: string | null) => void;
  addOptimisticRefs: (searchId: string, references: string[]) => void;
  clearOptimisticRefs: (searchId: string) => void;
  clearSpecificOptimisticRefs: (searchId: string, references: string[]) => void;
  getOptimisticRefsForSearch: (searchId: string) => Record<string, boolean>;
  clearStaleOptimisticRefs: (searchId: string, maxAgeMs: number) => void;
}

export const useCitationStore = create<CitationStore>((set, get) => ({
  activeSearchId: null,
  selectedReference: null,
  optimisticRefs: {},
  setActiveSearchId: id => set({ activeSearchId: id }),
  setSelectedReference: reference => set({ selectedReference: reference }),
  addOptimisticRefs: (searchId, references) =>
    set(state => {
      const newOptimisticRefs = { ...state.optimisticRefs };
      if (!newOptimisticRefs[searchId]) {
        newOptimisticRefs[searchId] = {};
      }
      references.forEach(ref => {
        newOptimisticRefs[searchId][ref] = {
          added: true,
          timestamp: Date.now(),
        };
      });
      return { optimisticRefs: newOptimisticRefs };
    }),
  clearOptimisticRefs: searchId =>
    set(state => {
      const newOptimisticRefs = { ...state.optimisticRefs };
      delete newOptimisticRefs[searchId];
      return { optimisticRefs: newOptimisticRefs };
    }),
  clearSpecificOptimisticRefs: (searchId, references) =>
    set(state => {
      const refs = state.optimisticRefs[searchId];
      if (!refs) return state;

      const newRefs = { ...refs };
      references.forEach(ref => {
        delete newRefs[ref];
      });

      const newOptimisticRefs = { ...state.optimisticRefs };
      if (Object.keys(newRefs).length === 0) {
        delete newOptimisticRefs[searchId];
      } else {
        newOptimisticRefs[searchId] = newRefs;
      }

      return { optimisticRefs: newOptimisticRefs };
    }),
  getOptimisticRefsForSearch: searchId => {
    const state = get();
    const refs = state.optimisticRefs[searchId] || {};
    // Convert to simple boolean map for backward compatibility
    const booleanMap: Record<string, boolean> = {};
    Object.keys(refs).forEach(key => {
      booleanMap[key] = true;
    });
    return booleanMap;
  },
  clearStaleOptimisticRefs: (searchId, maxAgeMs) =>
    set(state => {
      const refs = state.optimisticRefs[searchId];
      if (!refs) return state;

      const now = Date.now();
      const newRefs = { ...refs };
      let hasChanges = false;

      Object.keys(newRefs).forEach(ref => {
        if (now - newRefs[ref].timestamp > maxAgeMs) {
          delete newRefs[ref];
          hasChanges = true;
        }
      });

      if (!hasChanges) return state;

      const newOptimisticRefs = { ...state.optimisticRefs };
      if (Object.keys(newRefs).length === 0) {
        delete newOptimisticRefs[searchId];
      } else {
        newOptimisticRefs[searchId] = newRefs;
      }

      return { optimisticRefs: newOptimisticRefs };
    }),
}));
