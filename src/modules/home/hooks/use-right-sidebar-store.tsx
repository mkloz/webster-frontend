import { create } from 'zustand';

interface LeftSidebarStore {
  showRightSidebar: boolean;
  setShowRightSidebar: (show: boolean) => void;
}
export const useRightSidebarStore = create<LeftSidebarStore>((set) => ({
  showRightSidebar: false,
  setShowRightSidebar: (show) => set({ showRightSidebar: show })
}));
