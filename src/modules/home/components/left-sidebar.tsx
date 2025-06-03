'use client';

import type React from 'react';
import type { FC } from 'react';

import { Sidebar, SidebarProvider } from '../../../shared/components/ui/sidebar';
import { cn } from '../../../shared/lib/utils';
import { EraserOptions } from '../../canvas/components/tool-options/eraser-options';
import { ImageOptions } from '../../canvas/components/tool-options/image-options';
import { PenOptions } from '../../canvas/components/tool-options/pen-options';
import { PointerOptions } from '../../canvas/components/tool-options/pointer-options';
import { SelectOptions } from '../../canvas/components/tool-options/select-options';
import { ShapesOptions } from '../../canvas/components/tool-options/shapes-options';
import { TextOptions } from '../../canvas/components/tool-options/text-options';
import { type Tools, useLeftSidebarStore } from '../hooks/use-left-sidebar-store';
import { SidebarSheet } from './sidebar-sheet';
import { ToolBar } from './toolbar';

const TOOLS_SHEETS: Record<Tools, FC | undefined> = {
  select: SelectOptions,
  pen: PenOptions,
  eraser: EraserOptions,
  pointer: PointerOptions,
  text: TextOptions,
  shapes: ShapesOptions,
  image: ImageOptions
};

export const LeftSidebar: FC<React.ComponentProps<typeof Sidebar>> = ({ ...props }) => {
  const { showLeftSidebar, setShowLeftSidebar, activeTool } = useLeftSidebarStore();
  const ToolSheet = Object.keys(TOOLS_SHEETS).includes(activeTool) && TOOLS_SHEETS[activeTool];

  return (
    <SidebarProvider
      style={{ '--sidebar-width': '18rem' }}
      open={showLeftSidebar}
      onOpenChange={setShowLeftSidebar}
      className="w-auto flex h-full">
      <ToolBar />
      {ToolSheet && (
        <Sidebar
          collapsible={'offcanvas'}
          {...props}
          className={cn('border-r ml-12 flex-shrink-0 z-0 max-h-screen-no-header mt-header', props.className)}>
          <SidebarSheet
            title={activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
            onClose={() => setShowLeftSidebar(false)}>
            {<ToolSheet />}
          </SidebarSheet>
        </Sidebar>
      )}
    </SidebarProvider>
  );
};
