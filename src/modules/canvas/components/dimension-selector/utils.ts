export const getAspectRatio = (width: number, height: number): string => {
  if (width === height) return '1:1';

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const divisor = gcd(width, height);
  const simplifiedWidth = width / divisor;
  const simplifiedHeight = height / divisor;

  // Check for common aspect ratios
  if (Math.abs(simplifiedWidth / simplifiedHeight - 16 / 9) < 0.01) return '16:9';
  if (Math.abs(simplifiedWidth / simplifiedHeight - 4 / 3) < 0.01) return '4:3';
  if (Math.abs(simplifiedWidth / simplifiedHeight - 3 / 2) < 0.01) return '3:2';
  if (Math.abs(simplifiedWidth / simplifiedHeight - 9 / 16) < 0.01) return '9:16';
  if (Math.abs(simplifiedWidth / simplifiedHeight - 2 / 1) < 0.01) return '2:1';

  // If it's a simple ratio, return it
  if (simplifiedWidth <= 20 && simplifiedHeight <= 20) {
    return `${simplifiedWidth}:${simplifiedHeight}`;
  }

  // Otherwise return the decimal ratio
  return (width / height).toFixed(2) + ':1';
};
