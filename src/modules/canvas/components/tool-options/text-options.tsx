'use client';

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  MoveDown,
  MoveUp,
  Trash2,
  Type
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ColorPicker } from '../../../../shared/components/common/color-picker';
import { EnhancedSlider } from '../../../../shared/components/common/enhanced-slider';
import { Button } from '../../../../shared/components/ui/button';
import { Label } from '../../../../shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../shared/components/ui/select';
import { Separator } from '../../../../shared/components/ui/separator';
import { Textarea } from '../../../../shared/components/ui/textarea';
import { useShapesStore } from '../../hooks/shapes-store';
import { useToolOptionsStore } from '../../hooks/tool-optios-store';

const TEXT_ALIGNMENTS = [
  { value: 'left', icon: <AlignLeft className="h-4 w-4 mx-auto" /> },
  { value: 'center', icon: <AlignCenter className="h-4 w-4 mx-auto" /> },
  { value: 'right', icon: <AlignRight className="h-4 w-4 mx-auto" /> },
  { value: 'justify', icon: <AlignJustify className="h-4 w-4 mx-auto" /> }
];

const FONT_OPTIONS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS'
];

export function TextOptions() {
  const { text: textOptions, setToolOptions } = useToolOptionsStore();
  const { shapes, updateShape, selectedShapeIds, setShapes, setSelectedShapeIds } = useShapesStore();
  const [localText, setLocalText] = useState('');

  // Find the selected text shape if any
  const selectedTextId = textOptions.selectedTextId || (selectedShapeIds.length === 1 ? selectedShapeIds[0] : null);

  const selectedTextShape = selectedTextId
    ? shapes.find((shape) => shape.id === selectedTextId && shape.type === 'text')
    : null;

  // Update local text when selection changes
  useEffect(() => {
    if (selectedTextShape) {
      setLocalText(selectedTextShape.text || '');
    } else {
      setLocalText('');
    }
  }, [selectedTextShape]);

  const handleTextChange = (newText: string) => {
    setLocalText(newText);

    // Update the selected text shape immediately
    if (selectedTextShape) {
      updateShape(selectedTextShape.id, { text: newText });
    }
  };

  const handleFontChange = (font: string) => {
    setToolOptions('text', { fontFamily: font });

    // If a text is selected, update it with the new font
    if (selectedTextShape) {
      updateShape(selectedTextShape.id, { fontFamily: font });
    }
  };

  const handleSizeChange = (size: number) => {
    setToolOptions('text', { fontSize: size });

    // If a text is selected, update it with the new size
    if (selectedTextShape) {
      updateShape(selectedTextShape.id, { fontSize: size });
    }
  };

  // Helper to check if a style is active
  const isStyleActive = (style: string, fontStyles: string) => {
    return fontStyles.includes(style);
  };

  // Updated to toggle individual styles
  const handleStyleChange = (style: 'bold' | 'italic') => {
    // Get current font styles
    const currentStyles = selectedTextShape?.fontStyles || textOptions.fontStyles || '';

    // Toggle the style
    let newStyles = currentStyles;
    if (isStyleActive(style, currentStyles)) {
      // Remove the style
      newStyles = currentStyles.replace(style, '').trim();
    } else {
      // Add the style
      newStyles = (currentStyles + ' ' + style).trim();
    }

    setToolOptions('text', { fontStyles: newStyles });

    // If a text is selected, update it with the new style
    if (selectedTextShape) {
      updateShape(selectedTextShape.id, { fontStyles: newStyles });
    }
  };

  const handleAlignmentChange = (align: 'left' | 'center' | 'right') => {
    setToolOptions('text', { align });

    // If a text is selected, update it with the new alignment
    if (selectedTextShape) {
      updateShape(selectedTextShape.id, { align });
    }
  };

  const handleColorChange = (color: string) => {
    setToolOptions('text', { textColor: color });

    // If a text is selected, update it with the new color
    if (selectedTextShape) {
      updateShape(selectedTextShape.id, { color });
    }
  };

  const handleWidthChange = (width: number) => {
    setToolOptions('text', { width });

    // If a text is selected, update it with the new width
    if (selectedTextShape) {
      updateShape(selectedTextShape.id, { width });
    }
  };

  const handleBringToFront = () => {
    if (!selectedTextShape) return;

    // Find current index
    const currentIndex = shapes.findIndex((s) => s.id === selectedTextShape.id);
    if (currentIndex < shapes.length - 1) {
      // Move to front (end of array)
      const newShapes = [...shapes];
      const [shape] = newShapes.splice(currentIndex, 1);
      newShapes.push(shape);
      setShapes(newShapes);
      toast.success('Text brought to front');
    }
  };

  const handleSendToBack = () => {
    if (!selectedTextShape) return;

    // Find current index
    const currentIndex = shapes.findIndex((s) => s.id === selectedTextShape.id);
    if (currentIndex > 0) {
      // Move to back (beginning of array)
      const newShapes = [...shapes];
      const [shape] = newShapes.splice(currentIndex, 1);
      newShapes.unshift(shape);
      setShapes(newShapes);
      toast.success('Text sent to back');
    }
  };

  const handleDeleteText = () => {
    if (!selectedTextShape) return;

    // Remove the text from shapes
    setShapes((prevShapes) => prevShapes.filter((shape) => shape.id !== selectedTextShape.id));
    // Clear selection
    setSelectedShapeIds([]);
    setToolOptions('text', { selectedTextId: null });
    toast.success('Text deleted');
  };

  // Get current font styles
  const currentFontStyles = selectedTextShape?.fontStyles || textOptions.fontStyles || '';

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <h3 className="text-sm font-medium text-foreground mb-2">Text Tool</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Click on canvas to create new text</li>
          <li>• Click on text to select it</li>
          <li>• Edit text content in the panel below</li>
        </ul>
      </div>

      {/* Text Content Editor */}
      {selectedTextShape ? (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <h3 className="text-sm font-medium text-foreground mb-1">Selected Text</h3>
              <p className="text-xs text-muted-foreground">
                Font: {selectedTextShape.fontFamily} • Size: {selectedTextShape.fontSize}px
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="text-content" className="text-sm font-medium">
                Text Content
              </Label>
            </div>
            <Textarea
              id="text-content"
              placeholder="Enter your text here..."
              value={localText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="min-h-[80px] resize-none"
              style={{
                fontFamily: selectedTextShape.fontFamily,
                fontSize: `${Math.min(selectedTextShape.fontSize || 16, 14)}px`,
                fontWeight: isStyleActive('bold', currentFontStyles) ? 'bold' : 'normal',
                fontStyle: isStyleActive('italic', currentFontStyles) ? 'italic' : 'normal'
              }}
            />
            <div className="text-xs text-muted-foreground">{localText.length} characters</div>
          </div>
        </>
      ) : (
        <>
          <Separator />
          <div className="p-3 text-center text-sm text-muted-foreground rounded-md border border-dashed">
            Select a text element to edit its content
          </div>
        </>
      )}

      <Separator />

      {/* Font Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Font</h3>
        <Select value={selectedTextShape?.fontFamily || textOptions.fontFamily} onValueChange={handleFontChange}>
          <SelectTrigger className="w-full rounded-full">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((fontOption) => (
              <SelectItem key={fontOption} value={fontOption} style={{ fontFamily: fontOption }}>
                {fontOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Font Size */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Size</h3>
        <EnhancedSlider
          value={[selectedTextShape?.fontSize || textOptions.fontSize]}
          min={8}
          max={72}
          step={1}
          displayFormat={{ type: 'numeric', unit: 'px' }}
          labels={{
            min: 'Small',
            mid: 'Medium',
            max: 'Large'
          }}
          onValueChange={([size]) => handleSizeChange(size)}
        />
      </div>

      <Separator />

      {/* Font Style */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Style</h3>
        <div className="flex gap-2">
          <Button
            variant={isStyleActive('bold', currentFontStyles) ? 'default' : 'outline'}
            size="sm"
            className="flex-1 rounded-full"
            onClick={() => handleStyleChange('bold')}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={isStyleActive('italic', currentFontStyles) ? 'default' : 'outline'}
            size="sm"
            className="flex-1 rounded-full"
            onClick={() => handleStyleChange('italic')}>
            <Italic className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Text Alignment */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Alignment</h3>
        <div className="flex gap-2">
          {TEXT_ALIGNMENTS.map((align) => (
            <Button
              key={align.value}
              variant={(selectedTextShape?.align || textOptions.align) === align.value ? 'default' : 'outline'}
              size="sm"
              className="flex-1 rounded-full"
              onClick={() => handleAlignmentChange(align.value as 'left' | 'center' | 'right')}>
              {align.icon}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Text Color */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Color</h3>
        <ColorPicker value={selectedTextShape?.color || textOptions.textColor} onChange={handleColorChange} />
      </div>

      <Separator />

      {/* Text Width */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Text Width</h3>
        <EnhancedSlider
          value={[selectedTextShape?.width || textOptions.width]}
          min={50}
          max={500}
          step={10}
          displayFormat={{ type: 'numeric', unit: 'px' }}
          labels={{
            min: 'Narrow',
            mid: 'Medium',
            max: 'Wide'
          }}
          onValueChange={([width]) => handleWidthChange(width)}
        />
      </div>

      {selectedTextShape && (
        <>
          <Separator />

          {/* Layer Management and Actions */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-foreground">Actions</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="rounded-full" onClick={handleBringToFront}>
                  <MoveUp className="h-4 w-4 mr-1" />
                  To Front
                </Button>

                <Button variant="outline" size="sm" className="rounded-full" onClick={handleSendToBack}>
                  <MoveDown className="h-4 w-4 mr-1" />
                  To Back
                </Button>
              </div>

              <Button variant="destructive" size="sm" className="w-full rounded-full" onClick={handleDeleteText}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Text
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
