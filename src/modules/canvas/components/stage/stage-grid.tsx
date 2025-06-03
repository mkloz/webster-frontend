import { Line } from 'react-konva';

import { useCanvasStore } from '../../../../shared/store/canvas-store';

export const StageGrid = () => {
  const { width, height, showGrid, gridGap } = useCanvasStore();

  if (!showGrid) return null;

  const gridLines = [];

  // Vertical lines
  for (let i = 0; i <= Math.ceil(width / gridGap); i++) {
    gridLines.push(
      <Line
        key={`v-${i}`}
        points={[i * gridGap, 0, i * gridGap, height]}
        stroke="#FF0000"
        strokeWidth={0.5}
        opacity={0.4}
        listening={false}
      />
    );
  }

  // Horizontal lines
  for (let i = 0; i <= Math.ceil(height / gridGap); i++) {
    gridLines.push(
      <Line
        key={`h-${i}`}
        points={[0, i * gridGap, width, i * gridGap]}
        stroke="#FF0000"
        strokeWidth={0.5}
        opacity={0.4}
        listening={false}
      />
    );
  }

  return <>{gridLines}</>;
};
