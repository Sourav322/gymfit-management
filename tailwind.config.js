/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Barlow', 'sans-serif'],
        condensed: ['Barlow Condensed', 'sans-serif'],
      },
      colors: {
        'gym-bg': '#0a0a0f',
        'gym-card': '#16161e',
        'gym-accent': '#e8ff47',
        'gym-teal': '#47ffd4',
      }
    },
  },
  plugins: [],
};
