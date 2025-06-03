'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';

import { cn } from '../../lib/utils';

type DisplayFormat =
  | { type: 'numeric'; unit?: string }
  | { type: 'percentage'; showSymbol?: boolean }
  | { type: 'size'; labels: string[] }
  | { type: 'custom'; formatter: (value: number, max: number) => string };

interface EnhancedSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  displayFormat?: DisplayFormat;
  labels?: {
    min?: string;
    mid?: string;
    max?: string;
  };
  showValueDisplay?: boolean;
}

export const EnhancedSlider: React.FC<EnhancedSliderProps> = ({
  defaultValue,
  value,
  min = 0,
  max = 100,
  step = 1,
  displayFormat = { type: 'numeric' },
  labels,
  showValueDisplay = true,
  className,
  disabled,
  onValueChange,
  ...props
}) => {
  const [internalValue, setInternalValue] = React.useState<number[]>(defaultValue || [0]);
  const thumbRef = React.useRef<HTMLSpanElement>(null);
  const [isWideThumb, setIsWideThumb] = React.useState(false);

  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = React.useCallback(
    (newValue: number[]) => {
      setInternalValue(newValue);
      if (onValueChange) {
        onValueChange(newValue);
      }
    },
    [onValueChange]
  );

  // Helper function to format numbers with proper precision
  const formatNumber = React.useCallback((num: number): string => {
    // If it's a whole number, return as integer
    if (Number.isInteger(num)) {
      return num.toString();
    }

    // For decimals, limit to 2 decimal places and remove trailing zeros
    return Number.parseFloat(num.toFixed(num < 1 ? 2 : 0)).toString();
  }, []);

  const displayValue = React.useMemo(() => {
    const currentVal = currentValue[0];

    switch (displayFormat.type) {
      case 'percentage': {
        const percentValue = Math.round((currentVal / max) * 100);
        return displayFormat.showSymbol ? `${percentValue}%` : `${percentValue}`;
      }

      case 'size': {
        const normalizedValue = currentVal / max;
        const sizeIndex = Math.floor(normalizedValue * displayFormat.labels.length);
        const adjustedIndex = Math.min(sizeIndex, displayFormat.labels.length - 1);
        return displayFormat.labels[adjustedIndex];
      }

      case 'custom':
        return displayFormat.formatter(currentVal, max);

      case 'numeric':
      default: {
        const formattedValue = formatNumber(currentVal);
        return `${formattedValue}${displayFormat.unit || ''}`;
      }
    }
  }, [currentValue, max, displayFormat, formatNumber]);

  // Check if the text fits in a circle and adjust thumb shape
  React.useEffect(() => {
    if (!thumbRef.current || !showValueDisplay) return;

    const textElement = thumbRef.current.querySelector('[data-value-text]') as HTMLElement;
    if (!textElement) return;

    // Create a temporary element to measure text width
    const tempElement = document.createElement('span');
    tempElement.style.visibility = 'hidden';
    tempElement.style.position = 'absolute';
    tempElement.style.fontSize = '10px'; // text-2xs
    tempElement.style.fontWeight = '600'; // font-semibold
    tempElement.textContent = displayValue;
    document.body.appendChild(tempElement);

    const textWidth = tempElement.offsetWidth;
    document.body.removeChild(tempElement);

    // Circle diameter is 24px (h-6 w-6), so usable width is ~20px
    const circleUsableWidth = 20;
    const needsWideThumb = textWidth > circleUsableWidth;

    setIsWideThumb(needsWideThumb);
  }, [displayValue, showValueDisplay]);

  return (
    <div className={cn('relative w-full', className)} data-testid="enhanced-slider">
      <div className="relative py-2">
        <SliderPrimitive.Root
          defaultValue={defaultValue}
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onValueChange={handleValueChange}
          className={cn(
            'relative flex w-full touch-none select-none items-center',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          {...props}>
          <SliderPrimitive.Track className="bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2">
            <SliderPrimitive.Range className="absolute h-full bg-primary" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            ref={thumbRef}
            className={cn(
              'block border-2 border-primary bg-background shadow-sm ring-ring/50 transition-[color,box-shadow,width] hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50',
              // Dynamic sizing based on content
              isWideThumb
                ? 'h-6 min-w-10 px-1 rounded-full' // Wide thumb for long text
                : 'h-6 w-6 rounded-full' // Circle thumb for short text
            )}>
            {showValueDisplay && (
              <div
                className="absolute inset-0 flex items-center justify-center text-2xs font-semibold whitespace-nowrap"
                data-value-text>
                {displayValue}
              </div>
            )}
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
      </div>

      {labels && (
        <div className="flex justify-between text-xs text-muted-foreground mt-1" aria-hidden="true">
          {labels.min && <span>{labels.min}</span>}
          {labels.mid && <span className="absolute left-1/2 -translate-x-1/2">{labels.mid}</span>}
          {labels.max && <span>{labels.max}</span>}
        </div>
      )}
    </div>
  );
};
