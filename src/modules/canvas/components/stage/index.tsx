'use client';

import type { KonvaEventObject } from 'konva/lib/Node';
import { useEffect, useRef, useState } from 'react';
import { Layer, Stage } from 'react-konva';

import { useLeftSidebarStore } from '@/modules/home/hooks/use-left-sidebar-store';

import { useCanvasStore } from '../../../../shared/store/canvas-store';
import { useProjectPersistence } from '../../../project/hooks/use-project-persistence';
import { useShapesStore } from '../../hooks/shapes-store';
import { useToolOptionsStore } from '../../hooks/tool-optios-store';
import { useCanvasContext } from '../../hooks/use-canvas-context';
import { useCanvasHistory } from '../../hooks/use-canvas-history';
import { useDrawingLogic } from '../../hooks/use-drawing-logic';
import { useGlobalKeybinds } from '../../hooks/use-global-keybinds';
import { useImageLogic } from '../../hooks/use-image-logic';
import { usePanMode } from '../../hooks/use-pan-mode';
import { useSelectionLogic } from '../../hooks/use-selection-logic';
import { useShapeLogic } from '../../hooks/use-shape-logic';
import { useStageContainerResize } from '../../hooks/use-stage-resize';
import { useStageZoom } from '../../hooks/use-stage-zoom';
import { useTextLogic } from '../../hooks/use-text-logic';
import { CanvasBackground } from './canvas-background';
import { CanvasBoundary } from './canvas-boundary';
import { CanvasClipper } from './canvas-clipper';
import { SelectionLayer } from './selection-layer';
import { ShapeLayer } from './shape-layer';
import { StageGrid } from './stage-grid';

export const CanvasStage = () => {
  const { scale, width: canvasWidth, height: canvasHeight } = useCanvasStore();
  const { activeTool } = useLeftSidebarStore();
  const { pen } = useToolOptionsStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const { shapes, setShapes } = useShapesStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { stageRef } = useCanvasContext();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const { isPanMode } = usePanMode();
  const { setStageRef } = useProjectPersistence();

  // Set stage reference for project persistence
  useEffect(() => {
    if (stageRef.current) {
      setStageRef(stageRef.current);
    }
  }, [stageRef, setStageRef]);

  // Initialize global keybinds and history
  useGlobalKeybinds();
  useCanvasHistory();

  const { handleDragStart, handleDragEnd, handleDragMove, handleWheel } = useStageZoom({
    setPosition,
    containerRef,
    position
  });

  useStageContainerResize({
    setPosition,
    setStageSize,
    containerRef
  });

  const drawingLogic = useDrawingLogic({
    position,
    scale,
    isDrawing,
    setIsDrawing,
    setShapes
  });

  const shapeLogic = useShapeLogic({
    position,
    scale,
    isDrawing,
    setIsDrawing,
    setShapes
  });

  const selectionLogic = useSelectionLogic({
    position,
    scale
  });

  const textLogic = useTextLogic({
    position,
    scale,
    isDrawing,
    setIsDrawing,
    setShapes
  });

  const imageLogic = useImageLogic({
    position,
    scale,
    setShapes
  });

  // Set up event listeners for image tool
  useEffect(() => {
    const handleImageUpload = (event: CustomEvent) => {
      const { files } = event.detail;
      imageLogic.handleImageUpload(files);
    };

    const handleImageUrlImport = (event: CustomEvent) => {
      const { url } = event.detail;
      imageLogic.handleImageUrlImport(url);
    };

    const handleImageOpacityChange = (event: CustomEvent) => {
      const { opacity } = event.detail;
      imageLogic.handleOpacityChange(opacity);
    };

    const handleImageFlip = (event: CustomEvent) => {
      const { axis } = event.detail;
      imageLogic.handleFlipImage(axis);
    };

    const handleImageCropToggle = () => {
      imageLogic.handleToggleCrop();
    };

    window.addEventListener('imageUpload', handleImageUpload as EventListener);
    window.addEventListener('imageUrlImport', handleImageUrlImport as EventListener);
    window.addEventListener('imageOpacityChange', handleImageOpacityChange as EventListener);
    window.addEventListener('imageFlip', handleImageFlip as EventListener);
    window.addEventListener('imageCropToggle', handleImageCropToggle as EventListener);

    return () => {
      window.removeEventListener('imageUpload', handleImageUpload as EventListener);
      window.removeEventListener('imageUrlImport', handleImageUrlImport as EventListener);
      window.removeEventListener('imageOpacityChange', handleImageOpacityChange as EventListener);
      window.removeEventListener('imageFlip', handleImageFlip as EventListener);
      window.removeEventListener('imageCropToggle', handleImageCropToggle as EventListener);
      imageLogic.cleanup();
    };
  }, [imageLogic]);

  const isShapes = activeTool === 'shapes';
  const isSelect = activeTool === 'select';
  const isText = activeTool === 'text';
  const isImage = activeTool === 'image';

  // Check if a point is within canvas bounds
  const isWithinCanvasBounds = (clientX: number, clientY: number) => {
    const canvasX = (clientX - position.x) / scale;
    const canvasY = (clientY - position.y) / scale;
    return canvasX >= 0 && canvasX <= canvasWidth && canvasY >= 0 && canvasY <= canvasHeight;
  };

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos || !isWithinCanvasBounds(pos.x, pos.y)) {
      return; // Ignore clicks outside canvas bounds
    }

    if (isSelect) {
      // Let selection logic handle clicks
      return;
    }

    if (e.target === e.currentTarget) {
      // Clear any selections when clicking on empty space
      selectionLogic.clearSelection();
    }
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos || !isWithinCanvasBounds(pos.x, pos.y)) {
      return; // Ignore interactions outside canvas bounds
    }

    if (isSelect) {
      selectionLogic.handleSelectionMouseDown(e);
    } else if (isText) {
      textLogic.handleTextMouseDown(e);
    } else if (isShapes) {
      shapeLogic.handleShapeMouseDown(e);
    } else if (isImage) {
      imageLogic.handleImageMouseDown(e);
    } else {
      drawingLogic.handleDrawMouseDown(e);
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (isSelect) {
      selectionLogic.handleSelectionMouseMove(e);
    } else if (isShapes) {
      shapeLogic.handleShapeMouseMove(e);
    } else {
      drawingLogic.handleDrawMouseMove(e);
    }
  };

  const handleMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (isSelect) {
      selectionLogic.handleSelectionMouseUp(e);
    } else if (isShapes) {
      shapeLogic.handleShapeMouseUp();
    } else if (isText) {
      textLogic.handleTextMouseUp();
    } else {
      drawingLogic.handleDrawMouseUp();
    }
  };

  const handleDblClick = (e: KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos || !isWithinCanvasBounds(pos.x, pos.y)) {
      return; // Ignore double clicks outside canvas bounds
    }

    if (e.target.getClassName() === 'Text') {
      textLogic.handleTextDblClick(e);
    }
  };

  if (stageSize.width <= 0 || stageSize.height <= 0) {
    return (
      <div
        ref={containerRef}
        className="relative flex flex-col items-center justify-center w-full h-full overflow-hidden">
        <div className="text-muted-foreground">Loading canvas...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center w-full h-full overflow-hidden bg-muted/30"
      style={{ cursor: isPanMode ? 'grab' : isImage && imageLogic.pendingImage ? 'copy' : 'default' }}>
      <div className="absolute inset-0 overflow-hidden">
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onWheel={handleWheel}
          draggable={isPanMode}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragMove={handleDragMove}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDblClick={handleDblClick}
          x={position.x}
          y={position.y}
          scale={{ x: scale, y: scale }}
          onClick={handleStageClick}
          className="canvas-stage">
          {/* Background Layer */}
          <Layer>
            <CanvasBackground />
            <StageGrid />
            <CanvasBoundary />
          </Layer>

          {/* Content Layer with Clipping */}
          <Layer>
            <CanvasClipper>
              {shapes.map((shape) => (
                <ShapeLayer
                  key={shape.id}
                  shapes={[shape]}
                  selectedId={null}
                  penSmoothingValue={pen.smoothing}
                  onShapeSelect={selectionLogic.handleShapeSelect}
                />
              ))}
            </CanvasClipper>
          </Layer>

          {/* Selection Layer (should be above clipped content) */}
          <SelectionLayer
            selectedShapeIds={selectionLogic.selectedShapeIds}
            stageRef={stageRef}
            selectionBox={selectionLogic.selectionBox}
          />
        </Stage>
      </div>

      {isPanMode && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-md px-3 py-1 text-xs text-muted-foreground">
          Pan Mode (Space)
        </div>
      )}

      {isImage && imageLogic.pendingImage && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-md px-3 py-1 text-xs text-muted-foreground">
          Click on canvas to place image
        </div>
      )}
    </div>
  );
};
