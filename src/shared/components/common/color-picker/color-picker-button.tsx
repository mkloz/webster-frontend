import { Check, Copy, Pipette } from 'lucide-react';
import { FC } from 'react';
import { HexColorInput } from 'react-colorful';

import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';

interface ColorPickerButtonProps {
  color: string;
  showCopyButton?: boolean;
  showEyeDropper?: boolean;
  onCopy: () => void;
  onEyeDropper: () => void;
  copied: boolean;
}

export const ColorPickerButton: FC<ColorPickerButtonProps> = ({
  color,
  showCopyButton = true,
  showEyeDropper = true,
  onCopy,
  onEyeDropper,
  copied
}) => {
  return (
    <>
      <Label htmlFor="hex-input">Hex</Label>
      <div className="flex items-center gap-2 justify-center">
        <div className="flex-1">
          <div className="flex">
            <HexColorInput
              id="hex-input"
              color={color}
              prefixed
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex gap-1">
          {showCopyButton && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={onCopy} className="h-9 w-9">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Copy hex code</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {showEyeDropper && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={onEyeDropper} className="h-9 w-9">
                    <Pipette className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Pick color from screen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </>
  );
};
