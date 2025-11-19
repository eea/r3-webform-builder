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
          DEFAULT: '#47B3FF',
          dark: '#0083E0',
          light: '#A0D7FF',
        },
        secondary: {
          DEFAULT: '#289588',
        },
        danger: {
          DEFAULT: '#E56B38',
          light: '#FFEDD8',
        },
        warning: {
          DEFAULT: '#B83230',
        },
        purple: {
          DEFAULT: '#9E84B6',
          dark: '#5C3285',
          light: '#EFEBF2',
          border: '#BEADCE',
        },
        gray: {
          DEFAULT: '#4C677F',
          light: '#87A7C3',
          border: '#dee2e6',
          bg: '#f8f9fa',
        },
        text: {
          DEFAULT: '#333',
          dark: '#2E3E4C',
          muted: '#666',
          light: '#8B5E34',
        },
        success: {
          DEFAULT: '#007B6C',
        },
        info: {
          DEFAULT: '#003052',
        },
      },
      boxShadow: {
        'form': '0 20px 40px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
