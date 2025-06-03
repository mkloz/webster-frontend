import { Image } from 'lucide-react';
import type React from 'react';
import { FC } from 'react';

import { cn } from '@/shared/lib/utils';

interface ImagePlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  patternDensity?: 'low' | 'medium' | 'high';
}

export const ImagePlaceholder: FC<ImagePlaceholderProps> = ({ className, patternDensity = 'medium', ...props }) => {
  // Map density to actual values
  const densityMap = {
    low: 30,
    medium: 20,
    high: 12
  };

  const density = densityMap[patternDensity];

  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden rounded-md bg-muted flex items-center justify-center',
        className
      )}
      style={{
        backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent ${2}px)`,
        backgroundSize: `${density}px ${density}px`,
        backgroundPosition: '0 0'
      }}
      {...props}>
      {/* Corner brackets */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left corner */}
        <div className="absolute top-0 left-0 m-3 w-[15%] h-[15%] border-t-3 border-l-3" />

        {/* Top-right corner */}
        <div className="absolute top-0 right-0 m-3 w-[15%] h-[15%] border-t-3 border-r-3" />

        {/* Bottom-left corner */}
        <div className="absolute bottom-0 left-0 m-3 w-[15%] h-[15%] border-b-3 border-l-3" />

        {/* Bottom-right corner */}
        <div className="absolute bottom-0 right-0 m-3 w-[15%] h-[15%] border-b-3 border-r-3" />
      </div>

      {/* Center icon with backdrop */}
      <div className="relative flex items-center justify-center size-1/4 min-w-8 min-h-8 max-w-16 max-h-16 bg-background/50 rounded-full backdrop-blur-[2px]">
        <Image className="text-border" />
      </div>
    </div>
  );
};
