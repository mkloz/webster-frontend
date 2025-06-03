import { Download } from 'lucide-react';

import { ExportTab } from '../../../../modules/canvas/components/canvas-settings/export-tab';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';

export const ExportProjectDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Download className="size-5" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Project</DialogTitle>
          <DialogDescription>Choose your export format and settings.</DialogDescription>
        </DialogHeader>
        <ExportTab />
      </DialogContent>
    </Dialog>
  );
};
