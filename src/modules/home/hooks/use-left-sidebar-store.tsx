import { create } from 'zustand';

import { useShapesStore } from '../../canvas/hooks/shapes-store';
import { useToolOptionsStore } from '../../canvas/hooks/tool-optios-store';

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
    const { setToolOptions } = useToolOptionsStore.getState();
    if (get().activeTool === tool) {
      return; // Do nothing if the same tool is selected
    }
    if (get().activeTool === 'text') {
      setToolOptions('text', { selectedTextId: null });
    }
    if (get().activeTool === 'shapes') {
      setToolOptions('shape', { selectedShapeId: null });
    }
    if (get().activeTool === 'image') {
      setToolOptions('image', { selectedImageId: null });
    }
    const toolsToIgnore = ['select', 'text', 'shapes', 'image'];
    if (get().activeTool !== tool && !toolsToIgnore.includes(tool)) {
      s.clearSelection(); // Clear selection when changing tools
    }

    set({ activeTool: tool });
  },
  showLeftSidebar: false,
  setShowLeftSidebar: (show) => set({ showLeftSidebar: show })
}));
