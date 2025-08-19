/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'kt-red': '#e91e63',
        'kt-blue': '#2196f3',
        'kt-gray': '#f5f5f5'
      }
    },
  },
  plugins: [],
}
