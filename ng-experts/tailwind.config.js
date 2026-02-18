/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        heroBg: '#121212',
        expertSectionBg: '#000000',
        surface: '#111111',
        primary: '#EC4899',
        'primary-hover': '#D82D7E',
        border: '#222222',
        subtext: '#999999',
      },
      fontFamily: {
        sans: ['Geist Sans', 'Inter', 'sans-serif'],
        serif: ['EB Garamond', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'large': '0 12px 40px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 40px rgba(236, 72, 153, 0.2)',
        'inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      }
    },
  },
  plugins: [],
}
