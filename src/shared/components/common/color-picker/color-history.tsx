import { Clock } from 'lucide-react';
import { FC } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';

interface ColorHistoryProps {
  history: string[];
  currentColor: string;
  onSelectColor: (color: string) => void;
  onClearHistory: () => void;
}

export const ColorHistory: FC<ColorHistoryProps> = ({ history, currentColor, onSelectColor, onClearHistory }) => {
  return (
    <div className="space-y-4">
      <Label className="text-xs">Recently Used</Label>
      {history.length > 0 ? (
        <ScrollArea className="h-48 ">
          <div className="grid grid-cols-6 gap-1.5 p-1">
            {history.map((historyColor, index) => (
              <TooltipProvider key={`${historyColor}-${index}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        'h-7 w-7 rounded-md border border-input',
                        currentColor === historyColor && 'ring-2 ring-ring'
                      )}
                      style={{ backgroundColor: historyColor }}
                      onClick={() => onSelectColor(historyColor)}
                      aria-label={historyColor}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{historyColor}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex items-center justify-center h-62 rounded-md p-2 text-sm text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <Clock className="h-8 w-8" />
            <span>No color history yet</span>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <Button variant="outline" size="sm" className="w-full" onClick={onClearHistory}>
          Clear History
        </Button>
      )}
    </div>
  );
};
