'use client';

import { Home, LogIn } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '../../../../modules/auth/queries/use-auth.query';
import { UserMenuSheet } from '../../../../modules/user/pages/user-sheet';
import { cn } from '../../../lib/utils';
import { buttonVariants } from '../../ui/button';
import { Separator } from '../../ui/separator';
import { Link } from '../link';
import { ColorSchemeSelect } from '../theme/color-palette-select';
import { ThemeToggle } from '../theme/theme-toggle';
import { ExportProjectDialog } from './export-project-dialog';
import { HeaderActions } from './header-actions';
import { LogoSection } from './logo';
import { ProjectStatusIndicator } from './project-status-indicator';

export const Header = () => {
  const user = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname.split('?').at(0) === '/';
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border/40',
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-full max-h-header'
      )}>
      <div className={cn('flex items-center')}>
        <LogoSection />
        <div className="flex flex-1 items-center justify-between space-x-2 ml-auto p-3">
          <div className="w-full flex-1 md:w-auto">
            {isHomePage && (
              <div className="flex items-center gap-3">
                <ProjectStatusIndicator />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isHomePage && (
              <>
                <HeaderActions />
                <Separator orientation="vertical" className="min-h-7" />
                <ExportProjectDialog />
                <Separator orientation="vertical" className="min-h-7" />
              </>
            )}
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <ColorSchemeSelect />
            </div>
            <Separator orientation="vertical" className="min-h-7 mr-1" />
            {!isHomePage && (
              <Link unstyled to={'/'} className={buttonVariants({ variant: 'outline', size: 'icon' })}>
                <Home />
              </Link>
            )}
            {isHomePage && user.isLoggedIn && <UserMenuSheet />}
            {isHomePage && !user.isLoggedIn && (
              <Link unstyled to={'/login'} className={buttonVariants({ variant: 'outline', size: 'icon' })}>
                <LogIn />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
