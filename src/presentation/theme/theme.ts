// Presentation - Theme Colors
export const theme = {
  colors: {
    primary: '#772237', // Wine/Borgoña from mockup
    primaryDark: '#5c1a2b',
    primaryLight: '#9c2e4a',
    primaryForeground: '#f5ebe8', // Light beige for text on primary
    background: '#ffffff',
    surface: '#f8f6f4', // Warm off-white (HSL 30 15% 97%)
    card: '#ffffff',
    text: '#262626', // Dark gray (HSL 0 0% 15%)
    textSecondary: '#737373', // Medium gray (HSL 0 0% 45%)
    border: '#e8e5e1', // Warm border (HSL 30 12% 88%)
    inputBorder: '#e8e5e1',
    error: '#ef4444',
    success: '#659952', // Green (HSL 85 40% 45%)
    shadow: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
} as const;
