'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Button, buttonVariants } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

import { ConfirmModal } from '../../../../shared/components/common/confirm-modal';
import { Image } from '../../../../shared/components/common/image';
import { QueryKeys } from '../../../../shared/constants/query-keys';
import dayjs from '../../../../shared/lib/dayjs';
import { useShapesStore } from '../../../canvas/hooks/shapes-store';
import { useCurrentProject } from '../../hooks/use-current-project';
import { useProjectOpen } from '../../hooks/use-project-open';
import type { Project } from '../../interfaces/project.interface';
import { ProjectService } from '../../services/project.service';

interface RecentProjectsProps {
  onProjectOpen?: () => void;
}

export const RecentProjects = ({ onProjectOpen }: RecentProjectsProps) => {
  const { currentProjectId, hasHydrated } = useCurrentProject();
  const { shapes } = useShapesStore();
  const [showOpenConfirm, setShowOpenConfirm] = useState(false);
  const [selectedProjectToOpen, setSelectedProjectToOpen] = useState<Project | null>(null);

  const myProjects = useQuery({
    queryKey: [QueryKeys.PROJECTS],
    queryFn: () =>
      ProjectService.getMy({
        limit: 8,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      }),
    enabled: hasHydrated // Only fetch after hydration
  });

  const openProjectMutation = useProjectOpen(onProjectOpen);

  const hasUnsavedWork = shapes.length > 0;

  const handleOpenProject = (project: Project) => {
    // Check if there's unsaved work
    if (hasUnsavedWork) {
      setSelectedProjectToOpen(project);
      setShowOpenConfirm(true);
      return;
    }

    // No unsaved work, open directly
    openProjectMutation.mutate(project);
  };

  const handleConfirmOpen = () => {
    if (selectedProjectToOpen) {
      openProjectMutation.mutate(selectedProjectToOpen);
    }
    setShowOpenConfirm(false);
    setSelectedProjectToOpen(null);
  };

  const handleCancelOpen = () => {
    setShowOpenConfirm(false);
    setSelectedProjectToOpen(null);
  };

  if (!hasHydrated) {
    return <div className="text-center text-muted-foreground py-4">Loading...</div>;
  }

  return (
    <>
      <div className="grid gap-2">
        {myProjects.data?.items.map((project) => {
          const isCurrentProject = project.id === currentProjectId;

          return (
            <Button
              key={project.id}
              unstyled
              onClick={() => handleOpenProject(project)}
              disabled={openProjectMutation.isPending}
              className={cn(
                'flex items-center gap-3 p-1 rounded-lg hover:bg-muted/70 border border-transparent hover:border-primary/30 cursor-pointer transition-all group w-full',
                isCurrentProject && 'border-primary bg-muted/50'
              )}>
              <Image
                alt=""
                wrapperClassName="size-12 rounded-md overflow-hidden border"
                src={project.previewUrl || '/placeholder.svg'}
              />
              <div className="min-w-0 text-start">
                <h3 className="text-sm font-medium truncate max-w-50">{project.name}</h3>
                <p className="text-xs text-muted-foreground">
                  Edited on {dayjs(project.updatedAt).format('MMM D, YYYY HH:mm A')}
                </p>
              </div>
              <div
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'group-hover:bg-gradient-to-r from-primary to-secondary group-hover:text-primary-foreground ml-auto',
                  openProjectMutation.isPending && 'opacity-50',
                  isCurrentProject && 'bg-primary text-primary-foreground'
                )}>
                {openProjectMutation.isPending ? 'Opening...' : isCurrentProject ? 'Current' : 'Open'}
              </div>
            </Button>
          );
        })}

        {myProjects.isLoading && (
          <div className="text-center text-muted-foreground py-4">Loading recent projects...</div>
        )}

        {myProjects.data?.items.length === 0 && !myProjects.isLoading && (
          <div className="text-center text-muted-foreground py-8">
            No recent projects found. Create your first project to get started!
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showOpenConfirm}
        onClose={handleCancelOpen}
        onConfirm={handleConfirmOpen}
        title="Open Project?"
        description="Any unsaved changes to your current project will be lost. Are you sure you want to continue?"
        confirmText="Open Project"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
};
