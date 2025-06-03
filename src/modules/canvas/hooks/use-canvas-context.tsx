'use client';

import type Konva from 'konva';
import type React from 'react';
import { createContext, type ReactNode, useContext, useRef } from 'react';

interface CanvasContextType {
  stageRef: React.RefObject<Konva.Stage>;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const stageRef = useRef<Konva.Stage>(null);

  return <CanvasContext.Provider value={{ stageRef }}>{children}</CanvasContext.Provider>;
};

export const useCanvasContext = (): CanvasContextType => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return context;
};
