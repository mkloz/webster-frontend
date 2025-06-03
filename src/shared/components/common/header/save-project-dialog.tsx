'use client';

import { Cloud, Download, HardDrive, Save } from 'lucide-react';
import { type FC, useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';

import { useAuth } from '../../../../modules/auth/queries/use-auth.query';
import { useSelectedProjectId } from '../../../../modules/project/hooks/use-current-project';
import { useProjectPersistence } from '../../../../modules/project/hooks/use-project-persistence';
import { useProjectSave } from '../../../../modules/project/hooks/use-project-save';
import { useCanvasStore } from '../../../../shared/store/canvas-store';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

export const SaveProjectDialog: FC = () => {
  const [open, setOpen] = useState(false);
  const { name, setName } = useCanvasStore();
  const [localName, setLocalName] = useState('');
  const { id } = useSelectedProjectId();
  const me = useAuth();

  const { exportToFile, isLoading: persistenceLoading } = useProjectPersistence();
  const saveProjectMutation = useProjectSave(() => setOpen(false));

  // Sync local state with canvas store when dialog opens or name changes
  useEffect(() => {
    setLocalName(name || 'My Design');
  }, [name, open]);

  const handleSave = async () => {
    if (!localName.trim()) return;

    const finalName = localName.trim();
    setName(finalName); // Update canvas store immediately

    try {
      await saveProjectMutation.mutateAsync(finalName);
    } catch (error) {
      // Error is already handled in the mutation
      console.error('Save error:', error);
    }
  };

  const handleExportFile = async () => {
    if (!localName.trim()) return;

    const finalName = localName.trim();
    await exportToFile(finalName);
    setName(finalName);
    setOpen(false);
  };

  const handleNameChange = (value: string) => {
    setLocalName(value);
    // Also update the canvas store immediately for real-time sync
    setName(value);
  };

  const isLoading = saveProjectMutation.isPending || persistenceLoading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={'sm'}>
          <Save />
          Save
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Project</DialogTitle>
          <DialogDescription>
            {me.isLoggedIn
              ? id
                ? 'Update your project in the cloud and locally.'
                : 'Save your project to the cloud and locally.'
              : 'Save your project locally or export as a file.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="save-name">Project Name</Label>
            <Input
              id="save-name"
              value={localName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My Awesome Design"
            />
          </div>

          {me.isLoggedIn && (
            <div className="text-sm text-muted-foreground">
              {id ? (
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  <span>This will update your existing cloud project</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  <span>This will create a new cloud project</span>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleExportFile} disabled={!localName.trim() || isLoading}>
            <Download />
            Export File
          </Button>

          <Button className="ml-auto" onClick={handleSave} disabled={!localName.trim() || isLoading}>
            {me.isLoggedIn ? <Cloud /> : <HardDrive />}
            {isLoading ? 'Saving...' : me.isLoggedIn ? (id ? 'Update' : 'Save to Cloud') : 'Save Locally'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
