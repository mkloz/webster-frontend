import { useHotkeys } from 'react-hotkeys-hook';

import { useLeftSidebarStore } from '@/modules/home/hooks/use-left-sidebar-store';

import { useShapesStore } from './shapes-store';
import { useToolOptionsStore } from './tool-optios-store';
import { useCanvasHistory } from './use-canvas-history';

export const useGlobalKeybinds = () => {
  const { setActiveTool, setShowLeftSidebar } = useLeftSidebarStore();
  const { selectedShapeIds, setShapes, shapes, clearSelection, setSelectedShapeIds } = useShapesStore();
  const { setToolOptions } = useToolOptionsStore();
  const { saveToHistory, undo, redo } = useCanvasHistory();
  const { duplicateSelectedShapes } = useShapesStore();

  useHotkeys(
    'ctrl+d',
    () => {
      if (selectedShapeIds.length > 0) {
        duplicateSelectedShapes();
        saveToHistory('Duplicate shapes');
      }
    },
    { preventDefault: true }
  );

  // Tool shortcuts
  useHotkeys(
    'v',
    () => {
      setActiveTool('select');
      setShowLeftSidebar(true);
    },
    { preventDefault: true }
  );

  useHotkeys(
    'l',
    () => {
      setActiveTool('pointer');
      setShowLeftSidebar(true);
    },
    { preventDefault: true }
  );

  useHotkeys(
    'p',
    () => {
      setActiveTool('pen');
      setShowLeftSidebar(true);
    },
    { preventDefault: true }
  );

  useHotkeys(
    'e',
    () => {
      setActiveTool('eraser');
      setShowLeftSidebar(true);
    },
    { preventDefault: true }
  );

  useHotkeys(
    's',
    () => {
      setActiveTool('shapes');
      setShowLeftSidebar(true);
    },
    { preventDefault: true }
  );

  useHotkeys(
    't',
    () => {
      setActiveTool('text');
      setShowLeftSidebar(true);
    },
    { preventDefault: true }
  );

  useHotkeys(
    'i',
    () => {
      setActiveTool('image');
      setShowLeftSidebar(true);
    },
    { preventDefault: true }
  );

  // History shortcuts - centralized here to avoid duplicate registrations
  useHotkeys('ctrl+z', undo, { preventDefault: true });
  useHotkeys('ctrl+y', redo, { preventDefault: true });
  useHotkeys('ctrl+shift+z', redo, { preventDefault: true });

  // Selection shortcuts
  useHotkeys(
    'delete',
    () => {
      if (selectedShapeIds.length > 0) {
        setShapes(shapes.filter((shape) => !selectedShapeIds.includes(shape.id)));
        clearSelection();

        // Clear tool-specific selections
        setToolOptions('text', { selectedTextId: null });
        setToolOptions('shape', { selectedShapeId: null });
        setToolOptions('image', { selectedImageId: null });

        // Save to history
        saveToHistory('Delete shapes');
      }
    },
    { preventDefault: true }
  );

  useHotkeys(
    'backspace',
    () => {
      if (selectedShapeIds.length > 0) {
        setShapes(shapes.filter((shape) => !selectedShapeIds.includes(shape.id)));
        clearSelection();

        // Clear tool-specific selections
        setToolOptions('text', { selectedTextId: null });
        setToolOptions('shape', { selectedShapeId: null });
        setToolOptions('image', { selectedImageId: null });

        // Save to history
        saveToHistory('Delete shapes');
      }
    },
    { preventDefault: true }
  );

  useHotkeys(
    'escape',
    () => {
      // Clear all selections
      clearSelection();

      // Clear tool-specific selections
      setToolOptions('text', { selectedTextId: null });
      setToolOptions('shape', { selectedShapeId: null });
      setToolOptions('image', { selectedImageId: null });

      // Switch to select tool
      setActiveTool('select');
      setShowLeftSidebar(true);
    },
    { preventDefault: true }
  );

  useHotkeys(
    'ctrl+a',
    () => {
      setSelectedShapeIds(shapes.map((shape) => shape.id));
    },
    { preventDefault: true }
  );
};
