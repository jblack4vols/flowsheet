/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#ff8200',
          peach: '#ffead5',
          dark: '#1a1a1a',
          darkAlt: '#262626',
        },
      },
    },
  },
  plugins: [],
};
