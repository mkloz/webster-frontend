'use client';

import type { Shape } from '../../hooks/shapes-store';
import { ShapeRenderer } from './shape-renderer';

interface ShapeLayerProps {
  shapes: Shape[];
  selectedId: string | null;
  penSmoothingValue: number;
  onShapeSelect?: (id: string) => void;
}

export const ShapeLayer = ({ shapes, penSmoothingValue, onShapeSelect }: ShapeLayerProps) => {
  return (
    <>
      {shapes.map((shape) => (
        <ShapeRenderer
          key={shape.id}
          shape={shape}
          penSmoothingValue={penSmoothingValue}
          isSelected={false}
          onSelect={onShapeSelect}
        />
      ))}
    </>
  );
};
