import { useCallback } from 'react';
import { FaPen, FaPenNib } from 'react-icons/fa6';
import { PiMarkerCircleBold } from 'react-icons/pi';

import { ColorPicker } from '../../../../shared/components/common/color-picker';
import { EnhancedSlider } from '../../../../shared/components/common/enhanced-slider';
import { Button } from '../../../../shared/components/ui/button';
import { Separator } from '../../../../shared/components/ui/separator';
import { cn } from '../../../../shared/lib/utils';
import { useToolOptionsStore } from '../../hooks/tool-optios-store';

type PenType = 'ballpoint' | 'fountain' | 'marker';

const PEN_TYPES = [
  { value: 'ballpoint', label: 'Ballpoint', icon: <FaPen /> },
  { value: 'fountain', label: 'Fountain', icon: <FaPenNib /> },
  { value: 'marker', label: 'Marker', icon: <PiMarkerCircleBold /> }
];
export const PenOptions = () => {
  const penType = useToolOptionsStore((s) => s.pen.penType);
  const penColor = useToolOptionsStore((s) => s.pen.penColor);
  const penSize = useToolOptionsStore((s) => s.pen.penSize);
  const smoothing = useToolOptionsStore((s) => s.pen.smoothing);
  const setToolOptions = useToolOptionsStore((s) => s.setToolOptions);

  const handlePenTypeChange = useCallback(
    (type: PenType) => {
      setToolOptions('pen', { penType: type });
    },
    [setToolOptions]
  );

  const handleColorChange = useCallback(
    (color: string) => {
      setToolOptions('pen', { penColor: color });
    },
    [setToolOptions]
  );

  const handleSizeChange = useCallback(
    ([value]: number[]) => {
      setToolOptions('pen', { penSize: value });
    },
    [setToolOptions]
  );

  const handleSmoothingChange = useCallback(
    ([value]: number[]) => {
      setToolOptions('pen', { smoothing: value });
    },
    [setToolOptions]
  );

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Pen Type</h3>
        <div className="grid grid-cols-3 gap-2">
          {PEN_TYPES.map((penOption) => (
            <Button
              key={penOption.value}
              variant={penType === penOption.value ? 'default' : 'outline'}
              className={cn(`flex aspect-square p-2 h-auto rounded-xl transition-all flex-col`)}
              onClick={() => handlePenTypeChange(penOption.value as PenType)}>
              {penOption.icon}
              <span className="mt-1 text-xs">{penOption.label}</span>
            </Button>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Line Width</h3>
        <EnhancedSlider
          defaultValue={[penSize]}
          onValueChange={handleSizeChange}
          max={20}
          step={1}
          displayFormat={{ type: 'size', labels: ['XS', 'S', 'M', 'L', 'XL'] }}
          labels={{
            min: 'Thin',
            mid: 'Medium',
            max: 'Thick'
          }}
        />
      </div>
      <Separator />
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Smoothing</h3>
        <EnhancedSlider
          defaultValue={[smoothing]}
          onValueChange={handleSmoothingChange}
          max={100}
          step={1}
          displayFormat={{ type: 'size', labels: ['N', 'L', 'M', 'H'] }}
          labels={{
            min: 'None',
            mid: 'Medium',
            max: 'High'
          }}
        />
      </div>
      <Separator />
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Color</h3>
        <ColorPicker value={penColor} onChange={handleColorChange} />
      </div>
    </div>
  );
};
