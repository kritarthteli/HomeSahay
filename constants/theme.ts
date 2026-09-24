// ============================================================
// Design Tokens — Stitch (Obsidian Kinetic) Theme
// ============================================================

import { Platform } from 'react-native';

export const StitchColors = {
  // Core Canvases
  canvasLight: '#FAFAF6',        // Chalk cream / Warm off-white
  canvasCream: '#F7F7F2',        // Slightly deeper warm cream
  canvasDark: '#0A0A0A',         // Dense obsidian foundation
  
  // Surfaces & Elevated Modules
  surfaceLight: '#FFFFFF',       // Pure white for small inner elements on light
  surfaceDark: '#121212',        // Elevated obsidian modules
  surfaceInteractive: '#1C1C1C', // Interactive chips on dark
  
  // Accents & Semantics
  accentPrimary: '#9CFF3D',      // High-voltage electric neon lime
  accentPrimaryDim: '#7EDE13',   // Muted lime for hover/pressed states or auras
  danger: '#BA1A1A',             // SOS / Error
  dangerContainer: '#FFDAD6',    // SOS Background tint
  
  // Typography
  textOnLight: '#1A1C19',        // Primary text on light canvases
  textOnLightVariant: '#404A36', // Muted/secondary text on light
  textOnDark: '#FAFAF5',         // Primary text on dark surfaces
  textOnDarkVariant: '#A9AEA2',  // Muted/secondary text on dark
  textOnPrimary: '#0A0A0A',      // Text on neon lime (deep obsidian)
  
  // Borders & Outlines
  borderLight: '#E5E5DE',        // Hairline on light cream surfaces
  borderDark: '#242424',         // Hairline on dark obsidian surfaces
  
  // Translucency Base
  glassDark: 'rgba(10, 10, 10, 0.8)',
  glassLight: 'rgba(250, 250, 246, 0.8)',
};

// Aliased to existing app properties to maintain compatibility while migrating
export const Colors = {
  ...StitchColors,
  primary: StitchColors.accentPrimary,
  primaryLight: StitchColors.accentPrimaryDim,
  primaryDark: '#3E7300',
  accent: StitchColors.accentPrimary,
  accentLight: '#E8FFB5',
  accentPrimaryDark: '#70C729', // Darker neon lime
  dangerTint: StitchColors.dangerContainer,
  
  success: '#386A00',
  warning: '#F59E0B',
  warningDark: '#D97706',
  error: StitchColors.danger,
  sos: StitchColors.danger,

  // Map old backgrounds to new
  bg0: StitchColors.canvasLight,
  bg1: StitchColors.canvasCream,
  bg2: StitchColors.surfaceLight,
  bg3: StitchColors.borderLight,
  bg4: '#C2C6BC',
  
  // Specific dark maps
  darkSurface: StitchColors.surfaceDark,
  darkSurfaceDeep: StitchColors.canvasDark,
  darkInteractive: StitchColors.surfaceInteractive,

  textPrimary: StitchColors.textOnLight,
  textSecondary: StitchColors.textOnLightVariant,
  textMuted: '#707B63',
  textInverse: StitchColors.textOnDark,
  textInverseMuted: StitchColors.textOnDarkVariant,

  // Role accents (unify to primary where appropriate or keep semantics)
  customerAccent: StitchColors.accentPrimary,
  workerAccent: StitchColors.accentPrimary,
  adminAccent: StitchColors.accentPrimary,

  workerPin: StitchColors.canvasDark,
  customerPin: StitchColors.accentPrimary,
  emergencyPin: StitchColors.danger,

  overlay: 'rgba(10, 10, 10, 0.6)',
  overlayLight: 'rgba(10, 10, 10, 0.2)',

  glassBorder: StitchColors.borderLight,
  glassBorderDark: StitchColors.borderDark,
};

export const Typography = {
  fontFamily: {
    // We stick to System fonts to avoid breaking the build with new expo-font loaders,
    // but we use strict weights (800/900) to mimic Syne and Plus Jakarta Sans.
    display: 'System', 
    body: 'System',
    mono: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
  },
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    'display': 72,
    'displayMobile': 40,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900', // Syne-like display weight
  } as const,
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
  md: 14,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const Radius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  full: 9999,
};

export const Shadow = {
  soft: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sm: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: StitchColors.accentPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
};
