// Main theme export
export { colors, gradients } from './colors';
export { typography, textStyles } from './typography';
export { spacing, borderRadius, shadows } from './spacing';

// Combined theme object
import { colors, gradients } from './colors';
import { typography, textStyles } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

export const theme = {
  colors,
  gradients,
  typography,
  textStyles,
  spacing,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;

