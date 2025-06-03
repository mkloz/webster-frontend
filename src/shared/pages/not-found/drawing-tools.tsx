import { Eraser, Pen, Trash2 } from 'lucide-react';
import { FC } from 'react';

import { Button } from '../../components/ui/button';

interface DrawingToolsProps {
  tool: 'pen' | 'eraser';
  setTool: (tool: 'pen' | 'eraser') => void;
  clearCanvas: () => void;
}

export const DrawingTools: FC<DrawingToolsProps> = ({ tool, setTool, clearCanvas }) => {
  return (
    <div className="bg-background/80 backdrop-blur-sm rounded-full border border-border/40 shadow-md p-1 flex items-center gap-1">
      <Button
        variant={tool === 'pen' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setTool('pen')}
        className="h-10 w-10 rounded-full">
        <Pen className="h-5 w-5" />
      </Button>
      <Button
        variant={tool === 'eraser' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setTool('eraser')}
        className="h-10 w-10 rounded-full">
        <Eraser className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={clearCanvas}
        className="h-10 w-10 rounded-full text-destructive hover:text-destructive">
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
};
