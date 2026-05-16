/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['"Syne"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#edfcf4',
          100: '#d3f8e4',
          200: '#aaf0cd',
          300: '#72e3af',
          400: '#38ce8c',
          500: '#14b370',
          600: '#0a9259',
          700: '#09744a',
          800: '#0b5c3c',
          900: '#0a4c32',
          950: '#042b1d',
        },
        surface: {
          light: '#f8fafc',
          dark:  '#0d1117',
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-up':   'slideUp 0.35s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow':  'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
