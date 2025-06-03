import { Rect } from 'react-konva';

import { useCanvasStore } from '@/shared/store/canvas-store';

export const CanvasBackground = () => {
  const { width, height, background, opacity } = useCanvasStore();

  return <Rect x={0} y={0} width={width} height={height} fill={background} opacity={opacity} listening={false} />;
};
