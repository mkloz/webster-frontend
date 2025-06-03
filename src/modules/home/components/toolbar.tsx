'use client';

import { Eraser, ImageIcon, PenIcon, Type } from 'lucide-react';
import type { FC } from 'react';
import { FaCrosshairs } from 'react-icons/fa6';
import { PiSelectionPlusBold } from 'react-icons/pi';
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from 'react-icons/tb';

import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';

import { useSidebar } from '../../../shared/components/ui/sidebar';
import { SHAPES } from '../../canvas/components/tool-options/shapes-options';
import { useToolOptionsStore } from '../../canvas/hooks/tool-optios-store';
import { useLeftSidebarStore } from '../hooks/use-left-sidebar-store';

export const ToolBar: FC = () => {
  const { activeTool, setActiveTool } = useLeftSidebarStore();
  const { open, setOpen } = useSidebar();
  const SidebarIcon = open ? TbLayoutSidebarLeftCollapse : TbLayoutSidebarLeftExpand;
  const { shape } = useToolOptionsStore();
  const currentShape = shape?.shapeType || 'rectangle';

  // Find the current shape in SHAPES array
  const currentShapeData = SHAPES.find((s) => s.value === currentShape) || SHAPES[0];

  return (
    <div className="flex w-12 flex-col items-center border-r border-border/40 bg-background/50 py-4 backdrop-blur-xl shadow-sm h-screen-no-header z-10">
      <div className="flex flex-col items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'select' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                setActiveTool('select');
                setOpen(true);
              }}>
              <PiSelectionPlusBold className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Select (V)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'pointer' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                setActiveTool('pointer');
                setOpen(true);
              }}>
              <FaCrosshairs className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Laser Pointer (L)</TooltipContent>
        </Tooltip>
      </div>

      <Separator className="my-2 max-w-8" />

      <div className="flex flex-col items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'pen' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                setActiveTool('pen');
                setOpen(true);
              }}>
              <PenIcon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Pen (P)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'eraser' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                setActiveTool('eraser');
                setOpen(true);
              }}>
              <Eraser className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Eraser (E)</TooltipContent>
        </Tooltip>
      </div>

      <Separator className="my-2 max-w-8" />
      <div className="flex flex-col items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'shapes' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                setActiveTool('shapes');
                setOpen(true);
              }}>
              {currentShapeData.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Shapes (S) - {currentShapeData.label}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'text' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                setActiveTool('text');
                setOpen(true);
              }}>
              <Type className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Text (T)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === 'image' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                setActiveTool('image');
                setOpen(true);
              }}>
              <ImageIcon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Image (I)</TooltipContent>
        </Tooltip>
      </div>

      <div className="mt-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-accent text-muted-foreground transition-colors"
              onClick={() => setOpen(!open)}>
              <SidebarIcon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{open ? 'Hide Left Panel' : 'Show Left Panel'}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
