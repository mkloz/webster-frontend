import { create } from 'zustand';

export type Tools = 'select' | 'pen' | 'eraser' | 'pointer' | 'text' | 'shapes' | 'image';

interface LeftSidebarStore {
  activeTool: Tools;
  setActiveTool: (tool: Tools) => void;
  showLeftSidebar: boolean;
  setShowLeftSidebar: (show: boolean) => void;
}
export const useLeftSidebarStore = create<LeftSidebarStore>((set) => ({
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),
  showLeftSidebar: false,
  setShowLeftSidebar: (show) => set({ showLeftSidebar: show })
}));
