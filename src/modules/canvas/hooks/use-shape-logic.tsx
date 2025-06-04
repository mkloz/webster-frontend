'use client';

import type Konva from 'konva';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { useLeftSidebarStore } from '@/modules/home/hooks/use-left-sidebar-store';

import { useCanvasStore } from '../../../shared/store/canvas-store';
import { useToolOptionsStore } from '../hooks/tool-optios-store';
import { Shape, useShapesStore } from './shapes-store';
import { useCanvasContext } from './use-canvas-context';
import { useCanvasHistory } from './use-canvas-history';

export const useShapeLogic = () => {
  const stageRef = useCanvasContext().stageRef;
  const { activeTool } = useLeftSidebarStore();
  const { setToolOptions, shape } = useToolOptionsStore();
  const { shapes, setShapes, selectedShapeIds, setSelectedShapeIds, clearSelection } = useShapesStore();
  const { saveToHistory } = useCanvasHistory();
  const canvasStore = useCanvasStore();
  const isShapes = activeTool === 'shapes';
  const selectedTool = activeTool;

  const handleShapeMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isShapes) return;

    // Check if we clicked on an existing shape
    const clickedNode = e.target;
    if (clickedNode !== e.currentTarget) {
      const shapeId = clickedNode.id();
      if (shapeId) {
        // Select the shape
        setSelectedShapeIds([shapeId]);
        setToolOptions('shape', { selectedShapeId: shapeId });
        e.cancelBubble = true;
        return;
      }
    }

    // If clicking on empty space, deselect any selected shapes
    if (e.target === e.currentTarget) {
      setSelectedShapeIds([]);
      setToolOptions('shape', { selectedShapeId: null });
    }
  };

  const addShape = useCallback(
    (type: Shape['type'], x: number, y: number, color: string, size: number) => {
      const id = `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      let newShape: Shape = {
        id,
        type,
        x,
        y,
        color,
        size,
        opacity: 1,
        fillColor: color,
        fillOpacity: 0.8,
        strokeColor: color,
        strokeWidth: 2,
        showStroke: false,
        shouldFill: true
      };

      // Set initial dimensions based on shape type
      if (type === 'line') {
        // For lines, create a square bounding box initially
        newShape = {
          ...newShape,
          width: 100,
          height: 100,
          strokeWidth: size,
          showStroke: true,
          shouldFill: false
        };
      } else if (type === 'text') {
        newShape = {
          ...newShape,
          text: 'Double click to edit',
          fontSize: size,
          fontFamily: 'Arial',
          fontStyles: '',
          align: 'center',
          padding: 10,
          width: 200,
          height: size * 1.2,
          shouldFill: false,
          showStroke: false
        };
      } else if (type === 'image') {
        newShape = {
          ...newShape,
          width: 200,
          height: 200,
          shouldFill: false,
          showStroke: false
        };
      } else {
        // For other shapes, use size for both width and height initially
        newShape = {
          ...newShape,
          width: size,
          height: size
        };
      }

      setShapes((prev) => [...prev, newShape]);
      return id;
    },
    [setShapes]
  );

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Clear selection if clicking on empty area
      if (e.target === stage) {
        clearSelection();
        return;
      }
    },
    [addShape, clearSelection, stageRef, selectedTool]
  );

  const createShapeInCenter = (shapeType: Shape['type']) => {
    if (!isShapes) return;

    // Calculate center position
    const centerX = canvasStore.width / 2;
    const centerY = canvasStore.height / 2;

    // Create a base shape object with common properties
    const baseShape = {
      id: String(Date.now()),
      x: centerX,
      y: centerY,
      size: shape.shapeSize,
      color: shape.fillColor,
      opacity: 1,
      fillColor: shape.fillColor,
      fillOpacity: shape.fillOpacity,
      strokeColor: shape.strokeColor,
      strokeWidth: shape.strokeWidth,
      showStroke: shape.showStroke,
      shouldFill: shape.shouldFill,
      width: shape.shapeSize,
      height: shape.shapeSize
    };

    let newShape;

    // Create the appropriate shape type
    if (shapeType === 'star') {
      newShape = {
        ...baseShape,
        type: 'star' as const,
        scaleX: 1,
        scaleY: 1
      };
    } else if (shapeType === 'circle') {
      newShape = {
        ...baseShape,
        type: 'circle' as const
      };
    } else if (shapeType === 'line') {
      // For line, create with square bounding box for proper transformation
      newShape = {
        ...baseShape,
        type: 'line' as const,
        // Set equal width and height for square transform area
        width: shape.shapeSize,
        height: shape.shapeSize,
        // Configure line-specific properties
        showStroke: true,
        shouldFill: false,
        strokeWidth: shape.strokeWidth || 2
      };
    } else {
      // For other shapes (rectangle, etc.)
      newShape = {
        ...baseShape,
        type: shapeType
      };
    }

    // Add the shape to the canvas
    setShapes((prev) => [...prev, newShape]);

    // Select the new shape
    setSelectedShapeIds([newShape.id]);
    setToolOptions('shape', { selectedShapeId: newShape.id });

    // Save to history
    saveToHistory(`Create ${shapeType}`);

    // Show success message
    toast.success(`${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} added to canvas`);
  };

  return {
    handleShapeMouseDown,
    createShapeInCenter,
    shapes,
    selectedShapeIds,
    addShape,
    handleStageClick
  };
};
