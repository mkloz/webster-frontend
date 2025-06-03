'use client';

import { useState } from 'react';
import { GrObjectGroup } from 'react-icons/gr';
import { LuEraser } from 'react-icons/lu';

import { ConfirmModal } from '../../../../shared/components/common/confirm-modal';
import { EnhancedSlider } from '../../../../shared/components/common/enhanced-slider';
import { Button } from '../../../../shared/components/ui/button';
import { Separator } from '../../../../shared/components/ui/separator';
import { useToolOptionsStore } from '../../hooks/tool-optios-store';

export const EraserOptions = () => {
  const eraserType = useToolOptionsStore((state) => state.eraser.eraserType);
  const eraserSize = useToolOptionsStore((state) => state.eraser.eraserSize);
  const eraserHardness = useToolOptionsStore((state) => state.eraser.eraserHardness);
  const setToolOptions = useToolOptionsStore((state) => state.setToolOptions);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const DEFAULT_ERASER_SIZE = 20;
  const DEFAULT_ERASER_HARDNESS = 100;

  const handleEraserTypeChange = (type: 'pixel' | 'object') => {
    setToolOptions('eraser', { eraserType: type });
  };

  const handleSizeChange = (values: number[]) => {
    setToolOptions('eraser', { eraserSize: values[0] });
  };

  const handleHardnessChange = (values: number[]) => {
    setToolOptions('eraser', { eraserHardness: values[0] });
  };

  const handleConfirmReset = () => {
    setToolOptions('eraser', {
      eraserSize: DEFAULT_ERASER_SIZE,
      eraserHardness: DEFAULT_ERASER_HARDNESS
    });
    setShowResetConfirm(false);
  };

  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  const previewSize = Math.min(Math.max(eraserSize, 10), 100);

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Eraser Type</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={eraserType === 'pixel' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleEraserTypeChange('pixel')}>
              <LuEraser />
              Pixel
            </Button>
            <Button
              variant={eraserType === 'object' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleEraserTypeChange('object')}>
              <GrObjectGroup />
              Object
            </Button>
          </div>
        </div>

        <Separator />

        {eraserType === 'pixel' ? (
          <>
            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground">Eraser Size</h3>
              <EnhancedSlider
                value={[eraserSize]}
                max={100}
                min={1}
                step={1}
                onValueChange={handleSizeChange}
                displayFormat={{ type: 'size', labels: ['XS', 'S', 'M', 'L', 'XL'] }}
                labels={{
                  min: 'Small',
                  mid: 'Medium',
                  max: 'Large'
                }}
              />
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground">Hardness</h3>
              <EnhancedSlider
                value={[eraserHardness]}
                max={100}
                min={10}
                step={1}
                onValueChange={handleHardnessChange}
                displayFormat={{ type: 'size', labels: ['S', 'M', 'H'] }}
                labels={{
                  min: 'Soft',
                  mid: 'Medium',
                  max: 'Hard'
                }}
              />
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground">Preview</h3>
              <div className="relative h-24 rounded-md bg-[url('/checkerboard-pattern.png')] bg-cover bg-opacity-50 flex items-center justify-center">
                <div
                  className="rounded-full border-2 border-dashed border-primary"
                  style={{
                    width: `${previewSize}px`,
                    height: `${previewSize}px`,
                    background: `radial-gradient(circle, rgba(220,220,220,0.9) ${eraserHardness}%, rgba(255,255,255,0) 100%)`,
                    transition: 'width 0.2s, height 0.2s, background 0.2s'
                  }}
                />
              </div>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full"
                  onClick={() => setShowResetConfirm(true)}>
                  Reset Settings
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground rounded-md border border-dashed border-muted">
            Click on an object on the canvas to erase it.
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={handleCancelReset}
        onConfirm={handleConfirmReset}
        title="Reset Eraser Settings?"
        description="This will reset the eraser size and hardness to their default values."
        confirmText="Reset Settings"
        cancelText="Cancel"
        variant="default"
      />
    </>
  );
};
