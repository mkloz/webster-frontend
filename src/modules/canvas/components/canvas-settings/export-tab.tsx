import { Download } from 'lucide-react';
import { useState } from 'react';

import { EnhancedSlider } from '@/shared/components/common/enhanced-slider';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';

import { SizeInput } from '../../../../shared/components/common/size-input';
import { useCanvasStore } from '../../../../shared/store/canvas-store';
import { useExport } from '../../../project/hooks/use-export';
import { ExportOptions } from '../../../project/services/export.service';

const EXPORT_FORMATS: ExportOptions['format'][] = ['png', 'jpg', 'pdf', 'json'];

export const ExportTab = () => {
  const [exportFormat, setExportFormat] = useState<ExportOptions['format']>('png');
  const [quality, setQuality] = useState(90);
  const { width, height } = useCanvasStore();
  const [exportWidth, setWidth] = useState<number>(width);
  const [exportHeight, setHeight] = useState<number>(height);
  const { exportCanvas, isExporting } = useExport();
  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Format</h3>
        <div className="grid grid-cols-2 gap-2">
          {EXPORT_FORMATS.map((format) => (
            <Button
              key={format}
              variant={exportFormat === format ? 'default' : 'outline'}
              size="sm"
              className="w-full rounded-full shadow-sm hover:shadow-md transition-all"
              onClick={() => setExportFormat(format)}>
              {format.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <Separator orientation="horizontal" />

      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Quality</h3>
        <EnhancedSlider
          value={[quality]}
          onValueChange={(value) => setQuality(value.at(0) ?? 90)}
          max={100}
          min={1}
          step={1}
          displayFormat={{
            type: 'custom',
            formatter: (value) => `${value}`
          }}
          labels={{ min: 'Low', mid: 'Medium', max: 'High' }}
        />
      </div>

      <Separator orientation="horizontal" />

      <div className="space-y-3">
        <h3 className="mb-3 text-sm font-medium text-foreground">Size</h3>
        <SizeInput
          value={{ width: exportWidth, height: exportHeight }}
          onChange={(size) => {
            setWidth(size.width);
            setHeight(size.height);
          }}
        />

        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-full"
          onClick={() => {
            setWidth(width);
            setHeight(height);
          }}>
          Scale to Original Size
        </Button>
      </div>
      <Separator orientation="horizontal" />
      <Button
        className="w-full"
        onClick={() => exportCanvas({ format: exportFormat, quality, width: exportWidth, height: exportHeight })}
        disabled={isExporting}>
        <Download /> Export Image
      </Button>
    </>
  );
};
