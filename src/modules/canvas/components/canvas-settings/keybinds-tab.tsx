import { Command, Eraser, ImageIcon, MousePointer, PenTool, Square, Type } from 'lucide-react';
import type React from 'react';
import { FaCrosshairs } from 'react-icons/fa6';

import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';

const TOOL_KEYBINDS = [
  { tool: 'Select', key: 'V', icon: <MousePointer className="h-4 w-4" /> },
  { tool: 'Laser Pointer', key: 'L', icon: <FaCrosshairs className="h-4 w-4" /> },
  { tool: 'Pen', key: 'P', icon: <PenTool className="h-4 w-4" /> },
  { tool: 'Eraser', key: 'E', icon: <Eraser className="h-4 w-4" /> },
  { tool: 'Shapes', key: 'S', icon: <Square className="h-4 w-4" /> },
  { tool: 'Text', key: 'T', icon: <Type className="h-4 w-4" /> },
  { tool: 'Image', key: 'I', icon: <ImageIcon className="h-4 w-4" /> }
];

const CANVAS_KEYBINDS = [
  { action: 'Reset Zoom', key: 'Ctrl + 0', description: 'Reset canvas zoom to fit' },
  { action: 'Pan Mode', key: 'Space', description: 'Hold to pan around canvas' },
  { action: 'Zoom In/Out', key: 'Ctrl + Scroll', description: 'Zoom in or out on canvas' }
];

const SELECTION_KEYBINDS = [
  { action: 'Delete Selected', key: 'Delete', description: 'Delete selected objects' },
  { action: 'Select All', key: 'Ctrl + A', description: 'Select all objects on canvas' },
  { action: 'Deselect & Select Tool', key: 'Escape', description: 'Clear selection and switch to select tool' },
  { action: 'Multi-Select', key: 'Shift + Click', description: 'Add/remove from selection' }
];

interface KeybindItemProps {
  action: string;
  keys: string | string[];
  description?: string;
  icon?: React.ReactNode;
}

const KeybindItem = ({ action, keys, description, icon }: KeybindItemProps) => {
  const keyArray = Array.isArray(keys) ? keys : [keys];

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div>
          <div className="text-sm font-medium text-foreground">{action}</div>
          {description && <div className="text-xs text-muted-foreground">{description}</div>}
        </div>
      </div>
      <div className="flex gap-1">
        {keyArray.map((key, index) => (
          <Badge key={index} variant="outline" className="font-mono text-xs">
            {key}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export const KeybindsTab = () => {
  return (
    <div className="space-y-4">
      {/* Tools */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Tools</h3>
        <div className="space-y-1">
          {TOOL_KEYBINDS.map((item) => (
            <KeybindItem key={item.tool} action={item.tool} keys={item.key} icon={item.icon} />
          ))}
        </div>
      </div>

      <Separator />

      {/* Canvas Navigation */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Canvas Navigation</h3>
        <div className="space-y-1">
          {CANVAS_KEYBINDS.map((item) => (
            <KeybindItem key={item.action} action={item.action} keys={item.key} description={item.description} />
          ))}
        </div>
      </div>

      <Separator />

      {/* Selection & Editing */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Selection & Editing</h3>
        <div className="space-y-1">
          {SELECTION_KEYBINDS.map((item) => (
            <KeybindItem key={item.action} action={item.action} keys={item.key} description={item.description} />
          ))}
        </div>
      </div>

      <Separator />

      {/* Tips */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          <Command className="h-4 w-4" />
          Tips
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Use keyboard shortcuts for faster workflow</li>
          <li>• Hold Shift while selecting to add multiple objects</li>
          <li>• Use Space + drag to pan around large canvases</li>
          <li>• Press Escape to quickly switch to select tool</li>
        </ul>
      </div>
    </div>
  );
};
