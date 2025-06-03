import { ColorPicker } from '../../../../shared/components/common/color-picker';
import { EnhancedSlider } from '../../../../shared/components/common/enhanced-slider';
import { Separator } from '../../../../shared/components/ui/separator';
import { Switch } from '../../../../shared/components/ui/switch';
import { useToolOptionsStore } from '../../hooks/tool-optios-store';

export const PointerOptions = () => {
  const { pointer, setToolOptions } = useToolOptionsStore();
  const { pointerColor, pointerSize, showTrail, trailLength } = pointer;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Laser Pointer Options</h3>
        <div className="space-y-3">
          <div>
            <h4 className="mb-2 text-xs font-medium text-foreground">Color</h4>
            <ColorPicker
              value={pointerColor}
              onChange={(value) => setToolOptions('pointer', { pointerColor: value })}
            />
          </div>
        </div>
      </div>
      <Separator />
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Size</h3>
        <EnhancedSlider
          defaultValue={[pointerSize]}
          min={2}
          max={20}
          step={1}
          displayFormat={{ type: 'size', labels: ['XS', 'S', 'M', 'L', 'XL'] }}
          labels={{
            min: 'Small',
            mid: 'Medium',
            max: 'Large'
          }}
          onValueChange={([value]) => setToolOptions('pointer', { pointerSize: value })}
        />
      </div>
      <Separator />
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Trail</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-foreground">Show Trail</span>
          <Switch
            checked={showTrail}
            onCheckedChange={(checked) => setToolOptions('pointer', { showTrail: checked })}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Trail Length</label>
          <EnhancedSlider
            defaultValue={[trailLength]}
            min={5}
            max={100}
            step={1}
            displayFormat={{ type: 'size', labels: ['S', 'M', 'L'] }}
            labels={{
              min: 'Short',
              mid: 'Medium',
              max: 'Long'
            }}
            onValueChange={([value]) => setToolOptions('pointer', { trailLength: value })}
          />
        </div>
      </div>
    </div>
  );
};
