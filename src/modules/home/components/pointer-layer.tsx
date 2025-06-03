import { useEffect, useRef, useState } from 'react';

import { useToolOptionsStore } from '@/modules/canvas/hooks/tool-optios-store';

import { useLeftSidebarStore } from '../hooks/use-left-sidebar-store';

export const PointerLayer = () => {
  const { activeTool } = useLeftSidebarStore();
  const isActive = activeTool === 'pointer';

  const { pointer } = useToolOptionsStore();
  const { pointerColor, pointerSize = 8, showTrail, trailLength = 50 } = pointer;

  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const requestRef = useRef(0);
  const latestPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const safePointerSize = Math.max(pointerSize, 2);
  const safeTrailLength = Math.max(trailLength, 1);

  useEffect(() => {
    if (!isActive) return;

    const handleMove = (e: MouseEvent) => {
      latestPos.current = { x: e.clientX, y: e.clientY };
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const interpolateTrail = (from: { x: number; y: number }, to: { x: number; y: number }, steps = 5) => {
      const result = [];
      for (let i = 1; i <= steps; i++) {
        result.push({
          x: lerp(from.x, to.x, i / steps),
          y: lerp(from.y, to.y, i / steps)
        });
      }
      return result;
    };

    const update = () => {
      const newPos = latestPos.current;
      setPosition(newPos);

      if (showTrail) {
        setTrail((prev) => {
          const last = prev[prev.length - 1] || newPos;
          const interpolated = interpolateTrail(last, newPos, 4);
          const updated = [...prev, ...interpolated];
          return updated.slice(-safeTrailLength);
        });
      }

      requestRef.current = requestAnimationFrame(update);
    };

    window.addEventListener('mousemove', handleMove);
    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, showTrail, safeTrailLength]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {showTrail &&
        trail.map((point, idx) => (
          <div
            key={idx}
            className="absolute rounded-full"
            style={{
              width: safePointerSize,
              height: safePointerSize,
              backgroundColor: pointerColor,
              left: point.x - safePointerSize / 2,
              top: point.y - safePointerSize / 2,
              opacity: (idx + 1) / safeTrailLength,
              filter: 'blur(1px)',
              transition: 'opacity 0.1s linear'
            }}
          />
        ))}

      {!showTrail && (
        <div
          className="absolute rounded-full"
          style={{
            width: safePointerSize,
            height: safePointerSize,
            backgroundColor: pointerColor,
            left: position.x - safePointerSize / 2,
            top: position.y - safePointerSize / 2
          }}
        />
      )}
    </div>
  );
};
