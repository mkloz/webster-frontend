import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import { useCanvasStore } from '../../../shared/store/canvas-store';
import { useLeftSidebarStore } from '../../home/hooks/use-left-sidebar-store';
import { useRightSidebarStore } from '../../home/hooks/use-right-sidebar-store';
import { useCanvasContext } from './use-canvas-context';

interface StageResizeHookProps {
  setPosition: (position: { x: number; y: number }) => void;
  setStageSize: (size: { width: number; height: number }) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const useStageContainerResize = ({ setPosition, setStageSize, containerRef }: StageResizeHookProps) => {
  const { width, height, setScale } = useCanvasStore();
  const { showLeftSidebar } = useLeftSidebarStore();
  const { showRightSidebar } = useRightSidebarStore();
  const { stageRef } = useCanvasContext();
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isResizingRef = useRef(false);

  const updateSize = useCallback(() => {
    if (!containerRef.current) return;

    void containerRef.current.offsetHeight;

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    if (containerWidth <= 0 || containerHeight <= 0 || width <= 0 || height <= 0) {
      return;
    }

    isResizingRef.current = true;

    const scaleX = containerWidth / width;
    const scaleY = containerHeight / height;
    const newScale = Math.min(scaleX, scaleY) * 0.8;

    setStageSize({
      width: Math.max(1, containerWidth),
      height: Math.max(1, containerHeight)
    });
    setScale(Math.max(0.1, newScale));
    setPosition({
      x: (containerWidth - width * newScale) / 2,
      y: (containerHeight - height * newScale) / 2
    });

    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      isResizingRef.current = false;
      if (stageRef.current) {
        stageRef.current.batchDraw();
      }
    }, 150);
  }, [width, height, setScale]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      if (!isResizingRef.current && !signal.aborted) {
        updateSize();
        if (stageRef.current) {
          stageRef.current.batchDraw();
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const handleResize = () => {
      if (!isResizingRef.current && !signal.aborted) {
        updateSize();
        if (stageRef.current) {
          stageRef.current.batchDraw();
        }
      }
    };

    window.addEventListener('resize', handleResize, { signal });

    return () => {
      abortController.abort();
      resizeObserver.disconnect();
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [updateSize]);

  useEffect(() => {
    const abortController = new AbortController();

    if (stageRef.current) {
      stageRef.current.batchDraw();
    }

    const timer = setTimeout(() => {
      if (!isResizingRef.current && !abortController.signal.aborted) {
        if (containerRef.current) {
          const containerWidth = containerRef.current.offsetWidth;
          const containerHeight = containerRef.current.offsetHeight;

          if (containerWidth > 0 && containerHeight > 0) {
            updateSize();

            setTimeout(() => {
              if (stageRef.current && !abortController.signal.aborted) {
                stageRef.current.batchDraw();
              }
            }, 50);
          }
        }
      }
    }, 220);

    return () => {
      abortController.abort();
      clearTimeout(timer);
    };
  }, [showLeftSidebar, showRightSidebar, updateSize]);

  useEffect(() => {
    const abortController = new AbortController();

    const timer = setTimeout(() => {
      if (!abortController.signal.aborted) {
        updateSize();
      }
    }, 50);

    return () => {
      abortController.abort();
      clearTimeout(timer);
    };
  }, [width, height, updateSize]);

  useLayoutEffect(() => {
    const abortController = new AbortController();

    const timer = setTimeout(() => {
      if (!abortController.signal.aborted && stageRef.current) {
        stageRef.current.batchDraw();
      }
    }, 100);

    return () => {
      abortController.abort();
      clearTimeout(timer);
    };
  }, []);
};
