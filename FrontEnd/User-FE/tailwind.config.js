/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}", // Scan toàn bộ file JSX
    ],
    theme: {
      extend: {
        animation: {
          'fade-in': 'fadeIn 0.3s ease-out',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: 0, transform: 'scale(0.95)' },
            '100%': { opacity: 1, transform: 'scale(1)' },
          },
        },
      },
    },
    plugins: [],
  };
  