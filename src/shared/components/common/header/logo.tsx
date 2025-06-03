import { Logo } from '../../../../assets/logos/logo';
import { cn } from '../../../lib/utils';
import { useColorScheme } from '../../../store/color-scheme.store';
import { useTheme } from '../../../store/theme.store';
import { Link } from '../link';

export const LogoSection = () => {
  const { theme } = useTheme();
  const { colorScheme } = useColorScheme();

  const getPaletteName = () => {
    switch (colorScheme) {
      case 'sunset':
        return 'Sunset';
      case 'ocean':
        return 'Ocean';
      case 'forest':
        return 'Forest';
      case 'monochrome':
        return 'Mono';
      case 'violet':
        return 'Violet';
      case 'purple':
        return 'Purple';
      default:
        return '';
    }
  };

  return (
    <Link to={'/'} className={cn('flex items-center gap-2 p-4')} unstyled>
      <div
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-gradient-start to-gradient-end shadow-lg shadow-primary/20'
        )}>
        <Logo className={cn('h-5 w-5 text-white')} />
      </div>
      <h1
        className={cn(
          'text-xl font-bold tracking-tight bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent'
        )}>
        Webster
        <span className={cn('ml-3 text-xs font-normal text-muted-foreground')}>
          {theme === 'dark' ? 'Dark' : 'Light'} • {getPaletteName()}
        </span>
      </h1>
    </Link>
  );
};
