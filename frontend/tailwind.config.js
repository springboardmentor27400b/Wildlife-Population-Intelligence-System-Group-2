/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Nature/wildlife conservation palette
        emerald: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          900: '#064e3b',
        },
        forest: {
          50: '#f4f6f4',
          100: '#e5eae5',
          200: '#cbd5cb',
          300: '#a3b6a3',
          400: '#738e73',
          500: '#526e52',
          600: '#405740',
          700: '#344634',
          800: '#2b392b',
          850: '#202a20',
          900: '#1c251c',
          950: '#111711',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
