import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { QueryKeys } from '../../../shared/constants/query-keys';
import { ProjectService } from '../services/project.service';
import { useSelectedProjectId } from './use-current-project';

export const useProjectDelete = () => {
  const queryClient = useQueryClient();
  const { clearId } = useSelectedProjectId();

  return useMutation({
    mutationFn: (projectId: string) => ProjectService.delete(projectId),
    onSuccess: (deletedProject) => {
      // Clear the current project if it was the one being deleted
      clearId();

      // Clear localStorage
      localStorage.removeItem('webster_current_project');

      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PROJECTS] });

      toast.success(`Project "${deletedProject.name}" deleted successfully`);
    },
    onError: (error) => {
      console.error('Failed to delete project:', error);
      toast.error(error?.message || 'Failed to delete project');
    }
  });
};
