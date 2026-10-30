/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: '#4B1018',
        'blood-red': '#A51F2B',
        'bright-red': '#E62A3B',
        'muted-cream': '#F4E4CC',
        midnight: '#111827',
        'dark-purple': '#30213E',
        'antique-gold': '#D6A56C',
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'serif'],
        horror: ['Creepster', 'Cinzel', 'cursive', 'serif'],
        story: ['Playfair Display', 'Times New Roman', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
