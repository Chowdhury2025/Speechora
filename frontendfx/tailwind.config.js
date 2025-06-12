/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'duo-green': {
          DEFAULT: '#58CC02',
          100: '#eaf8e0',
          200: '#c7f2a4',
          300: '#a4eb68',
          400: '#81e52c',
          500: '#58cc02',
          600: '#47a301',
          700: '#357a01',
          800: '#245201',
          900: '#122900',
        },
        'duo-blue': {
          DEFAULT: '#1CB0F6',
          100: '#e0f6fd',
          200: '#a4e4fa',
          300: '#68d2f7',
          400: '#2cc0f4',
          500: '#1cb0f6',
          600: '#1890c6',
          700: '#136f95',
          800: '#0d4f64',
          900: '#062f32',
        },
        'duo-yellow': {
          DEFAULT: '#FFD600',
          100: '#fffbe0',
          200: '#fff3a4',
          300: '#ffeb68',
          400: '#ffe32c',
          500: '#ffd600',
          600: '#c6a900',
          700: '#947c00',
          800: '#635200',
          900: '#312900',
        },
        'duo-gray': {
          DEFAULT: '#F7F7F7',
          100: '#ffffff',
          200: '#f7f7f7',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        'duo-white': '#FFFFFF',
        'duo-black': '#222222',
      }
    },
  },
  plugins: [],
}