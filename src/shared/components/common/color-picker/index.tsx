import { Clock, Palette, Pipette, SlidersHorizontal } from 'lucide-react';
import { FC, useCallback, useEffect, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { toast } from 'sonner';
import useEyeDropper from 'use-eye-dropper';

import { Button } from '@/shared/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import { ConverterUtils } from '../../../utils/converter.utils';
import { TimeUtils } from '../../../utils/time.utils';
import { ColorHistory } from './color-history';
import { ColorPickerButton } from './color-picker-button';
import { ColorPresets } from './color-presets';
import { ColorSliders } from './color-sliders';
import { PRESET_COLORS } from './color-utils';

export const updateColorValues = (hexColor: string) => {
  const rgb = ConverterUtils.hexToRgb(hexColor);
  const hsl = ConverterUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
  return { rgb, hsl };
};

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  presets?: string[];
  showEyeDropper?: boolean;
  showCopyButton?: boolean;
  showHistory?: boolean;
}

export const ColorPicker: FC<ColorPickerProps> = ({
  value,
  onChange,
  className,
  presets = PRESET_COLORS,
  showEyeDropper = true,
  showCopyButton = true,
  showHistory = true
}) => {
  const [color, setColor] = useState(value || '#000000');
  const [copied, setCopied] = useState(false);
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [rgbValues, setRgbValues] = useState({ r: 0, g: 0, b: 0 });
  const [hslValues, setHslValues] = useState({ h: 0, s: 0, l: 0 });
  const { open, isSupported } = useEyeDropper();

  useEffect(() => {
    if (value !== color) {
      setColor(value);
      const { rgb, hsl } = updateColorValues(value);
      setRgbValues(rgb);
      setHslValues(hsl);
    }
  }, [value]);

  const handleColorChange = useCallback(
    (newColor: string) => {
      setColor(newColor);
      onChange(newColor);
      const { rgb, hsl } = updateColorValues(newColor);
      setRgbValues(rgb);
      setHslValues(hsl);
    },
    [onChange]
  );

  const handleOpenChange = (open: boolean) => {
    if (!open && showHistory && !colorHistory.includes(color)) {
      setColorHistory((prev) => [color, ...prev.slice(0, 9)]);
    }
  };

  const handleRgbChange = (component: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgbValues, [component]: value };
    const hexColor = ConverterUtils.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    handleColorChange(hexColor);
  };

  const handleHslChange = (component: 'h' | 's' | 'l', value: number) => {
    const newHsl = { ...hslValues, [component]: value };
    const rgb = ConverterUtils.hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const hexColor = ConverterUtils.rgbToHex(rgb.r, rgb.g, rgb.b);
    handleColorChange(hexColor);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    TimeUtils.timeout(2000, () => setCopied(false));
  };

  const useEyeDropperTool = async () => {
    if (!isSupported()) {
      toast.error('Eye dropper is not supported in this browser');
      return;
    }
    try {
      const { sRGBHex } = await open();
      handleColorChange(sRGBHex);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('Error picking color from screen');
      }
    }
  };

  return (
    <div className={className}>
      <Popover onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="outline" size={'icon-lg'} className="w-full justify-start text-left font-normal h-10">
            <div className="flex items-center gap-2 w-full">
              <div className="h-6 w-6 rounded-full shadow-sm" style={{ backgroundColor: color }} />
              <div className="flex-1 truncate">{color}</div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <Tabs defaultValue="picker">
            <TabsList className="w-full mb-2">
              <TabsTrigger value="picker">
                <Pipette className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="sliders">
                <SlidersHorizontal className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="presets">
                <Palette className="h-4 w-4" />
              </TabsTrigger>
              {showHistory && (
                <TabsTrigger value="history">
                  <Clock className="h-4 w-4" />
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="picker" className="space-y-4 min-h-[284px]">
              <div className="flex justify-center">
                <HexColorPicker color={color} onChange={handleColorChange} />
              </div>

              <ColorPickerButton
                color={color}
                showCopyButton={showCopyButton}
                showEyeDropper={showEyeDropper}
                onCopy={copyToClipboard}
                onEyeDropper={useEyeDropperTool}
                copied={copied}
              />
            </TabsContent>

            <TabsContent value="sliders" className="space-y-4 min-h-[284px]">
              <ColorSliders
                color={color}
                rgbValues={rgbValues}
                hslValues={hslValues}
                onRgbChange={handleRgbChange}
                onHslChange={handleHslChange}
              />
            </TabsContent>

            <TabsContent value="presets" className="space-y-4 min-h-[284px]">
              <ColorPresets presets={presets} currentColor={color} onSelectColor={handleColorChange} />
            </TabsContent>

            {showHistory && (
              <TabsContent value="history" className="space-y-4 min-h-[284px]">
                <ColorHistory
                  history={colorHistory}
                  currentColor={color}
                  onSelectColor={handleColorChange}
                  onClearHistory={() => setColorHistory([])}
                />
              </TabsContent>
            )}
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
};
