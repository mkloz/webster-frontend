'use client';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Trash2 } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';

import { Button, buttonVariants } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';

import { ConfirmModal } from '../../../../shared/components/common/confirm-modal';
import { Image } from '../../../../shared/components/common/image';
import { Pagination } from '../../../../shared/components/common/pagination';
import { QueryKeys } from '../../../../shared/constants/query-keys';
import { useShapesStore } from '../../../canvas/hooks/shapes-store';
import { useCurrentProject } from '../../hooks/use-current-project';
import { useProjectDelete } from '../../hooks/use-project-delete';
import { useProjectOpen } from '../../hooks/use-project-open';
import type { Project } from '../../interfaces/project.interface';
import { ProjectService } from '../../services/project.service';

interface MyProjectsProps {
  onProjectOpen?: () => void;
}

export const MyProjects = ({ onProjectOpen }: MyProjectsProps) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [showOpenConfirm, setShowOpenConfirm] = useState(false);
  const [selectedProjectToOpen, setSelectedProjectToOpen] = useState<Project | null>(null);
  const { currentProjectId, hasHydrated } = useCurrentProject();
  const { shapes } = useShapesStore();

  const options = useMemo(
    () => ({
      limit: 4,
      sortBy: 'updatedAt' as const,
      sortOrder: 'desc' as const,
      search: query,
      page
    }),
    [query, page]
  );

  const myProjects = useQuery({
    queryKey: [QueryKeys.PROJECTS, options],
    queryFn: () => ProjectService.getMy(options),
    enabled: hasHydrated // Only fetch after hydration
  });

  const openProjectMutation = useProjectOpen(onProjectOpen);
  const deleteProjectMutation = useProjectDelete();

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

  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation(); // Prevent opening the project
    setProjectToDelete(project);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setProjectToDelete(null);
  };

  if (!hasHydrated) {
    return <div className="text-center text-muted-foreground py-4">Loading...</div>;
  }

  return (
    <div className="grid gap-6">
      <Input placeholder="Search projects..." value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        {myProjects.data?.items.map((project) => {
          const isCurrentProject = project.id === currentProjectId;

          return (
            <div key={project.id} className="relative group">
              <Button
                unstyled
                onClick={() => handleOpenProject(project)}
                disabled={openProjectMutation.isPending}
                className={cn(
                  'cursor-pointer aspect-square rounded-lg border border-transparent p-2 hover:border-primary hover:shadow-md transition-all hover:bg-muted w-full',
                  isCurrentProject && 'border-primary bg-muted/50'
                )}>
                <div className="aspect-video rounded-lg overflow-hidden border">
                  <Image
                    alt=""
                    wrapperClassName="size-full aspect-video"
                    src={project.previewUrl || '/placeholder.svg'}
                  />
                </div>
                <div className="mt-1 grid gap-1 text-start">
                  <h3 className="text-sm font-medium truncate">{project.name}</h3>
                  <p className="text-xs text-muted-foreground">{`Created ${dayjs(project.createdAt).fromNow()}`}</p>
                  <div
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'xs' }),
                      'w-full group-hover:bg-gradient-to-r from-primary to-secondary group-hover:text-primary-foreground',
                      openProjectMutation.isPending && 'opacity-50',
                      isCurrentProject && 'bg-primary text-primary-foreground'
                    )}>
                    {openProjectMutation.isPending ? 'Opening...' : isCurrentProject ? 'Current' : 'Open'}
                  </div>
                </div>
              </Button>

              {/* Delete button positioned absolutely in top-right corner */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleDeleteClick(e, project)}
                disabled={deleteProjectMutation.isPending}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:border-destructive hover:text-destructive-foreground transition-all duration-200 z-100">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      {myProjects.isLoading && <div className="text-center text-muted-foreground">Loading projects...</div>}

      {myProjects.data?.items.length === 0 && !myProjects.isLoading && (
        <div className="text-center text-muted-foreground py-8">
          No projects found. Create your first project to get started!
        </div>
      )}

      {myProjects.data && myProjects.data.meta.totalPages > 1 && (
        <Pagination
          compact
          currentPage={myProjects.data?.meta.currentPage || 1}
          totalPages={myProjects.data?.meta.totalPages || 1}
          onPageChange={(newPage) => {
            setPage(newPage);
          }}
        />
      )}

      {/* Open project confirmation modal */}
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

      {/* Delete confirmation modal */}
      <ConfirmModal
        title="Delete Project"
        description={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone.`}
        isOpen={!!projectToDelete}
        isLoading={deleteProjectMutation.isPending}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
export default MyProjects;
