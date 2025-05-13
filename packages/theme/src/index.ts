import { colors } from './colors';
import { spacing } from './spacing';
import { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } from './typography';
import { boxShadow } from './shadows';

export const theme = {
  colors,
  spacing,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  boxShadow,
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  borderWidth: {
    DEFAULT: '1px',
    0: '0',
    2: '2px',
    4: '4px',
    8: '8px',
  },
  opacity: {
    0: '0',
    5: '0.05',
    10: '0.1',
    20: '0.2',
    25: '0.25',
    30: '0.3',
    40: '0.4',
    50: '0.5',
    60: '0.6',
    70: '0.7',
    75: '0.75',
    80: '0.8',
    90: '0.9',
    95: '0.95',
    100: '1',
  },
  zIndex: {
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    auto: 'auto',
  },
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Export individual theme parts
export { colors } from './colors';
export { spacing } from './spacing';
export { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } from './typography';
export { boxShadow } from './shadows';

// Export a function to generate a Tailwind config
export const createTailwindConfig = (customConfig = {}) => {
  return {
    content: [],
    theme: {
      extend: {
        colors: theme.colors,
        spacing: theme.spacing,
        fontFamily: theme.fontFamily,
        fontSize: theme.fontSize,
        fontWeight: theme.fontWeight,
        lineHeight: theme.lineHeight,
        letterSpacing: theme.letterSpacing,
        borderRadius: theme.borderRadius,
        borderWidth: theme.borderWidth,
        boxShadow: theme.boxShadow,
        opacity: theme.opacity,
        zIndex: theme.zIndex,
        screens: theme.screens,
        ...customConfig,
      },
    },
    plugins: [],
  };
};
