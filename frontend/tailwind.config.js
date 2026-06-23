/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Navy scale — used throughout components (text-navy-*, bg-navy-*)
        navy: {
          50:  '#e8eaf6',
          100: '#c5cae9',
          200: '#9fa8da',
          300: '#7986cb',
          400: '#5c6bc0',
          500: '#3f51b5',
          600: '#3949ab',
          700: '#303f9f',
          800: '#283593',
          900: '#1a237e',
        },
        // Gold scale — accent color
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Flat brand tokens used in globals.css @apply and components
        'brand-purple': '#6d28d9',
        'brand-navy':   '#1a237e',
        'brand-gold':   '#f59e0b',
        // Surface / background tokens
        surface: {
          light: '#f8fafc',
          dark:  '#0f172a',
        },
        // Primary scale (based on brand-purple)
        primary: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      screens: {
        xs: '375px',
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,.12)',
        hover:      '0 4px 16px rgba(0,0,0,.12)',
        product:    '0 2px 8px rgba(109,40,217,.10)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'slide-in':      'slideIn .3s ease',
        'fade-in':       'fadeIn .2s ease',
        'bounce-subtle': 'bounceSubtle 1s infinite',
        shimmer:         'shimmer 1.5s infinite',
      },
      keyframes: {
        slideIn:      { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        fadeIn:       { from: { opacity: 0 }, to: { opacity: 1 } },
        bounceSubtle: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
