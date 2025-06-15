/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Nunito', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Duolingo's Main Brand Colors
        primary: {
          DEFAULT: '#58CC02', // Main green
          hover: '#47b102',
          pressed: '#3c9202',
          dark: '#2e7001',
          light: '#d7ffb8',
        },
        secondary: {
          DEFAULT: '#1CB0F6', // Main blue
          hover: '#0095d9',
          pressed: '#0080bc',
          dark: '#0076ad',
          light: '#e5f6ff',
        },
        // Status Colors
        success: {
          bg: '#d7ffb8',
          text: '#58cc02',
          border: '#58cc02',
        },
        error: {
          bg: '#ffd4d4',
          text: '#ff4b4b',
          border: '#ff4b4b',
        },
        warning: {
          bg: '#fff5d4',
          text: '#ffc800',
          border: '#ffc800',
        },
        info: {
          bg: '#e5f6ff',
          text: '#1cb0f6',
          border: '#1cb0f6',
        },
        // Neutral Colors
        slate: {
          400: '#94a3b8', // Disabled text
          600: '#475569', // Secondary text
          700: '#334155', // Primary text
        },
      },
      // Duolingo's Border Radius
      borderRadius: {
        'xl': '1rem',     // Regular buttons, inputs
        '2xl': '1.5rem',  // Large buttons, cards
      },
      // Duolingo's Shadow Styles
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'button': '0 4px 0 0',  // Duolingo's signature button shadow
      },
      // Animation durations
      transitionDuration: {
        '200': '200ms',
      },
    },
  },
  plugins: [],
}