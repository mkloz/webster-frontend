export class ConverterUtils {
  static remToPx(rem: number | string): number {
    let value: number;

    if (typeof rem === 'string') {
      value = parseFloat(rem.replace(/rem/g, ''));
    } else {
      value = rem;
    }
    if (isNaN(value)) {
      return 0;
    }
    const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return value * fontSize;
  }

  static objectToSearchParams(obj: object) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || value === null || value === '') continue;

      if (Array.isArray(value)) {
        if (value.length === 0) continue;
        value.forEach((val) => params.append(key, val));
      } else if (value instanceof Date) {
        params.append(key, value.toISOString());
      } else if (typeof value === 'object' && value !== null) {
        params.append(key, JSON.stringify(value));
      } else {
        params.append(key, String(value));
      }
    }

    return params;
  }

  static getCssVariable(variable: string): string {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const value = computedStyle.getPropertyValue(variable).trim();

    return value;
  }

  static hexToRgb(hex: string) {
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  static rgbToHsl(r: number, g: number, b: number) {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

      if (max === rNorm) {
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
      } else if (max === gNorm) {
        h = ((bNorm - rNorm) / delta + 2) * 60;
      } else {
        h = ((rNorm - gNorm) / delta + 4) * 60;
      }
    }

    return {
      h: Math.round(h),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  static hslToRgb(h: number, s: number, l: number) {
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;

    let r, g, b;

    if (sNorm === 0) {
      r = g = b = lNorm;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
      const p = 2 * lNorm - q;

      r = hue2rgb(p, q, hNorm + 1 / 3);
      g = hue2rgb(p, q, hNorm);
      b = hue2rgb(p, q, hNorm - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  static rgbToHex(r: number, g: number, b: number) {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
