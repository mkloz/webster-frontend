import { ChevronLeft } from 'lucide-react';
import type React from 'react';
import { FC } from 'react';

import { Button } from '../../../shared/components/ui/button';
import { Sidebar, SidebarProvider } from '../../../shared/components/ui/sidebar';
import { cn } from '../../../shared/lib/utils';
import { CanvasSettings } from '../../canvas/components/canvas-settings';
import { useRightSidebarStore } from '../hooks/use-right-sidebar-store';
import { SidebarSheet } from './sidebar-sheet';

export const RightSidebar: FC<React.ComponentProps<typeof Sidebar>> = ({ ...props }) => {
  const { showRightSidebar, setShowRightSidebar } = useRightSidebarStore();

  return (
    <SidebarProvider
      style={{ '--sidebar-width': '17rem' }}
      open={showRightSidebar}
      onOpenChange={setShowRightSidebar}
      className="w-auto flex h-full overflow-hidden">
      <Sidebar
        collapsible={'offcanvas'}
        side="right"
        {...props}
        className={cn('border-r flex-shrink-0 z-0 max-h-screen-no-header mt-header', props.className)}>
        <SidebarSheet title="Canvas Settings" onClose={() => setShowRightSidebar(false)}>
          <CanvasSettings />
        </SidebarSheet>
      </Sidebar>

      <div className="relative">
        <Button
          unstyled
          className={cn(
            'relative transition-transform w-8 h-screen-no-header border-l flex text-muted-foreground bg-canvas-background',
            showRightSidebar ? 'translate-x-full absolute' : 'translate-x-0'
          )}
          onClick={() => setShowRightSidebar(true)}>
          <ChevronLeft className="w-8 h-8 m-auto text " />
        </Button>
      </div>
    </SidebarProvider>
  );
};
