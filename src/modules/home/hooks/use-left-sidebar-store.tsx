import { create } from 'zustand';

import { useShapesStore } from '../../canvas/hooks/shapes-store';

export type Tools = 'select' | 'pen' | 'eraser' | 'pointer' | 'text' | 'shapes' | 'image';

interface LeftSidebarStore {
  activeTool: Tools;
  setActiveTool: (tool: Tools) => void;
  showLeftSidebar: boolean;
  setShowLeftSidebar: (show: boolean) => void;
}
export const useLeftSidebarStore = create<LeftSidebarStore>((set, get) => ({
  activeTool: 'select',
  setActiveTool: (tool) => {
    const s = useShapesStore.getState();
    const toolsToIgnore = ['select', 'text', 'shapes', 'image'];
    if (get().activeTool !== tool && !toolsToIgnore.includes(tool)) {
      s.clearSelection(); // Clear selection when changing tools
    }

    set({ activeTool: tool });
  },
  showLeftSidebar: false,
  setShowLeftSidebar: (show) => set({ showLeftSidebar: show })
}));
