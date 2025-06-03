import type { Shape } from '../../canvas/hooks/shapes-store';

// Interface for Konva Stage to replace 'any' types
interface KonvaStage {
  toDataURL: (options?: { mimeType?: string; quality?: number; pixelRatio?: number }) => string;
}

export interface ProjectSaveData {
  metadata: {
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    thumbnail?: string;
  };
  canvas: {
    width: number;
    height: number;
    background: string;
    opacity: number;
    showGrid: boolean;
    gridGap: number;
  };
  shapes: SerializedShape[];
}

export interface SerializedShape extends Omit<Shape, 'imageElement'> {
  imageData?: {
    src: string; // base64
    originalWidth: number;
    originalHeight: number;
  };
}

export interface CanvasState {
  width: number;
  height: number;
  background: string;
  opacity: number;
  showGrid: boolean;
  gridGap: number;
  setDimensions: (width: number, height: number) => void;
  setBackground: (color: string) => void;
  setOpacity: (opacity: number) => void;
  setShowGrid: (value: boolean) => void;
  setGridGap: (gap: number) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
}

export interface ShapesState {
  shapes: Shape[];
  setShapes: (shapes: Shape[] | ((prev: Shape[]) => Shape[])) => void;
  clearSelection: () => void;
}

export class ProjectSerializationService {
  /**
   * Serialize current application state to JSON
   */
  static async serializeProject(
    canvasState: CanvasState,
    shapesState: ShapesState,
    name: string,
    description = '',
    stageRef?: { current: KonvaStage }
  ): Promise<ProjectSaveData> {
    // Serialize shapes with image handling
    const serializedShapes = await Promise.all(shapesState.shapes.map((shape) => this.serializeShape(shape)));

    // Generate thumbnail if stage reference is provided
    let thumbnail: string | undefined;
    if (stageRef?.current) {
      thumbnail = await this.generateThumbnail(stageRef.current);
    }

    const saveData: ProjectSaveData = {
      metadata: {
        name,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        thumbnail
      },
      canvas: {
        width: canvasState.width,
        height: canvasState.height,
        background: canvasState.background,
        opacity: canvasState.opacity,
        showGrid: canvasState.showGrid,
        gridGap: canvasState.gridGap
      },
      shapes: serializedShapes
    };

    return saveData;
  }

  /**
   * Deserialize JSON data and restore application state
   */
  static async deserializeProject(
    saveData: ProjectSaveData,
    canvasState: CanvasState,
    shapesState: ShapesState
  ): Promise<void> {
    // Validate the save data structure
    if (!this.validateSaveData(saveData)) {
      throw new Error('Invalid project file format');
    }

    // Restore canvas state
    canvasState.setDimensions(saveData.canvas.width, saveData.canvas.height);
    canvasState.setBackground(saveData.canvas.background);
    canvasState.setOpacity(saveData.canvas.opacity);
    canvasState.setShowGrid(saveData.canvas.showGrid);
    canvasState.setGridGap(saveData.canvas.gridGap);
    canvasState.setName(saveData.metadata.name);
    canvasState.setDescription(saveData.metadata.description);

    // Restore shapes with image rehydration
    const rehydratedShapes = await Promise.all(saveData.shapes.map((shape) => this.deserializeShape(shape)));

    shapesState.setShapes(rehydratedShapes);
    shapesState.clearSelection();
  }

  /**
   * Serialize a single shape, handling images specially
   */
  private static async serializeShape(shape: Shape): Promise<SerializedShape> {
    const { imageElement, ...shapeWithoutImage } = shape;

    if (shape.type === 'image' && imageElement) {
      // Convert image to base64
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.width = imageElement.naturalWidth;
        canvas.height = imageElement.naturalHeight;
        ctx.drawImage(imageElement, 0, 0);

        const base64 = canvas.toDataURL('image/png');

        return {
          ...shapeWithoutImage,
          imageData: {
            src: base64,
            originalWidth: imageElement.naturalWidth,
            originalHeight: imageElement.naturalHeight
          }
        };
      }
    }

    return shapeWithoutImage as SerializedShape;
  }

  /**
   * Deserialize a single shape, rehydrating images
   */
  private static async deserializeShape(serializedShape: SerializedShape): Promise<Shape> {
    if (serializedShape.type === 'image' && serializedShape.imageData) {
      // Recreate image element from base64
      const imageElement = new Image();
      imageElement.crossOrigin = 'anonymous';

      return new Promise((resolve, reject) => {
        imageElement.onload = () => {
          const shape: Shape = {
            ...serializedShape,
            imageElement,
            originalWidth: serializedShape.imageData!.originalWidth,
            originalHeight: serializedShape.imageData!.originalHeight
          };
          // Remove serialized data - using underscore prefix to indicate intentionally unused
          const { imageData: _imageData, ...cleanShape } = shape as SerializedShape & {
            imageElement: HTMLImageElement;
          };
          resolve(cleanShape);
        };

        imageElement.onerror = () => {
          reject(new Error('Failed to load image from saved data'));
        };

        imageElement.src = serializedShape.imageData?.src || '';
      });
    }

    return serializedShape as Shape;
  }

  /**
   * Generate a thumbnail of the current canvas
   */
  private static async generateThumbnail(stage: KonvaStage): Promise<string> {
    try {
      return stage.toDataURL({
        mimeType: 'image/jpeg',
        quality: 0.3,
        pixelRatio: 0.2 // Small thumbnail
      });
    } catch (error) {
      console.warn('Failed to generate thumbnail:', error);
      return '';
    }
  }

  /**
   * Export project as downloadable JSON file
   */
  static async exportToFile(
    canvasState: CanvasState,
    shapesState: ShapesState,
    name: string,
    description?: string,
    stageRef?: { current: KonvaStage }
  ): Promise<void> {
    try {
      const saveData = await this.serializeProject(canvasState, shapesState, name, description, stageRef);
      const jsonString = JSON.stringify(saveData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export project:', error);
      throw new Error('Failed to export project to file');
    }
  }

  /**
   * Import project from uploaded JSON file
   */
  static async importFromFile(
    file: File,
    canvasState: CanvasState,
    shapesState: ShapesState
  ): Promise<ProjectSaveData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const jsonString = e.target?.result as string;
          const saveData: ProjectSaveData = JSON.parse(jsonString);

          // Validate the save data structure
          if (!this.validateSaveData(saveData)) {
            throw new Error('Invalid project file format');
          }

          await this.deserializeProject(saveData, canvasState, shapesState);
          resolve(saveData);
        } catch (error) {
          reject(new Error('Failed to parse project file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read project file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Validate save data structure
   */
  private static validateSaveData(data: unknown): data is ProjectSaveData {
    const obj = data as Record<string, unknown>;

    return (
      !!obj.metadata &&
      typeof obj.metadata === 'object' &&
      !!obj.canvas &&
      typeof obj.canvas === 'object' &&
      Array.isArray(obj.shapes)
    );
  }
}
