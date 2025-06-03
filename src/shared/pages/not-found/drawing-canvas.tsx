import type Konva from 'konva';
import type React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import { Layer, Line, Stage, Text } from 'react-konva';

import { useColorScheme } from '../../store/color-scheme.store';
import { useTheme } from '../../store/theme.store';
import { ConverterUtils } from '../../utils/converter.utils';

export interface LineData {
  tool: 'pen' | 'eraser';
  points: number[];
  color: string;
  size: number;
}

interface DrawingCanvasProps {
  tool: 'pen' | 'eraser';
  color: string;
  size: number;
  lines: LineData[];
  setLines: React.Dispatch<React.SetStateAction<LineData[]>>;
  currentLine: LineData | null;
  setCurrentLine: React.Dispatch<React.SetStateAction<LineData | null>>;
  isDrawing: React.MutableRefObject<boolean>;
}

export const DrawingCanvas: FC<DrawingCanvasProps> = ({
  tool,
  color,
  size,
  lines,
  setLines,
  currentLine,
  setCurrentLine,
  isDrawing
}) => {
  const { colorScheme } = useColorScheme();
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const stageRef = useRef<Konva.Stage>(null);
  const { isLight, theme } = useTheme();
  const [textColors, setTextColors] = useState({
    stroke: isLight ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'
  });
  const abortController = new AbortController();

  useEffect(() => {
    const updateSize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight - ConverterUtils.remToPx(ConverterUtils.getCssVariable('--header-height'))
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize, {
      signal: abortController.signal
    });

    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    setTextColors({
      stroke: ConverterUtils.getCssVariable('--primary')
    });
  }, [colorScheme, theme]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition() || { x: 0, y: 0 };

    setCurrentLine({
      tool,
      points: [pos.x, pos.y],
      color: tool === 'eraser' ? '#FFFFFF' : color,
      size: tool === 'eraser' ? size * 2 : size
    });
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current || !currentLine) return;

    const pos = e.target.getStage()?.getPointerPosition() || { x: 0, y: 0 };
    const newPoints = [...currentLine.points, pos.x, pos.y];

    setCurrentLine({
      ...currentLine,
      points: newPoints
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (currentLine) {
      setLines([...lines, currentLine]);
      setCurrentLine(null);
    }
  };

  const gridLines = () => {
    const gridSize = 30;
    const gridLines: JSX.Element[] = [];

    for (let x = 0; x < stageSize.width; x += gridSize) {
      gridLines.push(
        <Line key={`v-${x}`} points={[x, 0, x, stageSize.height]} stroke="rgba(200, 200, 200, 0.1)" strokeWidth={1} />
      );
    }

    for (let y = 0; y < stageSize.height; y += gridSize) {
      gridLines.push(
        <Line key={`h-${y}`} points={[0, y, stageSize.width, y]} stroke="rgba(200, 200, 200, 0.1)" strokeWidth={1} />
      );
    }

    return gridLines;
  };

  return (
    <Stage
      ref={stageRef}
      width={stageSize.width}
      height={stageSize.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="absolute inset-0 z-10">
      <Layer>
        {gridLines()}
        <Text
          text="404"
          fontSize={240}
          fontStyle="bold"
          fill="transparent"
          stroke={textColors.stroke}
          strokeWidth={8}
          x={stageSize.width / 2}
          y={stageSize.height / 2}
          align="center"
          verticalAlign="middle"
          offsetX={180}
          offsetY={140}
        />
        <Text
          text={`The page you're looking for doesn't exist or has been moved.
           Feel free to draw something here!`}
          fontSize={24}
          fill="rgba(100, 100, 100, 0.8)"
          x={stageSize.width / 2}
          y={stageSize.height / 2 + 100}
          align="center"
          verticalAlign="middle"
          offsetX={300}
          offsetY={12}
        />
      </Layer>

      <Layer>
        {lines.map((line, i) => (
          <Line
            key={i}
            points={line.points}
            stroke={line.color}
            strokeWidth={line.size}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
          />
        ))}

        {currentLine && (
          <Line
            points={currentLine.points}
            stroke={currentLine.color}
            strokeWidth={currentLine.size}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation={currentLine.tool === 'eraser' ? 'destination-out' : 'source-over'}
          />
        )}
      </Layer>
    </Stage>
  );
};
