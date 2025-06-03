import { Rect } from 'react-konva';

import { useCanvasStore } from '@/shared/store/canvas-store';

export const CanvasBoundary = () => {
  const { width, height } = useCanvasStore();

  return (
    <Rect
      x={0}
      y={0}
      width={width}
      height={height}
      stroke="#000000"
      strokeWidth={2}
      fill="transparent"
      listening={false}
      perfectDrawEnabled={false}
      shadowForStrokeEnabled={false}
    />
  );
};
