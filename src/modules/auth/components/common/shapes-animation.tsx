import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '../../../../shared/lib/utils';

interface AnimatedBackgroundProps {
  isDark?: boolean;
  particleDensity?: number;
  connectionDistance?: number;
  maxParticles?: number;
  particleSpeed?: number;
  className?: string;
}

type ParticleShape = 'circle' | 'square' | 'triangle' | 'hexagon' | 'star' | 'diamond';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  shape: ParticleShape;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  glowAmount: number;
}

export const AnimatedBackground = ({
  isDark = false,
  particleDensity = 8000,
  connectionDistance = 180,
  maxParticles = 100,
  particleSpeed = 0.4,
  className = ''
}: AnimatedBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const colorPalette = useMemo(
    () => [
      'rgba(99, 102, 241, 0.7)',
      'rgba(139, 92, 246, 0.7)',
      'rgba(168, 85, 247, 0.7)',
      'rgba(217, 70, 239, 0.7)',
      'rgba(79, 70, 229, 0.7)',
      'rgba(124, 58, 237, 0.7)',
      'rgba(236, 72, 153, 0.7)',
      'rgba(67, 56, 202, 0.7)'
    ],
    []
  );

  const connectionColor = useMemo(() => (isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(90, 60, 160, 0.7)'), [isDark]);

  const createParticle = useCallback(
    (width: number, height: number): Particle => {
      const shapes: ParticleShape[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const size = Math.random() * 24 + 16;
      const glowAmount = Math.random() < 0.3 ? Math.random() * 10 + 5 : 0;

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        speedX: (Math.random() - 0.5) * particleSpeed,
        speedY: (Math.random() - 0.5) * particleSpeed,
        color,
        shape,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.6 + 0.2,
        glowAmount
      };
    },
    [colorPalette, particleSpeed]
  );

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasDimensions = () => {
      const { offsetWidth, offsetHeight } = canvas;
      canvas.width = offsetWidth;
      canvas.height = offsetHeight;
      setDimensions({ width: offsetWidth, height: offsetHeight });
    };

    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);

    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, []);

  const initializeParticles = useCallback(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const count = Math.min(maxParticles, Math.floor((dimensions.width * dimensions.height) / particleDensity));
    const newParticles = Array.from({ length: count }, () => createParticle(dimensions.width, dimensions.height));

    particlesRef.current = newParticles;
  }, [dimensions, maxParticles, particleDensity, createParticle]);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, p: Particle) => {
    ctx.save();
    ctx.globalAlpha = p.opacity;

    if (p.glowAmount > 0) {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.glowAmount;
    }

    ctx.fillStyle = p.color;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    switch (p.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -p.size / 2);
        ctx.lineTo(-p.size / 2, p.size / 2);
        ctx.lineTo(p.size / 2, p.size / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'hexagon':
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = p.size * Math.cos(angle);
          const y = p.size * Math.sin(angle);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        break;
      case 'star':
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? p.size : p.size / 2;
          const angle = (Math.PI / 5) * i;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -p.size / 2);
        ctx.lineTo(p.size / 2, 0);
        ctx.lineTo(0, p.size / 2);
        ctx.lineTo(-p.size / 2, 0);
        ctx.closePath();
        ctx.fill();
        break;
    }

    ctx.restore();
  }, []);

  const updateParticle = useCallback((p: Particle, width: number, height: number): Particle => {
    p.x += p.speedX;
    p.y += p.speedY;

    if (p.x > width || p.x < 0) p.speedX = -p.speedX;
    if (p.y > height || p.y < 0) p.speedY = -p.speedY;

    p.rotation += p.rotationSpeed;
    return p;
  }, []);

  const drawConnections = useCallback(
    (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
      ctx.lineWidth = 1.5;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = 1 - distance / connectionDistance;
            ctx.strokeStyle = connectionColor.replace(/[\d.]+\)$/, `${opacity * 0.7})`);

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    },
    [connectionDistance, connectionColor]
  );

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const { width, height } = dimensions;

    if (!canvas || !ctx || width === 0 || height === 0) return;

    ctx.clearRect(0, 0, width, height);

    const particles = particlesRef.current;
    particles.forEach((p, i) => {
      particlesRef.current[i] = updateParticle(p, width, height);
    });

    drawConnections(ctx, particles);
    particles.forEach((p) => drawParticle(ctx, p));

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [dimensions, updateParticle, drawParticle, drawConnections]);

  useEffect(() => initializeCanvas(), [initializeCanvas]);

  useEffect(() => {
    initializeParticles();
  }, [dimensions, initializeParticles]);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameRef.current!);
  }, [dimensions, animate]);

  useEffect(() => {
    initializeParticles();
  }, [isDark, initializeParticles]);

  return (
    <div
      className={cn(
        'w-full h-full relative',
        'bg-gradient-to-tl from-gradient-start/40 to-gradient-end/40',
        isDark ? 'dark' : '',
        className
      )}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" role="presentation" />
    </div>
  );
};
