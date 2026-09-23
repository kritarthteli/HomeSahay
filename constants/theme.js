// ============================================================
// Design Tokens — Stitch Theme Redesign
// ============================================================

const StitchColors = {
  canvas: '#F6F6F0',         // warm ivory
  surface: '#E8E8E2',        // soft grey-green
  surfaceWhite: '#FFFFFF',
  ink: '#2A2D28',            // near-black charcoal
  inkDeep: '#1B1D19',        // deeper charcoal
  textPrimary: '#1B1D19',
  textSecondary: '#5F645A',  // muted grey-green
  textOnDark: '#F2F3EE',
  textMutedOnDark: '#A9AEA2',
  accentLime: '#B6FF4D',     // electric lime
  accentOlive: '#3F6212',
  danger: '#B42318',
  dangerTint: '#FBE9E7',
  border: '#D3D6CF',
  borderDark: '#3A3E37',
};

// Map old constants to Stitch to prevent breakage
export const Colors = {
  // Brand
  primary: StitchColors.accentLime,
  primaryLight: '#D4FF8C',
  primaryDark: StitchColors.accentOlive,
  accent: StitchColors.accentLime,
  accentLight: '#E8FFB5',
  success: '#2E500A',
  warning: '#F59E0B',
  error: StitchColors.danger,
  sos: StitchColors.danger,

  // Backgrounds
  bg0: StitchColors.canvas,
  bg1: StitchColors.surface,
  bg2: StitchColors.surfaceWhite,
  bg3: StitchColors.border,
  bg4: '#C2C6BC',

  // Dark mode / inverse mapping for specific Stitch dark cards
  darkSurface: StitchColors.ink,
  darkSurfaceDeep: StitchColors.inkDeep,

  // Text
  textPrimary: StitchColors.textPrimary,
  textSecondary: StitchColors.textSecondary,
  textMuted: '#848A7D',
  textInverse: StitchColors.textOnDark,
  textInverseMuted: StitchColors.textMutedOnDark,

  // Role-specific (can unify for now)
  customerAccent: StitchColors.accentLime,
  workerAccent: StitchColors.accentLime,
  adminAccent: StitchColors.accentLime,

  // Map
  workerPin: StitchColors.ink,
  customerPin: StitchColors.accentLime,
  emergencyPin: StitchColors.danger,

  // Overlay
  overlay: 'rgba(27, 29, 25, 0.6)',
  overlayLight: 'rgba(27, 29, 25, 0.2)',

  // Borders
  glassBorder: StitchColors.border,
  glassBorderDark: StitchColors.borderDark,
};

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'Courier', // Will map to native monospace dynamically where needed
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    'display': 56, // Huge hero size
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900', // WIDE geometric look
  },
  lineHeight: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  base: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
  '5xl': 96,
};

export const Radius = {
  xs: 8,
  sm: 12,
  md: 20,
  lg: 28,
  xl: 36,
  '2xl': 44,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: StitchColors.inkDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: StitchColors.inkDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: StitchColors.inkDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: StitchColors.accentLime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
};
