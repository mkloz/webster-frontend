import type React from 'react';
import { create } from 'zustand';

export type Shape = {
  id: string;
  type:
    | 'round'
    | 'square'
    | 'star'
    | 'rectangle'
    | 'circle'
    | 'triangle'
    | 'hexagon'
    | 'line'
    | 'polygon'
    | 'text'
    | 'image';
  x: number;
  y: number;
  size: number;
  color: string;
  points?: number[];
  opacity: number;
  penType?: 'ballpoint' | 'fountain' | 'marker';
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  showStroke?: boolean;
  shouldFill?: boolean;
  x2?: number;
  y2?: number;
  tool?: 'pen' | 'brush' | 'eraser';
  hardness?: number;
  // Transform properties for selection
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  // Text specific properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyles?: string; // Changed from fontStyle to fontStyles
  align?: 'left' | 'center' | 'right';
  padding?: number;
  isEditing?: boolean;
  // Image specific properties - now only server URLs
  imageUrl?: string; // Server URL only
  imageElement?: HTMLImageElement; // Runtime only, not serialized
  originalWidth?: number;
  originalHeight?: number;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  flipX?: boolean;
  flipY?: boolean;
  cropActive?: boolean;
};

interface ShapesState {
  shapes: Shape[];
  selectedShapeIds: string[];
  isCreatingNewProject: boolean;
  isActivelyDrawing: boolean; // Add this new property
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  clearShapes: () => void;
  setSelectedShapeIds: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
  toggleSelection: (id: string) => void;
  getSelectedShapes: () => Shape[];
  updateShape: (id: string, updates: Partial<Shape>) => void;
  saveShapesState: () => void;
  setCreatingNewProject: (creating: boolean) => void;
  setActivelyDrawing: (drawing: boolean) => void; // Add this new method
  duplicateSelectedShapes: () => void;
  duplicateShapes: (shapeIds: string[], offset?: { x: number; y: number }) => string[];
}

// Extend Window interface to include our custom property
interface WindowWithCanvasState extends Window {
  __CANVAS_STORE_STATE__?: {
    name: string;
    [key: string]: unknown;
  };
}

// We need to keep a reference to the save function outside the store
let saveProjectFunction: ((name: string) => Promise<void>) | null = null;

export const setSaveProjectFunction = (fn: (name: string) => Promise<void>) => {
  saveProjectFunction = fn;
};

// Utility function to generate unique IDs
const generateId = () => `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Utility function to duplicate a single shape
const duplicateShape = (shape: Shape, offset: { x: number; y: number }): Shape => {
  const newShape: Shape = {
    ...shape,
    id: generateId(),
    x: shape.x + offset.x,
    y: shape.y + offset.y
  };

  // Handle special cases for different shape types
  if (shape.type === 'line' && shape.x2 !== undefined && shape.y2 !== undefined) {
    // For lines, also offset the end point
    newShape.x2 = shape.x2 + offset.x;
    newShape.y2 = shape.y2 + offset.y;
  }

  // For images, copy the image element reference
  if (shape.type === 'image' && shape.imageElement) {
    newShape.imageElement = shape.imageElement;
  }

  return newShape;
};

// Debounce function to prevent excessive saves
let saveTimeout: NodeJS.Timeout | null = null;

export const useShapesStore = create<ShapesState>((set, get) => ({
  shapes: [],
  selectedShapeIds: [],
  isCreatingNewProject: false,
  isActivelyDrawing: false, // Add this initial state

  setShapes: (valueOrUpdater) =>
    set((state) => {
      const nextShapes =
        typeof valueOrUpdater === 'function'
          ? (valueOrUpdater as (prev: Shape[]) => Shape[])(state.shapes)
          : valueOrUpdater;

      // Clear any existing timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // Don't auto-save if we're creating a new project OR actively drawing
      if (!state.isCreatingNewProject && !state.isActivelyDrawing) {
        // Debounced save after shapes are updated
        saveTimeout = setTimeout(() => {
          get().saveShapesState();
        }, 1000);
      }

      return { shapes: nextShapes };
    }),

  clearShapes: () => {
    set({ shapes: [], selectedShapeIds: [] });
  },

  setSelectedShapeIds: (ids) => set({ selectedShapeIds: ids }),

  addToSelection: (id) =>
    set((state) => ({
      selectedShapeIds: state.selectedShapeIds.includes(id) ? state.selectedShapeIds : [...state.selectedShapeIds, id]
    })),

  removeFromSelection: (id) =>
    set((state) => ({
      selectedShapeIds: state.selectedShapeIds.filter((selectedId) => selectedId !== id)
    })),

  clearSelection: () => set({ selectedShapeIds: [] }),

  toggleSelection: (id) =>
    set((state) => ({
      selectedShapeIds: state.selectedShapeIds.includes(id)
        ? state.selectedShapeIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedShapeIds, id]
    })),

  getSelectedShapes: () => {
    const { shapes, selectedShapeIds } = get();
    return shapes.filter((shape) => selectedShapeIds.includes(shape.id));
  },

  updateShape: (id, updates) =>
    set((state) => {
      const updatedShapes = state.shapes.map((shape) => (shape.id === id ? { ...shape, ...updates } : shape));

      // Clear any existing timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // Don't auto-save if we're creating a new project OR actively drawing
      if (!state.isCreatingNewProject && !state.isActivelyDrawing) {
        // Debounced auto-save when shapes are modified
        saveTimeout = setTimeout(() => {
          get().saveShapesState();
        }, 1000);
      }

      return { shapes: updatedShapes };
    }),

  setCreatingNewProject: (creating) => {
    set({ isCreatingNewProject: creating });
  },

  setActivelyDrawing: (drawing) => {
    set({ isActivelyDrawing: drawing });

    // If we just finished drawing, trigger a save after a short delay
    if (!drawing) {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      saveTimeout = setTimeout(() => {
        const state = get();
        if (!state.isCreatingNewProject && !state.isActivelyDrawing) {
          state.saveShapesState();
        }
      }, 500); // Shorter delay after drawing completes
    }
  },

  // Duplicate currently selected shapes
  duplicateSelectedShapes: () => {
    const state = get();
    if (state.selectedShapeIds.length === 0) {
      return;
    }

    const duplicatedIds = state.duplicateShapes(state.selectedShapeIds);

    // Select the duplicated shapes
    set({ selectedShapeIds: duplicatedIds });
  },

  // Duplicate specific shapes by ID
  duplicateShapes: (shapeIds, offset = { x: 20, y: 20 }) => {
    const state = get();
    const shapesToDuplicate = state.shapes.filter((shape) => shapeIds.includes(shape.id));

    if (shapesToDuplicate.length === 0) {
      return [];
    }

    // Create duplicated shapes
    const duplicatedShapes = shapesToDuplicate.map((shape) => duplicateShape(shape, offset));
    const duplicatedIds = duplicatedShapes.map((shape) => shape.id);

    // Add duplicated shapes to the shapes array
    set((currentState) => ({
      shapes: [...currentState.shapes, ...duplicatedShapes]
    }));

    // Clear any existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Auto-save if not creating a new project
    if (!state.isCreatingNewProject) {
      saveTimeout = setTimeout(() => {
        get().saveShapesState();
      }, 1000);
    }

    return duplicatedIds;
  },

  // Method to trigger save
  saveShapesState: () => {
    const state = get();

    // Don't save if we're creating a new project
    if (state.isCreatingNewProject) {
      return;
    }

    if (saveProjectFunction) {
      // Get the current canvas name from the canvas store directly
      const windowWithCanvas = window as WindowWithCanvasState;
      const canvasStore = windowWithCanvas.__CANVAS_STORE_STATE__ || null;
      let name = 'Untitled Design';

      // Try to get name from canvas store first
      if (canvasStore && canvasStore.name) {
        name = canvasStore.name;
      } else {
        // Fallback to localStorage
        const projectData = localStorage.getItem('webster_current_project');
        if (projectData) {
          try {
            const data = JSON.parse(projectData);
            name = data.metadata.name || data.canvas.name || name;
          } catch (e) {
            console.error('Failed to parse project data:', e);
          }
        }
      }

      saveProjectFunction(name).catch(console.error);
    }
  }
}));
