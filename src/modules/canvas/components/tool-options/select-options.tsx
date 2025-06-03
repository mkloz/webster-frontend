'use client';

import { MoveDown, MoveUp, Trash2 } from 'lucide-react';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { Button } from '../../../../shared/components/ui/button';
import { Separator } from '../../../../shared/components/ui/separator';
import { useShapesStore } from '../../hooks/shapes-store';

export function SelectOptions() {
  const { selectedShapeIds, clearSelection, setShapes, shapes } = useShapesStore();
  const handleDeleteSelected = useCallback(() => {
    if (selectedShapeIds.length > 0) {
      setShapes(shapes.filter((shape) => !selectedShapeIds.includes(shape.id)));
      clearSelection();
      toast.success(`${selectedShapeIds.length} item${selectedShapeIds.length > 1 ? 's' : ''} deleted`);
    }
  }, [selectedShapeIds, setShapes, shapes, clearSelection]);

  const handleBringToFront = useCallback(() => {
    if (selectedShapeIds.length === 0) return;

    const newShapes = [...shapes];
    const selectedShapes = selectedShapeIds.map((id) => shapes.find((s) => s.id === id)).filter(Boolean);

    // Remove selected shapes from their current positions
    selectedShapeIds.forEach((id) => {
      const index = newShapes.findIndex((s) => s.id === id);
      if (index !== -1) {
        newShapes.splice(index, 1);
      }
    });

    // Add them to the end (front)
    selectedShapes.forEach((shape) => {
      if (shape) newShapes.push(shape);
    });

    setShapes(newShapes);
    toast.success(`${selectedShapeIds.length} item${selectedShapeIds.length > 1 ? 's' : ''} brought to front`);
  }, [selectedShapeIds, shapes, setShapes]);

  const handleSendToBack = useCallback(() => {
    if (selectedShapeIds.length === 0) return;

    const newShapes = [...shapes];
    const selectedShapes = selectedShapeIds.map((id) => shapes.find((s) => s.id === id)).filter(Boolean);

    // Remove selected shapes from their current positions
    selectedShapeIds.forEach((id) => {
      const index = newShapes.findIndex((s) => s.id === id);
      if (index !== -1) {
        newShapes.splice(index, 1);
      }
    });

    // Add them to the beginning (back)
    selectedShapes.reverse().forEach((shape) => {
      if (shape) newShapes.unshift(shape);
    });

    setShapes(newShapes);
    toast.success(`${selectedShapeIds.length} item${selectedShapeIds.length > 1 ? 's' : ''} sent to back`);
  }, [selectedShapeIds, shapes, setShapes]);

  const hasSelection = selectedShapeIds.length > 0;
  const singleSelection = selectedShapeIds.length === 1;
  const selectedId = singleSelection ? selectedShapeIds[0] : null;

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <h3 className="text-sm font-medium text-foreground mb-2">Select Tool</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Click on objects to select them</li>
          <li>• Hold Shift to select multiple objects</li>
          <li>• Drag to create selection box</li>
          <li>• Use transform handles to resize/rotate</li>
        </ul>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Selection Info</h3>
        {hasSelection ? (
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm font-medium text-foreground">
              {selectedShapeIds.length} object{selectedShapeIds.length > 1 ? 's' : ''} selected
            </p>
            {singleSelection && (
              <p className="text-xs text-muted-foreground mt-1">
                {shapes.find((s) => s.id === selectedId)?.type || 'Unknown'} shape
              </p>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No objects selected</div>
        )}
      </div>

      {hasSelection && (
        <>
          <Separator />

          {/* Layer Management */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-foreground">Layer Order</h3>
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
          </div>

          <Separator />
        </>
      )}

      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Actions</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-full shadow-sm hover:shadow-md transition-all"
            onClick={clearSelection}
            disabled={!hasSelection}>
            Clear Selection
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="w-full rounded-full shadow-sm hover:shadow-md transition-all"
            onClick={handleDeleteSelected}
            disabled={!hasSelection}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      </div>

      {!hasSelection && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Click on shapes to select them, or drag to create a selection box.
          </p>
          <p className="text-xs text-muted-foreground mt-1">Hold Shift to select multiple shapes.</p>
        </div>
      )}
    </div>
  );
}
