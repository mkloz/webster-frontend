import { MoonIcon, SunIcon } from 'lucide-react';

import { cn } from '../../../lib/utils';
import { Theme, useTheme } from '../../../store/theme.store';
import { buttonVariants } from '../../ui/button';
import { Toggle } from '../../ui/toggle';

export const ThemeToggle = () => {
  const { setTheme, isDark } = useTheme();

  return (
    <div className="flex items-center">
      <Toggle
        aria-label="Toggle dark mode"
        pressed={isDark}
        variant={'outline'}
        size={'default'}
        onPressedChange={(value) => {
          setTheme(value ? Theme.DARK : Theme.LIGHT);
        }}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'relative p-0! data-[state=on]:bg-transparent data-[state=on]:hover:bg-accent shadow-none'
        )}>
        {isDark ? (
          <MoonIcon className="text-blue-500 fill-current" />
        ) : (
          <SunIcon className="text-yellow-600 fill-current" />
        )}
      </Toggle>
    </div>
  );
};
