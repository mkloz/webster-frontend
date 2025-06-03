'use client';

import { UploadCloud } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { ConfirmModal } from '../../../../shared/components/common/confirm-modal';
import { useCanvasStore } from '../../../../shared/store/canvas-store';
import { useShapesStore } from '../../../canvas/hooks/shapes-store';
import { useSelectedProjectId } from '../../hooks/use-current-project';
import { useProjectPersistence } from '../../hooks/use-project-persistence';

export const UploadProject = () => {
  const { setName } = useCanvasStore();
  const { shapes } = useShapesStore();
  const { importFromFile } = useProjectPersistence();
  const { setId } = useSelectedProjectId();
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const hasUnsavedWork = shapes.length > 0;

  const handleImport = async (file: File) => {
    setName(file.name.replace('.json', ''));
    setId(null); // Clear the current project ID to avoid conflicts
    try {
      await importFromFile(file);
    } catch (error) {
      console.error('Failed to import project:', error);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Check if there's unsaved work
      if (hasUnsavedWork) {
        setPendingFile(file);
        setShowImportConfirm(true);
        return;
      }

      // No unsaved work, import directly
      await handleImport(file);
    },
    [hasUnsavedWork]
  );

  const handleConfirmImport = async () => {
    if (pendingFile) {
      await handleImport(pendingFile);
    }
    setShowImportConfirm(false);
    setPendingFile(null);
  };

  const handleCancelImport = () => {
    setShowImportConfirm(false);
    setPendingFile(null);
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/json': ['.json']
    }
  });

  return (
    <>
      <div
        {...getRootProps()}
        className={`group relative w-full flex flex-col items-center justify-center px-6 py-12 border-2 border-dashed rounded-xl transition-colors duration-200 h-11/12
          ${
            isDragReject
              ? 'border-destructive/70 bg-red-200/20'
              : isDragActive
                ? 'border-primary bg-muted/40'
                : 'border-border hover:border-primary/40 hover:bg-muted/20'
          }`}>
        <input {...getInputProps()} />

        <UploadCloud className="w-10 h-10 text-muted-foreground group-hover:text-primary mb-4 transition-colors" />

        <div className="text-center space-y-1">
          <h3 className="text-base font-medium">{isDragActive ? 'Release to upload' : 'Drag & Drop your file'}</h3>
          <p className="text-sm text-muted-foreground">or click to browse from your device</p>
        </div>
      </div>

      <ConfirmModal
        isOpen={showImportConfirm}
        onClose={handleCancelImport}
        onConfirm={handleConfirmImport}
        title="Import Project?"
        description="Any unsaved changes to your current project will be lost. Are you sure you want to continue?"
        confirmText="Import Project"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
};
