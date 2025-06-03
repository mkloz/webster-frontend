import { create } from 'zustand';

import type { Shape } from './shapes-store';

interface HistoryEntry {
  shapes: Shape[];
  timestamp: number;
  action?: string; // Optional description of the action
}

interface HistoryState {
  history: HistoryEntry[];
  currentIndex: number;
  maxHistorySize: number;
  isProcessing: boolean; // Add flag to prevent rapid operations

  // Actions
  pushToHistory: (shapes: Shape[], action?: string) => void;
  undo: () => Shape[] | null;
  redo: () => Shape[] | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  getHistoryInfo: () => { current: number; total: number };
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: [],
  currentIndex: -1,
  maxHistorySize: 50, // Limit history to prevent memory issues
  isProcessing: false,

  pushToHistory: (shapes: Shape[], action?: string) => {
    const state = get();

    // Prevent rapid operations
    if (state.isProcessing) return;

    const newEntry: HistoryEntry = {
      shapes: JSON.parse(JSON.stringify(shapes)), // Deep clone to prevent mutations
      timestamp: Date.now(),
      action
    };

    // Remove any history entries after current index (when user made changes after undo)
    const newHistory = state.history.slice(0, state.currentIndex + 1);

    // Add new entry
    newHistory.push(newEntry);

    // Limit history size
    if (newHistory.length > state.maxHistorySize) {
      newHistory.shift(); // Remove oldest entry
    } else {
      // Only increment index if we didn't remove an entry
      set({ currentIndex: state.currentIndex + 1 });
    }

    set({
      history: newHistory,
      currentIndex: Math.min(state.currentIndex + 1, state.maxHistorySize - 1)
    });
  },

  undo: () => {
    const state = get();

    // Prevent rapid operations
    if (state.isProcessing || !state.canUndo()) return null;

    set({ isProcessing: true });

    const newIndex = state.currentIndex - 1;
    set({ currentIndex: newIndex });

    // Reset processing flag after a short delay
    setTimeout(() => set({ isProcessing: false }), 100);

    return newIndex >= 0 ? state.history[newIndex].shapes : [];
  },

  redo: () => {
    const state = get();

    // Prevent rapid operations
    if (state.isProcessing || !state.canRedo()) return null;

    set({ isProcessing: true });

    const newIndex = state.currentIndex + 1;
    set({ currentIndex: newIndex });

    // Reset processing flag after a short delay
    setTimeout(() => set({ isProcessing: false }), 100);

    return state.history[newIndex].shapes;
  },

  canUndo: () => {
    const state = get();
    return state.currentIndex > 0 && !state.isProcessing;
  },

  canRedo: () => {
    const state = get();
    return state.currentIndex < state.history.length - 1 && !state.isProcessing;
  },

  clearHistory: () => {
    set({ history: [], currentIndex: -1, isProcessing: false });
  },

  getHistoryInfo: () => {
    const state = get();
    return {
      current: state.currentIndex + 1,
      total: state.history.length
    };
  }
}));
