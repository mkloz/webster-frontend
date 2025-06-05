'use client';

import type { KonvaEventObject } from 'konva/lib/Node';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useLeftSidebarStore } from '@/modules/home/hooks/use-left-sidebar-store';

import { type Shape, useShapesStore } from './shapes-store';

interface UseSelectionLogicProps {
  position: { x: number; y: number };
  scale: number;
}

interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useSelectionLogic = ({ position, scale }: UseSelectionLogicProps) => {
  const { activeTool, setActiveTool, setShowLeftSidebar } = useLeftSidebarStore();
  const { shapes, selectedShapeIds, setSelectedShapeIds, addToSelection, clearSelection, setShapes, toggleSelection } =
    useShapesStore();

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const manualToolChangeRef = useRef(false);
  const lastToolRef = useRef(activeTool);

  const isSelectTool = activeTool === 'select';

  // Track manual tool changes
  useEffect(() => {
    if (lastToolRef.current !== activeTool) {
      manualToolChangeRef.current = true;
      lastToolRef.current = activeTool;

      // Reset the flag after a short delay to allow auto-switching again
      const timer = setTimeout(() => {
        manualToolChangeRef.current = false;
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [activeTool]);

  // Function to determine which tool should be active based on shape type
  const getToolForShapeType = (shapeType: string) => {
    switch (shapeType) {
      case 'text':
        return 'text';
      case 'image':
        return 'image';
      case 'rectangle':
      case 'square':
      case 'circle':
      case 'round':
      case 'star':
      case 'triangle':
      case 'hexagon':
      case 'line':
        return 'shapes';
      default:
        return 'select';
    }
  };

  // Auto-switch tool when a single item is selected (only if not manually changed)
  useEffect(() => {
    // Don't auto-switch if user just manually changed tools
    if (manualToolChangeRef.current) return;

    if (selectedShapeIds.length === 1) {
      const selectedShape = shapes.find((shape) => shape.id === selectedShapeIds[0]);
      if (selectedShape) {
        const requiredTool = getToolForShapeType(selectedShape.type);
        if (activeTool !== requiredTool) {
          setActiveTool(requiredTool);
          setShowLeftSidebar(true);
        }
      }
    }
  }, [selectedShapeIds, shapes, activeTool, setActiveTool, setShowLeftSidebar]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSelectTool) return;

      if (e.key === 'Escape') {
        clearSelection();
      }

      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setSelectedShapeIds(shapes.map((shape) => shape.id));
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedShapeIds.length > 0) {
          setShapes((prevShapes) => prevShapes.filter((shape) => !selectedShapeIds.includes(shape.id)));
          clearSelection();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelectTool, selectedShapeIds, shapes, clearSelection, setSelectedShapeIds, setShapes]);

  // Convert screen coordinates to canvas coordinates
  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      return {
        x: (clientX - position.x) / scale,
        y: (clientY - position.y) / scale
      };
    },
    [position, scale]
  );

  // Check if a point is inside a shape
  const isPointInShape = useCallback((point: { x: number; y: number }, shape: Shape) => {
    const { x, y, width, height, size, type, rotation = 0 } = shape;

    // For shapes with width and height, use those instead of size
    const shapeWidth = width || size;
    const shapeHeight = height || size;

    // If we have width and height, use half of those
    const halfWidth = shapeWidth ? shapeWidth / 2 : size / 2;
    const halfHeight = shapeHeight ? shapeHeight / 2 : size / 2;

    // If the shape is rotated, we need to rotate the point in the opposite direction
    let rotatedPoint = { ...point };
    if (rotation !== 0) {
      const radians = (rotation * Math.PI) / 180;
      const cos = Math.cos(-radians);
      const sin = Math.sin(-radians);

      // Translate point to origin
      const dx = point.x - x;
      const dy = point.y - y;

      // Rotate point
      rotatedPoint = {
        x: x + (dx * cos - dy * sin),
        y: y + (dx * sin + dy * cos)
      };
    }

    switch (type) {
      case 'circle':
      case 'round': {
        const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
        return distance <= halfWidth;
      }

      case 'rectangle':
      case 'square': {
        return (
          rotatedPoint.x >= x - halfWidth &&
          rotatedPoint.x <= x + halfWidth &&
          rotatedPoint.y >= y - halfHeight &&
          rotatedPoint.y <= y + halfHeight
        );
      }

      case 'line': {
        // For lines, we check if the point is close to the line segment
        // First, get the line endpoints
        const x1 = x - halfWidth;
        const y1 = y - halfHeight;
        const x2 = x + halfWidth;
        const y2 = y + halfHeight;

        // Calculate distance from point to line segment
        const A = rotatedPoint.x - x1;
        const B = rotatedPoint.y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;

        if (param < 0) {
          xx = x1;
          yy = y1;
        } else if (param > 1) {
          xx = x2;
          yy = y2;
        } else {
          xx = x1 + param * C;
          yy = y1 + param * D;
        }

        const dx = rotatedPoint.x - xx;
        const dy = rotatedPoint.y - yy;

        // Distance threshold - adjust as needed for easier selection
        const threshold = Math.max(5, shape.strokeWidth || 2);
        return Math.sqrt(dx * dx + dy * dy) <= threshold;
      }

      case 'star':
      case 'triangle':
      case 'hexagon': {
        // Use bounding box check for complex shapes
        return (
          rotatedPoint.x >= x - halfWidth &&
          rotatedPoint.x <= x + halfWidth &&
          rotatedPoint.y >= y - halfHeight &&
          rotatedPoint.y <= y + halfHeight
        );
      }

      case 'text':
      case 'image': {
        // For text and images, use their width and height
        return (
          rotatedPoint.x >= x - halfWidth &&
          rotatedPoint.x <= x + halfWidth &&
          rotatedPoint.y >= y - halfHeight &&
          rotatedPoint.y <= y + halfHeight
        );
      }

      default:
        return false;
    }
  }, []);

  // Get shapes within selection box
  const getShapesInBox = useCallback(
    (box: SelectionBox) => {
      return shapes.filter((shape) => {
        // Use width/height if available, otherwise use size
        const shapeWidth = shape.width || shape.size;
        const shapeHeight = shape.height || shape.size;

        const halfWidth = shapeWidth ? shapeWidth / 2 : shape.size / 2;
        const halfHeight = shapeHeight ? shapeHeight / 2 : shape.size / 2;

        // Check if shape overlaps with selection box
        return (
          shape.x + halfWidth >= box.x &&
          shape.x - halfWidth <= box.x + box.width &&
          shape.y + halfHeight >= box.y &&
          shape.y - halfHeight <= box.y + box.height
        );
      });
    },
    [shapes]
  );

  // Handle shape selection
  const handleShapeSelect = useCallback(
    (shapeId: string, event?: KonvaEventObject<MouseEvent>) => {
      if (!isSelectTool) return;

      const isMultiSelect = event?.evt.shiftKey || event?.evt.ctrlKey || event?.evt.metaKey;

      if (isMultiSelect) {
        toggleSelection(shapeId);
      } else {
        setSelectedShapeIds([shapeId]);
      }
    },
    [isSelectTool, toggleSelection, setSelectedShapeIds]
  );

  // Handle mouse down for selection
  const handleSelectionMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!isSelectTool) return;

      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;

      const canvasPos = getCanvasCoordinates(pos.x, pos.y);

      // Check if clicking on a shape
      const clickedShape = shapes.find((shape) => isPointInShape(canvasPos, shape));

      if (clickedShape) {
        handleShapeSelect(clickedShape.id, e);
        return;
      }

      // Start marquee selection if clicking on empty space
      if (e.target === e.currentTarget) {
        const isMultiSelect = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;

        if (!isMultiSelect) {
          clearSelection();
        }

        setIsSelecting(true);
        selectionStartRef.current = canvasPos;
        setSelectionBox({
          x: canvasPos.x,
          y: canvasPos.y,
          width: 0,
          height: 0
        });
      }
    },
    [isSelectTool, getCanvasCoordinates, shapes, isPointInShape, handleShapeSelect, clearSelection]
  );

  // Handle mouse move for marquee selection
  const handleSelectionMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!isSelecting || !selectionStartRef.current) return;

      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;

      const canvasPos = getCanvasCoordinates(pos.x, pos.y);
      const start = selectionStartRef.current;

      const newBox = {
        x: Math.min(start.x, canvasPos.x),
        y: Math.min(start.y, canvasPos.y),
        width: Math.abs(canvasPos.x - start.x),
        height: Math.abs(canvasPos.y - start.y)
      };

      setSelectionBox(newBox);
    },
    [isSelecting, getCanvasCoordinates]
  );

  // Handle mouse up for marquee selection
  const handleSelectionMouseUp = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!isSelecting || !selectionBox) return;

      const shapesInBox = getShapesInBox(selectionBox);
      const isMultiSelect = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;

      if (shapesInBox.length > 0) {
        if (isMultiSelect) {
          shapesInBox.forEach((shape) => addToSelection(shape.id));
        } else {
          setSelectedShapeIds(shapesInBox.map((shape) => shape.id));
        }
      }

      // Reset selection state
      setIsSelecting(false);
      setSelectionBox(null);
      selectionStartRef.current = null;
    },
    [isSelecting, selectionBox, getShapesInBox, addToSelection, setSelectedShapeIds]
  );

  return {
    isSelecting,
    selectionBox,
    selectedShapeIds,
    handleSelectionMouseDown,
    handleSelectionMouseMove,
    handleSelectionMouseUp,
    handleShapeSelect,
    clearSelection
  };
};
