/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f8f5',
          100: '#e1efe7',
          200: '#c5dfd1',
          300: '#9bc8b1',
          400: '#6ca88c',
          500: '#4d8c70',
          600: '#3a7057',
          700: '#305a47',
          800: '#27493a',
          900: '#213d31',
          950: '#12231c',
        },
        mint: {
          50: '#f0fdf6',
          100: '#dbfde9',
          200: '#b7fada',
          300: '#7ef4c1',
          400: '#3fe6a2',
          500: '#18cd85',
          600: '#0ea76a',
          700: '#0e8456',
          800: '#106846',
          900: '#0f563b',
          950: '#033020',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'hero': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '800' }],
        'section': ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '700' }],
        'card-title': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '750' }],
        'nav': ['1.0625rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body-premium': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'small-premium': ['0.9375rem', { lineHeight: '1.5', fontWeight: '400' }],
      }
    },
  },
  plugins: [],
}
