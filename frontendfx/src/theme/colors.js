/**
 * Duolingo-inspired Color System Documentation
 * 
 * This is a guide for using the color system consistently across the application.
 * 
 * Usage Examples:
 * 
 * 1. Text Colors:
 * - Primary text: text-slate-700 (dark slate for main text)
 * - Secondary text: text-slate-600 (medium slate for subtitles)
 * - Disabled text: text-slate-400 (light slate for disabled states)
 * 
 * 2. Background Colors:
 * - Page background: bg-[#fff] (clean white)
 * - Card background: bg-white shadow-sm
 * - Primary button: bg-[#58cc02] hover:bg-[#47b102] (Duolingo green)
 * - Secondary button: bg-[#1cb0f6] hover:bg-[#0095d9] (Duolingo blue)
 * 
 * 3. Border Colors:
 * - Default border: border-[#e5e5e5]
 * - Focus border: border-[#58cc02]
 * - Error border: border-[#ff4b4b]
 * 
 * 4. Status Colors:
 * - Success: bg-[#d7ffb8] text-[#58cc02]
 * - Error: bg-[#ffd4d4] text-[#ff4b4b]
 * - Warning: bg-[#fff5d4] text-[#ffc800]
 * - Info: bg-[#e5f6ff] text-[#1cb0f6]
 * 
 * Font System:
 * - Primary: 'din-round', sans-serif (Duolingo's signature font)
 * - Fallback: system-ui, -apple-system, sans-serif
 */

export const colorGuide = {
  // Main brand color - Duolingo's signature green
  primary: {
    bg: 'bg-[#58cc02]',
    text: 'text-[#58cc02]',
    border: 'border-[#58cc02]',
    hover: 'hover:bg-[#47b102]',
    pressed: 'active:bg-[#3c9202]',
  },

  // Secondary color - Duolingo's vibrant blue
  secondary: {
    bg: 'bg-[#1cb0f6]',
    text: 'text-[#1cb0f6]',
    border: 'border-[#1cb0f6]',
    hover: 'hover:bg-[#0095d9]',
    pressed: 'active:bg-[#0080bc]',
  },

  // Neutral colors - Clean and modern
  neutral: {
    // Text
    textPrimary: 'text-slate-700',
    textSecondary: 'text-slate-600',
    textTertiary: 'text-slate-400',
    
    // Backgrounds
    bgPage: 'bg-[#fff]',
    bgCard: 'bg-white',
    bgHover: 'hover:bg-[#f7f7f7]',
    
    // Borders
    border: 'border-[#e5e5e5]',
    borderHover: 'hover:border-[#58cc02]',
  },

  // Status colors - Playful and clear
  status: {
    success: {
      bg: 'bg-[#d7ffb8]',
      text: 'text-[#58cc02]',
      border: 'border-[#58cc02]',
    },
    error: {
      bg: 'bg-[#ffd4d4]',
      text: 'text-[#ff4b4b]',
      border: 'border-[#ff4b4b]',
    },
    warning: {
      bg: 'bg-[#fff5d4]',
      text: 'text-[#ffc800]',
      border: 'border-[#ffc800]',
    },
    info: {
      bg: 'bg-[#e5f6ff]',
      text: 'text-[#1cb0f6]',
      border: 'border-[#1cb0f6]',
    },
  }
};

// Common component styles using the Duolingo-inspired system
export const componentStyles = {
  // Button variants with Duolingo's signature styles
  button: {
    primary: 'bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-3 px-4 rounded-xl border-b-2 border-[#3c9202] hover:border-[#2e7502] focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2',
    secondary: 'bg-[#1cb0f6] hover:bg-[#0095d9] text-white font-bold py-3 px-4 rounded-xl border-b-2 border-[#0080bc] hover:border-[#0076ad] focus:outline-none focus:ring-2 focus:ring-[#1cb0f6] focus:ring-offset-2',
    outline: 'border-2 border-[#58cc02] text-[#58cc02] hover:bg-[#d7ffb8] font-bold py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2',
  },

  // Form control styles with Duolingo's design language
  form: {
    input: 'mt-1 block w-full rounded-xl border-2 border-slate-200 shadow-sm p-2 focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] transition-colors duration-200',
    select: 'mt-1 block w-full rounded-xl border-2 border-slate-200 shadow-sm p-2 focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] transition-colors duration-200',
    textarea: 'mt-1 block w-full rounded-xl border-2 border-slate-200 shadow-sm p-2 focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] transition-colors duration-200',
    label: 'block text-sm font-bold text-slate-600 mb-1',
  },

  // Card styles with subtle elevation
  card: {
    base: 'bg-white border-2 border-slate-200 rounded-xl shadow-sm',
    hover: 'hover:border-[#58cc02] hover:shadow-md transition-all duration-200',
  }
};

// Font classes
export const fontSystem = {
  base: 'font-["din-round",system-ui,-apple-system,sans-serif]',
  heading: 'font-["din-round",system-ui,-apple-system,sans-serif] font-bold',
  body: 'font-["din-round",system-ui,-apple-system,sans-serif] font-medium',
};

export default {
  colorGuide,
  componentStyles,
  fontSystem,
};
