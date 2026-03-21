import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
        },
        foreground: '#0f172a',
        card: '#ffffff',
        border: '#e2e8f0',
        primary: {
          DEFAULT: '#3b82f6',
          muted: '#dbeafe',
        },
        secondary: {
          DEFAULT: '#f1f5f9',
        },
        accent: {
          DEFAULT: '#60a5fa',
        },
        success: {
          DEFAULT: '#16a34a',
          muted: '#f0fdf4',
        },
        warning: {
          DEFAULT: '#f59e0b',
          muted: '#fffbeb',
        },
        destructive: {
          DEFAULT: '#ef4444',
          muted: '#fef2f2',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
