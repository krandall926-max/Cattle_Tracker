/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sand Creek Cattle brand cobalt (matches the logo mark).
        cobalt: {
          50: '#eef1fe',
          100: '#dfe4fd',
          200: '#c2ccfb',
          300: '#9aabf7',
          400: '#6f83f1',
          500: '#4a5ce8',
          600: '#1e35d4', // primary
          700: '#1a2cb0',
          800: '#18268c',
          900: '#182573',
        },
        sand: {
          50: '#faf8f3',
          100: '#f3eee1',
          200: '#e7dcc4',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
