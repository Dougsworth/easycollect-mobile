import { Dimensions, PixelRatio } from 'react-native';

// Baseline: iPhone 14 (393 x 852)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Scale based on width (for horizontal sizing, fonts, icon sizes)
const wScale = SCREEN_WIDTH / BASE_WIDTH;
// Scale based on height (for vertical spacing)
const hScale = SCREEN_HEIGHT / BASE_HEIGHT;

/**
 * Scale a value proportionally to screen width.
 * Clamped to prevent extremes on tablets or very small devices.
 */
export function s(size: number): number {
  const scaled = size * Math.min(Math.max(wScale, 0.8), 1.25);
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
}

/**
 * Scale a value proportionally to screen height.
 * Good for vertical spacing and padding.
 */
export function vs(size: number): number {
  const scaled = size * Math.min(Math.max(hScale, 0.8), 1.25);
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
}

/**
 * Moderate scale — blends width scale with a factor (default 0.5).
 * Best for font sizes so they don't grow/shrink too aggressively.
 */
export function ms(size: number, factor = 0.5): number {
  const scaled = size + (s(size) - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
}

/** Screen size category */
export type ScreenSize = 'small' | 'medium' | 'large';

export function getScreenSize(): ScreenSize {
  if (SCREEN_HEIGHT < 700) return 'small';    // iPhone SE, older Androids
  if (SCREEN_HEIGHT <= 850) return 'medium';   // iPhone 14, standard Androids
  return 'large';                              // iPhone Pro Max, tablets
}

export { SCREEN_WIDTH, SCREEN_HEIGHT };
