'use client';

import { Circle, Hexagon, MoveDown, MoveUp, Plus, Square, Star, Trash2, Triangle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { IoAnalyticsOutline } from 'react-icons/io5';
import { toast } from 'sonner';

import { useCanvasStore } from '@/shared/store/canvas-store';

import { ColorPicker } from '../../../../shared/components/common/color-picker';
import { EnhancedSlider } from '../../../../shared/components/common/enhanced-slider';
import { Button } from '../../../../shared/components/ui/button';
import { Separator } from '../../../../shared/components/ui/separator';
import { Switch } from '../../../../shared/components/ui/switch';
import { cn } from '../../../../shared/lib/utils';
import type { Shape } from '../../hooks/shapes-store';
import { useShapesStore } from '../../hooks/shapes-store';
import { type Shapes, useToolOptionsStore } from '../../hooks/tool-optios-store';
import { useCanvasHistory } from '../../hooks/use-canvas-history';

export const SHAPES: Array<{ value: Shapes; label: string; icon: ReactNode }> = [
  { value: 'rectangle', label: 'Rectangle', icon: <Square /> },
  { value: 'circle', label: 'Circle', icon: <Circle /> },
  { value: 'triangle', label: 'Triangle', icon: <Triangle /> },
  { value: 'hexagon', label: 'Hexagon', icon: <Hexagon /> },
  { value: 'star', label: 'Star', icon: <Star /> },
  { value: 'line', label: 'Line', icon: <IoAnalyticsOutline /> }
];

export const ShapesOptions = () => {
  const { shapeType, fillColor, strokeColor, strokeWidth, showStroke, shouldFill, selectedShapeId, fillOpacity } =
    useToolOptionsStore((s) => s.shape);
  const { setToolOptions } = useToolOptionsStore();
  const { shapes, updateShape, selectedShapeIds, setSelectedShapeIds, setShapes } = useShapesStore();
  const { width, height } = useCanvasStore();
  const { saveToHistory } = useCanvasHistory();

  // Find the selected shape if any
  const selectedShape = selectedShapeId
    ? shapes.find(
        (shape) =>
          shape.id === selectedShapeId &&
          ['rectangle', 'circle', 'triangle', 'hexagon', 'star', 'line'].includes(shape.type)
      )
    : selectedShapeIds.length === 1
      ? shapes.find(
          (shape) =>
            shape.id === selectedShapeIds[0] &&
            ['rectangle', 'circle', 'triangle', 'hexagon', 'star', 'line'].includes(shape.type)
        )
      : null;

  // Update local state when selection changes
  useEffect(() => {
    if (selectedShape) {
      setToolOptions('shape', {
        selectedShapeId: selectedShape.id,
        shapeType: selectedShape.type as Shapes,
        fillColor: selectedShape.fillColor || selectedShape.color,
        strokeColor: selectedShape.strokeColor || '#000000',
        strokeWidth: selectedShape.strokeWidth || 2,
        showStroke: selectedShape.showStroke ?? true,
        shouldFill: selectedShape.shouldFill ?? true,
        shapeSize: selectedShape.size || 50,
        fillOpacity: selectedShape.fillOpacity ?? 1
      });
    } else {
      setToolOptions('shape', {
        selectedShapeId: null
      });
    }
  }, [selectedShape, setToolOptions]);

  // Add shape in center of canvas
  const handleAddShape = () => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Create a base shape object with common properties
    const baseShape = {
      id: String(Date.now()),
      x: centerX,
      y: centerY,
      size: useToolOptionsStore.getState().shape.shapeSize,
      color: fillColor,
      opacity: 1,
      fillColor: fillColor,
      fillOpacity: fillOpacity,
      strokeColor: strokeColor,
      strokeWidth: strokeWidth,
      showStroke: showStroke,
      shouldFill: shouldFill,
      width: useToolOptionsStore.getState().shape.shapeSize,
      height: useToolOptionsStore.getState().shape.shapeSize
    };

    let newShape: Shape;

    // For star shapes, we'll use scaleX and scaleY for deformation
    if (shapeType === 'star') {
      newShape = {
        ...baseShape,
        type: 'star' as const,
        scaleX: 1,
        scaleY: 1
      };
    } else if (shapeType === 'line') {
      // For lines, create a horizontal line in the center
      const lineLength = baseShape.size;
      newShape = {
        ...baseShape,
        type: 'line' as const,
        x2: centerX + lineLength / 2,
        y2: centerY
      };
    } else {
      // For other shapes
      newShape = {
        ...baseShape,
        type: shapeType
      };
    }

    setShapes((prev) => [...prev, newShape]);

    // Select the new shape and save to history
    setSelectedShapeIds([newShape.id]);
    setToolOptions('shape', { selectedShapeId: newShape.id });
    saveToHistory(`Create ${shapeType}`);
    toast.success(`${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} added to canvas`);
  };

  const setActiveShape = (value: Shapes) => {
    setToolOptions('shape', { shapeType: value });

    // If a shape is selected, update it with the new type
    if (selectedShape) {
      updateShape(selectedShape.id, { type: value });
      toast.success(`Shape changed to ${value}`);
    }
  };

  const setFillColor = (color: string) => {
    setToolOptions('shape', { fillColor: color });

    // If a shape is selected, update it with the new fill color
    if (selectedShape) {
      updateShape(selectedShape.id, { fillColor: color, color: color });
    }
  };

  const setStrokeColor = (color: string) => {
    setToolOptions('shape', { strokeColor: color });

    // If a shape is selected, update it with the new stroke color
    if (selectedShape) {
      updateShape(selectedShape.id, { strokeColor: color });
    }
  };

  const setStrokeWidth = (width: number) => {
    setToolOptions('shape', { strokeWidth: width });

    // If a shape is selected, update it with the new stroke width
    if (selectedShape) {
      updateShape(selectedShape.id, { strokeWidth: width });
    }
  };

  const setShowStroke = (show: boolean) => {
    setToolOptions('shape', { showStroke: show });

    // If a shape is selected, update it with the new stroke visibility
    if (selectedShape) {
      updateShape(selectedShape.id, { showStroke: show });
    }
  };

  const setShouldFill = (fill: boolean) => {
    setToolOptions('shape', { shouldFill: fill });

    // If a shape is selected, update it with the new fill setting
    if (selectedShape) {
      updateShape(selectedShape.id, { shouldFill: fill });
    }
  };

  const setFillOpacity = (opacity: number) => {
    setToolOptions('shape', { fillOpacity: opacity });

    // If a shape is selected, update it with the new fill opacity
    if (selectedShape) {
      updateShape(selectedShape.id, { fillOpacity: opacity });
    }
  };

  const setShapeSize = (size: number) => {
    setToolOptions('shape', { shapeSize: size });

    // If a shape is selected, update it with the new size
    if (selectedShape) {
      updateShape(selectedShape.id, {
        size: size,
        width: size,
        height: size
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Instructions */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <h3 className="text-sm font-medium text-foreground mb-2">Shape Tool</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Select shape type and click &quot;Add Shape&quot; </li>
          <li>• Click on a shape to select and edit it</li>
          <li>• Use the controls below to modify properties</li>
        </ul>
      </div>

      {selectedShape && (
        <>
          <Separator />
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <h3 className="text-sm font-medium text-foreground mb-1">Selected Shape</h3>
            <p className="text-xs text-muted-foreground">
              {selectedShape.type.charAt(0).toUpperCase() + selectedShape.type.slice(1)} • Size:{' '}
              {selectedShape.size || selectedShape.width}px
            </p>
          </div>
        </>
      )}

      <Separator />

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Shape Type</h3>
        <div className="grid grid-cols-3 gap-2">
          {SHAPES.map((shape) => (
            <Button
              key={shape.value}
              variant={shapeType === shape.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveShape(shape.value)}
              className={cn(`flex aspect-square p-2 h-auto rounded-xl transition-all flex-col`)}>
              {shape.icon}
              <span className="text-xs">{shape.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Add Shape Button */}
      <div>
        <Button onClick={handleAddShape} className="w-full rounded-full" size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Add {shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}
        </Button>
      </div>

      <Separator />

      {/* Size Control */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Size</h3>
        <EnhancedSlider
          value={[selectedShape?.size || selectedShape?.width || useToolOptionsStore.getState().shape.shapeSize]}
          min={10}
          max={200}
          step={1}
          displayFormat={{ type: 'numeric', unit: 'px' }}
          labels={{
            min: 'Small',
            mid: 'Medium',
            max: 'Large'
          }}
          onValueChange={([size]) => setShapeSize(size)}
        />
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Fill</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-foreground">Fill Shape</span>
          <Switch checked={selectedShape?.shouldFill ?? shouldFill} onCheckedChange={setShouldFill} />
        </div>
        <ColorPicker value={selectedShape?.fillColor || selectedShape?.color || fillColor} onChange={setFillColor} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Fill Opacity</h3>
        <EnhancedSlider
          value={[selectedShape?.fillOpacity !== undefined ? selectedShape.fillOpacity * 100 : fillOpacity * 100]}
          min={10}
          max={100}
          step={1}
          displayFormat={{ type: 'percentage' }}
          labels={{
            min: '10%',
            max: '100%'
          }}
          onValueChange={([value]) => setFillOpacity(value / 100)}
          disabled={!selectedShape?.shouldFill && !shouldFill}
        />
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Stroke</h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-foreground">Show Stroke</span>
          <Switch checked={selectedShape?.showStroke ?? showStroke} onCheckedChange={setShowStroke} />
        </div>
        <div className="mb-3">
          <label className="text-xs text-gray-700 mb-2 block">Width</label>
          <EnhancedSlider
            value={[selectedShape?.strokeWidth || strokeWidth]}
            onValueChange={([width]) => setStrokeWidth(width)}
            max={20}
            step={1}
            displayFormat={{ type: 'size', labels: ['T', 'M', 'B'] }}
            labels={{
              min: 'Thin',
              mid: 'Medium',
              max: 'Bold'
            }}
          />
        </div>
        <ColorPicker value={selectedShape?.strokeColor || strokeColor} onChange={setStrokeColor} />
      </div>

      {selectedShape && (
        <>
          <Separator />

          {/* Layer Management and Actions */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-foreground">Actions</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    // Find current index
                    const currentIndex = shapes.findIndex((s) => s.id === selectedShape.id);
                    if (currentIndex < shapes.length - 1) {
                      // Move to front (end of array)
                      const newShapes = [...shapes];
                      const [shape] = newShapes.splice(currentIndex, 1);
                      newShapes.push(shape);
                      setShapes(newShapes);
                      toast.success('Shape brought to front');
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
                    // Find current index
                    const currentIndex = shapes.findIndex((s) => s.id === selectedShape.id);
                    if (currentIndex > 0) {
                      // Move to back (beginning of array)
                      const newShapes = [...shapes];
                      const [shape] = newShapes.splice(currentIndex, 1);
                      newShapes.unshift(shape);
                      setShapes(newShapes);
                      toast.success('Shape sent to back');
                    }
                  }}>
                  <MoveDown className="h-4 w-4 mr-1" />
                  To Back
                </Button>
              </div>

              <Button
                variant="destructive"
                size="sm"
                className="w-full rounded-full"
                onClick={() => {
                  // Remove the shape from shapes
                  setShapes((prevShapes) => prevShapes.filter((shape) => shape.id !== selectedShape.id));
                  // Clear selection
                  setSelectedShapeIds([]);
                  setToolOptions('shape', { selectedShapeId: null });
                  toast.success('Shape deleted');
                }}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Shape
              </Button>
            </div>
          </div>
        </>
      )}

      {!selectedShape && (
        <div className="p-4 text-center text-sm text-muted-foreground rounded-md border border-dashed mt-4">
          No shape selected. Click on a shape to select and edit it, or use &quot;Add Shape&quot; to create a new one.
        </div>
      )}
    </div>
  );
};
