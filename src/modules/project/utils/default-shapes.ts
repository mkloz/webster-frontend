import type { Shape } from '../../canvas/hooks/shapes-store';

// Generate unique IDs for shapes
const generateId = () => `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Beautiful sunset color palette
const getSunsetColors = () => {
  return {
    // Warm sunset colors
    sunsetOrange: '#FF6B35', // Vibrant orange
    sunsetRed: '#F7931E', // Golden orange
    sunsetYellow: '#FFD23F', // Warm yellow
    sunsetPink: '#FF8E9B', // Soft pink
    sunsetPurple: '#C73E1D', // Deep red
    sunsetBlue: '#4A90E2', // Soft blue
    sunsetDeep: 'rgb(161 99 75)', // Deep brown
    sunsetLight: '#FFF8E7' // Warm cream
  };
};

// Create sunset-themed background
export const getThemeBackground = (): string => {
  // Soft warm cream background
  return '#FFF8E7';
};

// Create modern, creative default shapes with sunset colors
export const createDefaultShapes = (canvasWidth: number, canvasHeight: number): Shape[] => {
  const colors = getSunsetColors();
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Calculate responsive sizes and spacing for full canvas utilization
  const baseSize = Math.min(canvasWidth, canvasHeight) * 0.05;
  const spacingX = canvasWidth * 0.15; // 15% of canvas width
  const spacingY = canvasHeight * 0.12; // 12% of canvas height

  const shapes: Shape[] = [
    // Main hero text - perfectly centered
    {
      id: generateId(),
      type: 'text',
      x: centerX,
      y: centerY - spacingY * 2,
      size: baseSize,
      color: colors.sunsetDeep,
      opacity: 1,
      text: 'Welcome to Webster',
      fontSize: Math.max(32, baseSize * 1.4),
      fontFamily: 'Inter',
      fontStyles: 'bold',
      align: 'center',
      width: canvasWidth * 0.8,
      padding: 0
    },

    // Subtitle with sunset theme
    {
      id: generateId(),
      type: 'text',
      x: centerX,
      y: centerY - spacingY * 1.2,
      size: baseSize * 0.5,
      color: colors.sunsetPurple,
      opacity: 0.8,
      text: 'Design • Create • Inspire',
      fontSize: Math.max(18, baseSize * 0.7),
      fontFamily: 'Inter',
      fontStyles: 'normal',
      align: 'center',
      width: canvasWidth * 0.6,
      padding: 0
    },

    // Top left area - Large sunset orange circle
    {
      id: generateId(),
      type: 'circle',
      x: spacingX,
      y: spacingY,
      size: baseSize * 2,
      width: baseSize * 2,
      height: baseSize * 2,
      color: colors.sunsetOrange,
      opacity: 0.3,
      shouldFill: true,
      fillColor: colors.sunsetOrange,
      fillOpacity: 0.3,
      showStroke: false
    },

    // Top right area - Golden rectangle
    {
      id: generateId(),
      type: 'rectangle',
      x: canvasWidth - spacingX,
      y: spacingY * 1.5,
      size: baseSize,
      width: baseSize * 2.5,
      height: baseSize * 0.8,
      color: colors.sunsetYellow,
      opacity: 1,
      shouldFill: true,
      fillColor: colors.sunsetYellow,
      fillOpacity: 1,
      showStroke: false,
      rotation: -8
    },

    // Center left - Orange circle with stroke
    {
      id: generateId(),
      type: 'circle',
      x: spacingX * 1.5,
      y: centerY + spacingY * 0.5,
      size: baseSize * 1.6,
      width: baseSize * 1.6,
      height: baseSize * 1.6,
      color: colors.sunsetRed,
      opacity: 1,
      shouldFill: false,
      showStroke: true,
      strokeColor: colors.sunsetRed,
      strokeWidth: 4
    },

    // Center right - Pink star
    {
      id: generateId(),
      type: 'star',
      x: canvasWidth - spacingX * 1.5,
      y: centerY - spacingY * 0.3,
      size: baseSize * 1.4,
      color: colors.sunsetPink,
      opacity: 0.9,
      shouldFill: true,
      fillColor: colors.sunsetPink,
      fillOpacity: 0.4,
      showStroke: true,
      strokeColor: colors.sunsetPink,
      strokeWidth: 2
    },

    // Bottom left - Sunset triangle
    {
      id: generateId(),
      type: 'triangle',
      x: spacingX * 1.2,
      y: canvasHeight - spacingY * 1.5,
      size: baseSize,
      width: baseSize * 1.4,
      height: baseSize * 1.4,
      color: colors.sunsetPurple,
      opacity: 0.8,
      shouldFill: true,
      fillColor: colors.sunsetPurple,
      fillOpacity: 0.5,
      showStroke: true,
      strokeColor: colors.sunsetPurple,
      strokeWidth: 2,
      rotation: 20
    },

    // Bottom right - Blue accent circle
    {
      id: generateId(),
      type: 'circle',
      x: canvasWidth - spacingX * 1.2,
      y: canvasHeight - spacingY,
      size: baseSize * 1.2,
      width: baseSize * 1.2,
      height: baseSize * 1.2,
      color: colors.sunsetBlue,
      opacity: 1,
      shouldFill: true,
      fillColor: colors.sunsetBlue,
      fillOpacity: 0.8,
      showStroke: false
    },

    // Center area - Main sunset rectangle
    {
      id: generateId(),
      type: 'rectangle',
      x: centerX,
      y: centerY + spacingY * 0.8,
      size: baseSize,
      width: baseSize * 3,
      height: baseSize * 0.6,
      color: colors.sunsetOrange,
      opacity: 1,
      shouldFill: true,
      fillColor: colors.sunsetOrange,
      fillOpacity: 1,
      showStroke: false,
      rotation: -3
    },

    // Decorative line elements - warm tone
    {
      id: generateId(),
      type: 'line',
      x: spacingX * 2,
      y: canvasHeight - spacingY * 0.5,
      x2: canvasWidth - spacingX * 2,
      y2: canvasHeight - spacingY * 0.5,
      size: 2,
      color: colors.sunsetRed,
      opacity: 0.5,
      strokeColor: colors.sunsetRed,
      strokeWidth: 2
    },

    // Call to action text
    {
      id: generateId(),
      type: 'text',
      x: centerX,
      y: canvasHeight - spacingY * 0.8,
      size: baseSize * 0.4,
      color: colors.sunsetPurple,
      opacity: 0.7,
      text: 'Click anywhere to start creating',
      fontSize: Math.max(14, baseSize * 0.5),
      fontFamily: 'Inter',
      fontStyles: 'normal',
      align: 'center',
      width: canvasWidth * 0.5,
      padding: 0
    }
  ];

  return shapes;
};

// Create minimal sunset shapes for smaller canvases
export const createMinimalDefaultShapes = (canvasWidth: number, canvasHeight: number): Shape[] => {
  const colors = getSunsetColors();
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const baseSize = Math.min(canvasWidth, canvasHeight) * 0.08;
  const spacingX = canvasWidth * 0.2;
  const spacingY = canvasHeight * 0.15;

  return [
    // Clean welcome text
    {
      id: generateId(),
      type: 'text',
      x: centerX,
      y: centerY - spacingY,
      size: baseSize * 0.8,
      color: colors.sunsetDeep,
      opacity: 1,
      text: 'Webster',
      fontSize: Math.max(24, baseSize * 0.9),
      fontFamily: 'Inter',
      fontStyles: 'bold',
      align: 'center',
      width: canvasWidth * 0.8,
      padding: 0
    },

    // Subtitle
    {
      id: generateId(),
      type: 'text',
      x: centerX,
      y: centerY - spacingY * 0.4,
      size: baseSize * 0.4,
      color: colors.sunsetPurple,
      opacity: 0.8,
      text: 'Start creating',
      fontSize: Math.max(16, baseSize * 0.5),
      fontFamily: 'Inter',
      fontStyles: 'normal',
      align: 'center',
      width: canvasWidth * 0.6,
      padding: 0
    },

    // Left sunset element
    {
      id: generateId(),
      type: 'circle',
      x: centerX - spacingX * 0.8,
      y: centerY + spacingY * 0.6,
      size: baseSize * 0.8,
      width: baseSize * 0.8,
      height: baseSize * 0.8,
      color: colors.sunsetOrange,
      opacity: 0.8,
      shouldFill: true,
      fillColor: colors.sunsetOrange,
      fillOpacity: 0.4,
      showStroke: true,
      strokeColor: colors.sunsetOrange,
      strokeWidth: 2
    },

    // Right sunset element
    {
      id: generateId(),
      type: 'rectangle',
      x: centerX + spacingX * 0.8,
      y: centerY + spacingY * 0.6,
      size: baseSize,
      width: baseSize * 1.5,
      height: baseSize * 0.5,
      color: colors.sunsetYellow,
      opacity: 1,
      shouldFill: true,
      fillColor: colors.sunsetYellow,
      fillOpacity: 1,
      showStroke: false,
      rotation: -5
    }
  ];
};
