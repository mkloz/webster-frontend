import { useHotkeys } from 'react-hotkeys-hook';

import { useLeftSidebarStore } from '@/modules/home/hooks/use-left-sidebar-store';

import { useShapesStore } from './shapes-store';
import { useToolOptionsStore } from './tool-optios-store';
import { useCanvasHistory } from './use-canvas-history';

const MOVE_DISTANCE = 10;
const FINE_MOVE_DISTANCE = 1;
const ROTATION_ANGLE = 15; // degrees
const FINE_ROTATION_ANGLE = 1; // degrees

export const useGlobalKeybinds = () => {
  const { setActiveTool, setShowLeftSidebar } = useLeftSidebarStore();
  const { selectedShapeIds, setShapes, shapes, clearSelection, setSelectedShapeIds } = useShapesStore();
  const { setToolOptions } = useToolOptionsStore();
  const { saveToHistory, undo, redo } = useCanvasHistory();
  const { duplicateSelectedShapes } = useShapesStore();
  const moveShapes = (dx: number, dy: number, selectedOnly = false, historyMessage: string) => {
    // Determine which shapes to move
    const shapesToMove =
      selectedOnly && selectedShapeIds.length > 0 ? selectedShapeIds : shapes.map((shape) => shape.id);

    if (shapesToMove.length === 0) return;

    setShapes((prevShapes) =>
      prevShapes.map((shape) => {
        if (!shapesToMove.includes(shape.id)) return shape;

        return {
          ...shape,
          x: shape.x + dx,
          y: shape.y + dy,
          // Also move line endpoints if it's a line
          ...(shape.type === 'line' && shape.x2 !== undefined && shape.y2 !== undefined
            ? { x2: shape.x2 + dx, y2: shape.y2 + dy }
            : {})
        };
      })
    );

    saveToHistory(historyMessage);
  };
  const rotateShapes = (angle: number, selectedOnly = false, historyMessage: string) => {
    // Determine which shapes to rotate
    const shapesToRotate =
      selectedOnly && selectedShapeIds.length > 0 ? selectedShapeIds : shapes.map((shape) => shape.id);

    if (shapesToRotate.length === 0) return;

    setShapes((prevShapes) =>
      prevShapes.map((shape) => {
        if (!shapesToRotate.includes(shape.id)) return shape;

        const currentRotation = shape.rotation || 0;
        let newRotation = currentRotation + angle;

        // Normalize rotation to 0-360 degrees
        while (newRotation < 0) newRotation += 360;
        while (newRotation >= 360) newRotation -= 360;

        return {
          ...shape,
          rotation: newRotation
        };
      })
    );

    saveToHistory(historyMessage);
  };

  // Rotation controls
  useHotkeys(
    'ctrl+left',
    () => {
      const selectedOnly = selectedShapeIds.length > 0;
      rotateShapes(
        -ROTATION_ANGLE,
        selectedOnly,
        selectedOnly ? 'Rotate selected shapes left' : 'Rotate all shapes left'
      );
    },
    { preventDefault: true }
  );

  useHotkeys(
    'ctrl+right',
    () => {
      const selectedOnly = selectedShapeIds.length > 0;
      rotateShapes(
        ROTATION_ANGLE,
        selectedOnly,
        selectedOnly ? 'Rotate selected shapes right' : 'Rotate all shapes right'
      );
    },
    { preventDefault: true }
  );

  // Fine rotation controls
  useHotkeys(
    'ctrl+alt+left',
    () => {
      const selectedOnly = selectedShapeIds.length > 0;
      rotateShapes(
        -FINE_ROTATION_ANGLE,
        selectedOnly,
        selectedOnly ? 'Fine rotate selected shapes left' : 'Fine rotate all shapes left'
      );
    },
    { preventDefault: true }
  );

  useHotkeys(
    'ctrl+alt+right',
    () => {
      const selectedOnly = selectedShapeIds.length > 0;
      rotateShapes(
        FINE_ROTATION_ANGLE,
        selectedOnly,
        selectedOnly ? 'Fine rotate selected shapes right' : 'Fine rotate all shapes right'
      );
    },
    { preventDefault: true }
  );

  // Move shapes with arrow keys (normal speed)
  useHotkeys(
    'up',
    () => {
      const selectedOnly = selectedShapeIds.length > 0;
      moveShapes(0, -MOVE_DISTANCE, selectedOnly, selectedOnly ? 'Move selected shapes up' : 'Move all shapes up');
    },
    { preventDefault: true }
  );

  useHotkeys(
    'down',
    () => {
      const selectedOnly = selectedShapeIds.length > 0;
      moveShapes(0, MOVE_DISTANCE, selectedOnly, selectedOnly ? 'Move selected shapes down' : 'Move all shapes down');
    },
    { preventDefault: true }
  );

  useHotkeys(
    'left',
    () => {
      const selectedOnly = selectedShapeIds.length > 0;
      moveShapes(-MOVE_DISTANCE, 0, selectedOnly, selectedOnly ? 'Move selected shapes left' : 'Move all shapes left');
    },
    { preventDefault: true }
  );

  useHotkeys(
    'right',
    () => {
      const selectedOnly = selectedShapeIds.length > 0;
      moveShapes(MOVE_DISTANCE, 0, selectedOnly, selectedOnly ? 'Move selected shapes right' : 'Move all shapes right');
    },
    { preventDefault: true }
  );
  // Fine movement with Alt+Arrow keys (1px increments)
  useHotkeys(
    'alt+up',
    () => {
      const selectedOnly = selectedShapeIds.length > 0;
      moveShapes(
        0,
        -FINE_MOVE_DISTANCE,
        selectedOnly,
        selectedOnly ? 'Fine move selected shapes up' : 'Fine move all shapes up'
      );
    },
    { preventDefault: true }
  );

  useHotkeys(
    'alt+down',
    () => {
      const selectedOnly = selectedShapeIds.length > 0;
      moveShapes(
        0,
        FINE_MOVE_DISTANCE,
        selectedOnly,
        selectedOnly ? 'Fine move selected shapes down' : 'Fine move all shapes down'
      );
    },
    { preventDefault: true }
  );

  useHotkeys(
    'alt+left',
    () => {
      const selectedOnly = selectedShapeIds.length > 0;
      moveShapes(
        -FINE_MOVE_DISTANCE,
        0,
        selectedOnly,
        selectedOnly ? 'Fine move selected shapes left' : 'Fine move all shapes left'
      );
    },
    { preventDefault: true }
  );

  useHotkeys(
    'alt+right',
    () => {
      const selectedOnly = selectedShapeIds.length > 0;
      moveShapes(
        FINE_MOVE_DISTANCE,
        0,
        selectedOnly,
        selectedOnly ? 'Fine move selected shapes right' : 'Fine move all shapes right'
      );
    },
    { preventDefault: true }
  );

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
