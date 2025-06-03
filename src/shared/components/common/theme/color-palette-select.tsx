import { Palette } from 'lucide-react';

import { cn } from '../../../lib/utils';
import { ColorScheme, useColorScheme } from '../../../store/color-scheme.store';
import { Button } from '../../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';

interface SchemeOption {
  value: ColorScheme;
  label: string;
  colors: string[];
}

export const SCHEME_OPTIONS: SchemeOption[] = [
  {
    value: ColorScheme.SUNSET,
    label: 'Sunset',
    colors: ['#f97316', '#ef4444']
  },
  {
    value: ColorScheme.OCEAN,
    label: 'Ocean',
    colors: ['#3b82f6', '#06b6d4']
  },
  {
    value: ColorScheme.FOREST,
    label: 'Forest',
    colors: ['#16a34a', '#10b981']
  },
  {
    value: ColorScheme.MONOCHROME,
    label: 'Monochrome',
    colors: ['#475569', '#94a3b8']
  },
  {
    value: ColorScheme.VIOLET,
    label: 'Violet',
    colors: ['#8b5cf6', '#f472b6']
  },
  {
    value: ColorScheme.PURPLE,
    label: 'Purple',
    colors: ['#a855f7', '#6366f1']
  }
];

export const ColorSchemeSelect = () => {
  const { colorScheme, setColorScheme } = useColorScheme();

  const handleSelectScheme = (scheme: ColorScheme) => {
    setColorScheme(scheme);
  };

  const getCurrentSchemeColors = () => {
    return (
      SCHEME_OPTIONS.find((option) => option.value === colorScheme)?.colors ||
      SCHEME_OPTIONS.find((option) => option.value === ColorScheme.SUNSET)?.colors
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Change color scheme">
                <div className={cn('relative h-6 w-6 flex items-center justify-center')}>
                  <Palette className={cn('h-5 w-5 absolute')} />
                  <div className={cn('absolute -bottom-0.75 -right-0.75 flex')}>
                    {getCurrentSchemeColors()?.map((color, index) => (
                      <div
                        key={index}
                        className={cn('h-2 w-2 rounded-full border border-background')}
                        style={{ backgroundColor: color, marginLeft: index > 0 ? '-0.1875rem' : '0' }}
                      />
                    ))}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={cn('w-40')}>
              {SCHEME_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSelectScheme(option.value)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2',
                    colorScheme === option.value && 'bg-accent'
                  )}>
                  <span className="font-medium">{option.label}</span>
                  <div className="flex">
                    {option.colors.map((color, index) => (
                      <div
                        key={index}
                        className="h-4 w-4 rounded-full border border-border"
                        style={{ backgroundColor: color, marginLeft: index > 0 ? '-0.1875rem' : '0' }}
                      />
                    ))}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Change color scheme</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
