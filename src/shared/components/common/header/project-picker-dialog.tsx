'use client';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';

import { useProjectDuplicate } from '../../../../modules/project/hooks/use-project-duplicate';
import type { Project } from '../../../../modules/project/interfaces/project.interface';
import { ProjectService } from '../../../../modules/project/services/project.service';
import { QueryKeys } from '../../../constants/query-keys';
import { Image } from '../image';
import { Pagination } from '../pagination';

interface ProjectPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelect: (project: Project) => void;
}

export const ProjectPickerDialog = ({ isOpen, onClose, onProjectSelect }: ProjectPickerDialogProps) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const duplicateProject = useProjectDuplicate();

  const options = {
    limit: 6,
    sortBy: 'updatedAt' as const,
    sortOrder: 'desc' as const,
    search: query,
    page
  };

  const myProjects = useQuery({
    queryKey: [QueryKeys.PROJECTS, options],
    queryFn: () => ProjectService.getMy(options),
    enabled: isOpen
  });

  const handleProjectSelect = (project: Project) => {
    duplicateProject.mutate(project, {
      onSuccess: () => {
        onProjectSelect(project);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose Project to Duplicate</DialogTitle>
          <DialogDescription>Select a project to use as a template for your new project.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden p-2">
          <Input placeholder="Search projects..." value={query} onChange={(e) => setQuery(e.target.value)} />

          <div className="flex-1 overflow-auto">
            {myProjects.isLoading && <div className="text-center text-muted-foreground py-8">Loading projects...</div>}

            {myProjects.data?.items.length === 0 && !myProjects.isLoading && (
              <div className="text-center text-muted-foreground py-8">
                No projects found. Create your first project to get started!
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              {myProjects.data?.items.map((project) => (
                <Button
                  key={project.id}
                  unstyled
                  onClick={() => handleProjectSelect(project)}
                  disabled={duplicateProject.isPending}
                  className={cn(
                    'group cursor-pointer rounded-lg border border-transparent p-3 hover:border-primary hover:shadow-md transition-all hover:bg-muted',
                    duplicateProject.isPending && 'opacity-50'
                  )}>
                  <div className="aspect-video rounded-lg overflow-hidden border mb-2">
                    <Image
                      alt=""
                      wrapperClassName="size-full aspect-video"
                      src={project.previewUrl || '/placeholder.svg'}
                    />
                  </div>
                  <div className="text-start space-y-1">
                    <h3 className="text-sm font-medium truncate">{project.name}</h3>
                    <p className="text-xs text-muted-foreground">{`Created ${dayjs(project.createdAt).fromNow()}`}</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {myProjects.data && myProjects.data.meta.totalPages > 1 && (
            <Pagination
              currentPage={myProjects.data?.meta.currentPage || 1}
              totalPages={myProjects.data?.meta.totalPages || 1}
              onPageChange={setPage}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
