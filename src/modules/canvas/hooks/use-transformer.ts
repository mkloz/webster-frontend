'use client';

import type Konva from 'konva';
import type React from 'react';
import { useEffect, useRef } from 'react';

import { useShapesStore } from './shapes-store';
import { useToolOptionsStore } from './tool-optios-store';

interface UseTransformerProps {
  selectedShapeIds: string[];
  stageRef: React.RefObject<Konva.Stage>;
}

export const useTransformer = ({ selectedShapeIds, stageRef }: UseTransformerProps) => {
  const transformerRef = useRef<Konva.Transformer>(null);
  const { updateShape, shapes } = useShapesStore();
  const { setToolOptions } = useToolOptionsStore();

  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;

    if (!transformer || !stage) return;

    if (selectedShapeIds.length === 0) {
      transformer.nodes([]);
      return;
    }

    // Find selected nodes
    const selectedNodes = selectedShapeIds.map((id) => stage.findOne(`#${id}`)).filter(Boolean) as Konva.Node[];

    if (selectedNodes.length > 0) {
      transformer.nodes(selectedNodes);
      transformer.getLayer()?.batchDraw();

      // If there's a single text node selected, update the text tool options
      if (selectedNodes.length === 1 && selectedNodes[0].getClassName() === 'Text') {
        const textNode = selectedNodes[0] as Konva.Text;
        const textId = textNode.id();

        // Update the selected text ID in the tool options
        setToolOptions('text', { selectedTextId: textId });
      } else {
        // Clear selected text ID if no text is selected
        setToolOptions('text', { selectedTextId: null });
      }
    }
  }, [selectedShapeIds, stageRef, shapes, setToolOptions]);

  // Handle transform end to update shape properties
  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const shapeId = node.id();

    if (!shapeId) return;

    // Get the current transform values
    const x = node.x();
    const y = node.y();
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    // Calculate absolute scale values
    const absScaleX = Math.abs(scaleX);
    const absScaleY = Math.abs(scaleY);

    // Find the shape to get its type
    const shape = shapes.find((s) => s.id === shapeId);
    if (!shape) return;

    // Get original dimensions from shape data
    const originalWidth = shape.width || shape.size || 100;
    const originalHeight = shape.height || shape.size || 100;

    // Calculate new dimensions
    const width = originalWidth * absScaleX;
    const height = originalHeight * absScaleY;

    // Special handling for line shapes
    if (shape.type === 'line' && !Array.isArray(shape.points)) {
      // For regular lines, handle scaling and rotation properly
      const originalX2 = shape.x2 || shape.x;
      const originalY2 = shape.y2 || shape.y;

      // Calculate the original line vector
      const originalDx = originalX2 - shape.x;
      const originalDy = originalY2 - shape.y;

      // Only apply scaling to the line vector, not rotation
      const newDx = originalDx * absScaleX;
      const newDy = originalDy * absScaleY;

      // Update the line with new start and end points and rotation
      updateShape(shapeId, {
        x,
        y,
        x2: x + newDx,
        y2: y + newDy,
        rotation // Store the rotation instead of applying it to coordinates
      });

      // Reset the node transform
      node.scaleX(1);
      node.scaleY(1);
      node.rotation(0);
      node.x(x);
      node.y(y);

      // Force redraw
      node.getLayer()?.batchDraw();
      return;
    }

    // Prevent the shape renderer from handling this event
    e.cancelBubble = true;

    // Update shape based on its type
    if (shape.type === 'text') {
      // For text, we update font size and width
      const originalFontSize = shape.fontSize || 16;
      const newFontSize = Math.max(8, Math.round(originalFontSize * absScaleY));
      const newWidth = Math.max(20, width);

      updateShape(shapeId, {
        x,
        y,
        rotation,
        fontSize: newFontSize,
        width: newWidth
      });

      // Reset scale after applying to font size and update node properties
      node.scaleX(1);
      node.scaleY(1);

      // Update the text node properties directly
      if (node.getClassName() === 'Text') {
        const textNode = node as Konva.Text;
        textNode.fontSize(newFontSize);
        textNode.width(newWidth);
        // Calculate approximate height based on font size
        const lineHeight = newFontSize * 1.2;
        const textLines = (shape.text || '').split('\n').length;
        textNode.height(lineHeight * Math.max(1, textLines));
      }
    } else if (shape.type === 'image') {
      // For images, update dimensions directly
      updateShape(shapeId, {
        x,
        y,
        rotation,
        width: Math.max(10, width),
        height: Math.max(10, height)
      });

      // Reset scale and update node dimensions
      node.scaleX(1);
      node.scaleY(1);

      // Update image node dimensions
      if (node.getClassName() === 'Image') {
        const imageNode = node as Konva.Image;
        imageNode.width(Math.max(10, width));
        imageNode.height(Math.max(10, height));
      }
    } else if (shape.type === 'circle' || shape.type === 'round') {
      // For circles, allow independent width/height scaling (ellipses)
      updateShape(shapeId, {
        x,
        y,
        rotation,
        width: Math.max(10, width),
        height: Math.max(10, height),
        // Keep size for backward compatibility
        size: Math.max(10, Math.max(width, height))
      });

      // Reset scale
      node.scaleX(1);
      node.scaleY(1);

      // Update the ellipse radii
      if (node.getClassName() === 'Ellipse') {
        const ellipseNode = node as Konva.Ellipse;
        ellipseNode.radiusX(Math.max(5, width / 2));
        ellipseNode.radiusY(Math.max(5, height / 2));
      }
    } else if (shape.type === 'star') {
      // For stars, directly apply the current scale values
      // This ensures the star looks exactly the same after transform as during preview

      // Store the current node scale directly
      updateShape(shapeId, {
        x,
        y,
        rotation,
        // Use the node's current scale directly
        scaleX: absScaleX,
        scaleY: absScaleY
      });

      // Don't reset the node scale - this is crucial to maintain the exact appearance
      // The shape renderer will use these scale values directly
    } else if (shape.type === 'triangle' || shape.type === 'hexagon') {
      // For triangle and hexagon (Line shapes), update width and height
      updateShape(shapeId, {
        x,
        y,
        rotation,
        width: Math.max(10, width),
        height: Math.max(10, height),
        size: Math.max(10, Math.max(width, height))
      });

      // Reset scale
      node.scaleX(1);
      node.scaleY(1);
    } else {
      // For other shapes (rectangle, etc.), update width and height
      updateShape(shapeId, {
        x,
        y,
        rotation,
        width: Math.max(10, width),
        height: Math.max(10, height)
      });

      // Reset scale and update node dimensions
      node.scaleX(1);
      node.scaleY(1);

      // Update rectangle node dimensions
      if (node.getClassName() === 'Rect') {
        const rectNode = node as Konva.Rect;
        rectNode.width(Math.max(10, width));
        rectNode.height(Math.max(10, height));
      }
    }

    // Force redraw
    node.getLayer()?.batchDraw();
  };

  // Handle drag end to update position
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const shapeId = node.id();

    if (!shapeId) return;

    updateShape(shapeId, {
      x: node.x(),
      y: node.y()
    });
  };

  return {
    transformerRef,
    handleTransformEnd,
    handleDragEnd
  };
};
