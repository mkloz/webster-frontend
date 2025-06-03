'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QueryKeys } from '../../../shared/constants/query-keys';
import { useCanvasStore } from '../../../shared/store/canvas-store';
import { useAuth } from '../../auth/queries/use-auth.query';
import { type Shape, useShapesStore } from '../../canvas/hooks/shapes-store';
import { useHistoryStore } from '../../canvas/hooks/use-history-store';
import { ProjectService } from '../services/project.service';
import { createDefaultShapes, createMinimalDefaultShapes } from '../utils/default-shapes';
import { useSelectedProjectId } from './use-current-project';
import { useExport } from './use-export';
import { useProjectPersistence } from './use-project-persistence';

export const PREVIEW_WIDTH = 300;
export const PREVIEW_HEIGHT = 300;

interface CreateProjectParams {
  projectName: string;
  includeDefaultShapes?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
}

interface CanvasSettings {
  width: number;
  height: number;
  background: string;
  opacity: number;
  showGrid: boolean;
  gridGap: number;
}

interface ProjectData {
  metadata: {
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
  canvas: {
    width: number;
    height: number;
    background: string;
    opacity: number;
    showGrid: boolean;
    gridGap: number;
    name: string;
    description: string;
  };
  shapes: Shape[];
}

export const useProjectCreate = (onSuccess?: () => void) => {
  const { saveProjectLocally, loadProjectFromAPI } = useProjectPersistence();
  const { getPngImage } = useExport();
  const { setId, clearId } = useSelectedProjectId();
  const me = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateProjectParams): Promise<void> => {
      const { projectName, includeDefaultShapes = false, canvasWidth = 1920, canvasHeight = 1080 } = params;
      // Set creating new project flag to prevent auto-saves
      const shapesStore = useShapesStore.getState();
      shapesStore.setCreatingNewProject(true);

      try {
        // FIRST: Clear localStorage to prevent auto-loading old project
        localStorage.removeItem('webster_current_project');

        // Clear current project ID
        clearId();

        // Get store instances
        const canvasStore = useCanvasStore.getState();
        const historyStore = useHistoryStore.getState();

        // Capture current canvas settings BEFORE clearing
        const currentCanvasSettings: CanvasSettings = {
          width: canvasStore.width,
          height: canvasStore.height,
          background: canvasStore.background,
          opacity: canvasStore.opacity,
          showGrid: canvasStore.showGrid,
          gridGap: canvasStore.gridGap
        };

        // Clear shapes and history but keep canvas settings
        shapesStore.clearShapes();
        shapesStore.setSelectedShapeIds([]);
        historyStore.clearHistory();

        // Set the new project name (don't reset canvas to defaults)
        canvasStore.setName(projectName);

        // Wait a bit for state to settle
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Create default shapes if requested
        let defaultShapes: Shape[] = [];
        if (includeDefaultShapes) {
          const canvasArea = canvasWidth * canvasHeight;
          const isSmallCanvas = canvasArea < 800000; // Less than ~900x900

          defaultShapes = isSmallCanvas
            ? createMinimalDefaultShapes(canvasWidth, canvasHeight)
            : createDefaultShapes(canvasWidth, canvasHeight);
        }

        if (!me.isLoggedIn) {
          // For local projects, create a project with default shapes
          createEmptyProject(projectName, currentCanvasSettings, defaultShapes);

          // Add shapes to the store
          if (defaultShapes.length > 0) {
            shapesStore.setShapes(defaultShapes);
          }

          await saveProjectLocally(projectName);
          return;
        }

        // For authenticated users, create project on server
        const projectData = createEmptyProject(projectName, currentCanvasSettings, defaultShapes);

        const p = await ProjectService.create({
          name: projectName,
          canvas: JSON.stringify(projectData)
        });

        // Set the new project ID
        setId(p.id);

        // Add shapes to the store AFTER creating the project
        if (defaultShapes.length > 0) {
          shapesStore.setShapes(defaultShapes);
        }

        // Generate preview (wait a bit for shapes to render)
        await new Promise((resolve) => setTimeout(resolve, 300));
        const preview = await getPngImage(PREVIEW_WIDTH, PREVIEW_HEIGHT);
        if (preview) {
          await ProjectService.uploadPreview(p.id, preview);
        }

        // Load the newly created project
        await loadProjectFromAPI(projectData);
      } finally {
        // Reset the creating new project flag after a delay
        setTimeout(() => {
          shapesStore.setCreatingNewProject(false);
        }, 1000);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PROJECTS] });
      onSuccess?.();
    }
  });
};

// Helper function to create an empty project data structure with current canvas settings
const createEmptyProject = (projectName: string, canvasSettings: CanvasSettings, shapes: Shape[] = []): ProjectData => {
  return {
    metadata: {
      name: projectName,
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    canvas: {
      width: canvasSettings.width,
      height: canvasSettings.height,
      background: canvasSettings.background,
      opacity: canvasSettings.opacity,
      showGrid: canvasSettings.showGrid,
      gridGap: canvasSettings.gridGap,
      name: projectName,
      description: ''
    },
    shapes // Include default shapes if provided
  };
};
