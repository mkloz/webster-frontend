'use client';

import { LayoutTemplate } from 'lucide-react';

import { ColorPicker } from '@/shared/components/common/color-picker';
import { EnhancedSlider } from '@/shared/components/common/enhanced-slider';
import { SizeInput } from '@/shared/components/common/size-input';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { Switch } from '@/shared/components/ui/switch';
import { useCanvasStore } from '@/shared/store/canvas-store';

import { DimensionSelector } from '../dimension-selector';

interface SettingsTabProps {
  constrainProportions: boolean;
  setConstrainProportions: (value: boolean) => void;
  background: string;
  setBackground: (value: string) => void;
}

export const SettingsTab = ({ background, setBackground }: SettingsTabProps) => {
  const { width, height, setDimensions, opacity, setOpacity, showGrid, setShowGrid, gridGap, setGridGap } =
    useCanvasStore();

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Dimensions</h3>
        <SizeInput value={{ width, height }} onChange={({ width, height }) => setDimensions(width, height)} />
      </div>

      <div className="mt-2">
        <DimensionSelector width={width} height={height} onSelect={setDimensions}>
          <Button variant="outline" size="sm" className="w-full rounded-full shadow-sm hover:shadow-md transition-all">
            <LayoutTemplate className="mr-2 h-4 w-4" />
            Choose from templates
          </Button>
        </DimensionSelector>
      </div>

      <Separator orientation="horizontal" />

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Background</h3>
        <ColorPicker value={background} onChange={setBackground} />
      </div>

      <Separator orientation="horizontal" />

      <div>
        <h3 className="mb-1 text-sm font-medium text-foreground">Opacity</h3>
        <EnhancedSlider
          value={[Math.round(opacity * 100)]}
          onValueChange={([value]) => setOpacity(value / 100)}
          defaultValue={[100]}
          max={100}
          step={1}
          displayFormat={{ type: 'percentage' }}
          labels={{ min: '0%', max: '100%' }}
        />
      </div>

      <Separator orientation="horizontal" />

      <div>
        <h3 className="mb-1 text-sm font-medium text-foreground">Grid</h3>
        <div className="flex items-center justify-between mt-2 mb-3">
          <span className="text-sm text-foreground">Show Grid</span>
          <Switch className="rounded-full" checked={showGrid} onCheckedChange={setShowGrid} />
        </div>

        {showGrid && (
          <div className="space-y-3">
            <label className="text-xs text-muted-foreground block">Grid Spacing</label>
            <EnhancedSlider
              value={[gridGap]}
              onValueChange={([value]) => setGridGap(value)}
              min={5}
              max={100}
              step={5}
              displayFormat={{ type: 'numeric', unit: 'px' }}
              labels={{
                min: 'Fine',
                mid: 'Medium',
                max: 'Coarse'
              }}
              className="w-full"
            />
          </div>
        )}
      </div>
    </>
  );
};
