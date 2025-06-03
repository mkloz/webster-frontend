import { useRef, useState } from 'react';

import { ColorPicker } from './color-picker';
import { DrawingCanvas, LineData } from './drawing-canvas';
import { DrawingTools } from './drawing-tools';
import { FloatingElements } from './floating-elements';
import { NavigationButtons } from './navigation-buttons';
import { SizePicker } from './size-picker';

const DEFAULT_PEN_SIZE = 20;

export const NotFound = () => {
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#8B5CF6');
  const [lines, setLines] = useState<LineData[]>([]);
  const [currentLine, setCurrentLine] = useState<LineData | null>(null);
  const isDrawing = useRef(false);
  const [size, setSize] = useState(DEFAULT_PEN_SIZE);

  const clearCanvas = () => {
    setLines([]);
  };

  return (
    <div className="relative w-full h-screen-no-header overflow-hidden bg-background">
      <FloatingElements />
      <div className="absolute top-6 left-6 z-20 flex gap-2">
        <SizePicker size={size} setSize={setSize} />
      </div>
      <DrawingCanvas
        tool={tool}
        color={color}
        size={size}
        lines={lines}
        setLines={setLines}
        currentLine={currentLine}
        setCurrentLine={setCurrentLine}
        isDrawing={isDrawing}
      />

      <div className="absolute top-6 right-6 z-20 flex gap-2">
        <DrawingTools tool={tool} setTool={setTool} clearCanvas={clearCanvas} />
        <ColorPicker color={color} setColor={setColor} />
      </div>

      <NavigationButtons />
    </div>
  );
};
