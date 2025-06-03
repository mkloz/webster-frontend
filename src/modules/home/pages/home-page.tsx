import { SidebarInset } from '../../../shared/components/ui/sidebar';
import { CanvasFooter } from '../../canvas/components/canvas-footer';
import { CanvasHeader } from '../../canvas/components/canvas-header';
import { CanvasStage } from '../../canvas/components/stage';
import { LeftSidebar } from '../components/left-sidebar';
import { PointerLayer } from '../components/pointer-layer';
import { RightSidebar } from '../components/right-sidebar';

export const HomePage = () => {
  return (
    <div className="flex">
      <LeftSidebar />
      <SidebarInset className="flex flex-1 flex-col gap-4 max-h-screen-no-header bg-canvas-background ">
        <div className="flex flex-col items-center justify-center h-screen-no-header gap-2 relative">
          <CanvasHeader />
          <CanvasStage />
          <CanvasFooter />
        </div>
      </SidebarInset>
      <RightSidebar />
      <PointerLayer />
    </div>
  );
};
