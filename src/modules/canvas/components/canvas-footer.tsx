import { MinusCircle, PlusCircle } from 'lucide-react';
import { RxDimensions } from 'react-icons/rx';

import { Button } from '../../../shared/components/ui/button';
import { Slider } from '../../../shared/components/ui/slider';
import { useCanvasStore } from '../../../shared/store/canvas-store';
import { DimensionSelector } from './dimension-selector';

const ZOOM_PRESETS = [0.25, 0.5, 0.75, 1, 1.5, 2, 4];

export const CanvasFooter = () => {
  const { scale, setScale, height, width, resetScale, setDimensions } = useCanvasStore();
  const handleZoomIn = () => {
    const nextPreset = ZOOM_PRESETS.find((preset) => preset > scale);
    setScale(nextPreset || Math.min(scale + 0.1, 4));
  };

  const handleZoomOut = () => {
    const prevPreset = [...ZOOM_PRESETS].reverse().find((preset) => preset < scale);
    setScale(prevPreset || Math.max(scale - 0.1, 0.25));
  };
  return (
    <>
      <div className="flex items-center gap-3 absolute bottom-2 left-2">
        <DimensionSelector
          key={'canvas-footer-dimention-selector'}
          height={height}
          width={width}
          onSelect={setDimensions}>
          <Button variant={'outline'} className="flex items-center gap-2 backdrop-blur-xl bg-canvas-background/80">
            <RxDimensions />
            <div className="text-sm ">
              {width} × {height} px
            </div>
          </Button>
        </DimensionSelector>
      </div>

      <div className="flex items-center absolute bottom-2 right-2">
        <div className="relative group">
          <div className="h-10 rounded-full  px-1 flex items-center border-primary backdrop-blur-xl bg-canvas-background/80 border transition-all min-w-56">
            <div className="flex items-center gap-2 w-full">
              <Button variant="ghost" size="icon-xs" onClick={handleZoomOut}>
                <MinusCircle className="h-4 w-4 text-primary" />
              </Button>

              <Slider
                className="min-w-16"
                value={[scale]}
                min={0.25}
                max={4}
                step={0.01}
                onValueChange={(value) => {
                  setScale(value[0]);
                }}
              />

              <Button variant="ghost" size="icon-xs" onClick={handleZoomIn}>
                <PlusCircle className="h-4 w-4 text-primary" />
              </Button>

              <Button className="ml-auto" variant={'default'} size={'xs'} onClick={() => resetScale()}>
                {(scale * 100).toFixed()}%
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
