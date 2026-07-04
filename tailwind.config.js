/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sand Creek Cattle brand cobalt — used as an ACCENT only (actions,
        // active states, the cow ear-tag). The app's base is neutral cream/ink.
        cobalt: {
          50: '#eef1fe',
          100: '#dfe4fd',
          200: '#c2ccfb',
          300: '#9aabf7',
          400: '#6f83f1',
          500: '#4a5ce8',
          600: '#1e35d4', // primary accent
          700: '#1a2cb0',
          800: '#18268c',
          900: '#182573',
        },
        // Neutral cream surfaces — the dominant palette.
        sand: {
          50: '#f8f6f1',
          100: '#f1ede3',
          200: '#e4ddcd',
          300: '#d3c8b1',
        },
        // Warm charcoal for the header and primary text (neutral, not black).
        ink: {
          700: '#33383f',
          800: '#25292f',
          900: '#181b20',
        },
        // Muted warm-gray for secondary accents/dividers.
        taupe: {
          100: '#eceae4',
          200: '#dcd8cf',
          400: '#a89f8f',
          600: '#726a5c',
        },
        // Kept for rare warm touches; used sparingly now.
        leather: {
          400: '#c08457',
          600: '#9a5a30',
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
