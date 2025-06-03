import { FC } from 'react';

import { Label } from '@/shared/components/ui/label';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';

interface ColorPresetsProps {
  presets: string[];
  currentColor: string;
  onSelectColor: (color: string) => void;
}

export const ColorPresets: FC<ColorPresetsProps> = ({ presets, currentColor, onSelectColor }) => {
  return (
    <div className="space-y-4">
      <Label className="text-xs">Color Presets</Label>
      <ScrollArea className="h-62">
        <div className="grid grid-cols-6 gap-1.5 p-1">
          {presets.map((presetColor) => (
            <TooltipProvider key={presetColor}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      'h-7 w-7 rounded-md border border-input',
                      currentColor === presetColor && 'ring-2 ring-ring'
                    )}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => onSelectColor(presetColor)}
                    aria-label={presetColor}
                  />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{presetColor}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
