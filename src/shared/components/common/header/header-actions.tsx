import { OpenProjectSheet } from '../../../../modules/project/pages/open-project-sheet';
import { NewProjectDialog } from './new-project-dialog';
import { SaveProjectDialog } from './save-project-dialog';
import { ShareProjectDialog } from './share-project-dialog';

export const HeaderActions = () => {
  return (
    <div className="flex items-center gap-2">
      <NewProjectDialog />
      <OpenProjectSheet />
      <SaveProjectDialog />
      <ShareProjectDialog />
    </div>
  );
};
