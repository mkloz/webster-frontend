'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useCanvasStore } from '../../../shared/store/canvas-store';
import type { Shape } from '../../canvas/hooks/shapes-store';
import { useShapesStore } from '../../canvas/hooks/shapes-store';
import { useHistoryStore } from '../../canvas/hooks/use-history-store';
import { useSelectedProjectId } from './use-current-project';

// Define Konva stage interface
interface KonvaStage {
  toDataURL: (config?: {
    width?: number;
    height?: number;
    pixelRatio?: number;
    mimeType?: string;
    quality?: number;
  }) => string;
}

// Define serializable shape type - properly exclude imageElement
type SerializableShape = Omit<Shape, 'imageElement'>;

// Define our save data structure
export interface ProjectSaveData {
  metadata: {
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    thumbnail?: string;
  };
  canvas: {
    width: number;
    height: number;
    background: string;
    opacity: number;
    showGrid: boolean;
    gridGap: number;
    name: string;
    description?: string;
  };
  shapes: SerializableShape[];
}

const LOCAL_PROJECT_KEY = 'webster_current_project';

export const useProjectPersistence = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stageRef, setStageRefState] = useState<KonvaStage | null>(null);
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
  const { clearId, _hasHydrated } = useSelectedProjectId();

  // Get store states
  const canvasState = useCanvasStore();
  const shapesState = useShapesStore();

  // Load project from localStorage ONLY on initial app load
  useEffect(() => {
    if (!_hasHydrated) return; // Wait for hydration to complete
    if (isCreatingNewProject) return; // Don't auto-load if creating new project
    if (hasAutoLoaded) return; // Don't auto-load if we've already done it once

    const loadSavedProject = async () => {
      try {
        const stored = localStorage.getItem(LOCAL_PROJECT_KEY);
        if (stored) {
          const saveData: ProjectSaveData = JSON.parse(stored);

          // Check if we're in the middle of creating a new project
          const shapesStore = useShapesStore.getState();
          if (shapesStore.isCreatingNewProject) {
            return;
          }

          await deserializeProject(saveData);
          setHasAutoLoaded(true); // Mark that we've auto-loaded
        } else {
          setHasAutoLoaded(true); // Mark as loaded even if no project exists
        }
      } catch (error) {
        console.error('Failed to load project from localStorage:', error);
        setHasAutoLoaded(true); // Mark as loaded even on error
      }
    };

    // Add a delay to ensure any new project creation has completed
    const timeoutId = setTimeout(loadSavedProject, 500);
    return () => clearTimeout(timeoutId);
  }, [_hasHydrated, isCreatingNewProject, hasAutoLoaded]);

  /**
   * Set stage reference for thumbnail generation
   */
  const setStageRef = (stage: KonvaStage) => {
    setStageRefState(stage);
  };

  /**
   * Load image from URL with better error handling and CORS support
   */
  const loadImageFromUrl = async (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const imageElement = new Image();

      // Set up error handling
      const handleError = (error: unknown) => {
        console.error('Image load error details:', {
          url,
          error,
          naturalWidth: imageElement.naturalWidth,
          naturalHeight: imageElement.naturalHeight,
          complete: imageElement.complete
        });
        reject(new Error(`Failed to load image from URL: ${url}`));
      };

      const handleLoad = () => {
        resolve(imageElement);
      };

      // Set up event listeners before setting src
      imageElement.onload = handleLoad;
      imageElement.onerror = handleError;
      imageElement.onabort = handleError;

      // Try different CORS settings
      try {
        // First try with crossOrigin
        imageElement.crossOrigin = 'anonymous';
        imageElement.src = url;
      } catch (error) {
        console.warn('Failed with crossOrigin=anonymous, trying without CORS:', error);

        // If that fails, try without CORS
        imageElement.crossOrigin = '';
        imageElement.src = url;
      }

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!imageElement.complete) {
          handleError(new Error('Image load timeout'));
        }
      }, 10000);
    });
  };

  /**
   * Generate thumbnail from current stage
   */
  const generateThumbnail = async (width: number, height: number): Promise<Blob | null> => {
    if (!stageRef) {
      console.warn('No stage reference available for thumbnail generation');
      return null;
    }

    try {
      // Create thumbnail with specified dimensions
      const dataURL = stageRef.toDataURL({
        width,
        height,
        pixelRatio: 1,
        mimeType: 'image/png'
      });

      // Convert data URL to blob
      const response = await fetch(dataURL);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      return null;
    }
  };

  /**
   * Process shapes for serialization - preserve ALL properties except imageElement
   */
  const processShapesForSerialization = (shapes: Shape[]): SerializableShape[] => {
    return shapes.map((shape) => {
      // For all shapes, we need to preserve ALL properties except imageElement
      if (shape.type === 'image') {
        // For images, remove only the non-serializable imageElement
        const { imageElement: _imageElement, ...serializableShape } = shape;
        return serializableShape;
      } else {
        // For all other shapes, keep everything (they don't have imageElement anyway)
        return shape as SerializableShape;
      }
    });
  };

  /**
   * Serialize project to JSON
   */
  const serializeProject = (name: string, description?: string): ProjectSaveData | null => {
    try {
      // Get current state
      const { width, height, background, opacity, showGrid, gridGap } = canvasState;
      const { shapes } = shapesState;

      // Create thumbnail if stage ref is available
      let thumbnail: string | undefined = undefined;
      if (stageRef) {
        try {
          // Create a small thumbnail of the canvas
          thumbnail = stageRef.toDataURL({
            pixelRatio: 0.1,
            mimeType: 'image/jpeg',
            quality: 0.3
          });
        } catch (error) {
          console.error('Failed to create thumbnail:', error);
        }
      }

      // Process shapes (preserve ALL properties)
      const processedShapes = processShapesForSerialization(shapes);

      // Create save data
      const saveData: ProjectSaveData = {
        metadata: {
          name,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          thumbnail
        },
        canvas: {
          width,
          height,
          background,
          opacity,
          showGrid,
          gridGap,
          name,
          description
        },
        shapes: processedShapes
      };

      return saveData;
    } catch (error) {
      console.error('Failed to serialize project:', error);
      return null;
    }
  };

  /**
   * Deserialize project from JSON
   */
  const deserializeProject = async (saveData: ProjectSaveData): Promise<void> => {
    try {
      // Get store instances
      const canvasStore = useCanvasStore.getState();
      const shapesStore = useShapesStore.getState();
      const historyStore = useHistoryStore.getState();

      // Clear history first
      historyStore.clearHistory();

      // Clear shapes before loading new ones
      shapesStore.setShapes([]);

      // Restore canvas state
      const { width, height, background, opacity, showGrid, gridGap, name, description } = saveData.canvas;

      // Set all canvas properties
      canvasStore.setDimensions(width, height);
      canvasStore.setBackground(background);
      canvasStore.setOpacity(opacity);
      canvasStore.setShowGrid(showGrid);
      canvasStore.setGridGap(gridGap);

      // Set the name
      if (name && name.trim() !== '') {
        canvasStore.setName(name);
      } else {
        canvasStore.setName('Untitled Design');
      }

      if (description) {
        canvasStore.setDescription(description);
      }

      // Process shapes to handle images
      const processedShapes = await Promise.all(
        saveData.shapes.map(async (shape) => {
          // Handle images with server URLs
          if (shape.type === 'image' && shape.imageUrl) {
            try {
              // Load image from server URL
              const imageElement = await loadImageFromUrl(shape.imageUrl);

              // Return shape with image element and preserve ALL properties
              return {
                ...shape, // Keep all original properties
                imageElement
              } as Shape;
            } catch (error) {
              console.error('Failed to load image from server URL:', error);

              // Return shape without image if loading fails
              return {
                ...shape,
                imageUrl: undefined
              } as Shape;
            }
          }

          // For all other shapes, keep everything as is
          return shape as Shape;
        })
      );

      // Restore shapes state
      shapesStore.setShapes(processedShapes);

      // Initialize history with the loaded state
      historyStore.pushToHistory(processedShapes, 'Project loaded');

      // Force a scale reset to ensure the canvas is properly displayed
      canvasStore.resetScale();
    } catch (error) {
      console.error('Failed to deserialize project:', error);
      throw error;
    }
  };

  const loadProjectFromAPI = async (saveData: ProjectSaveData): Promise<void> => {
    setIsLoading(true);
    try {
      await deserializeProject(saveData);

      // Double-check that the name was properly set
      if (saveData.metadata.name && saveData.metadata.name.trim() !== '') {
        useCanvasStore.getState().setName(saveData.metadata.name);
      }
    } catch (error) {
      console.error('Failed to load project from API:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save project data directly to localStorage
   */
  const saveProjectToLocalStorage = async (saveData: ProjectSaveData): Promise<void> => {
    try {
      // Save the complete project data to localStorage
      localStorage.setItem(LOCAL_PROJECT_KEY, JSON.stringify(saveData));
    } catch (error) {
      console.error('Failed to save project data to localStorage:', error);
      throw error;
    }
  };

  /**
   * Save project locally to localStorage
   */
  const saveProjectLocally = async (name: string, description?: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Update canvas name first
      useCanvasStore.getState().setName(name);
      if (description) {
        useCanvasStore.getState().setDescription(description);
      }

      const saveData = serializeProject(name, description);
      if (!saveData) {
        throw new Error('Failed to serialize project');
      }

      // Save to localStorage
      await saveProjectToLocalStorage(saveData);
    } catch (error) {
      console.error('Failed to save project locally:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get serialized project for API (same as local now since no base64)
   */
  const getProjectForAPI = (name: string, description?: string): ProjectSaveData | null => {
    return serializeProject(name, description);
  };

  /**
   * Load project from local storage
   */
  const loadProjectLocally = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(LOCAL_PROJECT_KEY);

      if (!stored) {
        toast.error('No saved project found');
        return false;
      }

      const saveData: ProjectSaveData = JSON.parse(stored);
      await deserializeProject(saveData);

      toast.success('Project loaded');
      return true;
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Set flag to prevent auto-loading during new project creation
   */
  const setCreatingNewProject = (creating: boolean) => {
    setIsCreatingNewProject(creating);
  };

  /**
   * Reset to new project state
   */
  const resetToNewProject = async (): Promise<void> => {
    try {
      // Set flag to prevent auto-loading
      setIsCreatingNewProject(true);

      // Clear current project ID first
      clearId();

      // Get store instances
      const canvasStore = useCanvasStore.getState();
      const shapesStore = useShapesStore.getState();
      const historyStore = useHistoryStore.getState();

      // Clear all state completely
      shapesStore.clearShapes();
      shapesStore.setSelectedShapeIds([]);
      historyStore.clearHistory();
      canvasStore.resetCanvas();

      // Remove local project
      localStorage.removeItem(LOCAL_PROJECT_KEY);
      // Reset the flag after a delay to allow new project creation to complete
      setTimeout(() => {
        setIsCreatingNewProject(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to reset to new project:', error);
      setIsCreatingNewProject(false);
      throw error;
    }
  };

  /**
   * Check if there's a saved project locally
   */
  const hasLocalProject = (): boolean => {
    return localStorage.getItem(LOCAL_PROJECT_KEY) !== null;
  };

  /**
   * Get local project metadata without loading it
   */
  const getLocalProjectInfo = (): { name: string; lastModified: string; thumbnail?: string } | null => {
    try {
      const stored = localStorage.getItem(LOCAL_PROJECT_KEY);
      if (!stored) return null;

      const saveData: ProjectSaveData = JSON.parse(stored);
      return {
        name: saveData.metadata.name,
        lastModified: saveData.metadata.updatedAt,
        thumbnail: saveData.metadata.thumbnail
      };
    } catch (error) {
      console.error('Failed to get local project info:', error);
      return null;
    }
  };

  /**
   * Delete local project
   */
  const deleteLocalProject = (): void => {
    try {
      localStorage.removeItem(LOCAL_PROJECT_KEY);
      clearId();
      toast.success('Project deleted');
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  /**
   * Export project to file
   */
  const exportToFile = async (name: string, description?: string): Promise<void> => {
    setIsLoading(true);
    try {
      const saveData = serializeProject(name, description);
      if (!saveData) {
        throw new Error('Failed to serialize project');
      }

      // Convert to JSON string
      const jsonString = JSON.stringify(saveData, null, 2);

      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name || 'webster-project'}.json`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Project exported');
    } catch (error) {
      console.error('Failed to export project:', error);
      toast.error('Failed to export project');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Import project from file
   */
  const importFromFile = async (file: File): Promise<void> => {
    setIsLoading(true);
    try {
      // Read file
      const text = await file.text();
      const saveData: ProjectSaveData = JSON.parse(text);

      // Validate save data
      if (!saveData.canvas || !saveData.shapes) {
        throw new Error('Invalid project file');
      }

      // Clear current project ID since we're importing a new project
      clearId();

      // Load project
      await deserializeProject(saveData);

      // Save to localStorage
      await saveProjectToLocalStorage(saveData);

      toast.success('Project imported');
    } catch (error) {
      console.error('Failed to import project:', error);
      toast.error('Failed to import project');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Force save current project state
   */
  const forceSave = async (): Promise<void> => {
    try {
      const canvasStore = useCanvasStore.getState();
      await saveProjectLocally(canvasStore.name);
    } catch (error) {
      console.error('Failed to force save:', error);
    }
  };

  return {
    isLoading,
    setStageRef,
    serializeProject,
    getProjectForAPI,
    deserializeProject,
    generateThumbnail,
    saveProjectLocally,
    saveProjectToLocalStorage,
    loadProjectLocally,
    hasLocalProject,
    getLocalProjectInfo,
    deleteLocalProject,
    exportToFile,
    importFromFile,
    loadProjectFromAPI,
    resetToNewProject,
    forceSave,
    setCreatingNewProject
  };
};
