import type { KonvaEventObject } from 'konva/lib/Node';
import { useCallback, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { useCanvasStore } from '../../../shared/store/canvas-store';
import { useCanvasContext } from '../hooks/use-canvas-context';
import { usePanMode } from '../hooks/use-pan-mode';

interface StageZoomHookProps {
  position: { x: number; y: number };
  setPosition: (position: { x: number; y: number }) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const useStageZoom = ({ setPosition, containerRef, position }: StageZoomHookProps) => {
  const { width, height, scale, setScale, shouldResetScale } = useCanvasStore();
  const { stageRef } = useCanvasContext();
  const { isPanMode } = usePanMode();

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    if (!e.evt.ctrlKey && e.evt.button !== 1) {
      return;
    }

    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale
    };

    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const limitedScale = Math.max(0.1, Math.min(newScale, 5));

    const newPos = {
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale
    };

    setScale(limitedScale);
    setPosition(newPos);
  };

  const resetView = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    const scaleX = containerWidth / width;
    const scaleY = containerHeight / height;
    const newScale = Math.min(scaleX, scaleY) * 0.8;

    setScale(newScale);
    setPosition({
      x: (containerWidth - width * newScale) / 2,
      y: (containerHeight - height * newScale) / 2
    });
  }, [width, height, setScale]);

  useEffect(() => {
    resetView();
  }, [shouldResetScale, resetView]);
  useHotkeys('ctrl+0', resetView, [resetView]);

  const handleDragStart = () => {
    if (!isPanMode) return;
    document.body.style.cursor = 'grabbing';
  };

  const handleDragEnd = () => {
    document.body.style.cursor = 'default';
  };

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    if (!isPanMode) return;
    setPosition({
      x: e.target.x(),
      y: e.target.y()
    });
  };

  return {
    handleDragEnd,
    handleDragMove,
    handleDragStart,
    handleWheel
  };
};
