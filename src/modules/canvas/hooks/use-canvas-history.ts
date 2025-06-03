'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useShapesStore } from './shapes-store';
import { useHistoryStore } from './use-history-store';

export const useCanvasHistory = () => {
  const { shapes, setShapes } = useShapesStore();
  const { pushToHistory, canUndo, canRedo, clearHistory, getHistoryInfo } = useHistoryStore();

  const isUndoRedoRef = useRef(false);
  const lastSavedShapesRef = useRef<string>('');

  // Save initial state to history only once
  useEffect(() => {
    const historyState = useHistoryStore.getState();
    if (historyState.history.length === 0) {
      pushToHistory([], 'Initial state');
      lastSavedShapesRef.current = JSON.stringify([]);
    }
  }, [pushToHistory]);

  // Only track changes for undo/redo operations, not for automatic saving
  useEffect(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      lastSavedShapesRef.current = JSON.stringify(shapes);
    }
  }, [shapes]);

  const handleUndo = useCallback(() => {
    // Get fresh state at execution time
    const { canUndo: canUndoNow, undo: undoAction, getHistoryInfo: getInfo } = useHistoryStore.getState();

    if (!canUndoNow()) {
      toast.error('Nothing to undo');
      return;
    }

    const previousShapes = undoAction();
    if (previousShapes !== null) {
      isUndoRedoRef.current = true;
      setShapes(previousShapes);

      const historyInfo = getInfo();
      toast.success(`Undo successful (${historyInfo.current}/${historyInfo.total})`);
    }
  }, [setShapes]);

  const handleRedo = useCallback(() => {
    // Get fresh state at execution time
    const { canRedo: canRedoNow, redo: redoAction, getHistoryInfo: getInfo } = useHistoryStore.getState();

    if (!canRedoNow()) {
      toast.error('Nothing to redo');
      return;
    }

    const nextShapes = redoAction();
    if (nextShapes !== null) {
      isUndoRedoRef.current = true;
      setShapes(nextShapes);

      const historyInfo = getInfo();
      toast.success(`Redo successful (${historyInfo.current}/${historyInfo.total})`);
    }
  }, [setShapes]);

  // Manual save function - only call this when you want to save to history
  const saveToHistory = useCallback(
    (action?: string) => {
      const shapesString = JSON.stringify(shapes);

      // Only save if shapes actually changed
      if (shapesString !== lastSavedShapesRef.current) {
        pushToHistory(shapes, action);
        lastSavedShapesRef.current = shapesString;
      }
    },
    [shapes, pushToHistory]
  );

  const resetHistory = useCallback(() => {
    clearHistory();
    pushToHistory(shapes, 'Reset');
    lastSavedShapesRef.current = JSON.stringify(shapes);
  }, [clearHistory, pushToHistory, shapes]);

  return {
    undo: handleUndo,
    redo: handleRedo,
    canUndo: canUndo(),
    canRedo: canRedo(),
    saveToHistory,
    resetHistory,
    getHistoryInfo
  };
};
