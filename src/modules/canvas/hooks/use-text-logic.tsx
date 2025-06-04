'use client';

import type { KonvaEventObject } from 'konva/lib/Node';
import type React from 'react';
import { useCallback } from 'react';

import { useCanvasStore } from '@/shared/store/canvas-store';

import type { Shape } from './shapes-store';
import { useShapesStore } from './shapes-store';
import { useToolOptionsStore } from './tool-optios-store';
import { useCanvasHistory } from './use-canvas-history';

interface TextLogicProps {
  position: { x: number; y: number };
  scale: number;
  isDrawing: boolean;
  setIsDrawing: (isDrawing: boolean) => void;
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
}

export const useTextLogic = ({ position, scale, isDrawing, setIsDrawing, setShapes }: TextLogicProps) => {
  const { width, height } = useCanvasStore();
  const { text: textOptions, setToolOptions } = useToolOptionsStore();
  const { selectedShapeIds, setSelectedShapeIds } = useShapesStore();
  const { saveToHistory } = useCanvasHistory();

  const getRelativePosition = useCallback(
    (pos: { x: number; y: number }) => {
      return {
        x: (pos.x - position.x) / scale,
        y: (pos.y - position.y) / scale
      };
    },
    [position, scale]
  );

  const handleTextMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;

      // Check if we clicked on any shape element (not just text)
      const clickedNode = e.target;
      if (clickedNode !== e.currentTarget) {
        const shapeId = clickedNode.id();
        if (shapeId) {
          // Select any shape type
          setSelectedShapeIds([shapeId]);
          e.cancelBubble = true;
          return;
        }
      }
    },
    [
      isDrawing,
      getRelativePosition,
      width,
      height,
      textOptions,
      setShapes,
      setIsDrawing,
      setSelectedShapeIds,
      setToolOptions,
      saveToHistory
    ]
  );

  const handleTextMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, [setIsDrawing]);

  const handleTextDblClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const textId = e.target.id();

      if (!textId) return;

      // Prevent event bubbling
      e.cancelBubble = true;

      // Select the text element if not already selected
      if (!selectedShapeIds.includes(textId)) {
        setSelectedShapeIds([textId]);
        setToolOptions('text', { selectedTextId: textId });
      }
    },
    [selectedShapeIds, setSelectedShapeIds, setToolOptions]
  );

  return {
    handleTextMouseDown,
    handleTextMouseUp,
    handleTextDblClick
  };
};
