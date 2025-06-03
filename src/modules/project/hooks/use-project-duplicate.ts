'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { QueryKeys } from '../../../shared/constants/query-keys';
import { useAuth } from '../../auth/queries/use-auth.query';
import { useShapesStore } from '../../canvas/hooks/shapes-store';
import type { Project } from '../interfaces/project.interface';
import { ProjectService } from '../services/project.service';
import { useSelectedProjectId } from './use-current-project';
import { useProjectPersistence } from './use-project-persistence';

export const useProjectDuplicate = () => {
  const { loadProjectFromAPI } = useProjectPersistence();
  const { setId, clearId } = useSelectedProjectId();
  const me = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sourceProject: Project) => {
      const shapesStore = useShapesStore.getState();
      shapesStore.setCreatingNewProject(true);

      try {
        // Clear localStorage to prevent auto-loading old project
        localStorage.removeItem('webster_current_project');

        // Clear current project ID
        clearId();

        if (!sourceProject.canvas) {
          throw new Error('Source project has no canvas data');
        }

        // Parse the source project data
        let sourceProjectData;
        try {
          sourceProjectData = JSON.parse(sourceProject.canvas);
        } catch (parseError) {
          console.error('Failed to parse source project canvas data:', parseError);
          throw new Error('Invalid source project data format');
        }

        // Create new project name
        const newProjectName = `${sourceProject.name} (Copy)`;

        // Update the project data with new name and timestamps
        const duplicatedProjectData = {
          ...sourceProjectData,
          metadata: {
            ...sourceProjectData.metadata,
            name: newProjectName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          canvas: {
            ...sourceProjectData.canvas,
            name: newProjectName
          }
        };

        if (!me.isLoggedIn) {
          // For local projects, just load the duplicated data
          await loadProjectFromAPI(duplicatedProjectData);
          return;
        }

        // For authenticated users, create new project on server
        const newProject = await ProjectService.create({
          name: newProjectName,
          canvas: JSON.stringify(duplicatedProjectData)
        });

        // Set the new project ID
        setId(newProject.id);

        // Load the duplicated project
        await loadProjectFromAPI(duplicatedProjectData);
        return newProject;
      } finally {
        // Reset the creating new project flag after a delay
        setTimeout(() => {
          shapesStore.setCreatingNewProject(false);
        }, 1000);
      }
    },
    onSuccess: (_, sourceProject) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PROJECTS] });
      toast.success(`Created "${sourceProject.name} (Copy)"`);
    },
    onError: (error, sourceProject) => {
      console.error('Duplicate project failed:', error);
      toast.error(
        `Failed to duplicate "${sourceProject.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  });
};
