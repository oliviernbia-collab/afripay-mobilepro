// AfriPay Pro — Design tokens (see DESIGN_TOKENS.md)

export const colors = {
  background: '#000000',
  backgroundAlt: '#0B0B0F',
  card: '#15151C',
  border: '#2A2A33',
  text: '#FFFFFF',
  textSecondary: '#B9B9C2',
  textMuted: '#7A7A85',

  magenta: '#E6007E',
  red: '#E30613',
  orange: '#F7941D',
  gold: '#FFC20E',
  green: '#39B54A',
  turquoise: '#00A99D',
  blue: '#27AAE1',
  violet: '#92278F',

  success: '#39B54A',
  warning: '#FFC20E',
  error: '#E30613',
};

export const gradients = {
  brand: [colors.magenta, colors.orange, colors.gold, colors.green, colors.turquoise, colors.blue],
  brandShort: [colors.magenta, colors.orange, colors.gold],
  cta: [colors.magenta, colors.orange],
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export default colors;
