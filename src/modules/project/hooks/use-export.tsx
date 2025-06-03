import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useCanvasStore } from '@/shared/store/canvas-store';

import { Optional } from '../../../shared/types/interfaces';
import { useCanvasContext } from '../../canvas/hooks/use-canvas-context';
import type { ExportOptions } from '../services/export.service';
import { ExportService } from '../services/export.service';
import { useProjectPersistence } from './use-project-persistence';

function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

export const useExport = () => {
  const stageRef = useCanvasContext().stageRef;
  const { width, height, name } = useCanvasStore();
  const filename = name.replace(/\s+/g, '-').toLowerCase();
  const { exportToFile } = useProjectPersistence();
  const exportMutation = useMutation({
    mutationFn: async (options: Optional<ExportOptions, 'width' | 'height'>) => {
      if (!stageRef.current) {
        throw new Error('Canvas not found');
      }
      if (!options.format) {
        throw new Error('Export format is required');
      }

      // If exporting to file, use the persistence method
      if (options.format === 'json') {
        return exportToFile(filename);
      }

      // Get optimal dimensions if not specified
      const exportDimensions =
        options.width && options.height
          ? { width: options.width, height: options.height, scale: 1 }
          : ExportService.getOptimalDimensions(width, height);

      const exportOptions: ExportOptions = {
        ...options,
        ...exportDimensions
      };

      await ExportService.exportCanvas(stageRef.current, filename, exportOptions);
    },
    onSuccess: (_, variables) => {
      toast.success(`Successfully exported as ${variables.format.toUpperCase()}`);
    }
  });

  return {
    exportCanvas: exportMutation.mutate,
    isExporting: exportMutation.isPending,
    getPngImage: async (desiredWidth: number, desiredHeight: number) => {
      if (!stageRef.current) return;

      const scaleX = desiredWidth / width;
      const scaleY = desiredHeight / height;
      const scale = Math.min(scaleX, scaleY);

      const dataUrl = await ExportService.exportAsPNG(stageRef.current, {
        width,
        height,
        quality: 100,
        scale
      });

      return dataURLtoFile(dataUrl, `${filename}.png`);
    },

    stageRef
  };
};
