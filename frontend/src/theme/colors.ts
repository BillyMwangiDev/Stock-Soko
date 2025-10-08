// Stock Soko - Dark Theme (OKX-inspired)
// Professional dark theme for trading platform

// Color type definitions for better type safety
export type ColorValue = string;
export type ColorOpacity = number;

export interface ColorScale {
	main: ColorValue;
	light?: ColorValue;
	dark?: ColorValue;
	contrast?: ColorValue;
}

export interface BackgroundColors {
	primary: ColorValue;
	secondary: ColorValue;
	tertiary: ColorValue;
	elevated: ColorValue;
	surface: ColorValue;
}

export interface TextColors {
	primary: ColorValue;
	secondary: ColorValue;
	tertiary: ColorValue;
	disabled: ColorValue;
	inverse: ColorValue;
}

export interface StatusColors {
	success: ColorValue;
	error: ColorValue;
	warning: ColorValue;
	info: ColorValue;
}

export interface BorderColors {
	light: ColorValue;
	main: ColorValue;
	dark: ColorValue;
}

export interface HoverColors {
	primary: ColorValue;
	secondary: ColorValue;
	destructive: ColorValue;
}

export interface InputColors {
	background: ColorValue;
	border: ColorValue;
	focus: ColorValue;
	placeholder: ColorValue;
}

export interface TabBarColors {
	background: ColorValue;
	active: ColorValue;
	inactive: ColorValue;
}

export interface ChartColors {
	grid: ColorValue;
	up: ColorValue;
	down: ColorValue;
	volume: ColorValue;
}

export interface ColorTheme {
	background: BackgroundColors;
	text: TextColors;
	primary: ColorScale;
	success: ColorValue;
	error: ColorValue;
	warning: ColorValue;
	info: ColorValue;
	status: StatusColors;
	gain: ColorValue;
	loss: ColorValue;
	neutral: ColorValue;
	border: BorderColors;
	overlay: ColorValue;
	hover: HoverColors;
	input: InputColors;
	tabBar: TabBarColors;
	chart: ChartColors;
}

export const colors: ColorTheme = {
  // Background layers (darkest to lighter)
  background: {
    primary: '#0B0E11',      // Main app background - very dark (OKX-style)
    secondary: '#161A1E',    // Secondary sections/cards
    tertiary: '#1E2329',     // Elevated surfaces (OKX card color)
    elevated: '#2B3139',     // Hover/active states
    surface: '#1E2329',      // Surface color for cards
  },
  
  // Text colors (light on dark)
  text: {
    primary: '#EAECEF',      // Main text - off white
    secondary: '#B7BDC6',    // Secondary text
    tertiary: '#848E9C',     // Muted text
    disabled: '#5E6673',     // Disabled text
    inverse: '#0B0E11',      // Inverse text (dark on light)
  },
  
  // Brand colors (OKX-inspired)
  primary: {
    main: '#2EBD85',         // Green accent (OKX green)
    light: '#3DD598',
    dark: '#1F9E6D',
    contrast: '#0B0E11',     // Dark text on green
  },
  
  // Semantic colors
  success: '#2EBD85',        // Green for buy/confirm (OKX green)
  error: '#F6465D',          // Red for sell/error (OKX red)
  warning: '#F0B90B',        // Yellow for alerts (OKX yellow)
  info: '#3861FB',           // Blue
  
  // Status colors (for components)
  status: {
    success: '#2EBD85',
    error: '#F6465D',
    warning: '#F0B90B',
    info: '#3861FB',
  },
  
  // Market colors
  gain: '#2EBD85',           // Positive changes
  loss: '#F6465D',           // Negative changes
  neutral: '#848E9C',
  
  // Border colors
  border: {
    light: '#2B3139',
    main: '#1E2329',
    dark: '#161A1E',
  },
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  
  // Special UI states (OKX-style)
  hover: {
    primary: '#26A372',      // Darker green on hover
    secondary: '#2B3139',    // Lighter grey on hover
    destructive: '#E03D51',  // Darker red on hover
  },
  
  // Input specific
  input: {
    background: '#1E2329',
    border: '#2B3139',
    focus: '#2EBD85',
    placeholder: '#5E6673',
  },
  
  // Tab bar
  tabBar: {
    background: '#161A1E',
    active: '#2EBD85',
    inactive: '#848E9C',
  },
  
  // Chart colors (OKX-style)
  chart: {
    grid: '#2B3139',
    up: '#2EBD85',
    down: '#F6465D',
    volume: '#474D57',
  },
};

export const gradients = {
  card: ['#1E2329', '#161A1E'],
  primary: ['#2EBD85', '#1F9E6D'],
  gain: ['#2EBD85', '#1F9E6D'],
  loss: ['#F6465D', '#E03D51'],
  background: ['#0B0E11', '#161A1E'],
};

/**
 * Color utility functions
 */

/**
 * Convert hex color to rgba with opacity
 */
export function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Lighten a color by a percentage
 */
export function lightenColor(color: string, percent: number): string {
  // This is a simplified version - in a real app you might want a more sophisticated color library
  if (color.startsWith('#')) {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
  return color;
}

/**
 * Darken a color by a percentage
 */
export function darkenColor(color: string, percent: number): string {
  return lightenColor(color, -percent);
}

/**
 * Get contrast color (black or white) for better readability
 */
export function getContrastColor(backgroundColor: string): string {
  if (backgroundColor.startsWith('#')) {
    const hex = backgroundColor.slice(1);
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
  return '#000000';
}
