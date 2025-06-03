import { FC } from 'react';

import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { Slider } from '@/shared/components/ui/slider';

interface ColorSlidersProps {
  color: string;
  rgbValues: { r: number; g: number; b: number };
  hslValues: { h: number; s: number; l: number };
  onRgbChange: (component: 'r' | 'g' | 'b', value: number) => void;
  onHslChange: (component: 'h' | 's' | 'l', value: number) => void;
}

export const ColorSliders: FC<ColorSlidersProps> = ({ rgbValues, hslValues, onRgbChange, onHslChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between">
            <Label htmlFor="r-slider">R</Label>
            <span className="text-xs text-muted-foreground">{rgbValues.r}</span>
          </div>
          <Slider
            id="r-slider"
            min={0}
            max={255}
            step={1}
            value={[rgbValues.r]}
            onValueChange={(value) => onRgbChange('r', value[0])}
            className="[&_[role=slider]]:bg-red-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <Label htmlFor="g-slider">G</Label>
            <span className="text-xs text-muted-foreground">{rgbValues.g}</span>
          </div>
          <Slider
            id="g-slider"
            min={0}
            max={255}
            step={1}
            value={[rgbValues.g]}
            onValueChange={(value) => onRgbChange('g', value[0])}
            className="[&_[role=slider]]:bg-green-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <Label htmlFor="b-slider">B</Label>
            <span className="text-xs text-muted-foreground">{rgbValues.b}</span>
          </div>
          <Slider
            id="b-slider"
            min={0}
            max={255}
            step={1}
            value={[rgbValues.b]}
            onValueChange={(value) => onRgbChange('b', value[0])}
            className="[&_[role=slider]]:bg-blue-500"
          />
        </div>
      </div>

      <Separator className="my-8" />

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between">
            <Label htmlFor="h-slider">H</Label>
            <span className="text-xs text-muted-foreground">{hslValues.h}°</span>
          </div>
          <Slider
            id="h-slider"
            min={0}
            max={360}
            step={1}
            value={[hslValues.h]}
            onValueChange={(value) => onHslChange('h', value[0])}
            className="[&_[role=slider]]:bg-[linear-gradient(to_right,_#f00_0%,_#ff0_17%,_#0f0_33%,_#0ff_50%,_#00f_67%,_#f0f_83%,_#f00_100%)]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <Label htmlFor="s-slider">S</Label>
            <span className="text-xs text-muted-foreground">{hslValues.s}%</span>
          </div>
          <Slider
            id="s-slider"
            min={0}
            max={100}
            step={1}
            value={[hslValues.s]}
            onValueChange={(value) => onHslChange('s', value[0])}
            className="[&_[role=slider]]:bg-gray-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <Label htmlFor="l-slider">L</Label>
            <span className="text-xs text-muted-foreground">{hslValues.l}%</span>
          </div>
          <Slider
            id="l-slider"
            min={0}
            max={100}
            step={1}
            value={[hslValues.l]}
            onValueChange={(value) => onHslChange('l', value[0])}
            className="[&_[role=slider]]:bg-gray-500"
          />
        </div>
      </div>
    </div>
  );
};
