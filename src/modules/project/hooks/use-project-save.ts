'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { QueryKeys } from '../../../shared/constants/query-keys';
import { useAuth } from '../../auth/queries/use-auth.query';
import { ProjectService } from '../services/project.service';
import { useSelectedProjectId } from './use-current-project';
import { useExport } from './use-export';
import { PREVIEW_HEIGHT, PREVIEW_WIDTH } from './use-project-create';
import { useProjectPersistence } from './use-project-persistence';

export const useProjectSave = (onSuccess?: () => void) => {
  const { getProjectForAPI, saveProjectLocally } = useProjectPersistence();
  const { getPngImage } = useExport();
  const { id, setId } = useSelectedProjectId();
  const me = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectName: string) => {
      // Dispatch save start event
      window.dispatchEvent(new CustomEvent('project-save-start'));

      if (!me.isLoggedIn) {
        // For unauthenticated users, save only locally
        await saveProjectLocally(projectName);
        return null;
      }

      try {
        // Get project data with uploaded images for API
        const projectData = await getProjectForAPI(projectName);
        if (!projectData) {
          throw new Error('Cannot save project. Failed to serialize project data');
        }

        let project;

        if (id) {
          project = await ProjectService.update(id, {
            name: projectName,
            canvas: JSON.stringify(projectData)
          });
        } else {
          // Create new project
          project = await ProjectService.create({
            name: projectName,
            canvas: JSON.stringify(projectData)
          });

          // Set the new project as current
          setId(project.id);
        }

        // Generate and upload preview
        try {
          const preview = await getPngImage(PREVIEW_WIDTH, PREVIEW_HEIGHT);
          if (preview) {
            await ProjectService.uploadPreview(project.id, preview);
          }
        } catch (previewError) {
          console.warn('Failed to upload preview:', previewError);
          // Don't fail the entire save if preview upload fails
        }

        // Save locally as backup (use base64 version)
        await saveProjectLocally(projectName);

        return project;
      } catch (apiError) {
        console.error('API save failed:', apiError);

        // Check if it's an image upload error
        if (apiError instanceof Error && (apiError.message.includes('upload') || apiError.message.includes('image'))) {
          toast.error('Failed to upload images. Check your connection and try again.');
        } else {
          toast.warning('Server unavailable - saved locally');
        }

        // Fallback to local save if API fails
        await saveProjectLocally(projectName);
        return null;
      }
    },
    onSuccess: (project) => {
      // Dispatch save end event
      window.dispatchEvent(new CustomEvent('project-save-end'));

      queryClient.invalidateQueries({ queryKey: [QueryKeys.PROJECTS] });

      if (project) {
        toast.success('Project saved to cloud and locally');
      } else if (me.isLoggedIn) {
        // This means API failed but local save succeeded
        // Toast already shown in the catch block above
      } else {
        toast.success('Project saved locally');
      }

      onSuccess?.();
    },
    onError: (error) => {
      // Dispatch save end event even on error
      window.dispatchEvent(new CustomEvent('project-save-end'));

      console.error('Save failed:', error);
      toast.error('Failed to save project');
    }
  });
};
