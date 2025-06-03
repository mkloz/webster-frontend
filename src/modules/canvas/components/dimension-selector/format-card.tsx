import { Check } from 'lucide-react';

import { cn } from '../../../../shared/lib/utils';
import { getAspectRatio } from './utils';

export interface FormatOption {
  name: string;
  width: number;
  height: number;
  description?: string;
  icon: React.ReactNode;
}

interface FormatCardProps {
  format: FormatOption;
  isSelected: boolean;
  onClick: () => void;
}

export const FormatCard = ({ format, isSelected, onClick }: FormatCardProps) => {
  const aspectRatio = getAspectRatio(format.width, format.height);
  const isSelectedStyles = isSelected ? 'border-primary/40 bg-background' : 'border-border bg-background';

  // Max dimensions for the box
  const MAX_DIMENSION = 40;

  // Calculate scaled dimensions to fit inside 40x40 box
  const scale = Math.min(MAX_DIMENSION / format.width, MAX_DIMENSION / format.height);
  const scaledWidth = Math.round(format.width * scale);
  const scaledHeight = Math.round(format.height * scale);

  return (
    <div
      className={cn(
        'relative rounded-xl border p-3.5 cursor-pointer transition-all hover:shadow-md',
        isSelected
          ? 'border-primary/40 bg-primary/10 shadow-md'
          : 'border-border hover:border-primary/30 hover:bg-primary/5'
      )}
      onClick={onClick}>
      {isSelected && (
        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-primary">{format.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{format.name}</h3>
          <p className="text-xs text-muted-foreground">{aspectRatio}</p>
        </div>
      </div>

      <div
        className={cn(
          'relative flex items-center justify-center w-full rounded-lg p-2 mb-2',
          isSelected ? 'bg-primary/20' : 'bg-muted'
        )}>
        <div
          className={cn('relative border', isSelectedStyles)}
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`
          }}
        />

        <div className="ml-3 text-xs font-medium">
          <span className="text-foreground">{format.width}</span>
          <span className="text-muted-foreground mx-1">×</span>
          <span className="text-foreground">{format.height}</span>
          <span className="text-muted-foreground ml-0.5">px</span>
        </div>
      </div>

      {format.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">{format.description}</p>}
    </div>
  );
};
