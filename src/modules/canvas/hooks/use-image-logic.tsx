'use client';

import type { KonvaEventObject } from 'konva/lib/Node';
import type React from 'react';
import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

import { useCanvasStore } from '@/shared/store/canvas-store';

import { FileUploadService } from '../../project/services/file-upload.service';
import type { Shape } from './shapes-store';
import { useShapesStore } from './shapes-store';
import { useToolOptionsStore } from './tool-optios-store';
import { useCanvasHistory } from './use-canvas-history';

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Supported image formats
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

interface ImageLogicProps {
  position: { x: number; y: number };
  scale: number;
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
}

export const useImageLogic = ({ setShapes }: ImageLogicProps) => {
  const { width, height } = useCanvasStore();
  const { setToolOptions } = useToolOptionsStore();
  const { selectedShapeIds, setSelectedShapeIds, updateShape } = useShapesStore();
  const { saveToHistory } = useCanvasHistory();
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Load an image from a URL with proper error handling
  const loadImage = useCallback((url: string): Promise<HTMLImageElement> => {
    // Check if image is already in cache
    if (imageCache.current.has(url)) {
      return Promise.resolve(imageCache.current.get(url)!);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Handle CORS

      img.onload = () => {
        // Add to cache
        imageCache.current.set(url, img);
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image from ${url}`));
      };

      img.src = url;
    });
  }, []);

  // Upload image to server and get URL
  const uploadImageToServer = useCallback(
    async (file: File): Promise<{ url: string; element: HTMLImageElement }> => {
      try {
        // Upload to server
        const uploadResult = await FileUploadService.upload(file);

        // Load the image element from the server URL
        const imageElement = await loadImage(uploadResult.url);

        return {
          url: uploadResult.url,
          element: imageElement
        };
      } catch (error) {
        console.error('Failed to upload image to server:', error);
        throw error;
      }
    },
    [loadImage]
  );

  // Add a function to place an image in the center of the canvas
  const placeImageInCenter = useCallback(
    (imageElement: HTMLImageElement, url: string) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const imageId = Date.now().toString();

      // Calculate size while maintaining aspect ratio
      const maxSize = Math.min(width, height) * 0.8;
      const aspectRatio = imageElement.naturalWidth / imageElement.naturalHeight;

      let imageWidth = imageElement.naturalWidth;
      let imageHeight = imageElement.naturalHeight;

      // Scale down large images
      if (imageWidth > maxSize || imageHeight > maxSize) {
        if (aspectRatio > 1) {
          imageWidth = maxSize;
          imageHeight = maxSize / aspectRatio;
        } else {
          imageHeight = maxSize;
          imageWidth = maxSize * aspectRatio;
        }
      }

      // Create new image shape with server URL
      const newImage: Shape = {
        id: imageId,
        type: 'image',
        x: centerX,
        y: centerY,
        size: Math.max(imageWidth, imageHeight),
        width: imageWidth,
        height: imageHeight,
        originalWidth: imageElement.naturalWidth,
        originalHeight: imageElement.naturalHeight,
        imageUrl: url, // Use server URL
        imageElement: imageElement,
        color: 'transparent',
        opacity: 1,
        flipX: false,
        flipY: false,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        cropActive: false
      };

      // Add to shapes
      setShapes((prevShapes) => [...prevShapes, newImage]);

      // Select the new image
      setSelectedShapeIds([imageId]);
      setToolOptions('image', { selectedImageId: imageId });

      // Save to history
      saveToHistory('Place image');

      // Show success message
      toast.success('Image added to canvas');
    },
    [width, height, setShapes, setSelectedShapeIds, setToolOptions, saveToHistory]
  );

  // Handle file upload
  const handleImageUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];

      // Validate file type
      if (!SUPPORTED_FORMATS.includes(file.type)) {
        toast.error('Unsupported file format. Please use JPG, PNG, GIF, WebP, or SVG.');
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File is too large. Maximum size is 5MB.');
        return;
      }

      try {
        setToolOptions('image', { isUploading: true, uploadProgress: 10 });

        // Upload to server and get URL + element
        const { url, element } = await uploadImageToServer(file);

        setToolOptions('image', { isUploading: false, uploadProgress: 100 });

        // Automatically place image in center
        placeImageInCenter(element, url);

        setTimeout(() => {
          setToolOptions('image', { uploadProgress: 0 });
        }, 1000);
      } catch (error) {
        setToolOptions('image', { isUploading: false, uploadProgress: 0 });
        toast.error('Failed to upload image. Please try again.');
        console.error(error);
      }
    },
    [uploadImageToServer, setToolOptions, placeImageInCenter]
  );

  // Handle URL import
  const handleImageUrlImport = useCallback(
    async (url: string) => {
      if (!url) return;

      try {
        setToolOptions('image', { isUploading: true, uploadProgress: 10 });

        // First, try to load the image to validate it
        const tempImg = new Image();
        tempImg.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          tempImg.onload = resolve;
          tempImg.onerror = reject;
          tempImg.src = url;
        });

        setToolOptions('image', { uploadProgress: 50 });

        // Convert the loaded image to a file and upload to our server
        const canvas = document.createElement('canvas');
        canvas.width = tempImg.naturalWidth;
        canvas.height = tempImg.naturalHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        ctx.drawImage(tempImg, 0, 0);

        // Convert to blob and then to file
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          }, 'image/png');
        });

        const file = new File([blob], 'imported-image.png', { type: 'image/png' });

        // Upload to our server
        const { url: serverUrl, element } = await uploadImageToServer(file);

        setToolOptions('image', { isUploading: false, uploadProgress: 100 });

        // Automatically place image in center
        placeImageInCenter(element, serverUrl);

        setTimeout(() => {
          setToolOptions('image', { uploadProgress: 0 });
        }, 1000);
      } catch (error) {
        setToolOptions('image', { isUploading: false, uploadProgress: 0 });
        toast.error('Failed to load image. Please check the URL and try again.');
        console.error(error);
      }
    },
    [uploadImageToServer, setToolOptions, placeImageInCenter]
  );

  // Handle mouse down for selecting existing images
  const handleImageMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const imageId = e.target.id();
      if (imageId) {
        // Select the image element
        setSelectedShapeIds([imageId]);
        setToolOptions('image', { selectedImageId: imageId });
        e.cancelBubble = true;
        return;
      }

      // If clicking on empty space, deselect
      if (e.target === e.currentTarget) {
        setSelectedShapeIds([]);
        setToolOptions('image', { selectedImageId: null });
      }
    },
    [setSelectedShapeIds, setToolOptions]
  );

  // Handle image flipping
  const handleFlipImage = useCallback(
    (axis: 'horizontal' | 'vertical') => {
      const selectedImageId = selectedShapeIds[0];
      if (!selectedImageId) return;

      const shape = useShapesStore.getState().shapes.find((s) => s.id === selectedImageId);
      if (!shape || shape.type !== 'image') return;

      if (axis === 'horizontal') {
        const newFlipX = !shape.flipX;
        updateShape(selectedImageId, { flipX: newFlipX });
      } else {
        const newFlipY = !shape.flipY;
        updateShape(selectedImageId, { flipY: newFlipY });
      }

      // Save to history
      saveToHistory(`Flip image ${axis}`);
    },
    [selectedShapeIds, updateShape, saveToHistory]
  );

  // Handle opacity change
  const handleOpacityChange = useCallback(
    (opacity: number) => {
      const selectedImageId = selectedShapeIds[0];
      if (!selectedImageId) return;

      updateShape(selectedImageId, { opacity });
    },
    [selectedShapeIds, updateShape]
  );

  // Handle crop toggle
  const handleToggleCrop = useCallback(() => {
    const selectedImageId = selectedShapeIds[0];
    if (!selectedImageId) return;

    const shape = useShapesStore.getState().shapes.find((s) => s.id === selectedImageId);
    if (!shape || shape.type !== 'image') return;

    const newCropActive = !shape.cropActive;

    if (newCropActive) {
      // Enable crop mode on the selected image
      updateShape(selectedImageId, {
        cropActive: true,
        // Initialize crop values if not already set
        cropX: shape.cropX ?? 0,
        cropY: shape.cropY ?? 0,
        cropWidth: shape.cropWidth ?? shape.originalWidth,
        cropHeight: shape.cropHeight ?? shape.originalHeight
      });
      toast.info('Crop mode enabled. Use transform handles to adjust the crop area.');
    } else {
      // Disable crop mode
      updateShape(selectedImageId, { cropActive: false });
      toast.info('Crop mode disabled.');
    }

    // Save to history
    saveToHistory(newCropActive ? 'Enable crop mode' : 'Disable crop mode');
  }, [selectedShapeIds, updateShape, saveToHistory]);

  // Clean up function to revoke object URLs when component unmounts
  const cleanup = useCallback(() => {
    // Clear image cache
    imageCache.current.clear();
  }, []);

  return {
    handleImageUpload,
    handleImageUrlImport,
    handleImageMouseDown,
    handleFlipImage,
    handleOpacityChange,
    handleToggleCrop,
    pendingImage: null, // We no longer need the pendingImage since we place directly
    cleanup,
    placeImageInCenter
  };
};
