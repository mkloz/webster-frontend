import { Rect } from 'react-konva';

interface SelectionBoxProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const SelectionBox = ({ x, y, width, height }: SelectionBoxProps) => {
  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="rgba(0, 122, 255, 0.1)"
      stroke="#007AFF"
      strokeWidth={1}
      dash={[5, 5]}
      listening={false}
    />
  );
};
