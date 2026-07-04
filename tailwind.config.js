/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette: cobalt + ink-blue (navy) + charcoal + tan/cognac + light gray
        // + winter white. Cobalt is the single accent; navy/charcoal are the
        // darks; cool grays and winter-white are the base surfaces.

        // Brand cobalt — the one accent (actions, active states, the ear tag).
        cobalt: {
          50: '#eef1fe',
          100: '#dfe4fd',
          200: '#c2ccfb',
          300: '#9aabf7',
          400: '#6f83f1',
          500: '#4a5ce8',
          600: '#1e35d4',
          700: '#1a2cb0',
          800: '#18268c',
          900: '#182573',
        },
        // Ink blue (navy) — header, hero bands, deep accents.
        navy: {
          600: '#003b8e',
          700: '#04295c',
          800: '#021d43',
          900: '#001b3a',
        },
        // Cool charcoal — headings & primary text.
        ink: {
          700: '#3a4049',
          800: '#2a2f38',
          900: '#20242c',
        },
        // Winter-white / light-gray base surfaces.
        sand: {
          50: '#eef1f5',
          100: '#e5e9f0',
          200: '#d5dce6',
          300: '#bcc6d4',
        },
        // Cool blue-gray secondary (labels, dividers, muted text).
        taupe: {
          100: '#e7eaf0',
          200: '#d3d9e2',
          400: '#8d99ae',
          600: '#59616e',
        },
        // Tan / cognac — warm accent, used sparingly.
        leather: {
          400: '#c99a67',
          600: '#9c6a3c',
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
