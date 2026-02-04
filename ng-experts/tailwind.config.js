/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E91E63',
        'primary-dark': '#C2185B',
        secondary: '#1E293B',
        'secondary-light': '#334155',
        accent: '#9C27B0',
        'bg-soft': '#FDF2F8',
        'angular-red': '#DD0031',
        'angular-pink': '#E91E63',
        'angular-purple': '#9C27B0',
        'angular-gradient-start': '#E91E63',
        'angular-gradient-end': '#9C27B0',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'large': '0 12px 40px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 40px rgba(233, 30, 99, 0.2)',
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
