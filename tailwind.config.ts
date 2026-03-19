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
          secondary: '#f9fafb',
        },
        foreground: '#111827',
        card: '#ffffff',
        border: '#e5e7eb',
        primary: {
          DEFAULT: '#3b82f6',
          muted: '#dbeafe',
        },
        secondary: {
          DEFAULT: '#f3f4f6',
        },
        success: {
          DEFAULT: '#10b981',
          muted: '#d1fae5',
        },
        warning: {
          DEFAULT: '#f59e0b',
          muted: '#fef3c7',
        },
        destructive: {
          DEFAULT: '#ef4444',
          muted: '#fee2e2',
        },
        muted: {
          DEFAULT: '#f9fafb',
          foreground: '#6b7280',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
