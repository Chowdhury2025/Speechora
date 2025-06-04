/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sky_blue': { 
          DEFAULT: '#67BDD7', 
          100: '#0d2932', 
          200: '#1b5364', 
          300: '#287c96', 
          400: '#35a6c8', 
          500: '#67bdd7', 
          600: '#85c9de', 
          700: '#a3d7e7', 
          800: '#c2e4ef', 
          900: '#e0f2f7' 
        },
        'mindaro': { 
          DEFAULT: '#C2DF75', 
          100: '#2c370d', 
          200: '#586f1a', 
          300: '#84a627', 
          400: '#abd23f', 
          500: '#c2df75', 
          600: '#cfe592', 
          700: '#dbecad', 
          800: '#e7f2c8', 
          900: '#f3f9e4' 
        },
        'yellow_green': { 
          DEFAULT: '#A2CE28', 
          100: '#202908', 
          200: '#405210', 
          300: '#607b18', 
          400: '#81a420', 
          500: '#a2ce28', 
          600: '#b6dc4e', 
          700: '#c8e57a', 
          800: '#dbeda6', 
          900: '#edf6d3' 
        },
        'azure': { 
          DEFAULT: '#DBEAEC', 
          100: '#1f383b', 
          200: '#3f7077', 
          300: '#63a4ad', 
          400: '#9fc7cc', 
          500: '#dbeaec', 
          600: '#e2eef0', 
          700: '#e9f2f3', 
          800: '#f0f6f7', 
          900: '#f8fbfb' 
        },
        'kelly': { 
          DEFAULT: '#58A317', 
          100: '#112005', 
          200: '#234009', 
          300: '#34600e', 
          400: '#468112', 
          500: '#58a317', 
          600: '#76da1f', 
          700: '#98e754', 
          800: '#baef8d', 
          900: '#ddf7c6' 
        }
      }
    },
  },
  plugins: [],
}