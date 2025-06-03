'use client';

import type Konva from 'konva';
import type React from 'react';
import { Layer, Transformer } from 'react-konva';

import { useTransformer } from '../../hooks/use-transformer';
import { SelectionBox } from './selection-box';

interface SelectionLayerProps {
  selectedShapeIds: string[];
  stageRef: React.RefObject<Konva.Stage>;
  selectionBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

export const SelectionLayer = ({ selectedShapeIds, stageRef, selectionBox }: SelectionLayerProps) => {
  const { transformerRef, handleTransformEnd, handleDragEnd } = useTransformer({
    selectedShapeIds,
    stageRef
  });

  return (
    <Layer>
      {/* Marquee selection box */}
      {selectionBox && (
        <SelectionBox x={selectionBox.x} y={selectionBox.y} width={selectionBox.width} height={selectionBox.height} />
      )}

      {/* Transformer for selected shapes */}
      <Transformer
        ref={transformerRef}
        onTransformEnd={handleTransformEnd}
        onDragEnd={handleDragEnd}
        keepRatio={false} // Allow non-uniform scaling
        boundBoxFunc={(oldBox, newBox) => {
          // Prevent shapes from being scaled too small
          if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
            return oldBox;
          }
          return newBox;
        }}
        enabledAnchors={[
          'top-left',
          'top-center',
          'top-right',
          'middle-right',
          'bottom-right',
          'bottom-center',
          'bottom-left',
          'middle-left'
        ]}
        rotateAnchorOffset={20}
        borderStroke="#007AFF"
        borderStrokeWidth={1}
        anchorStroke="#007AFF"
        anchorFill="#FFFFFF"
        anchorSize={8}
        anchorCornerRadius={2}
        // Special handling for text elements
        shouldOverdrawWholeArea={true}
        padding={10}
      />
    </Layer>
  );
};
