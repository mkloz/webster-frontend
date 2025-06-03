import type { ReactNode } from 'react';
import { Group } from 'react-konva';

import { useCanvasStore } from '@/shared/store/canvas-store';

interface CanvasClipperProps {
  children: ReactNode;
}

export const CanvasClipper = ({ children }: CanvasClipperProps) => {
  const { width, height } = useCanvasStore();

  return (
    <Group
      clipFunc={(ctx) => {
        ctx.rect(0, 0, width, height);
      }}>
      {children}
    </Group>
  );
};
