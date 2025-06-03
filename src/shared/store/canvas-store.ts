import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CanvasState {
  width: number;
  height: number;
  maxSize: number;
  minSize: number;
  scale: number;
  background: string;
  name: string;
  description: string;
  shouldResetScale: boolean;
  opacity: number;
  showGrid: boolean;
  gridGap: number;

  setDimensions: (width: number, height: number) => void;
  setBackground: (color: string) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  resetCanvas: () => void;
  resetScale: () => void;
  setScale: (scale: number) => void;
  setOpacity: (opacity: number) => void;
  setShowGrid: (value: boolean) => void;
  setGridGap: (gap: number) => void;
}

interface WindowWithCanvasState extends Window {
  __CANVAS_STORE_STATE__?: CanvasState;
}

declare const window: WindowWithCanvasState;

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;
const MAX_SIZE = 10000;
const MIN_SIZE = 10;
const DEFAULT_BACKGROUND = '#FFFFFF';
const DEFAULT_GRID_GAP = 20;

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      maxSize: MAX_SIZE,
      minSize: MIN_SIZE,
      shouldResetScale: false,
      scale: 1,

      background: DEFAULT_BACKGROUND,
      name: 'Untitled Design',
      description: '',
      opacity: 1,
      showGrid: false,
      gridGap: DEFAULT_GRID_GAP,

      setDimensions: (width, height) => {
        set({ width, height, shouldResetScale: true });
      },
      setBackground: (background) => {
        set({ background });
      },
      setName: (name) => {
        set({ name });
        // Store the current state globally for shapes store to access
        window.__CANVAS_STORE_STATE__ = { ...get(), name };
      },
      setDescription: (description) => set({ description }),
      setScale: (scale) => set({ scale }),
      resetScale: () => {
        set({ shouldResetScale: !get().shouldResetScale });
      },
      setOpacity: (opacity) => set({ opacity }),
      setShowGrid: (value) => set({ showGrid: value }),
      setGridGap: (gap) => set({ gridGap: gap }),
      resetCanvas: () => {
        const newState = {
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
          background: DEFAULT_BACKGROUND,
          name: 'Untitled Design',
          description: '',
          opacity: 1,
          showGrid: false,
          gridGap: DEFAULT_GRID_GAP,
          scale: 1,
          shouldResetScale: true
        };
        set(newState);
        // Update global state
        window.__CANVAS_STORE_STATE__ = { ...get(), ...newState };
      }
    }),
    {
      name: 'canvas-storage'
    }
  )
);
