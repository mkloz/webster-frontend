import { create } from 'zustand';

export type Shapes = 'rectangle' | 'circle' | 'line' | 'hexagon' | 'star' | 'triangle';

type PointerOptions = {
  pointerColor: string;
  pointerSize: number;
  showTrail: boolean;
  trailLength: number;
};

type PenOptions = {
  penColor: string;
  penSize: number;
  penType: 'ballpoint' | 'fountain' | 'marker';
  smoothing: number;
};

type EraserOptions = {
  eraserType: 'pixel' | 'object';
  eraserSize: number;
  eraserHardness: number;
};

type ShapeOptions = {
  shapeColor: string;
  shapeSize: number;
  shapeType: Shapes;
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
  showStroke: boolean;
  shouldFill: boolean;
  selectedShapeId: string | null;
};

type TextOptions = {
  textColor: string;
  fontSize: number;
  fontFamily: string;
  fontStyles: string; // Changed from fontStyle to fontStyles to support multiple styles
  align: 'left' | 'center' | 'right';
  width: number;
  padding: number;
  selectedTextId: string | null;
};

type ImageOptions = {
  opacity: number;
  selectedImageId: string | null;
  flipX: boolean;
  flipY: boolean;
  isUploading: boolean;
  uploadProgress: number;
  cropActive: boolean;
};

type ToolOptionsState = {
  pointer: PointerOptions;
  pen: PenOptions;
  eraser: EraserOptions;
  shape: ShapeOptions;
  text: TextOptions;
  image: ImageOptions;
  setToolOptions: <K extends keyof ToolOptionsState>(
    tool: K,
    opts: Partial<ToolOptionsState[K]> | ((prev: ToolOptionsState[K]) => Partial<ToolOptionsState[K]>)
  ) => void;
};

export const useToolOptionsStore = create<ToolOptionsState>((set) => ({
  pointer: {
    pointerColor: '#FF5555',
    pointerSize: 8,
    showTrail: true,
    trailLength: 50
  },
  pen: {
    penColor: '#000000',
    penSize: 2,
    penType: 'ballpoint',
    smoothing: 50
  },
  eraser: {
    eraserType: 'pixel',
    eraserSize: 20,
    eraserHardness: 100
  },
  shape: {
    shapeColor: '#8B5CF6',
    shapeSize: 50,
    shapeType: 'rectangle',
    fillColor: '#8B5CF6',
    fillOpacity: 0.8,
    strokeColor: '#000000',
    strokeWidth: 2,
    showStroke: true,
    shouldFill: false,
    selectedShapeId: null
  },
  text: {
    textColor: '#000000',
    fontSize: 16,
    fontFamily: 'Arial',
    fontStyles: '', // Changed from fontStyle: 'normal' to fontStyles: ''
    align: 'left',
    width: 200,
    padding: 5,
    selectedTextId: null
  },
  image: {
    opacity: 1,
    selectedImageId: null,
    flipX: false,
    flipY: false,
    isUploading: false,
    uploadProgress: 0,
    cropActive: false
  },
  setToolOptions: (
    tool: keyof ToolOptionsState,
    opts:
      | Partial<ToolOptionsState[keyof ToolOptionsState]>
      | ((prev: ToolOptionsState[keyof ToolOptionsState]) => Partial<ToolOptionsState[keyof ToolOptionsState]>)
  ) =>
    set((state) => {
      const current = state[tool];
      const updates = typeof opts === 'function' ? opts(current) : opts;
      const isSame = Object.entries(updates).every(([key, value]) => current[key as keyof typeof current] === value);
      if (isSame) return state;
      return {
        ...state,
        [tool]: {
          ...current,
          ...updates
        }
      };
    })
}));
