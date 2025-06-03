import { useShapesStore } from './shapes-store';
import { useCanvasHistory } from './use-canvas-history';

export const useCanvasReset = () => {
  const clearShapes = useShapesStore((state) => state.clearShapes);
  const { resetHistory } = useCanvasHistory();

  const resetCanvas = () => {
    clearShapes();
    resetHistory();
  };

  return { resetCanvas };
};
