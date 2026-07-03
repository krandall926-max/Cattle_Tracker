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
          50: '#faf7f0',
          100: '#f3ecdd',
          200: '#e7dcc4',
          300: '#d8c39c',
        },
        // Warm leather/rust accent for rancher character alongside the cobalt.
        leather: {
          50: '#fbf3ee',
          100: '#f3e0d3',
          400: '#c08457',
          600: '#9a5a30',
          700: '#7c4726',
          800: '#5f3720',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Zilla Slab"', 'Georgia', 'serif'],
      },
      backgroundImage: {
        // Faint cross-hatch so the cream background reads like paper/canvas.
        hatch:
          'repeating-linear-gradient(45deg, rgba(154,90,48,0.04) 0 2px, transparent 2px 9px)',
      },
    },
  },
  plugins: [],
}
