'use client';

import {
  FileImage,
  FlipHorizontal,
  FlipVertical,
  ImageIcon,
  Loader2,
  MoveDown,
  MoveUp,
  RotateCw,
  Scissors,
  Search,
  Trash2
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { EnhancedSlider } from '../../../../shared/components/common/enhanced-slider';
import { Button } from '../../../../shared/components/ui/button';
import { Input } from '../../../../shared/components/ui/input';
import { Label } from '../../../../shared/components/ui/label';
import { Progress } from '../../../../shared/components/ui/progress';
import { Separator } from '../../../../shared/components/ui/separator';
import { Switch } from '../../../../shared/components/ui/switch';
import { useShapesStore } from '../../hooks/shapes-store';
import { useToolOptionsStore } from '../../hooks/tool-optios-store';
import { ImageSearchDialog } from './image-search-dialog';

export const ImageOptions = () => {
  const { image, setToolOptions } = useToolOptionsStore();
  const { selectedImageId, isUploading, uploadProgress } = image;
  const { shapes, updateShape, selectedShapeIds, setShapes } = useShapesStore();
  const [imageUrl, setImageUrl] = useState('');
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Find the selected image shape if any
  const selectedImage = selectedImageId
    ? shapes.find((shape) => shape.id === selectedImageId && shape.type === 'image')
    : selectedShapeIds.length === 1
      ? shapes.find((shape) => shape.id === selectedShapeIds[0] && shape.type === 'image')
      : null;

  // Update local state when selection changes
  useEffect(() => {
    if (selectedImage) {
      setToolOptions('image', {
        selectedImageId: selectedImage.id,
        opacity: selectedImage.opacity || 1,
        flipX: selectedImage.flipX || false,
        flipY: selectedImage.flipY || false,
        cropActive: selectedImage.cropActive || false
      });
    } else {
      setToolOptions('image', {
        selectedImageId: null,
        flipX: false,
        flipY: false,
        cropActive: false
      });
    }
  }, [selectedImage, setToolOptions]);

  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Create a custom event to trigger image upload
    const uploadEvent = new CustomEvent('imageUpload', {
      detail: { files: e.target.files }
    });
    window.dispatchEvent(uploadEvent);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Handle URL import
  const handleUrlImport = useCallback(() => {
    if (!imageUrl) {
      toast.error('Please enter an image URL');
      return;
    }

    // Create a custom event to trigger image URL import
    const importEvent = new CustomEvent('imageUrlImport', {
      detail: { url: imageUrl }
    });
    window.dispatchEvent(importEvent);

    // Reset the input
    setImageUrl('');
  }, [imageUrl]);

  // Handle image search selection
  const handleSearchImageSelect = useCallback((imageUrl: string) => {
    // Create a custom event to trigger image URL import
    const importEvent = new CustomEvent('imageUrlImport', {
      detail: { url: imageUrl }
    });
    window.dispatchEvent(importEvent);
  }, []);

  // Handle opacity change
  const handleOpacityChange = useCallback((value: number) => {
    // Create a custom event to trigger opacity change
    const opacityEvent = new CustomEvent('imageOpacityChange', {
      detail: { opacity: value / 100 }
    });
    window.dispatchEvent(opacityEvent);
  }, []);

  // Handle flip
  const handleFlip = useCallback((axis: 'horizontal' | 'vertical') => {
    // Create a custom event to trigger image flip
    const flipEvent = new CustomEvent('imageFlip', {
      detail: { axis }
    });
    window.dispatchEvent(flipEvent);
  }, []);

  // Handle crop toggle
  const handleToggleCrop = useCallback(() => {
    // Create a custom event to trigger crop toggle
    const cropEvent = new CustomEvent('imageCropToggle', {});
    window.dispatchEvent(cropEvent);
  }, []);

  // Set up drag and drop
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('border-primary', 'bg-primary/10');
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('border-primary', 'bg-primary/10');
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('border-primary', 'bg-primary/10');

      if (e.dataTransfer?.files) {
        // Create a custom event to trigger image upload
        const uploadEvent = new CustomEvent('imageUpload', {
          detail: { files: e.dataTransfer.files }
        });
        window.dispatchEvent(uploadEvent);
      }
    };

    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    return () => {
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <h3 className="text-sm font-medium text-foreground mb-2">Image Tool</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Upload an image or paste a URL</li>
          <li>• Image will be added to the canvas </li>
          <li>• Click on an image to select and edit it</li>
        </ul>
      </div>

      {/* Upload Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Upload Image</h3>

        {/* Drag & Drop Zone */}
        <div
          ref={dropZoneRef}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center transition-colors">
          <FileImage className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">Drag & drop an image here</p>
          <p className="text-xs text-muted-foreground mb-3">Supports JPG, PNG, GIF, WebP, SVG (max 5MB)</p>

          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FileImage className="h-4 w-4 mr-2" />
                Select File
              </>
            )}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-1">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-right text-muted-foreground">{uploadProgress}%</p>
          </div>
        )}
      </div>

      <Separator />

      {/* URL Import and Search */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Import Image</h3>

        {/* URL Input */}
        <div className="flex gap-2 justify-center items-center">
          <Input
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            className="flex-1"
            wrapperClassName="w-full"
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={isUploading}
          />
          <Button variant="outline" size="icon-sm" onClick={handleUrlImport} disabled={isUploading || !imageUrl}>
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Button */}
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={() => setIsSearchDialogOpen(true)}
          disabled={isUploading}>
          <Search className="h-4 w-4" />
          Search Free Images
        </Button>
      </div>

      {selectedImage ? (
        <>
          <Separator />

          {/* Image Preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Selected Image</h3>
            <div className="relative aspect-video bg-muted/50 rounded-md overflow-hidden flex items-center justify-center">
              {selectedImage.imageElement ? (
                <canvas
                  ref={(canvas) => {
                    if (canvas && selectedImage.imageElement) {
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        // Set canvas size to match container
                        const containerRect = canvas.parentElement?.getBoundingClientRect();
                        if (containerRect) {
                          canvas.width = containerRect.width;
                          canvas.height = containerRect.height;

                          // Clear canvas
                          ctx.clearRect(0, 0, canvas.width, canvas.height);

                          // Calculate scaling to fit image in container while maintaining aspect ratio
                          const img = selectedImage.imageElement;
                          const containerAspect = canvas.width / canvas.height;
                          const imageAspect = img.width / img.height;

                          let drawWidth, drawHeight, drawX, drawY;

                          if (imageAspect > containerAspect) {
                            // Image is wider than container
                            drawWidth = canvas.width;
                            drawHeight = canvas.width / imageAspect;
                            drawX = 0;
                            drawY = (canvas.height - drawHeight) / 2;
                          } else {
                            // Image is taller than container
                            drawHeight = canvas.height;
                            drawWidth = canvas.height * imageAspect;
                            drawX = (canvas.width - drawWidth) / 2;
                            drawY = 0;
                          }

                          // Apply transformations
                          ctx.save();
                          ctx.globalAlpha = selectedImage.opacity || 1;

                          // Move to center for flipping
                          ctx.translate(drawX + drawWidth / 2, drawY + drawHeight / 2);

                          // Apply flips
                          ctx.scale(selectedImage.flipX ? -1 : 1, selectedImage.flipY ? -1 : 1);

                          // Draw image centered
                          ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

                          ctx.restore();
                        }
                      }
                    }
                  }}
                  className="w-full h-full"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              ) : selectedImage.imageUrl ? (
                <img
                  src={selectedImage.imageUrl || '/placeholder.svg'}
                  alt="Selected"
                  className="max-h-full max-w-full object-contain"
                  style={{
                    transform: `${selectedImage.flipX ? 'scaleX(-1)' : ''} ${selectedImage.flipY ? 'scaleY(-1)' : ''}`,
                    opacity: selectedImage.opacity || 1
                  }}
                />
              ) : (
                <div className="text-sm text-muted-foreground">Loading image...</div>
              )}
            </div>
            {selectedImage.originalWidth && selectedImage.originalHeight && (
              <div className="text-xs text-muted-foreground">
                {selectedImage.originalWidth} × {selectedImage.originalHeight} px
              </div>
            )}
          </div>

          <Separator />

          {/* Image Properties */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-foreground">Properties</h3>

            {/* Opacity */}
            <div className="mb-4">
              <Label className="text-xs text-muted-foreground mb-2 block">Opacity</Label>
              <EnhancedSlider
                value={[(selectedImage.opacity || 1) * 100]}
                min={10}
                max={100}
                step={1}
                displayFormat={{ type: 'percentage' }}
                labels={{
                  min: '10%',
                  max: '100%'
                }}
                onValueChange={([value]) => handleOpacityChange(value)}
              />
            </div>

            {/* Flip Controls */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant={selectedImage.flipX ? 'default' : 'outline'}
                size="sm"
                className="flex items-center justify-center gap-2"
                onClick={() => handleFlip('horizontal')}>
                <FlipHorizontal className="h-4 w-4" />
                Flip H
              </Button>
              <Button
                variant={selectedImage.flipY ? 'default' : 'outline'}
                size="sm"
                className="flex items-center justify-center gap-2"
                onClick={() => handleFlip('vertical')}>
                <FlipVertical className="h-4 w-4" />
                Flip V
              </Button>
            </div>

            {/* Crop Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Crop Mode</span>
              </div>
              <Switch checked={selectedImage.cropActive || false} onCheckedChange={handleToggleCrop} />
            </div>

            {selectedImage.cropActive && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Crop mode is active. Use the transform handles to adjust the crop area.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-foreground">Actions</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    if (selectedImage) {
                      // Find current index
                      const currentIndex = shapes.findIndex((s) => s.id === selectedImage.id);
                      if (currentIndex < shapes.length - 1) {
                        // Move to front (end of array)
                        const newShapes = [...shapes];
                        const [shape] = newShapes.splice(currentIndex, 1);
                        newShapes.push(shape);
                        setShapes(newShapes);
                        toast.success('Image brought to front');
                      }
                    }
                  }}>
                  <MoveUp className="h-4 w-4 mr-1" />
                  To Front
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    if (selectedImage) {
                      // Find current index
                      const currentIndex = shapes.findIndex((s) => s.id === selectedImage.id);
                      if (currentIndex > 0) {
                        // Move to back (beginning of array)
                        const newShapes = [...shapes];
                        const [shape] = newShapes.splice(currentIndex, 1);
                        newShapes.unshift(shape);
                        setShapes(newShapes);
                        toast.success('Image sent to back');
                      }
                    }
                  }}>
                  <MoveDown className="h-4 w-4 mr-1" />
                  To Back
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-full"
                onClick={() => {
                  if (selectedImage.rotation) {
                    updateShape(selectedImage.id, {
                      rotation: ((selectedImage.rotation || 0) + 90) % 360
                    });
                  } else {
                    updateShape(selectedImage.id, { rotation: 90 });
                  }
                }}>
                <RotateCw className="h-4 w-4 mr-2" />
                Rotate 90°
              </Button>

              <Button
                variant="destructive"
                size="sm"
                className="w-full rounded-full"
                onClick={() => {
                  if (selectedImage) {
                    // Remove the image from shapes
                    setShapes((prevShapes) => prevShapes.filter((shape) => shape.id !== selectedImage.id));
                    // Clear selection
                    setToolOptions('image', { selectedImageId: null });
                    toast.success('Image deleted');
                  }
                }}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Image
              </Button>
            </div>
          </div>

          <Separator />
        </>
      ) : (
        <div className="p-4 text-center text-sm text-muted-foreground rounded-md border border-dashed mt-4">
          No image selected. Upload an image and click on the canvas to place it, or click on an existing image to
          select it.
        </div>
      )}

      {/* Image Search Dialog */}
      <ImageSearchDialog
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
        onImageSelect={handleSearchImageSelect}
      />
    </div>
  );
};
