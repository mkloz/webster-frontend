import { apiClient } from '@/shared/api/api';
import type { UrlResponse } from '@/shared/types/url';

export class FileUploadService {
  static upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`file-upload`, { body: formData }).json<UrlResponse>();
  }

  /**
   * Upload image from canvas/base64 data
   */
  static async uploadFromDataURL(dataURL: string, filename = 'image.png'): Promise<UrlResponse> {
    // Convert data URL to blob
    const response = await fetch(dataURL);
    const blob = await response.blob();

    // Create file from blob
    const file = new File([blob], filename, { type: blob.type });

    return this.upload(file);
  }

  /**
   * Upload image from HTML image element
   */
  static async uploadFromImageElement(imageElement: HTMLImageElement, filename?: string): Promise<UrlResponse> {
    // Create canvas to convert image to blob
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;

    // Draw image to canvas
    ctx.drawImage(imageElement, 0, 0);

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from image'));
            return;
          }

          try {
            const file = new File([blob], filename || 'image.png', { type: blob.type });
            const result = await FileUploadService.upload(file);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        'image/png',
        0.9
      );
    });
  }
}
