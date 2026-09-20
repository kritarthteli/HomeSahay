// ============================================================
// Design Tokens — SIH Cooperative Gig Platform
// ============================================================

export const Colors = {
  // Brand
  primary: '#6C63FF',       // Deep violet — cooperative identity
  primaryLight: '#8B85FF',
  primaryDark: '#4A42CC',
  accent: '#FF6B35',        // Vibrant orange — energy/action
  accentLight: '#FF8F65',
  success: '#22C55E',
  warning: '#3c20a1ff',
  error: '#EF4444',
  sos: '#FF1744',           // High-contrast SOS red

  // Backgrounds (dark mode system)
  bg0: '#080D1A',           // Deepest background
  bg1: '#0F172A',           // Primary background
  bg2: '#1E293B',           // Cards / panels
  bg3: '#334155',           // Input fields / elevated
  bg4: '#475569',           // Dividers / muted

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  // Role-specific accent colors
  customerAccent: '#6C63FF',
  workerAccent: '#22C55E',
  adminAccent: '#3c20a1ff',

  // Map
  workerPin: '#22C55E',
  customerPin: '#6C63FF',
  emergencyPin: '#FF1744',

  // Overlay
  overlay: 'rgba(8, 13, 26, 0.85)',
  overlayLight: 'rgba(8, 13, 26, 0.5)',

  // Glass
  glass: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
};

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 56,
  '5xl': 72,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  glow: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
};
