// Typography System - Based on Inter/Calibri
export const typography = {
  // Font family
  fontFamily: {
    default: 'Inter, Calibri, sans-serif',
  },
  
  // Font sizes (from spec)
  fontSize: {
    xs: 12,
    sm: 14,          // caption_size from spec
    base: 16,        // body_size from spec
    lg: 18,
    xl: 20,
    '2xl': 22,       // headline_size from spec
    '3xl': 28,
    '4xl': 34,
  },
  
  // Font weights (from spec)
  fontWeight: {
    normal: '400' as const,    // font_weight_regular
    medium: '500' as const,    // font_weight_medium
    semibold: '600' as const,
    bold: '700' as const,      // font_weight_bold
    extrabold: '800' as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// Text styles presets
export const textStyles = {
  h1: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    color: '#111827',
  },
  h2: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    color: '#111827',
  },
  h3: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.tight,
    color: '#111827',
  },
  h4: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
    color: '#111827',
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    color: '#111827',
  },
  bodySmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    color: '#374151',
  },
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    color: '#6B7280',
  },
  button: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.tight,
  },
};
