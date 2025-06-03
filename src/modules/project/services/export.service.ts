import { jsPDF } from 'jspdf';
import type Konva from 'konva';

export interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf' | 'json';
  quality: number;
  width: number;
  height: number;
  scale?: number;
}

interface StageState {
  width: number;
  height: number;
  scale: { x: number; y: number };
  position: { x: number; y: number };
}

export class ExportService {
  static async exportCanvas(stage: Konva.Stage, name: string, options: ExportOptions): Promise<void> {
    const { format, quality, width, height, scale = 1 } = options;
    try {
      switch (format) {
        case 'png':
          this.downloadFile(await this.exportAsPNG(stage, { quality, width, height, scale }), `${name}.png`);
          break;
        case 'jpg':
          this.downloadFile(await this.exportAsJPG(stage, { quality, width, height, scale }), `${name}.jpg`);
          break;
        case 'pdf':
          await this.exportAsPDF(stage, name, { width, height, scale });
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Failed to export as ${format.toUpperCase()}`);
    }
  }

  static async exportAsPNG(
    stage: Konva.Stage,
    options: { quality: number; width: number; height: number; scale: number }
  ) {
    const { width, height, scale, quality } = options;
    const originalState = this.saveStageState(stage);

    try {
      this.prepareStageForExport(stage, width, height);
      return stage.toDataURL({
        mimeType: 'image/png',
        quality: quality / 100,
        pixelRatio: scale,
        width,
        height
      });
    } finally {
      this.restoreStageState(stage, originalState);
    }
  }

  static async exportAsJPG(
    stage: Konva.Stage,
    options: { quality: number; width: number; height: number; scale: number }
  ) {
    const { width, height, scale, quality } = options;
    const originalState = this.saveStageState(stage);

    try {
      this.prepareStageForExport(stage, width, height);
      return stage.toDataURL({
        mimeType: 'image/jpeg',
        quality: quality / 100,
        pixelRatio: scale,
        width,
        height
      });
    } finally {
      this.restoreStageState(stage, originalState);
    }
  }

  static async exportAsPDF(
    stage: Konva.Stage,
    name: string,
    options: { width: number; height: number; scale: number }
  ): Promise<void> {
    const { width, height, scale } = options;
    const originalState = this.saveStageState(stage);

    try {
      this.prepareStageForExport(stage, width, height);
      const dataURL = stage.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: scale,
        width,
        height
      });
      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height]
      });
      pdf.addImage(dataURL, 'PNG', 0, 0, width, height);
      pdf.save(`${name}.pdf`);
    } finally {
      this.restoreStageState(stage, originalState);
    }
  }

  static downloadFile(dataURL: string, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static saveStageState(stage: Konva.Stage): StageState {
    return {
      width: stage.width(),
      height: stage.height(),
      scale: { x: stage.scaleX(), y: stage.scaleY() },
      position: { x: stage.x(), y: stage.y() }
    };
  }

  static prepareStageForExport(stage: Konva.Stage, width: number, height: number): void {
    stage.width(width);
    stage.height(height);
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    stage.batchDraw();
  }

  private static restoreStageState(stage: Konva.Stage, originalState: StageState): void {
    stage.width(originalState.width);
    stage.height(originalState.height);
    stage.scale(originalState.scale);
    stage.position(originalState.position);
    stage.batchDraw();
  }

  static getOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth = 4096,
    maxHeight = 4096
  ): { width: number; height: number; scale: number } {
    const aspectRatio = originalWidth / originalHeight;
    let width = originalWidth;
    let height = originalHeight;
    let scale = 1;

    if (width > maxWidth || height > maxHeight) {
      if (aspectRatio > 1) {
        width = Math.min(maxWidth, width);
        height = width / aspectRatio;
      } else {
        height = Math.min(maxHeight, height);
        width = height * aspectRatio;
      }
      scale = width / originalWidth;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
      scale
    };
  }
}
