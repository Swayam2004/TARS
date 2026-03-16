/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // New design system — primary blue + named backgrounds
        primary:            '#1754cf',
        'background-light': '#f6f6f8',
        'background-dark':  '#111621',

        // Keep brand scale as alias so any existing refs still resolve
        brand: {
          50:  '#eef4ff',
          100: '#dce8ff',
          200: '#b9d1ff',
          400: '#5b8ef5',
          500: '#1754cf',
          600: '#1245b0',
          700: '#0e3690',
          900: '#071a4a',
        },
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        // Keep mono for code blocks
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg:      '0.5rem',
        xl:      '0.75rem',
        '2xl':   '1rem',
        full:    '9999px',
      },
      boxShadow: {
        card:    '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.10), 0 1px 3px -1px rgba(0,0,0,0.06)',
        primary: '0 4px 14px 0 rgba(23,84,207,0.25)',
      },
    },
  },
  plugins: [],
}
