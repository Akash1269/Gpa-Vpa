// ─── Typography ───────────────────────────────────────
export const fonts = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
} as const;

export const fontSizes = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  hero: 40,
} as const;

// ─── Spacing ──────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

// ─── Border Radii ─────────────────────────────────────
export const radii = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

// ─── Status Colors (theme-independent) ───────────────
export const statusColors = {
  inProgress: { bg: '#E3F2FD', text: '#1976D2' },
  completed: { bg: '#E8F5E9', text: '#34A853' },
  warning: { bg: '#FFF3E0', text: '#F57C00' },
  na: { bg: '#FFF3E0', text: '#F57C00' },
  goal: { bg: '#F3E5F5', text: '#9C27B0' },
} as const;
