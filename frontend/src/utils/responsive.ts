import { Dimensions, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard device sizes
const IPHONE_SE_WIDTH = 320;
const IPHONE_8_WIDTH = 375;
const IPHONE_11_WIDTH = 414;
const IPHONE_14_PRO_MAX_WIDTH = 430;

// Device type detection
export const isSmallDevice = SCREEN_WIDTH <= IPHONE_SE_WIDTH;
export const isMediumDevice = SCREEN_WIDTH > IPHONE_SE_WIDTH && SCREEN_WIDTH <= IPHONE_8_WIDTH;
export const isLargeDevice = SCREEN_WIDTH > IPHONE_11_WIDTH;

// Get responsive value based on screen width
export const getResponsiveValue = (small: number, medium: number, large: number): number => {
  if (isSmallDevice) return small;
  if (isMediumDevice) return medium;
  return large;
};

// Scale size based on screen width (base width is iPhone 11 - 414)
const BASE_WIDTH = 414;
export const scale = (size: number): number => {
  return Math.round((SCREEN_WIDTH / BASE_WIDTH) * size);
};

// Scale font size
export const scaleFont = (size: number): number => {
  return Math.round((SCREEN_WIDTH / BASE_WIDTH) * size);
};

// Get safe area insets
export const getStatusBarHeight = (): number => {
  if (Platform.OS === 'ios') {
    // iPhone models
    if (SCREEN_HEIGHT >= 812) {
      return 44; // iPhone X and newer
    }
    return 20; // Older iPhones
  }
  return StatusBar.currentHeight || 0;
};

export const getBottomSpace = (): number => {
  if (Platform.OS === 'ios' && SCREEN_HEIGHT >= 812) {
    return 34; // iPhone X and newer
  }
  return 0;
};

// Screen dimensions
export const SCREEN_DIMENSIONS = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: isSmallDevice,
  isMedium: isMediumDevice,
  isLarge: isLargeDevice,
};

// Responsive spacing
export const responsiveSpacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  base: scale(20),
  lg: scale(24),
  xl: scale(32),
  '2xl': scale(40),
  '3xl': scale(48),
};

// Responsive font sizes
export const responsiveFonts = {
  xs: scaleFont(11),
  sm: scaleFont(13),
  base: scaleFont(16),
  md: scaleFont(18),
  lg: scaleFont(20),
  xl: scaleFont(24),
  '2xl': scaleFont(28),
  '3xl': scaleFont(32),
};

