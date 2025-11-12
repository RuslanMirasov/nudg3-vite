/**
 * Chart color utilities for validation and fallback management
 */

/**
 * Validates if a string is a valid color format (hex, rgb, hsl)
 * @param color - The color string to validate
 * @returns true if valid color, false otherwise
 */
export function isValidColor(color: string | undefined | null): boolean {
  if (!color || typeof color !== 'string' || color.trim() === '') {
    return false;
  }

  // Hex color pattern: #RGB or #RRGGBB
  const hexPattern = /^#([0-9A-Fa-f]{3}){1,2}$/;

  // RGB pattern with range validation (0-255)
  const rgbPattern = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
  const rgbMatch = color.match(rgbPattern);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1] as string);
    const g = parseInt(rgbMatch[2] as string);
    const b = parseInt(rgbMatch[3] as string);
    // Validate range 0-255 (reject values like rgb(999, 999, 999))
    if (r > 255 || g > 255 || b > 255) {
      return false;
    }
  }

  // HSL pattern: hsl(0-360, 0-100%, 0-100%) with optional spaces
  const hslPattern = /^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/;

  return hexPattern.test(color) || rgbMatch !== null || hslPattern.test(color);
}

/**
 * Shared fallback color palette for charts (expanded to 16 colors)
 */
export const CHART_FALLBACK_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Orange
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Deep Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F43F5E', // Rose
  '#A855F7', // Violet
  '#0EA5E9', // Sky
  '#EAB308', // Yellow
  '#DC2626', // Dark Red
  '#16A34A', // Dark Green
];

/**
 * HSL fallback colors for sources (alternative format)
 */
export const CHART_FALLBACK_COLORS_HSL = [
  'hsl(221, 83%, 53%)', // Blue
  'hsl(0, 84%, 60%)', // Red
  'hsl(142, 76%, 36%)', // Green
  'hsl(32, 95%, 44%)', // Orange
  'hsl(271, 91%, 65%)', // Purple
  'hsl(328, 86%, 70%)', // Pink
  'hsl(173, 80%, 40%)', // Teal
  'hsl(25, 95%, 53%)', // Deep Orange
  'hsl(189, 94%, 43%)', // Cyan
  'hsl(84, 81%, 44%)', // Lime
  'hsl(351, 95%, 60%)', // Rose
  'hsl(272, 72%, 60%)', // Violet
  'hsl(199, 95%, 48%)', // Sky
  'hsl(50, 98%, 48%)', // Yellow
  'hsl(0, 84%, 47%)', // Dark Red
  'hsl(142, 76%, 37%)', // Dark Green
];

/**
 * Generate a derived color when palette exhausted
 * @param baseColor - The base color to derive from
 * @param variant - The variant number (0 for base, 1+ for derivatives)
 * @returns A derived color string
 */
export function generateDerivedColor(baseColor: string, variant: number): string {
  // For variant 0, return base color
  if (variant === 0) return baseColor;

  // Simple lightness adjustment for HSL colors
  const hslMatch = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (hslMatch) {
    const [, h, s, l] = hslMatch;
    // Alternate between lighter and darker variants
    const isLighter = variant % 2 === 1;
    const adjustment = Math.floor((variant + 1) / 2) * 10;
    const newL = isLighter ? Math.min(90, parseInt(l as string) + adjustment) : Math.max(20, parseInt(l as string) - adjustment);
    return `hsl(${h}, ${s}%, ${newL}%)`;
  }

  // For hex colors, add opacity as a simple variant
  if (baseColor.startsWith('#')) {
    // Convert to rgba with decreasing opacity for each variant
    const opacity = Math.max(0.3, 1 - variant * 0.15);
    return hexToRgba(baseColor, opacity);
  }

  // Fallback to base color if we can't derive
  return baseColor;
}

/**
 * Convert hex color to rgba with opacity
 * @param hex - Hex color string
 * @param opacity - Opacity value (0-1)
 * @returns RGBA color string
 */
function hexToRgba(hex: string, opacity: number): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = (hex[0] as string) + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  //   if (hex.length === 3) {
  //     const [r, g, b] = hex;
  //     hex = (r as string) + r + g + g + b + b;
  //   }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Convert HSL to RGB
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns RGB tuple [r, g, b]
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/**
 * Parse color string to RGB values
 * @param color - Color string in hex, rgb, or hsl format
 * @returns RGB tuple [r, g, b]
 */
function parseColor(color: string): [number, number, number] {
  if (!color || typeof color !== 'string') {
    return [0, 0, 0];
  }

  // Handle hex format (#RRGGBB or #RGB)
  if (color.startsWith('#')) {
    let hex = color.replace('#', '');

    // Handle 3-digit hex
    if (hex.length === 3) {
      hex = (hex[0] as string) + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }

  // Handle hsl format: hsl(h, s%, l%)
  const hslMatch = color.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/);
  if (hslMatch) {
    return hslToRgb(parseInt(hslMatch[1] as string), parseInt(hslMatch[2] as string), parseInt(hslMatch[3] as string));
  }

  // Handle rgb format: rgb(r, g, b)
  const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1] as string), parseInt(rgbMatch[2] as string), parseInt(rgbMatch[3] as string)];
  }

  // Handle rgba format: rgba(r, g, b, a)
  const rgbaMatch = color.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/);
  if (rgbaMatch) {
    return [parseInt(rgbaMatch[1] as string), parseInt(rgbaMatch[2] as string), parseInt(rgbaMatch[3] as string)];
  }

  // Fallback to black
  return [0, 0, 0];
}

/**
 * Calculate Euclidean distance between two colors in RGB space
 * @param color1 - First color string
 * @param color2 - Second color string
 * @returns Distance value (0-441, where 441 = max distance black to white)
 */
function calculateColorDistance(color1: string, color2: string): number {
  const [r1, g1, b1] = parseColor(color1);
  const [r2, g2, b2] = parseColor(color2);

  return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
}

/**
 * Check if a color is too similar to any color in the used set
 * @param newColor - Color to check
 * @param usedColors - Set of already used colors
 * @param threshold - Minimum distance threshold (default: 50)
 * @returns true if color is too similar to any used color
 */
function isTooSimilar(newColor: string, usedColors: Set<string>, threshold: number = 50): boolean {
  for (const usedColor of usedColors) {
    if (calculateColorDistance(newColor, usedColor) < threshold) {
      return true;
    }
  }
  return false;
}

/**
 * Transform color based on theme to ensure visibility
 * Automatically adjusts very dark colors on dark themes and very light colors on light themes
 * @param color - Original color string (hex format)
 * @param theme - Current theme ('light' | 'dark' | 'system' | undefined)
 * @returns Transformed color that contrasts with theme
 */
export function getThemeAwareColor(color: string, theme: string | undefined): string {
  if (!color || !isValidColor(color)) {
    return color; // Return as-is if invalid
  }

  const [r, g, b] = parseColor(color);

  // Calculate brightness (0-255, where 0 is black and 255 is white)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Transform based on theme
  if (theme === 'dark') {
    // On dark theme, convert very dark colors (< 40) to white
    // This makes black logos (like Apple) visible on dark backgrounds
    if (brightness < 40) {
      return '#FFFFFF'; // White
    }
  } else if (theme === 'light') {
    // On light theme, convert very light colors (> 230) to black
    // This makes white logos visible on light backgrounds
    if (brightness > 230) {
      return '#000000'; // Black
    }
  }

  // Return original color if it already has good contrast
  return color;
}

/**
 * Assign unique colors to entities with collision detection
 * Prevents multiple entities from having visually similar colors
 * @param entities - Array of entities with optional extracted colors
 * @param fallbackPalette - Fallback color palette to use when collisions detected
 * @returns Map of entity name to unique color
 */
export function assignUniqueColors(
  entities: Array<{ name: string; extractedColors?: string[] | null }>,
  fallbackPalette: string[]
): Map<string, string> {
  const colorMap = new Map<string, string>();
  const usedColors = new Set<string>();
  let fallbackIndex = 0;

  for (const entity of entities) {
    let assignedColor: string | null = null;

    // Try to use extracted color if available and valid
    if (entity.extractedColors && entity.extractedColors.length > 0) {
      const extractedColor = entity.extractedColors[0];

      if (isValidColor(extractedColor) && !isTooSimilar(extractedColor as string, usedColors)) {
        // Extracted color is valid and not too similar to any used color
        assignedColor = extractedColor as string;
      }
    }

    // If no extracted color or collision detected, use fallback
    if (!assignedColor) {
      // Find next fallback color that's not too similar to used colors
      let attempts = 0;
      while (attempts < fallbackPalette.length) {
        const candidateColor = fallbackPalette[fallbackIndex % fallbackPalette.length];

        if (!isTooSimilar(candidateColor as string, usedColors)) {
          assignedColor = candidateColor as string;
          fallbackIndex++;
          break;
        }

        fallbackIndex++;
        attempts++;
      }

      // If all fallback colors are similar (unlikely), use derived color
      if (!assignedColor) {
        const baseColor = fallbackPalette[fallbackIndex % fallbackPalette.length];
        const variant = Math.floor(fallbackIndex / fallbackPalette.length);
        assignedColor = generateDerivedColor(baseColor as string, variant);
        fallbackIndex++;
      }
    }

    // Assign the color and track it as used
    colorMap.set(entity.name, assignedColor);
    usedColors.add(assignedColor);
  }

  return colorMap;
}
