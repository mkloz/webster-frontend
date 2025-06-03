'use client';

import type { KonvaEventObject } from 'konva/lib/Node';
import type React from 'react';
import { useRef } from 'react';

import { useLeftSidebarStore } from '@/modules/home/hooks/use-left-sidebar-store';
import { useCanvasStore } from '@/shared/store/canvas-store';

import { useToolOptionsStore } from '../hooks/tool-optios-store';
import type { Shape } from './shapes-store';
import { useShapesStore } from './shapes-store';
import { useCanvasHistory } from './use-canvas-history';

interface UseShapeLogicProps {
  position: { x: number; y: number };
  scale: number;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
}

export const useShapeLogic = ({ position, scale, isDrawing, setIsDrawing, setShapes }: UseShapeLogicProps) => {
  const { width, height } = useCanvasStore();
  const { activeTool } = useLeftSidebarStore();
  const { shape } = useToolOptionsStore();
  const { setToolOptions } = useToolOptionsStore();
  const { setSelectedShapeIds } = useShapesStore();
  const { saveToHistory } = useCanvasHistory();
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const shapeCreatedRef = useRef(false);

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const isShapes = activeTool === 'shapes';

  const handleShapeMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (!isShapes) return;

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    // Check if we clicked on any existing shape (not just geometric shapes)
    const clickedNode = e.target;
    if (clickedNode !== e.currentTarget) {
      const shapeId = clickedNode.id();
      if (shapeId) {
        // Select any shape type
        setSelectedShapeIds([shapeId]);

        // Set tool options based on shape type
        const nodeType = clickedNode.getClassName();
        if (nodeType === 'Rect' || nodeType === 'Ellipse' || nodeType === 'Star' || nodeType === 'Line') {
          setToolOptions('shape', { selectedShapeId: shapeId });
        } else {
          // Clear shape-specific selection when selecting other shapes
          setToolOptions('shape', { selectedShapeId: null });
        }

        e.cancelBubble = true;
        return;
      }
    }

    // If clicking on empty space, deselect any selected shapes
    if (e.target === e.currentTarget) {
      setSelectedShapeIds([]);
      setToolOptions('shape', { selectedShapeId: null });
    }

    // Only create new shapes if clicking on empty canvas
    if (e.target !== e.currentTarget) return;

    let x = (pos.x - position.x) / scale;
    let y = (pos.y - position.y) / scale;

    const margin = shape.shapeSize / 2;
    x = clamp(x, margin, width - margin);
    y = clamp(y, margin, height - margin);

    // Create a base shape object with common properties
    const baseShape = {
      id: String(Date.now()),
      x,
      y,
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

    shapeCreatedRef.current = true;

    // For line, start drawing and store start point
    if (shape.shapeType === 'line') {
      setIsDrawing(true);
      lastPointRef.current = { x, y };
      const newShape = {
        ...baseShape,
        type: 'line' as const,
        x2: x,
        y2: y
      };
      setShapes((prev) => [...prev, newShape]);

      // Select the new shape
      setSelectedShapeIds([newShape.id]);
      setToolOptions('shape', { selectedShapeId: newShape.id });
      return;
    }

    // For star shapes, we'll use scaleX and scaleY for deformation
    if (shape.shapeType === 'star') {
      const newShape = {
        ...baseShape,
        type: 'star' as const,
        scaleX: 1,
        scaleY: 1
      };
      setShapes((prev) => [...prev, newShape]);

      // Select the new shape and save to history
      setSelectedShapeIds([newShape.id]);
      setToolOptions('shape', { selectedShapeId: newShape.id });
      saveToHistory('Create star');
      shapeCreatedRef.current = false;
      return;
    }

    // For circle shapes
    if (shape.shapeType === 'circle') {
      const newShape = {
        ...baseShape,
        type: 'circle' as const
      };
      setShapes((prev) => [...prev, newShape]);

      // Select the new shape and save to history
      setSelectedShapeIds([newShape.id]);
      setToolOptions('shape', { selectedShapeId: newShape.id });
      saveToHistory('Create circle');
      shapeCreatedRef.current = false;
      return;
    }

    // For other shapes
    const newShape = {
      ...baseShape,
      type: shape.shapeType
    };
    setShapes((prev) => [...prev, newShape]);

    // Select the new shape and save to history
    setSelectedShapeIds([newShape.id]);
    setToolOptions('shape', { selectedShapeId: newShape.id });
    saveToHistory(`Create ${shape.shapeType}`);
    shapeCreatedRef.current = false;
  };

  const handleShapeMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !isShapes || shape.shapeType !== 'line') return;
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    const x2 = (pos.x - position.x) / scale;
    const y2 = (pos.y - position.y) / scale;

    setShapes((prev) => {
      const shapesCopy = [...prev];
      const last = shapesCopy[shapesCopy.length - 1];
      if (last && last.type === 'line') {
        const width = Math.abs(x2 - last.x) * 2;
        const height = Math.abs(y2 - last.y) * 2;
        shapesCopy[shapesCopy.length - 1] = {
          ...last,
          x2,
          y2,
          width: Math.max(width, 1),
          height: Math.max(height, 1)
        };
      }
      return shapesCopy;
    });
  };

  const handleShapeMouseUp = () => {
    if (isShapes && shape.shapeType === 'line') {
      setIsDrawing(false);
      lastPointRef.current = null;

      // Save to history when line drawing is complete
      if (shapeCreatedRef.current) {
        shapeCreatedRef.current = false;
        saveToHistory('Create line');
      }
    }
  };

  return {
    handleShapeMouseDown,
    handleShapeMouseMove,
    handleShapeMouseUp
  };
};
