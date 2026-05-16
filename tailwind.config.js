/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e8ff',
          200: '#c5d4ff',
          300: '#9ab5ff',
          400: '#6a8cff',
          500: '#3f5bff',
          600: '#2a3ff3',
          700: '#2032d9',
          800: '#1d28ad',
          900: '#1a1a2e',
          950: '#0f1023',
        },
        accent: {
          50: '#fff5f4',
          100: '#ffe8e7',
          200: '#ffd5d3',
          300: '#ffb8b4',
          400: '#ff908a',
          500: '#ff6b6b',
          600: '#ed4b4b',
          700: '#d43535',
          800: '#b12c2c',
          900: '#922626',
          950: '#4d1111',
        },
        success: '#4ecdc4',
        warning: '#feca57',
        error: '#ff4757',
        info: '#3498db',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Source Sans Pro', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
