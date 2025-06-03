'use client';

import type { KonvaEventObject } from 'konva/lib/Node';
import type React from 'react';
import { useRef } from 'react';

import { useLeftSidebarStore } from '@/modules/home/hooks/use-left-sidebar-store';
import { useCanvasStore } from '@/shared/store/canvas-store';

import { useToolOptionsStore } from '../hooks/tool-optios-store';
import type { Shape } from './shapes-store';
import { useCanvasHistory } from './use-canvas-history';

interface UseDrawingLogicProps {
  position: { x: number; y: number };
  scale: number;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
}

export const useDrawingLogic = ({ position, scale, isDrawing, setIsDrawing, setShapes }: UseDrawingLogicProps) => {
  const { width, height } = useCanvasStore();
  const { activeTool } = useLeftSidebarStore();
  const { pen, eraser } = useToolOptionsStore();
  const { saveToHistory } = useCanvasHistory();
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const drawingStartedRef = useRef(false);
  const erasedObjectsRef = useRef<Set<string>>(new Set());

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const distance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  };

  const getFountainStrokeQuad = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    width: number,
    angleDeg: number
  ): number[] => {
    const angle = (angleDeg * Math.PI) / 180;
    const dx = (Math.cos(angle) * width) / 2;
    const dy = (Math.sin(angle) * width) / 2;

    return [p1.x - dx, p1.y - dy, p1.x + dx, p1.y + dy, p2.x + dx, p2.y + dy, p2.x - dx, p2.y - dy];
  };

  // Helper function to calculate distance from point to line segment
  const distanceToLineSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) {
      return Math.sqrt(A * A + B * B);
    }

    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));

    const xx = x1 + param * C;
    const yy = y1 + param * D;

    const dx = px - xx;
    const dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy);
  };

  // Check if eraser collides with any shapes based on geometric calculations
  const checkObjectEraserCollision = (eraserX: number, eraserY: number) => {
    if (eraser.eraserType !== 'object') return;

    const eraserRadius = eraser.eraserSize / 2;

    setShapes((prevShapes) => {
      const shapesToRemove: string[] = [];

      prevShapes.forEach((shape) => {
        // Skip if already erased in this drag session
        if (erasedObjectsRef.current.has(shape.id)) return;

        let shouldErase = false;

        switch (shape.type) {
          case 'rectangle': {
            const halfSize = shape.size / 2;
            const closestX = Math.max(shape.x - halfSize, Math.min(eraserX, shape.x + halfSize));
            const closestY = Math.max(shape.y - halfSize, Math.min(eraserY, shape.y + halfSize));
            const distanceToRect = Math.sqrt((eraserX - closestX) ** 2 + (eraserY - closestY) ** 2);
            shouldErase = distanceToRect <= eraserRadius;
            break;
          }

          case 'circle': {
            const shapeRadius = shape.size / 2;
            const distanceToCenter = Math.sqrt((eraserX - shape.x) ** 2 + (eraserY - shape.y) ** 2);
            shouldErase = distanceToCenter <= eraserRadius + shapeRadius;
            break;
          }

          case 'text': {
            const fontSize = shape.fontSize || 16;
            const textWidth = (shape.text?.length || 1) * fontSize * 0.6;
            const textHeight = fontSize;
            const halfWidth = textWidth / 2;
            const halfHeight = textHeight / 2;
            const closestX = Math.max(shape.x - halfWidth, Math.min(eraserX, shape.x + halfWidth));
            const closestY = Math.max(shape.y - halfHeight, Math.min(eraserY, shape.y + halfHeight));
            const distanceToText = Math.sqrt((eraserX - closestX) ** 2 + (eraserY - closestY) ** 2);
            shouldErase = distanceToText <= eraserRadius;
            break;
          }

          case 'image': {
            const imgWidth = shape.width || shape.size;
            const imgHeight = shape.height || shape.size;
            const halfWidth = imgWidth / 2;
            const halfHeight = imgHeight / 2;
            const closestX = Math.max(shape.x - halfWidth, Math.min(eraserX, shape.x + halfWidth));
            const closestY = Math.max(shape.y - halfHeight, Math.min(eraserY, shape.y + halfHeight));
            const distanceToImg = Math.sqrt((eraserX - closestX) ** 2 + (eraserY - closestY) ** 2);
            shouldErase = distanceToImg <= eraserRadius;
            break;
          }

          case 'line': {
            // For line shapes (drawn with pen/eraser), the points array contains the actual path
            if (shape.points && shape.points.length >= 2) {
              // EXTREMELY generous collision detection for testing
              const VERY_LARGE_THRESHOLD = 200; // 200 pixel radius!

              // Check collision with each line segment
              for (let i = 0; i < shape.points.length - 2; i += 2) {
                const x1 = shape.points[i];
                const y1 = shape.points[i + 1];
                const x2 = shape.points[i + 2];
                const y2 = shape.points[i + 3];

                // Skip if we don't have valid coordinates
                if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
                  continue;
                }

                const distToLine = distanceToLineSegment(eraserX, eraserY, x1, y1, x2, y2);

                if (distToLine <= VERY_LARGE_THRESHOLD) {
                  shouldErase = true;
                  break;
                }
              }

              // Also check individual points with huge threshold
              if (!shouldErase && shape.points.length >= 2) {
                for (let i = 0; i < shape.points.length; i += 2) {
                  const px = shape.points[i];
                  const py = shape.points[i + 1];

                  if (px !== undefined && py !== undefined) {
                    const distToPoint = Math.sqrt((eraserX - px) ** 2 + (eraserY - py) ** 2);

                    if (distToPoint <= VERY_LARGE_THRESHOLD) {
                      shouldErase = true;
                      break;
                    }
                  }
                }
              }
            }
            break;
          }

          case 'polygon': {
            // Handle fountain pen strokes (polygons)
            if (shape.points && shape.points.length >= 6) {
              // For polygons, check if eraser center is inside the polygon or close to edges
              // Simple approach: check distance to polygon center first
              const centerX = shape.x || 0;
              const centerY = shape.y || 0;
              const distanceToCenter = Math.sqrt((eraserX - centerX) ** 2 + (eraserY - centerY) ** 2);

              // Use a generous collision area for polygons
              const polygonRadius = Math.max(shape.size || 20, 20);
              shouldErase = distanceToCenter <= eraserRadius + polygonRadius;
            }
            break;
          }

          default: {
            // For all other shapes (star, triangle, hexagon, etc.)
            const shapeRadius = shape.size / 2;
            const distanceToCenter = Math.sqrt((eraserX - shape.x) ** 2 + (eraserY - shape.y) ** 2);
            shouldErase = distanceToCenter <= eraserRadius + shapeRadius;
            break;
          }
        }

        if (shouldErase) {
          shapesToRemove.push(shape.id);
          erasedObjectsRef.current.add(shape.id);
        }
      });

      if (shapesToRemove.length > 0) {
        return prevShapes.filter((shape) => !shapesToRemove.includes(shape.id));
      }

      return prevShapes;
    });
  };

  const handleDrawMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    const localX = (pos.x - position.x) / scale;
    const localY = (pos.y - position.y) / scale;

    // Check if within canvas bounds
    if (localX < 0 || localX > width || localY < 0 || localY > height) {
      return;
    }

    const isPen = activeTool === 'pen';
    const isEraser = activeTool === 'eraser';

    if (isEraser && eraser.eraserType === 'object') {
      setIsDrawing(true);
      drawingStartedRef.current = true;
      erasedObjectsRef.current.clear();

      // Check for collision on mouse down
      checkObjectEraserCollision(localX, localY);
      return;
    }

    if (!isPen && !isEraser) return;

    const size = isPen ? pen.penSize : eraser.eraserSize;
    const color = isPen ? pen.penColor : '#000';
    const opacity = 1;
    const margin = size / 2;

    const x = clamp(localX, margin, width - margin);
    const y = clamp(localY, margin, height - margin);

    setIsDrawing(true);
    drawingStartedRef.current = true;
    lastPointRef.current = { x, y };

    if (isPen || isEraser) {
      const hardnessRaw = isEraser ? (eraser.eraserHardness ?? 100) : 100;
      const hardnessNormalized = (hardnessRaw - 1) / 99;
      setShapes((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          type: 'line',
          points: [x, y],
          strokeWidth: size,
          strokeColor: color,
          penType: isPen ? pen.penType : undefined,
          opacity,
          x: 0,
          y: 0,
          size: 0,
          color: '',
          tool: isPen ? 'pen' : 'eraser',
          hardness: hardnessNormalized
        }
      ]);
    }
  };

  const handleDrawMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    const localX = (pos.x - position.x) / scale;
    const localY = (pos.y - position.y) / scale;

    // Check if within canvas bounds
    if (localX < 0 || localX > width || localY < 0 || localY > height) {
      return;
    }

    const isPen = activeTool === 'pen';
    const isEraser = activeTool === 'eraser';

    // Handle object eraser drag
    if (isEraser && eraser.eraserType === 'object') {
      checkObjectEraserCollision(localX, localY);
      return;
    }

    if (!isPen && !isEraser) return;

    const size = isPen ? pen.penSize : eraser.eraserSize;
    const color = isPen ? pen.penColor : '#000';
    const opacity = 1;
    const margin = size / 2;

    const x = clamp(localX, margin, width - margin);
    const y = clamp(localY, margin, height - margin);

    const dist = lastPointRef.current ? distance(lastPointRef.current, { x, y }) : 0;
    if (dist < 1) return;

    if (isPen && pen.penType === 'fountain') {
      const last = lastPointRef.current!;
      const quadPoints = getFountainStrokeQuad(last, { x, y }, size, 45);
      lastPointRef.current = { x, y };

      setShapes((prevShapes) => [
        ...prevShapes,
        {
          id: String(Date.now()),
          type: 'polygon',
          points: quadPoints,
          color,
          opacity,
          x: 0,
          y: 0,
          size: 0,
          tool: 'pen',
          penType: 'fountain'
        }
      ]);
    }

    if (isPen || isEraser) {
      lastPointRef.current = { x, y };
      setShapes((prevShapes) => {
        const shapesCopy = [...prevShapes];
        const lastShape = shapesCopy[shapesCopy.length - 1];
        if (lastShape && lastShape.type === 'line' && Array.isArray(lastShape.points)) {
          lastShape.points = [...lastShape.points, x, y];
          lastShape.opacity = opacity;
          if (isEraser) {
            const hardnessRaw = eraser.eraserHardness ?? 100;
            lastShape.hardness = (hardnessRaw - 1) / 99;
          }
        }
        return shapesCopy;
      });
    }
  };

  const handleDrawMouseUp = () => {
    if (activeTool === 'pen' || activeTool === 'eraser') {
      setIsDrawing(false);
      lastPointRef.current = null;

      if (drawingStartedRef.current) {
        drawingStartedRef.current = false;
        const toolName = activeTool === 'pen' ? 'Pen stroke' : 'Erase stroke';
        saveToHistory(toolName);

        if (activeTool === 'eraser' && eraser.eraserType === 'object') {
          erasedObjectsRef.current.clear();
        }
      }
    }
  };

  return {
    handleDrawMouseDown,
    handleDrawMouseMove,
    handleDrawMouseUp
  };
};
