import { createTheme } from '@mantine/core';

export const theme = createTheme({
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  headings: { fontFamily: "'Poppins', 'Inter', sans-serif", fontWeight: '700' },
  primaryColor: 'blue',
  primaryShade: 7,
  defaultRadius: 'lg',
});

export const COLORS = {
  blue: '#1958c9',
  blueDark: '#0d3a8a',
  blueDeep: '#082452',
  amber: '#f5a524',
  bg: '#ffffff',
  bgSoft: '#dbeafe',
  text: '#0f1b33',
  textMuted: '#5b6b8c',
  border: '#e2e9f5',
};
