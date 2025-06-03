import { useEffect, useRef } from 'react';

import { cn } from '../../lib/utils';

const SHAPES = ['circle', 'square', 'triangle', 'hexagon'] as const;
const COLORS = ['#8B5CF6', '#EC4899', '#F97316', '#10B981'];

export const FloatingElements = () => {
  const floatingElementsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateFloatingElements();
  }, []);

  const generateFloatingElements = () => {
    const container = floatingElementsRef.current;
    if (!container) return;

    container.innerHTML = ''; // Clear previous elements

    for (let i = 0; i < 15; i++) {
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size = Math.random() * 60 + 20;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const duration = (Math.random() * 10 + 10).toFixed(2);
      const delay = (Math.random() * 3).toFixed(2);

      const el = document.createElement('div');
      el.className = cn(
        `absolute pointer-events-none opacity-20 animate-float z-[1]`,
        Math.random() > 0.5 && 'animate-float-reverse'
      );
      el.style.left = `${left}%`;
      el.style.top = `${top}%`;
      el.style.animationDuration = `${duration}s`;
      el.style.animationDelay = `${delay}s`;

      if (shape === 'circle') {
        el.className += ' rounded-full';
        setStyle(el, size, size, color);
      } else if (shape === 'square') {
        el.className += ' rounded';
        setStyle(el, size, size, color);
      } else if (shape === 'triangle') {
        Object.assign(el.style, {
          width: '0',
          height: '0',
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
          backgroundColor: 'transparent'
        });
      } else if (shape === 'hexagon') {
        setStyle(el, size, size, color);
        el.style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
      }

      container.appendChild(el);
    }
  };

  const setStyle = (el: HTMLDivElement, width: number, height: number, color: string) => {
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.backgroundColor = color;
  };

  return <div ref={floatingElementsRef} className="absolute inset-0 pointer-events-none z-0" />;
};
