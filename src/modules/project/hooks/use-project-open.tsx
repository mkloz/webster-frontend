'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { QueryKeys } from '../../../shared/constants/query-keys';
import type { Project } from '../interfaces/project.interface';
import { useSelectedProjectId } from './use-current-project';
import type { ProjectSaveData } from './use-project-persistence';
import { useProjectPersistence } from './use-project-persistence';

export const useProjectOpen = (onSuccess?: () => void) => {
  const { loadProjectFromAPI, saveProjectToLocalStorage } = useProjectPersistence();
  const { setId } = useSelectedProjectId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Project) => {
      try {
        // Set this project as the current project
        setId(project.id);

        if (!project.canvas) {
          throw new Error('Project has no canvas data');
        }

        // Parse the canvas data
        let projectData: ProjectSaveData;
        try {
          projectData = JSON.parse(project.canvas);
        } catch (parseError) {
          console.error('Failed to parse project canvas data:', parseError);
          throw new Error('Invalid project data format');
        }

        // Validate project data structure
        if (!projectData.canvas || !projectData.shapes) {
          throw new Error('Project data is missing required fields');
        }

        // Load the project into the canvas
        await loadProjectFromAPI(projectData);

        // Save the complete project data to local storage as backup
        try {
          await saveProjectToLocalStorage(projectData);
        } catch (localSaveError) {
          console.warn('Failed to save project locally:', localSaveError);
          // Don't fail the entire operation if local save fails
        }

        return project;
      } catch (error) {
        console.error('Failed to open project:', error);
        // Reset the project ID if opening failed
        setId(null);
        throw error;
      }
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PROJECTS] });
      toast.success(`Opened "${project.name}"`);
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Open project failed:', error);
      toast.error(`Failed to open project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
};
